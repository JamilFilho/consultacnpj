import { Suspense } from 'react'
import CNPJFetcher from './cnpj-fetcher'
import Loading from './load'
import { registerGeneratedPage } from '@/lib/sitemap-tracker'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export const revalidate = false

export async function generateStaticParams() {
  return []
}

/** Valida se o id é um CNPJ: exatamente 14 dígitos numéricos. */
function isValidCNPJ(id: string): boolean {
  return /^\d{14}$/.test(id)
}

export const generateMetadata = async ({ params }: PageProps) => {
  const { id } = await params

  if (!isValidCNPJ(id)) {
    return { title: 'Empresa' }
  }

  const res = await fetch(`https://minhareceita.org/${id}`)

  if (!res.ok) {
    return { title: 'Empresa' }
  }
  const data = await res.json()
  return {
    title: data.nome_fantasia || 'Empresa',
    description: `Informações da empresa ${data.nome_fantasia || data.razao_social} - CNPJ: ${id}`,
  }
}

export default async function CNPJPage({ params }: PageProps) {
  const { id } = await params

  // Rejeita qualquer path que não seja um CNPJ válido
  if (!isValidCNPJ(id)) {
    notFound()
  }

  // Persiste o CNPJ no KV para o sitemap e rodapé
  await registerGeneratedPage(id)

  return (
    <div className="py-12">
      <Suspense fallback={<Loading />}>
        <CNPJFetcher id={id} />
      </Suspense>
    </div>
  )
}