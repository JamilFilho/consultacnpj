// lib/cnpj.ts
import { cache } from 'react'
import { kv } from '@vercel/kv'
import { CNPJData, EmpresaRelacionada } from '@/app/(pages)/consulta/[id]/types'
import { gerarChaveSocio, getEmpresasDoSocio } from './socios'
import { gerarChaveEndereco, getEmpresasMesmoEndereco } from './enderecos'
import { getOrFetchEnrichment, InscricaoEstadual } from './enrichment'
import { getRelacoes, RelacaoGrafo } from './grafo'
import { normalizarCNPJ } from './cnpj-generator'

export type IncentivoSuframa = {
  tributo: string
  beneficio: string
  finalidade: string
  fundamentoLegal: string
}

export type SuframaData = {
  numero: string
  desde: string
  aprovada: boolean
  dataAprovacao: string
  status: string
  incentivos: IncentivoSuframa[]
}

// Tipo retornado pelo fetch primário — sem dados lentos (descrição, enriquecimento, grafo)
export type CNPJDataBase = CNPJData & {
  emailPrimario: string | null
  empresasMesmoEndereco: EmpresaRelacionada[]
}

// Tipo completo (mantido para compatibilidade caso seja necessário em outros lugares)
export type CNPJDataWithDescription = CNPJData & {
  descricao: string
  email: string | null
  inscricoesEstaduais: InscricaoEstadual[] | null
  suframa: SuframaData[] | null
  relacoesGrafo: RelacaoGrafo[] | null
}

// ---------------------------------------------------------------------------
// Geração de descrição via IA (OpenRouter)
// ---------------------------------------------------------------------------

async function generateDescription(data: CNPJData): Promise<string> {
  const fallback = `Informações da empresa ${data.nome_fantasia || data.razao_social} — CNPJ: ${data.cnpj}`

  try {
    const prompt = `Forneça uma breve descrição (máximo 5 frases) da empresa com os seguintes dados: Razão Social: ${data.razao_social}, Nome Fantasia: ${data.nome_fantasia}, Atividade Principal: ${data.cnae_fiscal_descricao}.`

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b:free',
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) return fallback

    const respData = await response.json()
    return respData?.choices?.[0]?.message?.content?.trim() || fallback
  } catch {
    return fallback
  }
}

export async function getOrCreateDescription(data: CNPJData): Promise<string> {
  const kvKey = `desc:${data.cnpj}`
  const cached = await kv.get<string>(kvKey)
  if (cached) return cached

  const descricao = await generateDescription(data)
  await kv.set(kvKey, descricao)
  return descricao
}

// ---------------------------------------------------------------------------
// Fetch primário — apenas minhareceita.org + operações KV/QSA
//
// Não inclui descrição (IA), enriquecimento (cnpja/cnpj.ws) nem grafo.
// Esses três são disparados em paralelo na camada de página (page.tsx) e
// cada um é envolvido em seu próprio <Suspense> boundary para streaming SSR.
// ---------------------------------------------------------------------------

export const fetchCNPJBase = cache(async (id: string): Promise<CNPJDataBase> => {
  // normalizarCNPJ preserva letras (A-Z) — diferente de um replace(/\D/g, ''),
  // que destruiria CNPJs alfanuméricos (formato vigente a partir de 2026)
  // ao remover qualquer caractere não-numérico.
  const cleanId = normalizarCNPJ(id)

  const res = await fetch(`https://minhareceita.org/${cleanId}`, {
    next: { revalidate: false },
  })

  if (!res.ok) {
    throw new Error(
      res.status === 404
        ? 'CNPJ não encontrado. Verifique o número e tente novamente.'
        : `Erro ao consultar CNPJ (status ${res.status}).`
    )
  }

  const data: CNPJData = await res.json()

  // Persiste dados básicos da empresa no KV para uso em lookups de sócios/endereços
  await kv.set(`empresa:${data.cnpj}`, {
    cnpj: data.cnpj,
    razao_social: data.razao_social,
    nome_fantasia: data.nome_fantasia,
  })

  // Indexação de endereço para lookup de co-localizadas
  const enderecoKey = gerarChaveEndereco(data)
  await kv.sadd(`endereco:${enderecoKey}`, data.cnpj)

  // Indexação de sócios em paralelo
  const operations: Promise<any>[] = []
  for (const socio of data.qsa) {
    const socioKey = gerarChaveSocio(socio)
    operations.push(kv.sadd(`socio:${socioKey}:empresas`, data.cnpj))
    operations.push(kv.sadd(`empresa:${data.cnpj}:socios`, socioKey))
    operations.push(
      kv.set(`socio:${socioKey}`, {
        nome: socio.nome_socio,
        cpfMascarado: socio.cnpj_cpf_do_socio,
        qualificacao: socio.qualificacao_socio,
        faixaEtaria: socio.faixa_etaria,
      })
    )
  }

  // QSA enriquecido (empresas relacionadas por sócio) e empresas no mesmo
  // endereço rodam em paralelo — ambos são lookups locais no KV, portanto rápidos.
  const [qsaEnriquecido, empresasMesmoEndereco] = await Promise.all([
    Promise.all(
      data.qsa.map(async (socio) => {
        await Promise.all(operations)
        const rawEmpresas = (await getEmpresasDoSocio(socio)) as any[]
        const empresasFiltradas = rawEmpresas.filter(
          (empresa): empresa is EmpresaRelacionada =>
            !!empresa && typeof empresa.cnpj === 'string' && empresa.cnpj !== data.cnpj
        )
        return { ...socio, empresasRelacionadas: empresasFiltradas }
      })
    ),
    getEmpresasMesmoEndereco({
      cnpj: data.cnpj,
      uf: data.uf,
      municipio: data.municipio,
      logradouro: data.logradouro,
      numero: data.numero,
    }) as Promise<EmpresaRelacionada[]>,
  ])

  const emailPrimario = (data as { email?: string | null }).email ?? null

  return {
    ...data,
    qsa: qsaEnriquecido as any,
    empresasMesmoEndereco,
    emailPrimario,
  }
})

// ---------------------------------------------------------------------------
// fetchCNPJ — mantido por compatibilidade, porém não mais usado na page.tsx
// principal. Internamente usa fetchCNPJBase + as três fontes lentas em paralelo.
// ---------------------------------------------------------------------------

export const fetchCNPJ = cache(async (id: string): Promise<CNPJDataWithDescription> => {
  const base = await fetchCNPJBase(id)

  const [descricao, enrichment, relacoesGrafo] = await Promise.all([
    getOrCreateDescription(base),
    getOrFetchEnrichment(base.cnpj, base.emailPrimario),
    getRelacoes(base.cnpj),
  ])

  const email = base.emailPrimario || enrichment.email

  return {
    ...base,
    descricao,
    email,
    inscricoesEstaduais: enrichment.inscricoesEstaduais,
    suframa: enrichment.suframa,
    relacoesGrafo,
  }
})