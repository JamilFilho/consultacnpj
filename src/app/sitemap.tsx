import { getGeneratedPageIds } from '@/lib/sitemap-tracker'

export default async function sitemap() {
  const ids = await getGeneratedPageIds()
  const baseUrl = 'https://cnpjhub.app'

  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    ...ids.map((id) => ({
      url: `${baseUrl}/consulta/${id}`,
      lastModified: new Date(),
    })),
  ]

  return routes
}