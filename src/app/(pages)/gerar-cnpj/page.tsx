// app/gerador-cnpj/page.tsx
import type { Metadata } from 'next'
import GeradorCNPJClient from './gerador-client'

export const metadata: Metadata = {
  title: "Gerador de CNPJ para testes | BaseCNPJ",
  description: "Gere números de CNPJ válidos (dígito verificador correto) para uso em ambientes de desenvolvimento e teste. Suporta o formato numérico clássico e o novo formato alfanumérico de 2026.",
}

export default function GeradorCNPJPage() {
  return <GeradorCNPJClient />
}