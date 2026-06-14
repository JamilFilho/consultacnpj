import type { Metadata } from "next";
import "../styles/globals.css";
import { Separator } from "@/components/ui/separator";
import FeedCNPJ from "@/components/feed";

export const metadata: Metadata = {
  title: "BaseCNPJ | Dados oficiais da Receita Federal, ao alcance de todos.",
  description: "BaseCNPJ é a forma mais rápida de consultar empresas brasileiras. Razão social, situação cadastral, endereço, sócios e muito mais — tudo de graça, tudo oficial.",
  keywords: "cnpj, consulta cnpj, busca cnpj, consultar cnpj, cnpj gratis, consulta cnpj gratuita, receita federal, dados cnpj, situacao cadastral, razao social, nome fantasia, cnpj online, verificar cnpj, checar cnpj, empresa cnpj, cnpj empresa, consulta empresa, dados empresa, cnpj ativo, cnpj inativo, socios empresa, quadro societario, cnae, endereco empresa, capital social, porte empresa, natureza juridica, consulta gratuita, base cnpj, basecnpj",
  openGraph: {
    title: "BaseCNPJ",
    description: "Dados oficiais da Receita Federal, ao alcance de todos.",
    url: "https://basecnpj.vercel.app",
    siteName: "BaseCNPJ",
    images: [
      {
        url: "https://basecnpj.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "BaseCNPJ",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  return (
    <html lang="pt-br">
      <body className="m-0 p-0">
        <div className="mx-auto">
          {children}

          <aside className="print:hidden flex flex-col md:grid md:grid-cols-3 gap-12 mx-auto py-6 px-12 mt-12 text-sm">
            <section className="col-span-1 flex flex-col gap-8">
              <header>
                <h4 className="font-semibold uppercase">Últimos CNPJs consultados</h4>
              </header>

              <div className="flex flex-col gap-4">
                <FeedCNPJ />
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
        </div>
      </body>
</html>
  );
}
