import { Suspense } from 'react'
import CNPJFetcher from './cnpj-fetcher'
import Loading from './load'
import { registerGeneratedPage } from '@/lib/sitemap-tracker'
import { fetchCNPJ } from '@/lib/cnpj'

interface PageProps {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  return []
}

export const generateMetadata = async ({ params }: PageProps) => {
  const { id } = await params

  try {
    const data = await fetchCNPJ(id)
    return {
      title: data.razao_social || 'Empresa',
      description: `Informações da empresa ${data.nome_fantasia || data.razao_social} - CNPJ: ${id}`,
    }
  } catch {
    return {
      title: 'Empresa não encontrada',
      description: `Consulta de CNPJ: ${id}`,
    }
  }
}

export default async function CNPJPage({ params }: PageProps) {
  const { id } = await params
  await registerGeneratedPage(id)

  return (
    <div className="py-12">
      <Suspense fallback={<Loading />}>
        <CNPJFetcher id={id} />
      </Suspense>
    </div>
  )
}