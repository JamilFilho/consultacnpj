// app/p/[id]/suframa-section.tsx
import { EnrichmentData } from '@/lib/enrichment'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Props {
  promise: Promise<EnrichmentData>
}

// Componente async: suspende até o enrichment resolver.
// Renderiza null quando não há dados de SUFRAMA — o Suspense boundary
// usa fallback={null} para não reservar espaço durante o carregamento.
export async function SuframaAsync({ promise }: Props) {
  const enrichment = await promise

  if (!enrichment.suframa || enrichment.suframa.length === 0) return null

  return (
    <Card className="py-0 gap-0">
      <div className="p-6">
        <h3 className="text-lg font-semibold">Incentivos Fiscais</h3>
        <p className="text-sm text-muted-foreground">
          Benefícios fiscais vinculados ao cadastro SUFRAMA.
        </p>
      </div>

      <Separator />

      <div>
        {enrichment.suframa.map((registro) => (
          <div key={registro.numero}>
            <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm text-muted-foreground">
                SUFRAMA {registro.numero}
              </span>

              {registro.aprovada && (
                <div className="flex flex-row gap-2 items-center">
                  <Badge variant="outline">
                    Aprovada em{' '}
                    {new Date(registro.dataAprovacao).toLocaleDateString('pt-BR')}
                  </Badge>
                  <Badge variant={registro.status === 'Ativa' ? 'default' : 'secondary'}>
                    {registro.status}
                  </Badge>
                </div>
              )}
            </div>

            <Separator />

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tributo</TableHead>
                  <TableHead>Benefício</TableHead>
                  <TableHead>Finalidade</TableHead>
                  <TableHead>Base Legal</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {registro.incentivos.map((incentivo, index) => (
                  <TableRow key={`${registro.numero}-${index}`}>
                    <TableCell className="font-medium">{incentivo.tributo}</TableCell>
                    <TableCell>{incentivo.beneficio}</TableCell>
                    <TableCell>{incentivo.finalidade}</TableCell>
                    <TableCell>{incentivo.fundamentoLegal}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}
      </div>
    </Card>
  )
}