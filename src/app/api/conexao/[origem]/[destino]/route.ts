// app/api/conexao/[origem]/[destino]/route.ts

import { NextResponse } from 'next/server'
import { getConexao } from '@/lib/grafo'

export async function GET(
  _req: Request,
  {
    params,
  }: {
    params: Promise<{
      origem: string
      destino: string
    }>
  }
) {
  const { origem, destino } =
    await params

  const conexao =
    await getConexao(origem, destino)

  if (conexao === null) {
    return NextResponse.json(
      {
        error:
          'Não foi possível obter a conexão',
      },
      {
        status: 503,
      }
    )
  }

  return NextResponse.json(conexao)
}