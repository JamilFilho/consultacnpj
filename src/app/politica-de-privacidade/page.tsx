import Head from 'next/head';

/**
 * Página de Política de Privacidade
 *
 * Esta página contém a política de privacidade do site e inclui
 * metadados de SEO usando o componente <Head> do Next.js.
 * Também faz referência ao adendo da Cloudflare Turnstile.
 */
export default function Privacidade() {
    return (
        <>
            <Head>
                <title>Política de Privacidade - BaseCNPJ</title>
                <meta name="description" content="Política de privacidade do site BaseCNPJ, incluindo informações sobre coleta de dados e uso do Cloudflare Turnstile." />
                <meta name="robots" content="index,follow" />
                <link rel="canonical" href="https://basecnpj.vercel.app/politica-de-privacidade" />
            </Head>
            <main className="w-2/3 mx-auto py-12">
                <header className="my-8 md:my-12 flex flex-col gap-2">
                    <h1 className="text-4xl font-bold">Política de Privacidade</h1>
                    <p className="text-lg text-muted-foreground">Esta política descreve como coletamos, usamos e protegemos as informações pessoais dos usuários do nosso site.</p>
                </header>
                <h2 className="text-xl font-semibold mt-4 mb-2">Coleta de Dados</h2>
                <p className="mb-2">
                    Podemos coletar informações pessoais fornecidas diretamente por você, bem como dados técnicos coletados
                    automaticamente ao navegar em nosso site (por exemplo, endereço IP, tipo de navegador, etc.).
                </p>
                <h2 className="text-xl font-semibold mt-4 mb-2">Uso de Serviços de Terceiros</h2>
                <p className="mb-2">
                    Utilizamos o serviço <a href="https://www.cloudflare.com/en-gb/turnstile-privacy-policy/" target="_blank" rel="noopener noreferrer">Cloudflare Turnstile</a> para proteger o site contra bots e spam. Para detalhes sobre a política de privacidade do Turnstile, consulte o adendo oficial da Cloudflare.
                </p>
                <h2 className="text-xl font-semibold mt-4 mb-2">Direitos dos Usuários</h2>
                <p className="mb-2">
                    Você tem o direito de acessar, corrigir ou solicitar a exclusão de seus dados pessoais. Para exercer esses direitos, entre em contato conosco através do e‑mail disponibilizado na página de contato.
                </p>
                <p className="mt-6 text-sm text-gray-600">
                    Última atualização: 15 de junho de 2026.
                </p>
            </main>
        </>
    );
}