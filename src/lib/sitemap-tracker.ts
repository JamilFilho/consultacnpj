/**
 * Sitemap tracker utilities — backed by Upstash Redis.
 *
 * Requires: npm install @upstash/redis
 * Env vars:
 *   UPSTASH_REDIS_REST_URL    — disponível no painel do Upstash
 *   UPSTASH_REDIS_REST_TOKEN  — disponível no painel do Upstash
 */

import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()
const KV_KEY = 'cnpj_visits'

/**
 * Registra um CNPJ visitado usando score = timestamp para ordenação cronológica.
 */
export async function registerGeneratedPage(id: string): Promise<void> {
  await redis.zadd(KV_KEY, { score: Date.now(), member: id })
}

/**
 * Retorna todos os CNPJs visitados, do mais recente ao mais antigo.
 */
export async function getGeneratedPageIds(): Promise<string[]> {
  // zrange com rev:true retorna do maior score (mais recente) para o menor
  return redis.zrange(KV_KEY, 0, -1, { rev: true }) as Promise<string[]>
}