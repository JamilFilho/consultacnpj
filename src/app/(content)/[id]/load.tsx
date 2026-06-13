import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function Loading() {
  return (
    <section>
      <header className="mb-8 space-y-3">
        <Skeleton className="h-8 w-1/2 md:w-1/3" />
        <Skeleton className="h-4 w-1/4" />
      </header>

      <div className="space-y-6">
        <Card className="flex flex-row items-center justify-between p-2">
          <Skeleton className="h-4 w-32 m-2" />
          <Skeleton className="h-6 w-20 m-2" />
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 space-y-3">
              <Skeleton className="h-6 w-6 rounded" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-40" />
            </Card>
          ))}
        </div>

        <Card>
          <div className="py-4">
            <div className="px-6 mb-4">
              <Skeleton className="h-6 w-36" />
            </div>
            <Separator />
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-48" />
                </div>
              ))}
              <div className="md:col-span-2 space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-64" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="py-4">
            <div className="px-6 mb-4">
              <Skeleton className="h-6 w-48" />
            </div>
            <Separator />
            <div className="pt-6 px-6">
              <Card className="bg-slate-50 dark:bg-slate-900/50 border-0">
                <CardContent className="pt-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/3" />
                </CardContent>
              </Card>
            </div>
          </div>
        </Card>

        <Card>
          <div className="px-6 my-4">
            <Skeleton className="h-6 w-28" />
          </div>
          <Separator />
          <div className="py-4 px-6 space-y-2">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4, 5].map((j) => (
                      <div key={j} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-5 w-40" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </section>
  )
}