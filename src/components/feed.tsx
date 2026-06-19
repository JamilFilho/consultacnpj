import Link from 'next/link'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { getGeneratedPageIds } from '@/lib/sitemap-tracker'
import { unstable_noStore as noStore } from 'next/cache'
import { ExternalLink } from 'lucide-react'

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
            <Item key={id} variant="outline" asChild>
              <Link href={`/consulta/${id}`}>
                <ItemContent>
                  <ItemDescription className="p-0 m-0">{formatCNPJ(id)}</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <ExternalLink className="size-4"/>
                </ItemActions>
              </Link>
            </Item>
          ))}
        </>
      )}
    </>
  )
}