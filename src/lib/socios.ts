// lib/socios.ts

import crypto from 'crypto'
import { kv } from '@vercel/kv'
import { CNPJSocio } from '@/app/p/[id]/types'

export function gerarChaveSocio(socio: CNPJSocio) {
  return crypto
    .createHash('sha256')
    .update(
      [
        socio.nome_socio,
        socio.cnpj_cpf_do_socio,
        socio.faixa_etaria,
      ].join('|')
    )
    .digest('hex')
}

export async function getEmpresasDoSocio(
  socio: CNPJSocio
) {
  const socioKey =
    gerarChaveSocio(socio)

  const empresas =
    await kv.smembers<string[]>(
      `socio:${socioKey}:empresas`
    )

  const detalhadas =
    await Promise.all(
      empresas.map(cnpj =>
        kv.get<{
          cnpj: string
          razao_social: string
          nome_fantasia: string
        }>(`empresa:${cnpj}`)
      )
    )

  return detalhadas.filter(Boolean)
}