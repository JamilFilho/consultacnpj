"use client"

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  ClipboardPaste,
  Trash2,
  AlertCircle,
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
  diagnosticarCNPJ,
  formatarCNPJ,
  type DiagnosticoCNPJ,
} from '@/lib/cnpj-generator'

type Modo = 'unico' | 'lote'

// Rótulos legíveis para cada motivo de invalidez — voz da interface,
// explica o que aconteceu sem se desculpar.
const RAZOES: Record<NonNullable<DiagnosticoCNPJ['motivoInvalidez']>, string> = {
  vazio: 'Vazio',
  tamanho_incorreto: 'Tamanho incorreto',
  caractere_invalido: 'Caractere inválido',
  todos_iguais: 'Sequência trivial',
  dv_incorreto: 'Dígito verificador incorreto',
}

export default function ValidadorCNPJClient() {
  const [modo, setModo] = useState<Modo>('unico')
  const [valorUnico, setValorUnico] = useState('')
  const [textoLote, setTextoLote] = useState('')

  const diagnosticoUnico = useMemo(
    () => (valorUnico.trim() ? diagnosticarCNPJ(valorUnico) : null),
    [valorUnico]
  )

  const resultadosLote = useMemo(() => {
    const linhas = textoLote
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)

    return linhas.map((linha) => ({
      entrada: linha,
      diagnostico: diagnosticarCNPJ(linha),
    }))
  }, [textoLote])

  const resumoLote = useMemo(() => {
    const total = resultadosLote.length
    const validos = resultadosLote.filter((r) => r.diagnostico.valido).length
    return { total, validos, invalidos: total - validos }
  }, [resultadosLote])

  async function colarDaAreaDeTransferencia() {
    try {
      const texto = await navigator.clipboard.readText()
      if (modo === 'unico') {
        setValorUnico(texto)
      } else {
        setTextoLote((atual) => (atual ? `${atual}\n${texto}` : texto))
      }
    } catch {
      // Permissão de clipboard negada pelo navegador — sem tratamento
      // especial, o usuário pode colar manualmente com Ctrl+V.
    }
  }

  return (
    <section className="md:w-2/3 mx-auto px-6 mt-12 pt-12">
      {/* Cabeçalho */}
      <div className="mb-10">
        <Badge variant="outline" className="mb-3 font-mono text-xs">
          Validação por módulo 11
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Validador de CNPJ
        </h1>
        <p className="text-muted-foreground">
          Confere se o dígito verificador de um CNPJ está matematicamente correto, formato numérico clássico ou alfanumérico (2026). Isso confirma a estrutura do número, não se a empresa existe de fato.
        </p>
      </div>

      {/* Toggle de modo */}
      <div className="flex rounded-lg border p-1 bg-muted/40 w-fit mb-6">
        <button
          onClick={() => setModo('unico')}
          className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
            modo === 'unico'
              ? 'bg-background shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Um por vez
        </button>
        <button
          onClick={() => setModo('lote')}
          className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
            modo === 'lote'
              ? 'bg-background shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Em lote
        </button>
      </div>

      {modo === 'unico' ? (
        <div className="space-y-6">
          {/* Campo de entrada */}
          <Card>
            <div className="px-4 flex flex-col md:flex-row gap-2">
              <input
                type="text"
                value={valorUnico}
                onChange={(e) => setValorUnico(e.target.value)}
                placeholder="00.000.000/0001-00"
                className="flex-1 rounded-md border px-4 py-2 font-mono text-md tracking-wide bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                autoFocus
              />
              <Button className="h-full py-2.5" variant="outline" onClick={colarDaAreaDeTransferencia}>
                <ClipboardPaste />
                Colar
              </Button>
            </div>
          </Card>

          {/* Resultado */}
          {diagnosticoUnico && (
            <ResultadoUnico diagnostico={diagnosticoUnico} />
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Campo de entrada em lote */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <textarea
                value={textoLote}
                onChange={(e) => setTextoLote(e.target.value)}
                placeholder={'Um CNPJ por linha, por exemplo:\n11.222.333/0001-81\n12ABC345000188'}
                rows={6}
                className="w-full rounded-md border px-4 py-3 font-mono text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-y"
              />
              <div className="flex gap-2">
                <Button variant="outline" onClick={colarDaAreaDeTransferencia}>
                  <ClipboardPaste />
                  Colar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setTextoLote('')}
                  disabled={!textoLote}
                >
                  <Trash2 />
                  Limpar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resumo + tabela */}
          {resultadosLote.length > 0 && (
            <>
              <div className="flex gap-3">
                <Card className="flex-1 p-4">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-semibold tabular-nums">
                    {resumoLote.total}
                  </p>
                </Card>
                <Card className="flex-1 p-4 border-emerald-200 dark:border-emerald-900">
                  <p className="text-sm text-muted-foreground">Válidos</p>
                  <p className="text-2xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {resumoLote.validos}
                  </p>
                </Card>
                <Card className="flex-1 p-4 border-red-200 dark:border-red-900">
                  <p className="text-sm text-muted-foreground">Inválidos</p>
                  <p className="text-2xl font-semibold tabular-nums text-red-600 dark:text-red-400">
                    {resumoLote.invalidos}
                  </p>
                </Card>
              </div>

              <Card className="py-0 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>CNPJ informado</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Detalhe</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resultadosLote.map(({ entrada, diagnostico }, index) => (
                      <TableRow key={`${entrada}-${index}`}>
                        <TableCell className="font-mono text-sm">
                          {entrada}
                        </TableCell>
                        <TableCell>
                          {diagnostico.valido ? (
                            <Badge className="gap-1">
                              <CheckCircle2 className="size-3.5" />
                              Válido
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="gap-1">
                              <XCircle className="size-3.5" />
                              Inválido
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {diagnostico.valido
                            ? diagnostico.formatoDetectado === 'alfanumerico'
                              ? 'Alfanumérico'
                              : 'Numérico'
                            : RAZOES[diagnostico.motivoInvalidez!]}
                        </TableCell>
                        <TableCell className="text-right">
                          {diagnostico.valido && (
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/consulta/${diagnostico.limpo}`}>
                                Consultar
                                <ExternalLink className="size-3.5" />
                              </Link>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </>
          )}
        </div>
      )}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Resultado detalhado do modo "um por vez"
// ---------------------------------------------------------------------------

function ResultadoUnico({ diagnostico }: { diagnostico: DiagnosticoCNPJ }) {
  if (diagnostico.motivoInvalidez === 'vazio') return null

  if (diagnostico.valido) {
    return (
      <Card className="border-emerald-200 dark:border-emerald-900 overflow-hidden">
        <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-5" />
            <span className="font-semibold">CNPJ válido</span>
          </div>

          <p className="font-mono text-2xl md:text-3xl font-semibold tracking-wide tabular-nums">
            {formatarCNPJ(diagnostico.limpo)}
          </p>

          <Badge variant="outline">
            {diagnostico.formatoDetectado === 'alfanumerico'
              ? 'Formato alfanumérico (2026)'
              : 'Formato numérico'}
          </Badge>

          <p className="text-sm text-muted-foreground">
            O dígito verificador <span className="font-mono">{diagnostico.dvCalculado}</span>{' '} confere com a base informada. Isso garante que a estrutura do número está correta — para saber se a empresa existe de fato, consulte na Receita.
          </p>

          <Button asChild>
            <Link href={`/consulta/${diagnostico.limpo}`}>
              Consultar este CNPJ na Receita
              <ExternalLink />
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-red-200 dark:border-red-900 overflow-hidden">
      <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <XCircle className="size-5" />
          <span className="font-semibold">CNPJ inválido</span>
        </div>

        <p className="text-sm text-muted-foreground max-w-md">
          {diagnostico.mensagem}
        </p>

        {diagnostico.motivoInvalidez === 'dv_incorreto' && diagnostico.base && (
          <div className="w-full pt-2">
            <Separator className="mb-4" />
            <div className="grid grid-cols-2 gap-px rounded-lg overflow-hidden border bg-border font-mono text-center text-sm">
              <div className="bg-card p-3">
                <p className="text-lg font-semibold tabular-nums text-muted-foreground">
                  {diagnostico.dvInformado}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Informado</p>
              </div>
              <div className="bg-card p-3">
                <p className="text-lg font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {diagnostico.dvCalculado}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Esperado</p>
              </div>
            </div>
          </div>
        )}

        {diagnostico.motivoInvalidez === 'caractere_invalido' && (
          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 text-left">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>
              Aceito: dígitos (0-9) em qualquer posição, e letras (A-Z) nas
              12 primeiras posições no formato alfanumérico.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}