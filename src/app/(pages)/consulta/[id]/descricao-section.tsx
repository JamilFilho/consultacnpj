// app/p/[id]/descricao-section.tsx
import { Info } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

// Componente async: suspende até a Promise de descrição resolver
export async function DescricaoAsync({ promise }: { promise: Promise<string> }) {
  const descricao = await promise

  return (
    <div className="mb-12 flex flex-col gap-4">
      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-0 prose-p:leading-relaxed">
        <ReactMarkdown>{descricao}</ReactMarkdown>
      </div>
      <span className="text-xs text-zinc-500 flex flex-row gap-2 items-center">
        <Info className="size-3" />
        Descrição gerada com IA
      </span>
    </div>
  )
}

// Skeleton exibido enquanto a IA não respondeu ainda
export function DescricaoSkeleton() {
  return (
    <div className="mb-12 flex flex-col gap-3 animate-pulse">
      <div className="h-4 bg-muted rounded w-full" />
      <div className="h-4 bg-muted rounded w-5/6" />
      <div className="h-4 bg-muted rounded w-4/6" />
      <div className="h-3 bg-muted rounded w-32 mt-1" />
    </div>
  )
}