"use client"

import Link from 'next/link'
import React from 'react'
import { Card, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Building2, DollarSign, Landmark, Search, Printer, MapPinned, ChevronsUpDown, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CNPJData } from './types'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Map from '@/components/map'

interface Props {
  data: CNPJData
  description: string
}

interface RegimeTributario {
  ano: number
  cnpj_da_scp: string | null
  forma_de_tributacao: string
  quantidade_de_escrituracoes: number
}

function formatCNPJ(cnpj: string): string {
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

function formatPhone(raw: string): string {
  if (!raw) return '—'
  const ddd = raw.slice(0, 2)
  const num = raw.slice(2)
  const formatted =
    num.length === 9
      ? num.replace(/(\d{5})(\d{4})/, '$1-$2')
      : num.replace(/(\d{4})(\d{4})/, '$1-$2')
  return `(${ddd}) ${formatted}`
}

function formatCEP(cep: string): string {
  return cep.replace(/(\d{5})(\d{3})/, '$1-$2')
}

export default function CNPJPageContent({ data, description }: Props) {
  const [loading, setLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)

  return (
    <>
      <header className="mb-8 flex flex-col md:grid md:grid-cols-2 gap-2">
        <div>
          <h1 className="text-2xl mb-2 font-bold">{data.razao_social}</h1>
        </div>
        <div className="print:hidden flex flex-row gap-2 justify-start md:justify-end">
          <Button asChild>
            <Link href="/">
              <Search />
              Nova pesquisa
            </Link>
          </Button>

          <Button variant="outline" onClick={() => window.print()}>
            <Printer />
            Imprimir
          </Button>
        </div>
      </header>
      
      <div className="mb-12 flex flex-col gap-4">
        {description}

        <span className="text-xs text-zinc-500 flex flex-row gap-2 items-center">
          <Info className="size-3"/>
          Descrição gerada com IA
        </span>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Card className="flex flex-row items-center justify-between py-2 px-4">
            <CardDescription>CNPJ</CardDescription>
            <p>
              {formatCNPJ(data.cnpj)}
            </p>
          </Card>
          <Card className="flex flex-row items-center justify-between py-2 px-4">
            <CardDescription>Nome fantasia</CardDescription>
            <p>
              {data.nome_fantasia}
            </p>
          </Card>
          {/* Situação Cadastral */}
          <Card className="py-2 px-4 flex flex-col">
            <div className="flex flex-row items-center justify-between">
              <CardDescription>Situação cadastral</CardDescription>
              <Badge
                variant={data.descricao_situacao_cadastral === 'ATIVA' ? 'default' : 'destructive'}
              >
                {data.descricao_situacao_cadastral}
              </Badge>
            </div>
            {data.descricao_situacao_cadastral === 'BAIXADA' && (
              <p>{data.descricao_motivo_situacao_cadastral}</p>
            )}
          </Card>
        </div>

        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Atualizações da empresa</TableHead>
                <TableHead className="text-right">Data</TableHead>
              </TableRow>
            </TableHeader>

          <TableBody>
              {[
                { label: 'Data de início das atividades', value: data.data_inicio_atividade },
                { label: 'Data de opção pelo MEI', value: data.data_opcao_pelo_mei },
                { label: 'Data de exclusão do MEI', value: data.data_exclusao_do_mei },
                { label: 'Data de opção pelo simples', value: data.data_opcao_pelo_simples },
                { label: 'Data de exclusão do simples', value: data.data_exclusao_do_simples },
              ]
               // Filtra itens que possuem data válida e garante ao TypeScript que `value` é string
              .filter((item): item is { label: string; value: string } => Boolean(item.value))
              .sort((a, b) => new Date(a.value).getTime() - new Date(b.value).getTime())
              .map(item => (
                <TableRow key={item.label}>
                  <TableCell className="font-medium">{item.label}</TableCell>
                  <TableCell className="text-right">{new Date(item.value as string).toLocaleDateString('pt-BR')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 print:grid-cols-3 gap-4">
          <Card className="p-6">
            <Building2 className="mb-4" />
            <p className="text-sm text-muted-foreground font-medium">Tipo de Empresa</p>
            <p className="text-base font-semibold mt-1">{data.porte}</p>
          </Card>

          <Card className="p-6">
            <Landmark className="mb-4" />
            <p className="text-sm text-muted-foreground font-medium">Natureza Jurídica</p>
            <p className="text-base font-semibold mt-1">{data.natureza_juridica}</p>
          </Card>

          <Card className="p-6">
            <DollarSign className="mb-4" />
            <p className="text-sm text-muted-foreground font-medium">Capital Social</p>
            <p className="text-base font-semibold mt-1">
              R$ {Number(data.capital_social).toLocaleString('pt-BR')}
            </p>
          </Card>
        </div>

        {/* Regime Tributário */}

        {data.regime_tributario && data.regime_tributario.length > 0 && (
          <Card className="py-0">
            <Table>
              <TableCaption>Regime Tributário</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Ano</TableHead>
                  <TableHead>Forma de Tributação</TableHead>
                  <TableHead className="text-center">Escriturações (ECF)</TableHead>
                  <TableHead>CNPJ SCP</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {(data.regime_tributario as RegimeTributario[]).map((item) => (
                  <TableRow key={item.ano}>
                    <TableCell className="font-medium">{item.ano}</TableCell>
                    <TableCell>{item.forma_de_tributacao}</TableCell>
                    <TableCell className="text-center">{item.quantidade_de_escrituracoes}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.cnpj_da_scp ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Estabelecimento */}
        <Card>
          <div className="px-6 flex flex-row justify-between">
            <h3 className="text-lg font-semibold">Estabelecimento</h3>
          </div>

          <Separator />
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2 -mt-2 mb-4">
              <Map
                descricao_tipo_de_logradouro={data.descricao_tipo_de_logradouro}
                logradouro={data.logradouro}
                numero={data.numero}
                complemento={data.complemento}
                municipio={data.municipio}
                uf={data.uf}
                cep={data.cep}
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tipo</p>
              <p className="font-medium">{data.descricao_tipo_de_logradouro || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data de Início</p>
              <p className="font-medium">
                {new Date(data.data_inicio_atividade).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Logradouro</p>
              <p className="font-medium">
                {data.descricao_tipo_de_logradouro} {data.logradouro}, {data.numero}
                {data.complemento ? ` — ${data.complemento}` : ''}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Localização</p>
              <p className="font-medium">
                {data.municipio}, {data.uf}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">CEP</p>
              <p className="font-medium">{formatCEP(data.cep)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Telefone(s)</p>
              <p className="font-medium">
                {data.uf !== "EX" ? (
                  <a href={`tel:+55${data.ddd_telefone_1}`}>
                   {formatPhone(data.ddd_telefone_1)}
                  </a>
                ) : (
                  <>
                    {formatPhone(data.ddd_telefone_1)}
                  </>
                )}
                {data.ddd_telefone_2.length > 0 && data.uf !== "EX" && (
                  <a href={`tel:+55${data.ddd_telefone_2}`}>
                    &nbsp;—&nbsp;{formatPhone(data.ddd_telefone_2)}
                  </a>
                )}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Email</p>
              {data.email ? (
                <a href={`mailto:${data.email}`} className="font-medium hover:underline">
                  {data.email}
                </a>
              ) : (
                <p className="font-medium">—</p>
              )}
            </div>
          </div>
        </Card>

        {/* Atividade Principal */}
        <Card>
          <h3 className="px-6 text-lg font-semibold">Atividade Principal</h3>
          <Separator />
          <div className="px-6">
            <Card className="bg-slate-50 dark:bg-slate-900/50 border-0">
              <CardContent>
                <p className="font-medium">{data.cnae_fiscal_descricao}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Código: {data.cnae_fiscal}
                </p>
              </CardContent>
            </Card>
          </div>

          {data.cnaes_secundarios.length > 0 && (
            <div className="mb-6">
              <Separator />
              <p className="px-6 text-sm font-semibold text-muted-foreground my-3">
                Atividades Secundárias ({data.cnaes_secundarios.length})
              </p>
              <Separator />
              <div className="pt-4 -mb-4 px-6 space-y-2">
                {data.cnaes_secundarios.map((atividade) => (
                  <div
                    key={atividade.codigo}
                    className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg"
                  >
                    <p className="text-sm">{atividade.descricao}</p>
                    <p className="text-xs text-muted-foreground">Código: {atividade.codigo}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Sócios */}
        <Card>
          <h3 className="text-lg font-semibold px-6">Sócios ({data.qsa.length})</h3>
          <Separator />
          <div className="py-4 px-6 space-y-4">
            {data.qsa.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                Nenhum sócio registrado.
              </p>
            ) : (
              data.qsa.map((socio, index) => (
                <Card key={index}>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Nome</p>
                        <p className="font-semibold">{socio.nome_socio}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Qualificação</p>
                        <p className="font-semibold">{socio.qualificacao_socio}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">CPF/CNPJ</p>
                        <p className="font-mono text-sm">{socio.cnpj_cpf_do_socio}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Data de Entrada</p>
                        <p className="font-semibold">
                          {new Date(socio.data_entrada_sociedade).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Faixa Etária</p>
                        <p className="font-semibold">{socio.faixa_etaria}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </Card>
      </div>
    </>
  )
}