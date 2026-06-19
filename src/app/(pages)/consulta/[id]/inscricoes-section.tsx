// app/p/[id]/inscricoes-section.tsx
import { EnrichmentData } from '@/lib/enrichment'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
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
// Renderiza null quando não há inscrições estaduais.
export async function InscricoesAsync({ promise }: Props) {
  const enrichment = await promise

  if (
    !enrichment.inscricoesEstaduais ||
    enrichment.inscricoesEstaduais.length === 0
  ) {
    return null
  }

  return (
    <Card className="py-0">
      <div className="p-6">
        <h3 className="text-lg font-semibold">Inscrições Estaduais</h3>
        <p className="text-sm text-muted-foreground">
          Registros estaduais vinculados a este CNPJ.
        </p>
      </div>

      <Separator />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>UF</TableHead>
            <TableHead>Inscrição Estadual</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {enrichment.inscricoesEstaduais.map((ie) => (
            <TableRow key={`${ie.uf}-${ie.inscricaoEstadual}`}>
              <TableCell className="font-medium">{ie.uf}</TableCell>
              <TableCell className="font-mono">{ie.inscricaoEstadual}</TableCell>
              <TableCell>
                <Badge variant={ie.ativo ? 'default' : 'secondary'}>
                  {ie.ativo ? 'Ativa' : 'Inativa'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}