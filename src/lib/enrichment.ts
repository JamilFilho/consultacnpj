// lib/enrichment.ts
import { kv } from '@vercel/kv'

export type EnrichmentData = {
  email: string | null
  inscricoesEstaduais: InscricaoEstadual[] | null
  suframa: SuframaData[] | null
  fonte: 'cnpja' | 'cnpj_ws' | null
}

export type InscricaoEstadual = {
  inscricaoEstadual: string
  uf: string
  ativo: boolean
}

export type IncentivoSuframa = {
  tributo: string
  beneficio: string
  finalidade: string
  fundamentoLegal: string
}

type CnpjaIncentive = {
  tribute: string
  benefit: string
  purpose: string
  basis: string
}

type CnpjaSuframa = {
  number: string
  since: string
  approved: boolean
  approvalDate: string
  status: {
    text: string
  }
  incentives?: CnpjaIncentive[]
}

export type SuframaData = {
  numero: string
  desde: string
  aprovada: boolean
  dataAprovacao: string
  status: string
  incentivos: IncentivoSuframa[]
}

const EMPTY_ENRICHMENT: EnrichmentData = {
  email: null,
  inscricoesEstaduais: null,
  suframa: null,
  fonte: null,
}

// TTL do cache de enriquecimento. Dado que email/IE de uma empresa
// muda raramente, usamos um TTL bem longo (30 dias) em vez de cache eterno,
// pra eventualmente capturar atualizações sem precisar de invalidação manual.
const ENRICHMENT_TTL_SECONDS = 60 * 60 * 24 * 30

// --- Rate limit tracking (best-effort, em memória do processo) ---
// Como o rate limit é por IP e não por chave de API, não há garantia
// perfeita em ambiente serverless (instâncias diferentes = estado diferente).
// Isso serve apenas para evitar bater requests óbvias contra uma API que
// acabamos de saber que está 429 dentro do mesmo "warm" da function.
type RateLimitState = {
  blockedUntil: number // timestamp em ms
}

const rateLimitState: Record<'cnpja' | 'cnpj_ws', RateLimitState> = {
  cnpja: { blockedUntil: 0 },
  cnpj_ws: { blockedUntil: 0 },
}

function isRateLimited(provider: 'cnpja' | 'cnpj_ws'): boolean {
  return Date.now() < rateLimitState[provider].blockedUntil
}

function markRateLimited(
  provider: 'cnpja' | 'cnpj_ws',
  retryAfterSeconds = 60
) {
  rateLimitState[provider].blockedUntil =
    Date.now() + retryAfterSeconds * 1000
}

function parseRetryAfter(res: Response): number {
  const header = res.headers.get('retry-after')
  const parsed = header ? parseInt(header, 10) : NaN
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 60
}

// --- cnpja.com ---
// Limite: 5 req/min por IP
// Docs: https://open.cnpja.com/office/{cnpj}

type CnpjaEmail = {
  ownership: string
  address: string
  domain: string
}

type CnpjaResponse = {
  suframa?: CnpjaSuframa[]
  emails?: CnpjaEmail[]
}

async function fetchFromCnpja(
  cleanCnpj: string
): Promise<EnrichmentData | null> {
  if (isRateLimited('cnpja')) return null

  try {
    const res = await fetch(
      `https://open.cnpja.com/office/${cleanCnpj}`,
      {
        next: { revalidate: false },
      }
    )

    if (res.status === 429) {
      markRateLimited('cnpja', parseRetryAfter(res))
      return null
    }

    if (!res.ok) return null

    const data: CnpjaResponse = await res.json()

    const primaryEmail = data.emails?.[0]?.address ?? null
    const suframa =
      data.suframa?.map(item => ({
        numero: item.number,
        desde: item.since,
        aprovada: item.approved,
        dataAprovacao: item.approvalDate,
        status: item.status.text,
        incentivos:
          item.incentives?.map(incentivo => ({
            tributo: incentivo.tribute,
            beneficio: incentivo.benefit,
            finalidade: incentivo.purpose,
            fundamentoLegal: incentivo.basis,
          })) ?? [],
      })) ?? null

    // cnpja não retorna inscrições estaduais no endpoint público gratuito,
    // então deixamos null aqui; se a conta tiver acesso a esse dado no
    // futuro, basta mapear aqui.
    if (!primaryEmail && !suframa?.length) {
      return null
    }

    return {
      email: primaryEmail,
      inscricoesEstaduais: null,
      suframa,
      fonte: 'cnpja',
    }
  } catch {
    return null
  }
}

// --- publica.cnpj.ws ---
// Limite: 3 req/min por IP, retorna 429 + exige 60s de espera
// Docs: https://publica.cnpj.ws/cnpj/{cnpj}

type CnpjWsInscricaoEstadual = {
  inscricao_estadual: string
  uf: string
  ativo: boolean
}

type CnpjWsResponse = {
  estabelecimento?: {
    email?: string | null
    inscricoes_estaduais?: CnpjWsInscricaoEstadual[]
  }
}

async function fetchFromCnpjWs(
  cleanCnpj: string
): Promise<EnrichmentData | null> {
  if (isRateLimited('cnpj_ws')) return null

  try {
    const res = await fetch(
      `https://publica.cnpj.ws/cnpj/${cleanCnpj}`,
      {
        next: { revalidate: false },
      }
    )

    if (res.status === 429) {
      markRateLimited('cnpj_ws', parseRetryAfter(res))
      return null
    }

    if (!res.ok) return null

    const data: CnpjWsResponse = await res.json()

    const email = data.estabelecimento?.email ?? null

    const inscricoesEstaduais =
      data.estabelecimento?.inscricoes_estaduais?.map(ie => ({
        inscricaoEstadual: ie.inscricao_estadual,
        uf: ie.uf,
        ativo: ie.ativo,
      })) ?? null

    if (!email && (!inscricoesEstaduais || inscricoesEstaduais.length === 0)) {
      return null
    }

    return {
      email,
      inscricoesEstaduais:
        inscricoesEstaduais && inscricoesEstaduais.length > 0
          ? inscricoesEstaduais
          : null,
      suframa: null,
      fonte: 'cnpj_ws',
    }
  } catch {
    return null
  }
}

/**
 * Busca email e inscrições estaduais nas APIs de fallback (cnpja.com e
 * cnpj.ws), tentando primeiro a que tem rate limit mais generoso.
 *
 * Estratégia:
 * 1. cnpja.com primeiro (5 req/min) — cobre o email na maioria dos casos.
 * 2. Se cnpja não retornar email, tenta cnpj.ws (3 req/min) — também cobre
 *    inscrições estaduais, que cnpja não tem.
 * 3. Se ambas estiverem rate-limited ou falharem, retorna vazio sem travar
 *    a resposta principal (graceful degradation).
 */
async function fetchEnrichmentFromProviders(
  cleanCnpj: string
): Promise<EnrichmentData> {
  const fromCnpja = await fetchFromCnpja(cleanCnpj)

  if (fromCnpja?.email) {
    // Mesmo tendo email do cnpja, ainda vale tentar pegar inscrições
    // estaduais do cnpj.ws caso a quota permita — mas isso custaria uma
    // request extra. Por padrão mantemos simples: se já tem email, não
    // gastamos cota do provedor mais escasso (cnpj.ws) só por IE.
    return fromCnpja
  }

  const fromCnpjWs = await fetchFromCnpjWs(cleanCnpj)

  if (fromCnpjWs) {
    return fromCnpjWs
  }

  return EMPTY_ENRICHMENT
}

function enrichmentCacheKey(cnpj: string): string {
  return `enrichment:${cnpj}`
}

/**
 * Retorna dados de enriquecimento (email, inscrições estaduais) para um
 * CNPJ, usando cache do KV. Só consulta as APIs externas (rate-limited) se
 * não houver cache E o email já vier vazio da minhareceita.org.
 */
export async function getOrFetchEnrichment(
  cnpj: string,
  emailJaPresente: string | null | undefined
): Promise<EnrichmentData> {
  // Se a fonte primária já trouxe o email, não precisamos enriquecer.
  if (emailJaPresente) {
    return EMPTY_ENRICHMENT
  }

  const cleanCnpj = cnpj.replace(/\D/g, '')
  const cacheKey = enrichmentCacheKey(cleanCnpj)

  const cached = await kv.get<EnrichmentData>(cacheKey)
  if (cached) return cached

  const enrichment = await fetchEnrichmentFromProviders(cleanCnpj)

  // Cacheamos mesmo o resultado vazio, para não bater nas APIs de novo
  // toda vez que esse CNPJ for consultado dentro do TTL — mesmo que vazio,
  // isso evita gastar cota repetidamente em empresas que simplesmente não
  // têm email cadastrado em lugar nenhum.
  await kv.set(cacheKey, enrichment, {
    ex: ENRICHMENT_TTL_SECONDS,
  })

  return enrichment
}