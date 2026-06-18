import type { Metadata } from "next";
import "../styles/globals.css";
import FeedCNPJ from "@/components/feed";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "@/lib/providers";
import { LayoutAside } from "@/components/layout-footer";

export const metadata: Metadata = {
  title: "CNPJHub | Dados oficiais da Receita Federal, ao alcance de todos.",
  description: "CNPJ Hub é a forma mais rápida de consultar empresas brasileiras. Razão social, situação cadastral, endereço, sócios e muito mais — tudo de graça, tudo oficial.",
  keywords: "cnpj, consulta cnpj, busca cnpj, consultar cnpj, cnpj gratis, consulta cnpj gratuita, receita federal, dados cnpj, situacao cadastral, razao social, nome fantasia, cnpj online, verificar cnpj, checar cnpj, empresa cnpj, cnpj empresa, consulta empresa, dados empresa, cnpj ativo, cnpj inativo, socios empresa, quadro societario, cnae, endereco empresa, capital social, porte empresa, natureza juridica, consulta gratuita, base cnpj, CNPJ Hub",
  openGraph: {
    title: "CNPJ Hub",
    description: "Dados oficiais da Receita Federal, ao alcance de todos.",
    url: "https://cnpjhub.app",
    siteName: "CNPJ Hub",
    images: [
      {
        url: "https://cnpjhub.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "CNPJ Hub",
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
          <Providers>
            {children}

            <LayoutAside feed={<FeedCNPJ />} />
          </Providers>
        </div>
        <Analytics/>
      </body>
    </html>
  );
}
