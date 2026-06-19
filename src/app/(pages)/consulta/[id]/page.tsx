// app/p/[id]/page.tsx
import { Suspense } from 'react'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import CNPJPageContent from './cnpj-content'
import { fetchCNPJBase, getOrCreateDescription } from '@/lib/cnpj'
import { getOrFetchEnrichment } from '@/lib/enrichment'
import { getRelacoes } from '@/lib/grafo'
import { DescricaoAsync, DescricaoSkeleton } from './descricao-section'
import { EmailAsync } from './email-section'
import { GrafoAsync, GrafoSkeleton } from './grafo-section'
import { SuframaAsync } from './suframa-section'
import { InscricoesAsync } from './inscricoes-section'

interface PageProps {
  params: Promise<{ id: string }>
}

// Página de erro inline (evita redirect para não perder contexto)
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

  // -------------------------------------------------------------------------
  // Fetch primário — minhareceita.org + KV (indexação de sócios/endereços).
  // Bloqueia a renderização inicial, mas é o único fetch que faz isso.
  // Numa segunda visita, o react/cache evita refetch dentro do mesmo request.
  // -------------------------------------------------------------------------
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

  // -------------------------------------------------------------------------
  // Fetches lentos — disparados aqui SEM await. O Next.js App Router com
  // Suspense faz streaming SSR: o HTML do shell sai imediatamente e cada
  // boundary é preenchido conforme a Promise resolve.
  //
  // Disparar as Promises aqui (em vez de dentro de cada componente async)
  // garante que rodem em paralelo desde o início, mesmo que os Suspense
  // boundaries renderizem em momentos diferentes.
  // -------------------------------------------------------------------------
  const descricaoPromise = getOrCreateDescription(base)
  const enrichmentPromise = getOrFetchEnrichment(base.cnpj, base.emailPrimario)
  const grafoPromise = getRelacoes(base.cnpj)

  return (
    <CNPJPageContent
      data={base}
      descricaoSlot={
        <Suspense key="descricao" fallback={<DescricaoSkeleton />}>
          <DescricaoAsync promise={descricaoPromise} />
        </Suspense>
      }
      emailSlot={
        // Fallback "—" para não deslocar layout enquanto carrega
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
      grafoSlot={
        <Suspense key="grafo" fallback={<GrafoSkeleton />}>
          <GrafoAsync
            cnpj={base.cnpj}
            razaoSocial={base.nome_fantasia || base.razao_social}
            promise={grafoPromise}
          />
        </Suspense>
      }
    />
  )
}