// app/validador-cnpj/page.tsx
import type { Metadata } from 'next'
import ValidadorCNPJClient from './validador-client'

export const metadata: Metadata = {
  title: 'Validador de CNPJ | BaseCNPJ',
  description:
    'Valide o dígito verificador de um CNPJ instantaneamente, no formato numérico clássico ou alfanumérico (2026). Valide vários de uma vez e consulte os válidos direto na Receita.',
}

export default function ValidadorCNPJPage() {
  return <ValidadorCNPJClient />
}