"use client"

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Network, Printer } from "lucide-react";
import { formatarCNPJ } from '@/lib/cnpj-generator'

interface GrafoInterface {
    razaoSocial: string
    cnpj: string
}

export default function GrafoHeader({razaoSocial, cnpj}:GrafoInterface) {
    return(
        <header className="px-6 md:px-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <Network className="size-5 text-white print:text-black" />
            </div>
            <div>
              <h1
                className="text-lg font-semibold text-slate-900 leading-tight truncate max-w-sm"
                title={razaoSocial}
              >
                {razaoSocial}
              </h1>
              <p className="text-sm font-mono text-slate-500">{formatarCNPJ(cnpj)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" asChild>
              <Link href={`/consulta/${cnpj}`}>
                Ver empresa
              </Link>
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
                <Printer />
                Imprimir
            </Button>
          </div>
        </header>
    )
}