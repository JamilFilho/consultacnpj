// app/api/grafo/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getRelacoes } from '@/lib/grafo'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const relacoes = await getRelacoes(id)

  if (relacoes === null) {
    return NextResponse.json(
      {
        error: 'Não foi possível obter as relações para este documento. A API de grafo pode estar indisponível.',
      },
      { status: 503 }
    )
  }

  return NextResponse.json({ relacoes })
}