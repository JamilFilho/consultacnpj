import { DatabaseSearch } from 'lucide-react'
import Search from '@/components/search'
import { MiniAds } from '@/components/ads'

export default function CNPJPage() {
  
  return (
    <div className="h-dvh md:h-screen flex-col items-center justify-center bg-zinc-50 -mb-12">
      <div className="absolute top-10 w-full flex items-center justify-center z-10">
        <MiniAds />
      </div>

      <section className="relative px-10 md:px-0 md:w-2/3 mx-auto h-full flex flex-col justify-center items-start gap-4">
          <header className="my-8 md:my-12 flex flex-col gap-2">
              <DatabaseSearch className="h-8 w-8" />
              <h1 className="text-4xl font-bold">BaseCNPJ</h1>
              <p className="text-lg text-muted-foreground">Qualquer CNPJ. Qualquer hora. De graça.</p>
          </header>

          <div className="w-full">
            <Search />
          </div>

          <footer className="px-10 md:px-0 w-full absolute bottom-6 left-0 text-xs md:text-sm">Os dados exibidos são obtidos de fontes públicas via api (brasilapi e minhareceita.org) e refletem informações disponíveis na base da Receita Federal do Brasil. O PDF gerado é de uso exclusivo do usuário e destina-se apenas a fins de registro e documentação pessoal.</footer>
      </section>
    </div>
  )
}
