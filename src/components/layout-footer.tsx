"use client";

import { type ReactNode } from "react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export function LayoutAside({ feed }: { feed: ReactNode }) {
  return (
    <>
    <aside className="print:hidden border-y border-border flex flex-col md:grid md:grid-cols-3 gap-12 mx-auto py-12 px-12 mt-12 text-sm">
        <section className="col-span-1">
            <div className="flex flex-col gap-8">
                <header>
                <h4 className="font-semibold uppercase">Últimos CNPJs consultados</h4>
                </header>

                <div className="flex flex-col gap-4">
                    {feed}
                </div>
            </div>
        </section>
        <section className="col-span-2 flex flex-col gap-2">
            <h4 className="font-semibold uppercase">O que é um CNPJ?</h4>
            <p>CNPJ significa Cadastro Nacional da Pessoa Jurídica. É um número único de 14 dígitos emitido pela Receita Federal que funciona como a "identidade" de uma empresa ou organização no Brasil.</p>
            
            <p>Ele equivale ao CPF (Cadastro de Pessoas Físicas), mas é voltado para registrar e identificar negócios perante o governo.Para entender o CNPJ, é útil conhecer estes três pontos principais:</p>

            <Separator className="my-6"/>
            
            <h4 className="font-semibold uppercase">1. Para que serve?</h4>

            <ul className="pl-6 list-disc mt-4 space-y-2">
                <li>Legalização: Permite que o negócio atue de forma regularizada.</li>
                <li>Direitos e Deveres: Possibilita a emissão de notas fiscais, contratação de funcionários e abertura de contas bancárias empresariais.</li>
                <li>Tributação: Ajuda a Receita Federal a fiscalizar e garantir o pagamento correto dos impostos.</li>
            </ul>

            <Separator className="my-6"/>
            
            <h4 className="font-semibold uppercase">2. O formato do número</h4>
            
            <p>O CNPJ é composto por 14 dígitos organizados no formato padrão: XX.XXX.XXX/YYYY-ZZ.</p>

            <ul className="pl-6 list-disc mt-4 space-y-2">
                <li><strong>Os 8 primeiros (XX.XXX.XXX):</strong> Identificam a "raiz" da empresa.</li>
                <li><strong>Os 4 seguintes (/YYYY):</strong> Indicam se o local é uma matriz (0001) ou uma filial (0002).</li>
                <li><strong>Os 2 últimos (-ZZ):</strong> São os dígitos verificadores para autenticação.</li>
            </ul>
            
            <Separator className="my-6"/>
                
            <h4 className="font-semibold uppercase">3. Como emitir?</h4>
            
            <p>Para ter o seu próprio CNPJ, o processo varia dependendo do seu faturamento e do modelo de negócio (se você atua sozinho ou com sócios):</p>

            <ul className="pl-6 list-disc mt-4 space-y-2">
                <li><strong>MEI (Microempreendedor Individual):</strong> Ideal para quem trabalha por conta própria e fatura até o limite anual. É feito gratuitamente pela internet no Portal do Empreendedor.</li>
                <li><strong>Demais Empresas:</strong> Para empresas de maior porte ou com sócios, o processo é feito através da plataforma Redesim, sendo altamente recomendado o auxílio de um contador profissional.</li>
            </ul>
        </section>
    </aside>

    <footer className="py-2 px-6 flex flex-col-reverse md:flex-row justify-between">
        <span className="text-center my-2 md:my-0 md:text-left text-sm">
            <strong>basecnpj</strong>.vercel.app &copy; 2026
        </span>

        <ul className="flex flex-row gap-4 items-center justify-center text-sm *:hover:underline *:decoration-dotted *:underline-offset-4 p-2 md:p-0">
            <li>
                <Link href="/politica-de-privacidade" title="Política de Privacidade">
                    Política de Privacidade
                </Link>
            </li>
            <li>
                <Link  href="/termos-uso" title="Termos de Uso">
                    Termos de Uso
                </Link>
            </li>
        </ul>
    </footer>
    </>
  );
}