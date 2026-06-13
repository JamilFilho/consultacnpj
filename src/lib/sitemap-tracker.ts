/**
 * Sitemap tracker utilities — backed by Vercel KV (Redis).
 *
 * Requires: npm install @vercel/kv
 * Env vars:  KV_REST_API_URL  e  KV_REST_API_TOKEN  (provisionadas automaticamente
 *            ao linkar um KV store no painel da Vercel).
 */

import { kv } from '@vercel/kv'

const KV_KEY = 'cnpj_visits'

/**
 * Registra um CNPJ visitado usando score = timestamp para ordenação cronológica.
 */
export async function registerGeneratedPage(id: string): Promise<void> {
  await kv.zadd(KV_KEY, { score: Date.now(), member: id })
}

/**
 * Retorna todos os CNPJs visitados, do mais recente ao mais antigo.
 */
export async function getGeneratedPageIds(): Promise<string[]> {
  // zrange com rev:true retorna do maior score (mais recente) para o menor
  return kv.zrange(KV_KEY, 0, -1, { rev: true }) as Promise<string[]>
}