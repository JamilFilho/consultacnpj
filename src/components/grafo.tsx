// components/grafo.tsx
import { RelacaoGrafo } from '@/lib/grafo'
import GrafoRelacoes from '@/components/grafoRelacoes'

interface Props {
  cnpj: string
  razaoSocial: string
  promise: Promise<RelacaoGrafo[] | null>
}

export async function GrafoAsync({ cnpj, razaoSocial, promise }: Props) {
  const relacoes = await promise

  return (
    <GrafoRelacoes
      cnpjRaiz={cnpj}
      razaoSocialRaiz={razaoSocial}
      relacoesIniciais={relacoes}
    />
  )
}

export function GrafoSkeleton() {
  return (
    <div className="rounded-xl border bg-card animate-pulse">
      <div className="p-6 flex flex-col gap-3">
        <div className="h-5 bg-muted rounded w-48" />
        <div className="h-4 bg-muted rounded w-72" />
      </div>
      <div className="mx-6 mb-6 h-64 bg-muted rounded-lg" />
    </div>
  )
}