import Link from 'next/link'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { getGeneratedPageIds } from '@/lib/sitemap-tracker'
import { unstable_noStore as noStore } from 'next/cache'

function formatCNPJ(id: string): string {
  return String(id).replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

export default async function FeedCNPJ() {
  noStore()
  const lastFiveIds = (await getGeneratedPageIds()).slice(0, 10)

  return (
    <>
      {lastFiveIds.length > 0 && (
        <>
          {lastFiveIds.map((id) => (
            <Link key={id} href={`/p/${id}`}>
              <Card className="py-2 px-4 gap-2">
                <CardTitle className="p-0 m-0">{formatCNPJ(id)}</CardTitle>
              </Card>
            </Link>
          ))}
        </>
      )}
    </>
  )
}