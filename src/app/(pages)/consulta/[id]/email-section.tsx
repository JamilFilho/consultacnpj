// app/p/[id]/email-section.tsx
import { EnrichmentData } from '@/lib/enrichment'

interface Props {
  // Email já disponível na fonte primária (minhareceita.org) — se presente,
  // não aguardamos o enrichment: exibimos imediatamente sem suspender.
  emailPrimario: string | null
  promise: Promise<EnrichmentData>
}

// Componente async: se emailPrimario já existe renderiza sincronamente;
// caso contrário suspende até o enrichment resolver.
export async function EmailAsync({ emailPrimario, promise }: Props) {
  const email = emailPrimario ?? (await promise).email

  if (!email) return <p className="font-medium">—</p>

  return (
    <a href={`mailto:${email}`} className="font-medium hover:underline">
      {email}
    </a>
  )
}