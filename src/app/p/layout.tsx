import Search from "@/components/search";
import { DatabaseSearch } from "lucide-react";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode; }) {
  return (
    <>
    <nav className="print:hidden w-full h-12 fixed top-0 left-0 flex flex-row items-center px-6 md:px-12 bg-white/80 backdrop-blur-sm border-b z-50">
        <Link href="/" title="Página Inicial">
            <h1 className="font-bold lowercase flex flex-row items-center gap-2 text-base">
                <DatabaseSearch className="size-5"/>
                Consultar CNPJ
            </h1>
        </Link>

        <div className="hidden md:block w-1/2 ml-auto">
            <Search />
        </div>
    </nav>
    
    <div className="px-6 md:px-0 md:w-2/3 mx-auto pt-12">
        {children}
    </div>                
    </>
  );
}