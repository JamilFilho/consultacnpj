// components/grafoRelacoes.tsx
'use client'

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Loader2,
  RefreshCw,
  User,
  Building2,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
} from 'lucide-react'

type RelacaoGrafo = {
  cnpj: string
  razao_social: string
  id: string
  nome: string
  cpf: string
}

type TipoNo = 'pessoa' | 'empresa' | 'raiz'

type No = {
  key: string
  tipo: 'pessoa' | 'empresa' | 'raiz'
  label: string
  sublabel: string
  documento?: string
  idGrafo?: string
  x: number
  y: number
  vx: number
  vy: number
  fixo?: boolean
}

type Aresta = {
  origem: string
  destino: string
}

interface Props {
  cnpjRaiz: string
  razaoSocialRaiz: string
  relacoesIniciais: RelacaoGrafo[] | null
}

function formatCNPJ(cnpj: string): string {
  if (cnpj.length !== 14) return cnpj
  return cnpj.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    '$1.$2.$3/$4-$5'
  )
}

function chaveEmpresa(cnpj: string): string {
  return `e:${cnpj}`
}

function chavePessoa(id: string): string {
  return `p:${id}`
}

function mesclarRelacoes(
  relacoes: RelacaoGrafo[],
  nosExistentes: Map<string, No>,
  arestasExistentes: Map<string, Aresta>,
  origemExpansao: { x: number; y: number } | null
): {
  nos: Map<string, No>
  arestas: Map<string, Aresta>
} {
  const nos = new Map(nosExistentes)
  const arestas = new Map(arestasExistentes)

  for (const rel of relacoes) {
    const keyEmpresa = chaveEmpresa(rel.cnpj)
    const keyPessoa = chavePessoa(rel.id)

    if (!nos.has(keyEmpresa)) {
      const base = origemExpansao ?? { x: 0, y: 0 }
      nos.set(keyEmpresa, {
        key: keyEmpresa,
        tipo: 'empresa',
        label: rel.razao_social,
        sublabel: formatCNPJ(rel.cnpj),
        documento: rel.cnpj,
        x: base.x + (Math.random() - 0.5) * 40,
        y: base.y + (Math.random() - 0.5) * 40,
        vx: 0,
        vy: 0,
      })
    }

    if (!nos.has(keyPessoa)) {
      const base = origemExpansao ?? { x: 0, y: 0 }
      nos.set(keyPessoa, {
        key: keyPessoa,
        tipo: 'pessoa',
        label: rel.nome,
        sublabel: rel.cpf,
        documento: rel.cpf,
        idGrafo: rel.id,
        x: base.x + (Math.random() - 0.5) * 40,
        y: base.y + (Math.random() - 0.5) * 40,
        vx: 0,
        vy: 0,
      })
    }

    const arestaKey = `${keyPessoa}__${keyEmpresa}`
    if (!arestas.has(arestaKey)) {
      arestas.set(arestaKey, {
        origem: keyPessoa,
        destino: keyEmpresa,
      })
    }
  }

  return { nos, arestas }
}

const LARGURA_BASE = 800
const ALTURA_BASE = 520

// Distância euclidiana entre dois toques
function distanciaToques(t1: React.Touch, t2: React.Touch): number {
  const dx = t1.clientX - t2.clientX
  const dy = t1.clientY - t2.clientY
  return Math.sqrt(dx * dx + dy * dy)
}

// Ponto central entre dois toques (em coordenadas de cliente)
function centroToques(t1: React.Touch, t2: React.Touch): { x: number; y: number } {
  return {
    x: (t1.clientX + t2.clientX) / 2,
    y: (t1.clientY + t2.clientY) / 2,
  }
}

export default function GrafoRelacoes({
  cnpjRaiz,
  razaoSocialRaiz,
  relacoesIniciais,
}: Props) {
  const [nos, setNos] = useState<Map<string, No>>(() => {
    const keyRaiz = chaveEmpresa(cnpjRaiz)
    const inicial = new Map<string, No>()
    inicial.set(keyRaiz, {
      key: keyRaiz,
      tipo: 'raiz',
      label: razaoSocialRaiz,
      sublabel: formatCNPJ(cnpjRaiz),
      documento: cnpjRaiz,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      fixo: true,
    })
    return inicial
  })

  const [arestas, setArestas] = useState<Map<string, Aresta>>(new Map())

  const [indisponivel] = useState(relacoesIniciais === null)
  const [carregando, setCarregando] = useState<string | null>(null)
  const [erroExpansao, setErroExpansao] = useState<string | null>(null)
  const [nosSelecionados, setNosSelecionados] = useState<string[]>([])
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const moveuNoRef = useRef(false)
  const inicioDragRef = useRef<{ x: number; y: number } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const arrastoRef = useRef<{ ativo: boolean; ultimoX: number; ultimoY: number }>({
    ativo: false,
    ultimoX: 0,
    ultimoY: 0,
  })
  const arrastandoNoRef = useRef<{ key: string; offsetX: number; offsetY: number } | null>(null)

  // --- Estado de pinch (dois dedos) ---
  // Guardamos a distância e o centro iniciais no começo do gesto, mais os
  // valores de zoom/pan vigentes no momento — assim o cálculo incremental
  // não acumula erro entre frames.
  const pinchRef = useRef<{
    distanciaInicial: number
    zoomInicial: number
    panInicial: { x: number; y: number }
    centroCliente: { x: number; y: number }
  } | null>(null)

  const expandidos = useRef<Set<string>>(new Set())
  const nosRef = useRef(nos)
  const arestasRef = useRef(arestas)
  const zoomRef = useRef(zoom)
  const panRef = useRef(pan)

  const coordenadasGrafo = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current
      if (!svg) return { x: 0, y: 0 }

      const rect = svg.getBoundingClientRect()
      const xSvg = ((clientX - rect.left) / rect.width) * LARGURA_BASE - LARGURA_BASE / 2
      const ySvg = ((clientY - rect.top) / rect.height) * ALTURA_BASE - ALTURA_BASE / 2

      return {
        x: (xSvg - pan.x) / zoom,
        y: (ySvg - pan.y) / zoom,
      }
    },
    [pan, zoom]
  )

  useEffect(() => { nosRef.current = nos }, [nos])
  useEffect(() => { arestasRef.current = arestas }, [arestas])
  useEffect(() => { zoomRef.current = zoom }, [zoom])
  useEffect(() => { panRef.current = pan }, [pan])

  useEffect(() => {
    if (relacoesIniciais && relacoesIniciais.length > 0) {
      const { nos: novosNos, arestas: novasArestas } = mesclarRelacoes(
        relacoesIniciais,
        nos,
        arestas,
        { x: 0, y: 0 }
      )
      setNos(novosNos)
      setArestas(novasArestas)
      expandidos.current.add(cnpjRaiz.replace(/\D/g, ''))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const buscarConexao = useCallback(async (origem: No, destino: No) => {
    try {
      setCarregando(destino.key)
      setErroExpansao(null)

      const origemId = origem.tipo === 'pessoa' ? origem.idGrafo : origem.documento
      const destinoId = destino.tipo === 'pessoa' ? destino.idGrafo : destino.documento
      if (!origemId || !destinoId) return

      const res = await fetch(`/api/conexao/${origemId}/${destinoId}`)
      const data = await res.json()

      if (!res.ok) {
        setErroExpansao('Não foi possível localizar a conexão.')
        return
      }

      const relacoes: RelacaoGrafo[] = data ?? []
      const { nos: novosNos, arestas: novasArestas } = mesclarRelacoes(
        relacoes,
        nosRef.current,
        arestasRef.current,
        { x: (origem.x + destino.x) / 2, y: (origem.y + destino.y) / 2 }
      )
      setNos(novosNos)
      setArestas(novasArestas)
    } catch {
      setErroExpansao('Erro ao consultar conexão.')
    } finally {
      setCarregando(null)
    }
  }, [])

  const expandirNo = useCallback(async (no: No) => {
    const identificador =
      no.tipo === 'pessoa' ? no.idGrafo : no.documento?.replace(/[^\d]/g, '')

    if (!identificador) {
      console.error('Nó sem identificador', no)
      return
    }

    if (expandidos.current.has(identificador)) return

    setCarregando(no.key)
    setErroExpansao(null)

    try {
      const res = await fetch(`/api/grafo/${identificador}`)
      const data = await res.json()

      if (!res.ok) {
        setErroExpansao(`Não foi possível carregar a rede de ${no.label}.`)
        return
      }

      const relacoes: RelacaoGrafo[] = data.relacoes ?? []
      expandidos.current.add(identificador)

      const origem = nosRef.current.get(no.key)
      const { nos: novosNos, arestas: novasArestas } = mesclarRelacoes(
        relacoes,
        nosRef.current,
        arestasRef.current,
        origem ? { x: origem.x, y: origem.y } : null
      )
      setNos(novosNos)
      setArestas(novasArestas)
    } catch {
      setErroExpansao('Erro de conexão ao buscar relações. Tente novamente.')
    } finally {
      setCarregando(null)
    }
  }, [])

  // --- Simulação de força ---
  useEffect(() => {
    let ativo = true

    function passo() {
      if (!ativo) return

      setNos(prevNos => {
        const lista = Array.from(prevNos.values())
        if (lista.length <= 1) return prevNos

        const proximos = new Map(prevNos)

        for (let i = 0; i < lista.length; i++) {
          const a = lista[i]
          let fx = 0
          let fy = 0

          for (let j = 0; j < lista.length; j++) {
            if (i === j) continue
            const b = lista[j]
            const dx = a.x - b.x
            const dy = a.y - b.y
            const distSq = Math.max(dx * dx + dy * dy, 1)
            const forca = 2400 / distSq
            fx += (dx / Math.sqrt(distSq)) * forca
            fy += (dy / Math.sqrt(distSq)) * forca
          }

          fx += -a.x * 0.004
          fy += -a.y * 0.004

          const atual = proximos.get(a.key)
          if (!atual || atual.fixo) continue

          proximos.set(a.key, {
            ...atual,
            vx: (atual.vx + fx) * 0.82,
            vy: (atual.vy + fy) * 0.82,
          })
        }

        for (const aresta of arestas.values()) {
          const origem = proximos.get(aresta.origem)
          const destino = proximos.get(aresta.destino)
          if (!origem || !destino) continue

          const dx = destino.x - origem.x
          const dy = destino.y - origem.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const distIdeal = 130
          const forca = (dist - distIdeal) * 0.02
          const fx = (dx / dist) * forca
          const fy = (dy / dist) * forca

          if (!origem.fixo) {
            proximos.set(aresta.origem, { ...origem, vx: origem.vx + fx, vy: origem.vy + fy })
          }
          if (!destino.fixo) {
            proximos.set(aresta.destino, { ...destino, vx: destino.vx - fx, vy: destino.vy - fy })
          }
        }

        let alguemMoveu = false
        for (const [key, no] of proximos) {
          if (no.fixo) continue
          const novoX = no.x + no.vx
          const novoY = no.y + no.vy
          if (Math.abs(no.vx) > 0.02 || Math.abs(no.vy) > 0.02) alguemMoveu = true
          proximos.set(key, { ...no, x: novoX, y: novoY })
        }

        return alguemMoveu ? proximos : prevNos
      })

      requestAnimationFrame(passo)
    }

    const frame = requestAnimationFrame(passo)
    return () => {
      ativo = false
      cancelAnimationFrame(frame)
    }
  }, [arestas])

  // --- Pan com pointer (mouse / stylus / toque único) ---
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    arrastoRef.current = { ativo: true, ultimoX: e.clientX, ultimoY: e.clientY }
  }, [])

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (arrastandoNoRef.current) {
        const inicio = inicioDragRef.current
        if (inicio) {
          const distancia = Math.hypot(e.clientX - inicio.x, e.clientY - inicio.y)
          if (distancia > 5) moveuNoRef.current = true
        }

        const { x, y } = coordenadasGrafo(e.clientX, e.clientY)
        const drag = arrastandoNoRef.current

        setNos(prev => {
          const next = new Map(prev)
          const no = next.get(drag.key)
          if (!no) return prev
          next.set(drag.key, { ...no, x: x - drag.offsetX, y: y - drag.offsetY, vx: 0, vy: 0 })
          return next
        })
        return
      }

      if (!arrastoRef.current.ativo) return

      const dx = e.clientX - arrastoRef.current.ultimoX
      const dy = e.clientY - arrastoRef.current.ultimoY
      arrastoRef.current.ultimoX = e.clientX
      arrastoRef.current.ultimoY = e.clientY
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }))
    },
    [coordenadasGrafo]
  )

  const onPointerUp = useCallback(() => {
    arrastoRef.current.ativo = false
    inicioDragRef.current = null
    if (arrastandoNoRef.current) arrastandoNoRef.current = null
  }, [])

  // --- Pinch-to-zoom (touch com dois dedos) ---
  //
  // Usamos eventos de touch nativos em vez de pointer events porque os
  // pointer events não expõem os dois pontos de contato simultaneamente —
  // cada dedo chega como um evento separado, o que torna impossível calcular
  // a distância entre eles de forma confiável num handler de React.
  //
  // Estratégia:
  //   touchstart com 2 dedos  → salva estado inicial (distância + zoom + pan + centro)
  //   touchmove  com 2 dedos  → calcula novo zoom proporcional à variação de distância,
  //                             ajusta o pan para manter o ponto central fixo na tela
  //   touchend / touchcancel  → limpa o estado do pinch
  //
  // O ajuste de pan durante o pinch garante que o ponto entre os dois dedos
  // não "pule" conforme o zoom muda (comportamento esperado em apps de mapa).

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 2) return

    // Impede scroll da página enquanto o gesto de pinch está ativo
    e.preventDefault()

    const t1 = e.touches[0]
    const t2 = e.touches[1]

    pinchRef.current = {
      distanciaInicial: distanciaToques(t1, t2),
      zoomInicial: zoomRef.current,
      panInicial: { ...panRef.current },
      centroCliente: centroToques(t1, t2),
    }
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 2 || !pinchRef.current) return

    e.preventDefault()

    const t1 = e.touches[0]
    const t2 = e.touches[1]
    const { distanciaInicial, zoomInicial, panInicial, centroCliente } = pinchRef.current

    const distanciaAtual = distanciaToques(t1, t2)
    const escala = distanciaAtual / distanciaInicial

    const novoZoom = Math.min(Math.max(zoomInicial * escala, 0.4), 2.5)

    // Para manter o ponto central fixo na tela enquanto o zoom muda,
    // calculamos onde esse ponto estava no espaço do grafo (com zoom/pan
    // iniciais) e ajustamos o pan para que ele permaneça no mesmo lugar
    // no SVG após o zoom.
    //
    // Fórmula: panNovo = centroSVG - centroGrafo * novoZoom
    // onde centroGrafo = (centroSVG - panInicial) / zoomInicial
    const svg = svgRef.current
    if (!svg) return

    const rect = svg.getBoundingClientRect()

    // Centro do gesto em coordenadas SVG (espaço [-W/2, W/2] x [-H/2, H/2])
    const centroSvgX = ((centroCliente.x - rect.left) / rect.width) * LARGURA_BASE - LARGURA_BASE / 2
    const centroSvgY = ((centroCliente.y - rect.top) / rect.height) * ALTURA_BASE - ALTURA_BASE / 2

    // Mesma posição no espaço do grafo (invariante durante o gesto)
    const centroGrafoX = (centroSvgX - panInicial.x) / zoomInicial
    const centroGrafoY = (centroSvgY - panInicial.y) / zoomInicial

    // Pan necessário para manter centroGrafo fixo em centroSvg com novoZoom
    const novoPanX = centroSvgX - centroGrafoX * novoZoom
    const novoPanY = centroSvgY - centroGrafoY * novoZoom

    setZoom(novoZoom)
    setPan({ x: novoPanX, y: novoPanY })
  }, [])

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    // Encerra o pinch quando qualquer dedo é levantado
    if (e.touches.length < 2) {
      pinchRef.current = null
    }
  }, [])

  const resetarVisualizacao = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])

  const listaNos = useMemo(() => Array.from(nos.values()), [nos])
  const listaArestas = useMemo(() => Array.from(arestas.values()), [arestas])

  const totalPessoas = listaNos.filter(n => n.tipo === 'pessoa').length
  const totalEmpresas = listaNos.filter(n => n.tipo === 'empresa' || n.tipo === 'raiz').length

  const containerRef = useRef<HTMLDivElement>(null)

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
  }

  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  if (indisponivel && listaNos.length <= 1) {
    return (
      <Card>
        <div className="flex flex-row items-start gap-3">
          <AlertTriangle className="size-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold mb-1">Malha de relações indisponível</h3>
            <p className="text-sm text-muted-foreground">
              Não foi possível carregar os dados de relações societárias agora. Este é um recurso
              experimental e pode estar temporariamente fora do ar.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <>
      <p className="px-6 md:px-12 text-sm text-muted-foreground">
        {totalPessoas} pessoa(s) · {totalEmpresas} empresa(s) conectada(s)
      </p>

      {erroExpansao && (
        <div className="px-6 mt-3">
          <div className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2 flex flex-row items-center justify-between gap-2">
            <span>{erroExpansao}</span>
            <Button variant="ghost" size="icon" className="size-6" onClick={() => setErroExpansao(null)}>
              ×
            </Button>
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className="w-full relative select-none touch-none fullscreen:h-screen fullscreen:w-screen"
        style={{ height: 480 }}
      >
        <div className="absolute right-12 top-0 flex flex-row gap-1 print:hidden">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setZoom(z => Math.min(z + 0.2, 2.5))}
            title="Aumentar zoom"
          >
            <ZoomIn className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setZoom(z => Math.max(z - 0.2, 0.4))}
            title="Diminuir zoom"
          >
            <ZoomOut className="size-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={resetarVisualizacao} title="Centralizar">
            <RefreshCw className="size-4" />
          </Button>
          <Button variant="outline" size="icon" title="Tela cheia" onClick={toggleFullscreen}>
            {fullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </Button>
        </div>

        <svg
          ref={svgRef}
          viewBox={`${-LARGURA_BASE / 2} ${-ALTURA_BASE / 2} ${LARGURA_BASE} ${ALTURA_BASE}`}
          className="w-full h-full bg-zinc-100 cursor-grab active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
        >
          <defs>
            <marker
              id="seta"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" className="fill-slate-300 dark:fill-slate-700" />
            </marker>
          </defs>

          <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
            {listaArestas.map(aresta => {
              const origem = nos.get(aresta.origem)
              const destino = nos.get(aresta.destino)
              if (!origem || !destino) return null
              return (
                <line
                  key={`${aresta.origem}__${aresta.destino}`}
                  x1={origem.x}
                  y1={origem.y}
                  x2={destino.x}
                  y2={destino.y}
                  className="stroke-slate-300 dark:stroke-slate-700"
                  strokeWidth={1.5}
                  markerEnd="url(#seta)"
                />
              )
            })}

            {listaNos.map(no => {
              const ehPessoa = no.tipo === 'pessoa'
              const ehRaiz = no.tipo === 'raiz'
              const selecionado = nosSelecionados.includes(no.key)
              const estaCarregando = carregando === no.key
              const raio = ehRaiz ? 34 : ehPessoa ? 22 : 26

              return (
                <g
                  key={no.key}
                  transform={`translate(${no.x} ${no.y})`}
                  className="cursor-pointer group"
                  onPointerDown={e => {
                    e.stopPropagation()
                    moveuNoRef.current = false
                    inicioDragRef.current = { x: e.clientX, y: e.clientY }
                    const { x, y } = coordenadasGrafo(e.clientX, e.clientY)
                    arrastandoNoRef.current = { key: no.key, offsetX: x - no.x, offsetY: y - no.y }
                  }}
                  onClick={async () => {
                    if (moveuNoRef.current) {
                      moveuNoRef.current = false
                      return
                    }

                    const selecionados = [...nosSelecionados]

                    if (selecionados.includes(no.key)) {
                      setNosSelecionados(selecionados.filter(item => item !== no.key))
                      return
                    }

                    if (selecionados.length === 0) {
                      setNosSelecionados([no.key])
                      await expandirNo(no)
                      return
                    }

                    if (selecionados.length === 1) {
                      const origem = nos.get(selecionados[0])
                      if (!origem) return
                      setNosSelecionados([selecionados[0], no.key])
                      await buscarConexao(origem, no)
                      return
                    }

                    setNosSelecionados([no.key])
                    await expandirNo(no)
                  }}
                >
                  {selecionado && (
                    <circle
                      r={raio + 6}
                      className="fill-none stroke-blue-400/60"
                      strokeWidth={2}
                      strokeDasharray="3 3"
                    />
                  )}

                  {ehPessoa ? (
                    <circle
                      r={raio}
                      className={
                        ehRaiz
                          ? 'fill-blue-600'
                          : 'fill-white dark:fill-slate-900 stroke-blue-500 group-hover:fill-blue-50 dark:group-hover:fill-slate-800'
                      }
                      strokeWidth={2}
                    />
                  ) : (
                    <rect
                      x={-raio}
                      y={-raio}
                      width={raio * 2}
                      height={raio * 2}
                      rx={8}
                      className={
                        ehRaiz
                          ? 'fill-blue-600'
                          : 'fill-white dark:fill-slate-900 stroke-slate-400 group-hover:fill-slate-50 dark:group-hover:fill-slate-800'
                      }
                      strokeWidth={2}
                    />
                  )}

                  <foreignObject
                    x={-raio}
                    y={-raio}
                    width={raio * 2}
                    height={raio * 2}
                    className="pointer-events-none"
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      {estaCarregando ? (
                        <Loader2 className={`size-4 animate-spin ${ehRaiz ? 'text-white' : 'text-slate-500'}`} />
                      ) : ehPessoa ? (
                        <User className={`size-4 ${ehRaiz ? 'text-white' : 'text-blue-500'}`} />
                      ) : (
                        <Building2 className={`size-4 ${ehRaiz ? 'text-white' : 'text-slate-500'}`} />
                      )}
                    </div>
                  </foreignObject>

                  <text
                    y={raio + 16}
                    textAnchor="middle"
                    className="text-[10px] font-medium fill-slate-700 dark:fill-slate-300"
                  >
                    {no.label.length > 22 ? `${no.label.slice(0, 22)}…` : no.label}
                  </text>
                </g>
              )
            })}
          </g>
        </svg>
      </div>

      {nosSelecionados.length === 1 && nos.get(nosSelecionados[0]) && (
        <div className="px-6">
          <NoDetalhe no={nos.get(nosSelecionados[0]) as No} />
        </div>
      )}

      <div className="p-6 flex flex-row items-center gap-4 text-xs text-muted-foreground border-t">
        <span className="flex flex-row items-center gap-1.5">
          <User className="size-3.5 text-blue-500" /> Pessoa
        </span>
        <span className="flex flex-row items-center gap-1.5">
          <Building2 className="size-3.5 text-slate-500" /> Empresa
        </span>
        <span className="ml-auto print:hidden">Clique em um nó para expandir a rede</span>
      </div>
    </>
  )
}

function NoDetalhe({ no }: { no: No }) {
  const ehEmpresaClicavel = no.tipo !== 'pessoa'

  const cnpj =
    no.documento && no.documento.replace(/\D/g, '').length === 14
      ? formatCNPJ(no.documento.replace(/\D/g, ''))
      : no.sublabel

  return (
    <div className="flex flex-row items-center justify-between gap-3 bg-zinc-100 rounded-lg px-4">
      <div>
        <p className="text-sm font-semibold">{no.label}</p>
        {cnpj && <p className="text-xs text-muted-foreground font-mono">{cnpj}</p>}
      </div>

      {ehEmpresaClicavel && no.documento && (
        <Button variant="outline" size="sm" asChild>
          <a href={`/consulta/${no.documento.replace(/\D/g, '')}`}>Ver empresa</a>
        </Button>
      )}
    </div>
  )
}