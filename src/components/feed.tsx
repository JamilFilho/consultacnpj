import Link from 'next/link'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { getGeneratedPageIds } from '@/lib/sitemap-tracker'
import { unstable_noStore as noStore } from 'next/cache'

export default async function FeedCNPJ() {
  noStore()
  const lastFiveIds = (await getGeneratedPageIds()).slice(0, 5)

  return (
    <>
      {lastFiveIds.length > 0 && (
        <>
          {lastFiveIds.map((id) => (
            <Link key={id} href={`/${id}`}>
              <Card className="py-2 px-4 gap-2">
                <CardTitle className="p-0 m-0">{id}</CardTitle>
              </Card>
            </Link>
          ))}
        </>
      )}
    </>
  )
}