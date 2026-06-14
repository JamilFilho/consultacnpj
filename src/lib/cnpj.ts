import { cache } from 'react'
import { CNPJData } from '@/app/p/[id]/types'

export const fetchCNPJ = cache(async (id: string): Promise<CNPJData> => {
  const cleanId = id.replace(/\D/g, '')

  const res = await fetch(`https://minhareceita.org/${cleanId}`, {
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(
      res.status === 404
        ? 'CNPJ não encontrado. Verifique o número e tente novamente.'
        : `Erro ao consultar CNPJ (status ${res.status}).`
    )
  }

  return res.json()
})