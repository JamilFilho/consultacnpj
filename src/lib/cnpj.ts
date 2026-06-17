import { cache } from 'react'
import { kv } from '@vercel/kv'
import { CNPJData } from '@/app/p/[id]/types'
import {
  gerarChaveSocio,
  getEmpresasDoSocio,
} from './socios'

export type CNPJDataWithDescription =
  CNPJData & {
    descricao: string
  }

async function generateDescription(
  data: CNPJData
): Promise<string> {
  const fallback =
    `Informações da empresa ${
      data.nome_fantasia ||
      data.razao_social
    } — CNPJ: ${data.cnpj}`

  try {
    const prompt = `Forneça uma breve descrição (máximo 5 frases) da empresa com os seguintes dados: Razão Social: ${data.razao_social}, Nome Fantasia: ${data.nome_fantasia}, Atividade Principal: ${data.cnae_fiscal_descricao}.`

    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json',
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model:
            'openai/gpt-oss-120b:free',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      }
    )

    if (!response.ok)
      return fallback

    const respData =
      await response.json()

    return (
      respData?.choices?.[0]
        ?.message?.content?.trim() ||
      fallback
    )
  } catch {
    return fallback
  }
}

async function getOrCreateDescription(
  data: CNPJData
): Promise<string> {
  const kvKey = `desc:${data.cnpj}`

  const cached =
    await kv.get<string>(kvKey)

  if (cached) return cached

  const descricao =
    await generateDescription(data)

  await kv.set(kvKey, descricao)

  return descricao
}

export const fetchCNPJ = cache(
  async (
    id: string
  ): Promise<CNPJDataWithDescription> => {
    const cleanId =
      id.replace(/\D/g, '')

    const res = await fetch(
      `https://minhareceita.org/${cleanId}`,
      {
        next: {
          revalidate: false,
        },
      }
    )

    if (!res.ok) {
      throw new Error(
        res.status === 404
          ? 'CNPJ não encontrado. Verifique o número e tente novamente.'
          : `Erro ao consultar CNPJ (status ${res.status}).`
      )
    }

    const data: CNPJData =
      await res.json()

    await kv.set(
      `empresa:${data.cnpj}`,
      {
        cnpj: data.cnpj,
        razao_social:
          data.razao_social,
        nome_fantasia:
          data.nome_fantasia,
      }
    )

    const operations: Promise<any>[] =
      []

    for (const socio of data.qsa) {
      const socioKey =
        gerarChaveSocio(socio)

      operations.push(
        kv.sadd(
          `socio:${socioKey}:empresas`,
          data.cnpj
        )
      )

      operations.push(
        kv.sadd(
          `empresa:${data.cnpj}:socios`,
          socioKey
        )
      )

      operations.push(
        kv.set(
          `socio:${socioKey}`,
          {
            nome:
              socio.nome_socio,
            cpfMascarado:
              socio.cnpj_cpf_do_socio,
            qualificacao:
              socio.qualificacao_socio,
            faixaEtaria:
              socio.faixa_etaria,
          }
        )
      )
    }

    await Promise.all(operations)

    const qsaEnriquecido =
      await Promise.all(
        data.qsa.map(
          async socio => {
            const empresasRelacionadas =
              await getEmpresasDoSocio(
                socio
              )

            return {
              ...socio,
              empresasRelacionadas:
                empresasRelacionadas.filter(
                  empresa =>
                    empresa?.cnpj &&
                    empresa.cnpj !==
                      data.cnpj
                ),
            }
          }
        )
      )

    const descricao =
      await getOrCreateDescription(
        data
      )

    return {
      ...data,
      qsa: qsaEnriquecido,
      descricao,
    }
  }
)