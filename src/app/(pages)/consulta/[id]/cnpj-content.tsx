// app/p/[id]/cnpj-content.tsx
"use client"

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Building2, DollarSign, Landmark, Search, Printer, Info, ExternalLink, AlertTriangle, ChevronsUpDown, Network } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CNPJData } from './types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Map from '@/components/map'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getNaturezaJuridica } from '@/components/natureza-juridica'
import { getCnpjMatriz } from '@/lib/cnpj-matriz'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Item } from '@/components/ui/item'
import { EmpresaRelacionada } from './types'

// ---------------------------------------------------------------------------
// Props — dados síncronos (base) + slots async (Suspense boundaries)
// ---------------------------------------------------------------------------

interface Props {
  data: CNPJData & {
    emailPrimario: string | null
    empresasMesmoEndereco: EmpresaRelacionada[]
  }
  // Cada slot é um <Suspense> boundary injetado pelo page.tsx
  descricaoSlot: React.ReactNode
  emailSlot: React.ReactNode
  suframaSlot: React.ReactNode
  inscricoesSlot: React.ReactNode
  grafoSlot: React.ReactNode
}

interface RegimeTributario {
  ano: number
  cnpj_da_scp: string | null
  forma_de_tributacao: string
  quantidade_de_escrituracoes: number
}

// ---------------------------------------------------------------------------
// Helpers de formatação
// ---------------------------------------------------------------------------

function formatCNPJ(cnpj: string): string {
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

function formatCPF(cpf: string): string {
  const clean = cpf.replace(/[^\d*]/g, '')
  if (clean.length !== 11) return cpf
  return clean.replace(/(.{3})(.{3})(.{3})(.{2})/, '$1.$2.$3-$4')
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

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export default function CNPJPageContent({
  data,
  descricaoSlot,
  emailSlot,
  suframaSlot,
  inscricoesSlot,
  grafoSlot,
}: Props) {
  const ehMatriz = data.identificador_matriz_filial === 1
  const cnpjMatriz = !ehMatriz ? getCnpjMatriz(data.cnpj) : null

  const temSituacaoEspecial = Boolean(
    data.situacao_especial && data.situacao_especial.trim().length > 0
  )

  // Análise societária
  const sociosPF = data.qsa.filter((s) => s.cnpj_cpf_do_socio.includes('*'))
  const sociosPJ = data.qsa.filter((s) => !s.cnpj_cpf_do_socio.includes('*'))

  const socioMaisAntigo =
    data.qsa.length > 0
      ? [...data.qsa].sort(
          (a, b) =>
            new Date(a.data_entrada_sociedade).getTime() -
            new Date(b.data_entrada_sociedade).getTime()
        )[0]
      : null

  const socioMaisRecente =
    data.qsa.length > 0
      ? [...data.qsa].sort(
          (a, b) =>
            new Date(b.data_entrada_sociedade).getTime() -
            new Date(a.data_entrada_sociedade).getTime()
        )[0]
      : null

  const dataMaisAntiga = socioMaisAntigo?.data_entrada_sociedade

  const quantidadeSociosMaisAntigos = dataMaisAntiga
    ? data.qsa.filter((s) => s.data_entrada_sociedade === dataMaisAntiga).length
    : 0

  const todosEntraramMesmaData = quantidadeSociosMaisAntigos === data.qsa.length

  const anosDesdeUltimaAlteracao = socioMaisRecente
    ? (Date.now() - new Date(socioMaisRecente.data_entrada_sociedade).getTime()) /
      (1000 * 60 * 60 * 24 * 365)
    : 0

  const idadeEmpresa =
    (Date.now() - new Date(data.data_inicio_atividade).getTime()) /
    (1000 * 60 * 60 * 24 * 365)

  let estabilidade = 'Não disponível'
  if (socioMaisRecente) {
    if (idadeEmpresa < 1 && todosEntraramMesmaData) {
      estabilidade = 'Empresa recém-constituída'
    } else if (anosDesdeUltimaAlteracao >= 5) {
      estabilidade = 'Muito estável'
    } else if (anosDesdeUltimaAlteracao >= 2) {
      estabilidade = 'Estável'
    } else if (anosDesdeUltimaAlteracao >= 1) {
      estabilidade = 'Alteração recente'
    } else {
      estabilidade = 'Alta rotatividade'
    }
  }

  let concentracaoSocietaria = ''
  if (data.qsa.length === 1) {
    concentracaoSocietaria = 'Sócio único'
  } else if (data.qsa.length <= 3) {
    concentracaoSocietaria = 'Sociedade simples'
  } else if (data.qsa.length <= 5) {
    concentracaoSocietaria = 'Sociedade diversificada'
  } else {
    concentracaoSocietaria = 'Estrutura societária ampliada'
  }

  const administradores = data.qsa.filter((s) =>
    s.qualificacao_socio.toLowerCase().includes('administrador')
  )

  const faixasEtarias = data.qsa.reduce((acc, socio) => {
    acc[socio.faixa_etaria] = (acc[socio.faixa_etaria] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const faixaPredominante = Object.entries(faixasEtarias).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0]

  const descricaoEstabilidade: Record<string, string> = {
    'Empresa recém-constituída':
      'Empresa aberta há menos de 12 meses. Ainda não há histórico suficiente para avaliar a estabilidade do quadro societário.',
    'Muito estável': 'O quadro societário não apresenta alterações há mais de 5 anos.',
    Estável:
      'O quadro societário não apresenta alterações recentes, com a última mudança ocorrida entre 2 e 5 anos atrás.',
    'Alteração recente':
      'Foi identificada uma alteração no quadro societário entre 1 e 2 anos atrás.',
    'Alta rotatividade':
      'Foi identificada uma alteração societária nos últimos 12 meses.',
  }

  return (
    <>
      {/* Header — renderiza imediatamente */}
      <header className="mt-12 mb-8 flex flex-col md:grid md:grid-cols-2 gap-2">
        <div>
          <div className="flex flex-row items-center gap-2 mb-2 flex-wrap">
            <h1 className="text-2xl font-bold">{data.razao_social}</h1>
          </div>
        </div>
        <div className="print:hidden flex flex-row gap-2 justify-start md:justify-end">
          <Button asChild>
            <Link href={`/conexoes/${data.cnpj}`}>
              <Network />
              Malha de conexões
            </Link>
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer />
            Imprimir relatório
          </Button>
        </div>
      </header>

      {/* Descrição — slot async, preenche via streaming */}
      {descricaoSlot}

      <div className="space-y-6">
        {/* Dados cadastrais básicos — renderiza imediatamente */}
        <div className="space-y-2">
          <Card className="flex flex-row items-center justify-between py-2 px-4">
            <CardDescription>CNPJ</CardDescription>
            <p>{formatCNPJ(data.cnpj)}</p>
          </Card>

          <Card className="flex flex-row items-center justify-between py-2 px-4">
            <CardDescription>Nome fantasia</CardDescription>
            <p>{data.nome_fantasia}</p>
          </Card>

          <Card className="py-2 px-4 flex flex-col">
            <div className="flex flex-row items-center justify-between">
              <CardDescription>Situação cadastral</CardDescription>
              <Badge
                variant={
                  data.descricao_situacao_cadastral === 'ATIVA' ? 'default' : 'destructive'
                }
              >
                {data.descricao_situacao_cadastral}
              </Badge>
            </div>
            {data.descricao_situacao_cadastral === 'BAIXADA' && (
              <p>{data.descricao_motivo_situacao_cadastral}</p>
            )}
          </Card>

          {temSituacaoEspecial && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>
                Situação especial registrada: {data.situacao_especial}
              </AlertTitle>
              <AlertDescription>
                {data.data_situacao_especial
                  ? `Registrada em ${new Date(data.data_situacao_especial).toLocaleDateString('pt-BR')}. `
                  : ''}
                Este é um evento informado pela Receita Federal e pode indicar processo de
                falência, recuperação judicial ou liquidação. Recomenda-se cautela e
                verificação adicional antes de fechar negócios com esta empresa.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Cards de resumo — síncronos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 print:grid-cols-3 gap-4">
          <Card className="p-6">
            <Building2 className="mb-4" />
            <p className="text-sm text-muted-foreground font-medium">Tipo de Empresa</p>
            <p className="text-base font-semibold mt-1">
              {data.opcao_pelo_mei ? 'MEI' : data.porte}
            </p>
          </Card>

          <Card className="p-6">
            <div className="mb-4 flex flex-row items-center justify-between">
              <Landmark />
              <Tooltip>
                <TooltipTrigger>
                  <Info className="size-4" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getNaturezaJuridica(data.codigo_natureza_juridica)}</p>
                </TooltipContent>
              </Tooltip>
            </div>
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

        {/* Atualizações — síncronas */}
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
                .filter((item): item is { label: string; value: string } =>
                  Boolean(item.value)
                )
                .sort(
                  (a, b) => new Date(a.value).getTime() - new Date(b.value).getTime()
                )
                .map((item) => (
                  <TableRow key={item.label}>
                    <TableCell className="font-medium">{item.label}</TableCell>
                    <TableCell className="text-right">
                      {new Date(item.value).toLocaleDateString('pt-BR')}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Card>

        {/* Regime Tributário — síncrono */}
        {data.regime_tributario && data.regime_tributario.length > 0 && (
          <Card className="py-0">
            <Table>
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
                    <TableCell className="text-center">
                      {item.quantidade_de_escrituracoes}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.cnpj_da_scp ? (
                        <Link href={`/consulta/${item.cnpj_da_scp}`}>{item.cnpj_da_scp}</Link>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* SUFRAMA — slot async, aparece quando enrichment resolver */}
        {suframaSlot}

        {/* Inscrições Estaduais — slot async, aparece quando enrichment resolver */}
        {inscricoesSlot}

        {/* Estabelecimento — síncrono, exceto o email */}
        <Card>
          <div className="px-6 flex flex-col md:flex-row md:justify-between">
            <div className="flex flex-row items-center gap-2">
              <h3 className="text-lg font-semibold">Estabelecimento</h3>
              <Badge variant={ehMatriz ? 'default' : 'secondary'}>
                {data.descricao_identificador_matriz_filial}
              </Badge>
            </div>
            {!ehMatriz && cnpjMatriz && (
              <Link
                href={`/consulta/${cnpjMatriz}`}
                className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 decoration-dotted inline-flex items-center gap-1"
              >
                Ver matriz ({formatCNPJ(cnpjMatriz)})
                <ExternalLink className="size-3.5" />
              </Link>
            )}
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
                {data.uf !== 'EX' ? (
                  <a href={`tel:+55${data.ddd_telefone_1}`}>
                    {formatPhone(data.ddd_telefone_1)}
                  </a>
                ) : (
                  formatPhone(data.ddd_telefone_1)
                )}
                {data.ddd_telefone_2.length > 0 && data.uf !== 'EX' && (
                  <a href={`tel:+55${data.ddd_telefone_2}`}>
                    &nbsp;—&nbsp;{formatPhone(data.ddd_telefone_2)}
                  </a>
                )}
              </p>
            </div>

            {/* Email — slot async, "—" como fallback imediato */}
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Email</p>
              {emailSlot}
            </div>
          </div>

          {data.empresasMesmoEndereco && data.empresasMesmoEndereco.length > 0 && (
            <>
              <Separator />
              <div className="mt-4 px-6 pb-4">
                <h4 className="font-medium mb-2">Empresas neste endereço</h4>
                <div className="flex flex-wrap gap-2">
                  {data.empresasMesmoEndereco.map((empresa) => (
                    <Item key={empresa.cnpj} variant="outline">
                      <Link href={`/consulta/${empresa.cnpj}`}>
                        {empresa.nome_fantasia || empresa.razao_social}
                      </Link>
                    </Item>
                  ))}
                </div>
              </div>
            </>
          )}
        </Card>

        {/* Atividade Principal — síncrona */}
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
            <Collapsible>
              <Separator />
              <CollapsibleTrigger asChild>
                <Button
                  className="w-full flex flex-row items-center justify-between px-6 text-sm font-semibold text-muted-foreground mt-3"
                  variant="ghost"
                >
                  Atividades Secundárias ({data.cnaes_secundarios.length})
                  <ChevronsUpDown className="size-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-3">
                  <Separator />
                  <div className="pt-4 px-6 space-y-2">
                    {data.cnaes_secundarios.map((atividade) => (
                      <div
                        key={atividade.codigo}
                        className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg"
                      >
                        <p className="text-sm">{atividade.descricao}</p>
                        <p className="text-xs text-muted-foreground">
                          Código: {atividade.codigo}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </Card>

        {/* Análise Societária — síncrona */}
        <Card>
          <h3 className="text-lg font-semibold px-6">Análise Societária</h3>
          <Separator />
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Estrutura Societária</p>
              <p className="font-semibold">{sociosPF.length} Pessoa(s) Física(s)</p>
              <p className="font-semibold">{sociosPJ.length} Pessoa(s) Jurídica(s)</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Administração</p>
              <p className="font-semibold">{administradores.length} administrador(es)</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estabilidade</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant={estabilidade === 'Alta rotatividade' ? 'destructive' : 'default'}
                    className="cursor-help"
                  >
                    {estabilidade}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{descricaoEstabilidade[estabilidade]}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            {socioMaisAntigo && (
              <div>
                <p className="text-sm text-muted-foreground">Sócio mais antigo</p>
                <p className="font-semibold">
                  {new Date(socioMaisAntigo.data_entrada_sociedade).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}
            {socioMaisRecente && (
              <div>
                <p className="text-sm text-muted-foreground">Última alteração societária</p>
                <p className="font-semibold">
                  {new Date(socioMaisRecente.data_entrada_sociedade).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}
            {faixaPredominante && (
              <div>
                <p className="text-sm text-muted-foreground">Faixa etária predominante</p>
                <p className="font-semibold">{faixaPredominante}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Sócios — síncronos */}
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
                        {!todosEntraramMesmaData &&
                          socioMaisAntigo?.data_entrada_sociedade ===
                            socio.data_entrada_sociedade && (
                            <Badge variant="secondary" className="my-2">
                              Sócio mais antigo
                            </Badge>
                          )}
                        <p className="font-semibold">{socio.nome_socio}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Qualificação</p>
                        <p className="font-semibold">{socio.qualificacao_socio}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">CPF/CNPJ</p>
                        <p className="font-mono text-sm">
                          {socio.cnpj_cpf_do_socio.length === 14 ? (
                            <Link
                              href={`/consulta/${socio.cnpj_cpf_do_socio}`}
                              className="underline underline-offset-4 decoration-dotted flex flex-row gap-2 items-center"
                            >
                              {formatCNPJ(socio.cnpj_cpf_do_socio)}
                              <ExternalLink className="size-4" />
                            </Link>
                          ) : (
                            formatCPF(socio.cnpj_cpf_do_socio)
                          )}
                        </p>
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

                  {socio.empresasRelacionadas && socio.empresasRelacionadas.length > 0 && (
                    <CardFooter className="flex flex-col items-start gap-3">
                      <p className="text-sm text-muted-foreground">
                        Também faz parte do quadro societário das empresas
                      </p>
                      <div className="w-full flex flex-wrap gap-2">
                        {socio.empresasRelacionadas.map((empresa) => (
                          <Item key={empresa.cnpj} variant="outline">
                            <Link
                              href={`/consulta/${empresa.cnpj}`}
                              title={empresa.nome_fantasia || empresa.razao_social}
                              className="w-full flex flex-col md:flex-row justify-between gap-2"
                            >
                              <span className="font-medium">
                                {empresa.nome_fantasia || empresa.razao_social}
                              </span>
                              <span>{formatCNPJ(empresa.cnpj)}</span>
                            </Link>
                          </Item>
                        ))}
                      </div>
                    </CardFooter>
                  )}
                </Card>
              ))
            )}
          </div>
        </Card>

        {/* Grafo de relações — slot async, preenche por último */}
        {grafoSlot}
      </div>
    </>
  )
}