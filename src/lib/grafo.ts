// lib/grafo.ts
import { kv } from '@vercel/kv'

export type RelacaoGrafo = {
  cnpj: string
  razao_social: string
  id: string
  nome: string
  cpf: string
}

// Cache de 7 dias. Como o endpoint é experimental e pode ficar fora do
// ar, preferimos manter os dados já obtidos por bem mais tempo do que o
// normal — se a API cair, o cache vira a única fonte de verdade disponível
// para os CNPJs/CPFs já consultados.
const GRAFO_TTL_SECONDS = 60 * 60 * 24 * 7

function grafoCacheKey(documento: string): string {
  return `grafo:${documento}`
}

/**
 * Busca as relações societárias de um CNPJ ou CPF (mascarado, no formato
 * que a própria API aceita) na API experimental grafo.minhareceita.org.
 *
 * Sempre cacheia no KV, mesmo quando a resposta vem vazia — assim não
 * insistimos em bater numa API instável/experimental para um documento
 * que simplesmente não tem relações mapeadas.
 *
 * Retorna `null` quando a API está inacessível E não há cache disponível,
 * para que o chamador possa diferenciar "sem relações" de "indisponível".
 */
export async function getRelacoes(
  documento: string
): Promise<RelacaoGrafo[] | null> {
  const cleanDocumento = /^[a-f0-9]{32}$/i.test(documento) ? documento.toLowerCase() : documento.replace(/[^\d*]/g, '')

  const cacheKey = grafoCacheKey(cleanDocumento)

  const cached = await kv.get<RelacaoGrafo[]>(cacheKey)
  if (cached) return cached

  try {
    const res = await fetch(
      `https://grafo.minhareceita.org/relacoes/${cleanDocumento}`,
      {
        next: { revalidate: false },
      }
    )

    if (!res.ok) {
      // API fora do ar ou documento não encontrado: não há o que cachear,
      // só sinalizamos indisponibilidade pro chamador decidir o que mostrar.
      return null
    }

    const relacoes: RelacaoGrafo[] = await res.json()

    await kv.set(cacheKey, relacoes, {
      ex: GRAFO_TTL_SECONDS,
    })

    return relacoes
  } catch {
    return null
  }
}

export async function getConexao(
  origem: string,
  destino: string
): Promise<RelacaoGrafo[] | null> {
  const cacheKey = `conexao:${origem}:${destino}`

  const cached =
    await kv.get<RelacaoGrafo[]>(cacheKey)

  if (cached) return cached

  try {
    const res = await fetch(
      `https://grafo.minhareceita.org/conexao/${origem}/${destino}`,
      {
        next: { revalidate: false },
      }
    )

    if (!res.ok) {
      return null
    }

    const relacoes: RelacaoGrafo[] =
      await res.json()

    await kv.set(cacheKey, relacoes, {
      ex: GRAFO_TTL_SECONDS,
    })

    return relacoes
  } catch {
    return null
  }
}