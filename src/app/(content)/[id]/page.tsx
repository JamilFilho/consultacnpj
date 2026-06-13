import { Suspense } from 'react'
import CNPJFetcher from './cnpj-fetcher'
import Loading from './load'
import { registerGeneratedPage } from '@/lib/sitemap-tracker'

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

  // Persiste o ID no KV para o sitemap e rodapé — agora com await
  await registerGeneratedPage(id)

  return (
    <div className="py-12">
      <Suspense fallback={<Loading />}>
        <CNPJFetcher id={id} />
      </Suspense>
    </div>
  )
}