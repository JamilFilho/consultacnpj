import { BadgeCheck, DatabaseSearch, LayersPlus, Route } from 'lucide-react'
import Search from '@/components/search'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import JsonLd from '@/components/JsonLd';

export default function CNPJPage() {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "CNPJ Hub",
    "url": "https://cnpjhub.app",
    "description": "Consulta CNPJ grátis com dados oficiais da Receita Federal. Gere, valide e explore conexões entre empresas.",
    "publisher": {
      "@type": "Organization",
      "name": "CNPJ Hub",
      "url": "https://cnpjhub.app"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://cnpjhub.app/consulta/{search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <JsonLd data={websiteSchema} />
      <div className="h-dvh md:h-screen flex-col items-center justify-center bg-zinc-50 -mb-12 pb-12">
        <section className="relative px-10 md:px-0 md:w-2/3 mx-auto h-full flex flex-col justify-center items-start gap-4">
            <header className="my-8 md:my-12 flex flex-col gap-2">
                <DatabaseSearch className="h-8 w-8" />
                <h1 className="text-4xl font-bold">CNPJ<span className="text-orange-500">Hub</span></h1>
                <p className="text-lg text-muted-foreground">Pesquise qualquer CNPJ. A qualquer hora. Totalmente gratuito.</p>
            </header>

            <div className="w-full">
              <Search />
            </div>

            <footer className="px-10 md:px-0 w-full absolute bottom-6 left-0 text-xs md:text-sm">Os dados exibidos são obtidos de fontes públicas via api (brasilapi e minhareceita.org) e refletem informações disponíveis na base da Receita Federal do Brasil. O PDF gerado é de uso exclusivo do usuário e destina-se apenas a fins de registro e documentação pessoal.</footer>
        </section>
      </div>

      <div className="print:hidden w-full bg-zinc-50 mt-12 grid grid-cols-1 md:grid-cols-3 *:col-span-1 *:py-12 *:px-6 *:hover:bg-zinc-200/20 *:transition-all *:ease-in-out *:flex *:flex-col *:gap-4">
        <section>
            <header className="flex flex-col gap-2">
                <Route />
                <h3 className="font-medium text-lg">Conexões</h3>
                <p>Busque conexões entre um CNPJ, seus sócios e outras empresas.</p>
            </header>
            <Button asChild className="mt-auto">
                <Link href="/conexoes" title="Conexões">
                  Buscar conexões
                </Link>
            </Button>
        </section>

        <section>
          <header className="flex flex-col gap-2">
              <LayersPlus />
              <h3 className="font-medium text-lg">Gerar CNPJ</h3>
              <p>Gere números com dígito verificador matematicamente válido (módulo 11). Use para popular bancos de dados de desenvolvimento, testes automatizados ou formulários de homologação.</p>
          </header>
          <Button asChild className="mt-auto">
              <Link href="/gerar-cnpj" title="Gerar CNPJ">
                  Gerar CNPJ
              </Link>
          </Button>
        </section>

        <section>
            <header className="flex flex-col gap-2">
                <BadgeCheck />
                <h3 className="font-medium text-lg">Validar CNPJ</h3>
                <p>Verifique se um número CNPJ está matematicamente correto. Valide tanto formato numérico clássico como quanto formato alfanumérico (2026).</p>
            </header>
            <Button asChild className="mt-auto">
                <Link href="/validar-cnpj" title="Validar CNPJ">
                    Validar CNPJ
                </Link>
            </Button>
        </section>
      </div>
    </>
  )
}
