import { Suspense } from 'react'
import CNPJFetcher from './cnpj-fetcher'
import Loading from './load'
import { registerGeneratedPage } from '@/lib/sitemap-tracker'
import { fetchCNPJ } from '@/lib/cnpj'

interface PageProps {
  params: Promise<{ id: string }>
}

export const dynamicParams = true  // permite rotas não listadas em generateStaticParams
export const revalidate = false    // uma vez gerada, a página não revalida (SSG permanente)

export async function generateStaticParams() {
  return [] // nenhuma página pré-gerada no build; tudo é gerado sob demanda
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params

  try {
    const data = await fetchCNPJ(id) // react cache: reutiliza a mesma requisição da página
    return {
      title: data.razao_social || 'Empresa',
      description: data.descricao,
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