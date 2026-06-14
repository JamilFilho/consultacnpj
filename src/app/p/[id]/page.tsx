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

export const generateMetadata = async ({ params }: PageProps) => {
  const { id } = await params
  const res = await fetch(`https://minhareceita.org/${id}`)

  const data = await res.json()
  
  return {
    title: data.razao_social || 'Empresa',
    description: `Informações da empresa ${data.nome_fantasia || data.razao_social} - CNPJ: ${id}`,
  }
}

export default async function CNPJPage({ params }: PageProps) {
  const { id } = await params

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