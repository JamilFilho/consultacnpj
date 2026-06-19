"use client"

import { useState, useCallback } from 'react'
import {
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Download,
  Hash,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  gerarCNPJ,
  gerarLoteCNPJ,
  formatarCNPJ,
  type FormatoCNPJ,
} from '@/lib/cnpj-generator'

type Modo = 'unico' | 'lote'

// Pesos usados no cálculo — exibidos na anotação da anatomia do número
const PESOS_DV1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

function useClipboard() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const copiar = useCallback((texto: string, key: string) => {
    navigator.clipboard.writeText(texto)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500)
  }, [])

  return { copiedKey, copiar }
}

export default function GeradorCNPJClient() {
  const [formato, setFormato] = useState<FormatoCNPJ>('numerico')
  const [modo, setModo] = useState<Modo>('unico')
  const [cnpjAtual, setCnpjAtual] = useState<string>(() => gerarCNPJ('numerico'))
  const [lote, setLote] = useState<string[]>([])
  const [quantidadeLote, setQuantidadeLote] = useState(10)
  const { copiedKey, copiar } = useClipboard()

  const gerarUnico = useCallback((f: FormatoCNPJ) => {
    setCnpjAtual(gerarCNPJ(f))
  }, [])

  const gerarOLote = useCallback((f: FormatoCNPJ, qtd: number) => {
    setLote(gerarLoteCNPJ(qtd, f))
  }, [])

  function trocarFormato(novoFormato: FormatoCNPJ) {
    setFormato(novoFormato)
    if (modo === 'unico') {
      gerarUnico(novoFormato)
    } else {
      gerarOLote(novoFormato, quantidadeLote)
    }
  }

  function trocarModo(novoModo: Modo) {
    setModo(novoModo)
    if (novoModo === 'lote' && lote.length === 0) {
      gerarOLote(formato, quantidadeLote)
    }
  }

  function baixarLoteCsv() {
    const linhas = ['cnpj_sem_mascara,cnpj_formatado', ...lote.map((c) => `${c},${formatarCNPJ(c)}`)]
    const blob = new Blob([linhas.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cnpjs-teste-${formato}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const cnpjFormatado = formatarCNPJ(cnpjAtual)
  const base = cnpjAtual.slice(0, 12)
  const dv = cnpjAtual.slice(12, 14)

  return (
    <section className="w-2/3 mx-auto px-6 mt-12 pt-12">
      {/* Cabeçalho */}
      <header className="mb-10">
        <Badge variant="outline" className="mb-3 font-mono text-xs">
          Apenas para ambiente de teste
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Gerador de CNPJ
        </h1>
        <p className="text-muted-foreground">
          Números com dígito verificador matematicamente válido (módulo 11), gerados ao acaso e não correspondem a empresas reais. Use para popular bancos de dados de desenvolvimento, testes automatizados ou formulários de homologação.
        </p>
      </header>

      {/* Aviso sobre uso indevido */}
      <Alert />

      {/* Controles: formato + modo */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex rounded-lg border p-1 bg-muted/40">
          <button
            onClick={() => trocarFormato('numerico')}
            className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
              formato === 'numerico'
                ? 'bg-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Numérico
          </button>
          <button
            onClick={() => trocarFormato('alfanumerico')}
            className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
              formato === 'alfanumerico'
                ? 'bg-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Alfanumérico (2026)
          </button>
        </div>

        <div className="flex rounded-lg border p-1 bg-muted/40">
          <button
            onClick={() => trocarModo('unico')}
            className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
              modo === 'unico'
                ? 'bg-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Um por vez
          </button>
          <button
            onClick={() => trocarModo('lote')}
            className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
              modo === 'lote'
                ? 'bg-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Em lote
          </button>
        </div>
      </div>

      {modo === 'unico' ? (
        <div className="space-y-6">
          {/* Card principal com o CNPJ gerado */}
          <Card className="overflow-hidden">
            <CardContent className="p-6 flex flex-col items-center gap-6">
              <p className="font-mono text-xl md:text-5xl font-bold tracking-wide tabular-nums">
                {cnpjFormatado}
              </p>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => copiar(cnpjFormatado, 'formatado')}
                >
                  {copiedKey === 'formatado' ? (
                    <Check className="text-emerald-600" />
                  ) : (
                    <Copy />
                  )}
                  Copiar formatado
                </Button>
                <Button
                  variant="outline"
                  onClick={() => copiar(cnpjAtual, 'limpo')}
                >
                  {copiedKey === 'limpo' ? (
                    <Check className="text-emerald-600" />
                  ) : (
                    <Hash />
                  )}
                  Copiar sem máscara
                </Button>
                <Button onClick={() => gerarUnico(formato)}>
                  <RefreshCw />
                  Gerar outro
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Anatomia do número — o elemento de assinatura desta página */}
          <Card>
            <div className="px-6">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Anatomia deste número
              </h2>
            </div>
            <Separator />
            <div className="p-6 space-y-4">
              <div className="flex flex-col md:grid md:grid-cols-3 gap-px rounded-lg overflow-hidden border bg-border font-mono text-center">
                <div className="bg-card p-3">
                  <p className="text-2xl font-semibold tabular-nums">{base.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Raiz</p>
                </div>
                <div className="bg-card p-3">
                  <p className="text-2xl font-semibold tabular-nums">{base.slice(8, 12)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Ordem do estabelecimento</p>
                </div>
                <div className="bg-card p-3">
                  <p className="text-2xl font-semibold tabular-nums">{dv}</p>
                  <p className="text-xs text-muted-foreground mt-1">Dígitos verificadores</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {formato === 'alfanumerico' ? (
                  <>
                    As 12 primeiras posições podem combinar letras (A-Z) e dígitos. Os dígitos verificadores são sempre numéricos, calculados convertendo cada caractere pelo seu valor ASCII menos 48 — assim <code className="text-xs bg-muted px-1 py-0.5 rounded">'A'</code> vale 17 e{' '}
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">'0'</code> vale 0 no cálculo do módulo 11.
                  </>
                ) : (
                  <>
                    As 8 primeiras posições identificam a raiz da empresa; as 4 seguintes, a ordem do estabelecimento (0001 para a matriz). Os dois últimos dígitos são verificadores, calculados por módulo 11 com pesos{' '}
                    <span className="font-mono text-xs">
                      {PESOS_DV1.join(' · ')}
                    </span>
                    .
                  </>
                )}
              </p>
            </div>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Controles do lote */}
          <Card>
            <CardContent className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-2 flex-1">
                <label htmlFor="quantidade" className="text-sm text-muted-foreground whitespace-nowrap">
                  Quantidade
                </label>
                <input
                  id="quantidade"
                  type="number"
                  min={1}
                  max={1000}
                  value={quantidadeLote}
                  onChange={(e) => {
                    const valor = Math.max(1, Math.min(1000, Number(e.target.value) || 1))
                    setQuantidadeLote(valor)
                  }}
                  className="w-24 rounded-md border px-3 py-1.5 text-sm font-mono bg-background"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={() => gerarOLote(formato, quantidadeLote)}>
                  <Sparkles />
                  Gerar lote
                </Button>
                <Button
                  variant="outline"
                  onClick={baixarLoteCsv}
                  disabled={lote.length === 0}
                >
                  <Download />
                  Baixar .csv
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de resultados */}
          {lote.length > 0 && (
            <Card className="py-0 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>CNPJ formatado</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lote.map((cnpj, index) => (
                    <TableRow key={cnpj}>
                      <TableCell className="text-muted-foreground tabular-nums">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-mono tabular-nums">
                        {formatarCNPJ(cnpj)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copiar(cnpj, `lote-${cnpj}`)}
                        >
                          {copiedKey === `lote-${cnpj}` ? (
                            <Check className="text-emerald-600 size-4" />
                          ) : (
                            <Copy className="size-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      )}
    </section>
  )
}

function Alert() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 mb-6">
      <AlertTriangle className="size-4 text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
      <p className="text-sm text-amber-900 dark:text-amber-200">
        Estes números têm dígito verificador válido, mas são gerados aleatoriamente e não pertencem a nenhuma empresa registrada. Não use para abrir contas, simular cadastros em produção ou qualquer finalidade fora de ambientes de desenvolvimento e teste.
      </p>
    </div>
  )
}