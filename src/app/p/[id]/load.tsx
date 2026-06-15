import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Building2, DollarSign, Landmark } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function Loading() {
  return (
    <>
      {/* Header */}
      <header className="mb-8 flex flex-col md:grid md:grid-cols-2 gap-2">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
        </div>
        <div className="flex flex-row gap-2 justify-start md:justify-end">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-28" />
        </div>
      </header>

      {/* Descrição IA */}
      <div className="space-y-2 mb-6">
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-2 w-3/4" />
      </div>

      <div className="space-y-6">

        {/* CNPJ / Nome fantasia / Situação cadastral */}
        <div className="space-y-2">
          <Card className="flex flex-row items-center justify-between py-2 px-4">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-40" />
          </Card>
          <Card className="flex flex-row items-center justify-between py-2 px-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-48" />
          </Card>
          <Card className="py-2 px-4 flex flex-row items-center justify-between">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </Card>
        </div>

        {/* Tabela de datas */}
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><Skeleton className="h-4 w-48" /></TableHead>
                <TableHead className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-52" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Cards Porte / Natureza / Capital */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[Building2, Landmark, DollarSign].map((Icon, i) => (
            <Card key={i} className="p-6">
              <Icon className="mb-4 text-muted-foreground" />
              <Skeleton className="h-4 w-28 mb-2" />
              <Skeleton className="h-5 w-40" />
            </Card>
          ))}
        </div>

        {/* Estabelecimento */}
        <Card>
          <div className="px-6 flex flex-row justify-between">
            <Skeleton className="h-6 w-36 my-4" />
          </div>
          <Separator />
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Placeholder do mapa */}
            <div className="col-span-2 -mt-2 mb-4">
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
            {[
              [14, 32],
              [20, 28],
              [24, 56],
              [20, 36],
              [10, 24],
              [18, 44],
            ].map(([labelW, valueW], i) => (
              <div key={i} className="space-y-1">
                <Skeleton className={`h-4 w-${labelW}`} />
                <Skeleton className={`h-5 w-${valueW}`} />
              </div>
            ))}
            <div className="md:col-span-2 space-y-1">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-5 w-64" />
            </div>
          </div>
        </Card>

        {/* Atividade Principal */}
        <Card>
          <Skeleton className="h-6 w-44 mx-6 my-4" />
          <Separator />
          <div className="px-6 pt-4">
            <Card className="bg-slate-50 dark:bg-slate-900/50 border-0">
              <CardContent className="pt-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-28" />
              </CardContent>
            </Card>
          </div>
          <div className="mb-6 mt-4">
            <Separator />
            <Skeleton className="h-4 w-48 mx-6 my-3" />
            <Separator />
            <div className="pt-4 px-6 space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Sócios */}
        <Card>
          <Skeleton className="h-6 w-32 mx-6 my-4" />
          <Separator />
          <div className="py-4 px-6 space-y-4">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nome / Qualificação / CPF / Data / Faixa etária */}
                    {[
                      [14, 48],
                      [24, 56],
                      [16, 40],
                      [24, 32],
                      [20, 36],
                    ].map(([labelW, valueW], j) => (
                      <div key={j} className="space-y-1">
                        <Skeleton className={`h-4 w-${labelW}`} />
                        <Skeleton className={`h-5 w-${valueW}`} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Card>

      </div>
    </>
  )
}