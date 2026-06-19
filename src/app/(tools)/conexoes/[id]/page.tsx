import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { normalizarCNPJ, formatarCNPJ, validarCNPJ } from '@/lib/cnpj-generator'
import { fetchCNPJBase } from '@/lib/cnpj'
import { getRelacoes } from '@/lib/grafo'
import { GrafoAsync, GrafoSkeleton } from '@/components/grafo'
import GrafoHeader from './graph-header'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const cnpj = normalizarCNPJ(id)

  return {
    title: `Malha de conexões — ${formatarCNPJ(cnpj)}`,
    description: `Rede de sócios e empresas relacionadas ao CNPJ ${formatarCNPJ(cnpj)}.`,
  }
}

export default async function ConexoesDetalhe({ params }: Props) {
  const { id } = await params
  const cnpj = normalizarCNPJ(id)

  // Valida antes de qualquer fetch
  if (cnpj.length !== 14 || !validarCNPJ(cnpj)) {
    notFound()
  }

  // Busca dados básicos da empresa (razão social) — necessário para o label
  // raiz do grafo. Se o CNPJ não existir na Receita, retorna 404.
  let razaoSocial: string
  try {
    const base = await fetchCNPJBase(cnpj)
    razaoSocial = base.nome_fantasia?.trim() || base.razao_social
  } catch {
    notFound()
  }

  // Dispara a busca de relações em paralelo com a renderização do shell
  const relacoesPromise = getRelacoes(cnpj)

  return (
    <main className="min-h-screen bg-zinc-100">
      <div className="mx-auto py-8 flex flex-col gap-6">
        <GrafoHeader
          razaoSocial={razaoSocial}
          cnpj={cnpj}
        />

        {/* Grafo com Suspense para streaming SSR */}
        <Suspense fallback={<GrafoSkeleton />}>
          <GrafoAsync
            cnpj={cnpj}
            razaoSocial={razaoSocial}
            promise={relacoesPromise}
          />
        </Suspense>

        {/* Rodapé */}
        <footer className="text-center text-xs text-slate-400 px-6">
          Dados obtidos via{' '}
          <a
            href="https://grafo.minhareceita.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-slate-600"
          >
            grafo.minhareceita.org
          </a>
          {' '}· Recurso experimental sujeito a indisponibilidade.
        </footer>
      </div>
    </main>
  )
}