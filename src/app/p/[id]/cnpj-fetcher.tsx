// app/[id]/cnpj-fetcher.tsx
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import CNPJPageContent from './cnpj-content'
import { CNPJData } from './types'

async function fetchCNPJ(id: string): Promise<CNPJData> {
  const cleanId = id.replace(/\D/g, '')

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

  return res.json()
}

export default async function CNPJFetcher({ id }: { id: string }) {
  let data: CNPJData

  try {
    data = await fetchCNPJ(id)
  } catch (err) {
    return (
      <div className="px-10 flex flex-col items-center justify-center h-screen">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro na consulta</AlertTitle>
          <AlertDescription>
            {err instanceof Error ? err.message : 'Erro desconhecido.'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return <CNPJPageContent data={data} />
}