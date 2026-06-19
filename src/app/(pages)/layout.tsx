import Search from "@/components/search";
import { Button } from "@/components/ui/button";
import { BadgeCheck, DatabaseSearch, LayersPlus, Route } from "lucide-react";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode; }) {
  return (
    <>
    <nav className="print:hidden w-full h-12 fixed top-0 left-0 flex flex-row items-center px-6 md:px-12 bg-white/80 backdrop-blur-sm border-b z-50">
        <Link href="/" title="Página Inicial">
            <h1 className="font-bold lowercase flex flex-row items-center gap-2 text-base">
                <DatabaseSearch className="size-5"/>
                <span>CNPJ<span className="text-orange-500">Hub</span></span>
            </h1>
        </Link>

        <div className="hidden md:block w-1/2 ml-auto">
            <Search />
        </div>
    </nav>
    
    <div className="px-6 md:px-0 md:w-2/3 mx-auto pt-12">
        {children}
    </div>      

    <footer className="print:hidden w-full bg-zinc-50 mt-12 grid grid-cols-1 md:grid-cols-3 *:col-span-1 *:py-12 *:px-6 *:hover:bg-zinc-200/20 *:transition-all *:ease-in-out *:flex *:flex-col *:gap-4">
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
    </footer>          
    </>
  );
}