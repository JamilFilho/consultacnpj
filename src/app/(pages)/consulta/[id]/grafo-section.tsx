import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Props {
  cnpj: string
}

export function GrafoAsync({ cnpj }: Props) {
  return (
    <Card className="flex flex-col md:flex-row px-6 items-start md:items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold">Malha de conexões</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Mapeie as conexões desta empresa e sócios.
        </p>
      </div>
      <Button variant="outline" asChild>
        <Link href={`/conexoes/${cnpj}`}>
          Acessar malha de conexões
          <ExternalLink className="size-4" />
        </Link>
      </Button>
    </Card>
  )
}