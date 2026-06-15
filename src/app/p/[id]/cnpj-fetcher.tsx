import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import CNPJPageContent from './cnpj-content'
import { fetchCNPJ } from '@/lib/cnpj'

export default async function CNPJFetcher({ id }: { id: string }) {
  try {
    const data = await fetchCNPJ(id) // react cache: sem nova requisição
    return <CNPJPageContent data={data} description={data.descricao} />
  } catch (err) {
    return (
      <div className="px-10 flex flex-col items-center justify-center h-screen">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro na consulta</AlertTitle>
          <AlertDescription>
            {err instanceof Error ? err.message : 'Erro desconhecido.'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }
}