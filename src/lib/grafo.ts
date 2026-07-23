// lib/grafo.ts
import { kv } from '@vercel/kv'
import { normalizarCNPJ } from './cnpj-generator'

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

// Normaliza um documento de entrada para a API de grafo: hashes MD5 (CPF
// mascarado costuma chegar como hash de 32 chars hex) passam direto em
// minúsculas; qualquer outra coisa é tratada como CNPJ/CPF e normalizada
// preservando letras (necessário para CNPJ alfanumérico — um
// replace(/[^\d*]/g, '') descartaria as letras do novo formato).
function normalizarDocumento(documento: string): string {
  if (/^[a-f0-9]{32}$/i.test(documento)) {
    return documento.toLowerCase()
  }

  // CPF mascarado preserva os asteriscos (***); CNPJ alfanumérico preserva
  // letras A-Z. normalizarCNPJ remove pontuação e força maiúsculas — os
  // asteriscos de CPF não são afetados por ela.
  return normalizarCNPJ(documento)
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
  const cleanDocumento = normalizarDocumento(documento)
  
  // Mudamos a chave para "v3" para forçar o Vercel KV a buscar dados frescos,
  // ignorando arrays vazios que possam ter sido cacheados por engano antes.
  const cacheKey = `grafo:v3:${cleanDocumento}`

  const cached = await kv.get<RelacaoGrafo[]>(cacheKey)
  if (cached) return cached

  try {
    const res = await fetch(
      `https://grafo.minhareceita.org/${cleanDocumento}`,
      {
        cache: 'no-store', // 🔴 Ignora o cache persistente do fetch nativo do Next.js
        headers: {
          'Accept': 'application/json',
          // 🔴 Muitas APIs bloqueiam requisições de servidores sem User-Agent definido
          'User-Agent': 'MinhaAplicacao/1.0 (Integracao)', 
        }
      }
    )

    if (!res.ok) {
      console.error(`[API Grafo] Erro ${res.status}: ${res.statusText}`)
      return null
    }

    const relacoes: RelacaoGrafo[] = await res.json()

    await kv.set(cacheKey, relacoes, {
      ex: GRAFO_TTL_SECONDS,
    })

    return relacoes
  } catch (err) {
    console.error(`[API Grafo] Exceção no fetch:`, err)
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
      `https://grafo.minhareceita.org/${origem}/${destino}`,
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