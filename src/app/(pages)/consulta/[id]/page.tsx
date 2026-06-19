import { Suspense } from 'react'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import CNPJPageContent from './cnpj-content'
import { fetchCNPJBase, getOrCreateDescription } from '@/lib/cnpj'
import { getOrFetchEnrichment } from '@/lib/enrichment'
import { DescricaoAsync, DescricaoSkeleton } from './descricao-section'
import { EmailAsync } from './email-section'
import { GrafoAsync } from './grafo-section'
import { SuframaAsync } from './suframa-section'
import { InscricoesAsync } from './inscricoes-section'

interface PageProps {
  params: Promise<{ id: string }>
}

function PageError({ message }: { message: string }) {
  return (
    <div className="px-10 flex flex-col items-center justify-center h-screen">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro na consulta</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </div>
  )
}

export default async function CNPJPage({ params }: PageProps) {
  const { id } = await params

  let base
  try {
    base = await fetchCNPJBase(id)
  } catch (err) {
    return (
      <PageError
        message={err instanceof Error ? err.message : 'Erro desconhecido.'}
      />
    )
  }

  const descricaoPromise = getOrCreateDescription(base)
  const enrichmentPromise = getOrFetchEnrichment(base.cnpj, base.emailPrimario)

  return (
    <CNPJPageContent
      data={base}
      descricaoSlot={
        <Suspense key="descricao" fallback={<DescricaoSkeleton />}>
          <DescricaoAsync promise={descricaoPromise} />
        </Suspense>
      }
      emailSlot={
        <Suspense key="email" fallback={<p className="font-medium">—</p>}>
          <EmailAsync emailPrimario={base.emailPrimario} promise={enrichmentPromise} />
        </Suspense>
      }
      suframaSlot={
        <Suspense key="suframa" fallback={null}>
          <SuframaAsync promise={enrichmentPromise} />
        </Suspense>
      }
      inscricoesSlot={
        <Suspense key="inscricoes" fallback={null}>
          <InscricoesAsync promise={enrichmentPromise} />
        </Suspense>
      }
      grafoSlot={<GrafoAsync cnpj={base.cnpj} />}
    />
  )
}