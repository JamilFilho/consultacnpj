import { Building2 } from 'lucide-react'
import Search from '@/components/search'

export default function CNPJPage() {
  
  return (
    <div className="h-screen flex-col items-center justify-center bg-zinc-50">
      <section className="relative w-2/3 mx-auto h-full flex flex-col justify-center items-start gap-4">
          <header className="my-12 flex flex-col gap-2">
              <Building2 className="h-8 w-8" />
              <h1 className="text-4xl font-bold">Consultar CNPJ</h1>
              <p className="text-lg text-muted-foreground">Insira o CNPJ da empresa que deseja consultar e exporte os resultados em pdf.</p>
          </header>

          <div className="w-full">
            <Search />
          </div>

          <footer className="w-full absolute bottom-6 left-0 text-sm">Os dados exibidos são obtidos de fontes públicas via minhareceita.org e refletem informações disponíveis na base da Receita Federal do Brasil. O PDF gerado é de uso exclusivo do usuário e destina-se apenas a fins de registro e documentação pessoal.</footer>
      </section>
    </div>
  )
}
