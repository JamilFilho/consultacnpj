import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    async redirects() {
        return [
            {
                source: '/ads/planilha-precificacao',
                destination: 'https://go.hotmart.com/F106322809T?redirectionUrl=https%3A%2F%2Fwitoriaalves475.hotmart.host%2Fplanilha-de-precificacao-descomplicada-39b524bd-b5c0-4750-9346-6d6114b68d00',
                permanent: true,
            },
            {
                source: '/ads/do-informal-ao-milhao',
                destination: 'https://go.hotmart.com/J106322947P?redirectionUrl=https%3A%2F%2Fhotmart.com%2Fpt-br%2Fmarketplace%2Fprodutos%2Fdo-informal-ao-milhao-como-transformar-seu-negocio-digital-em-uma-empresa-lucrativa-e-protegida-legalmente-mesmo-comecando-do-zero%2FY101237735Y',
                permanent: true
            },
            {
                source: '/ads/certificado-digital-cnpj',
                destination: 'https://amzn.to/4v9uQIR',
                permanent: true
            },
            {
                source: '/ads/reduza-impostos',
                destination: 'https://amzn.to/4fJZ2Wj',
                permanent: true
            },
            {
                source: '/ads/manual-do-mei',
                destination: 'https://go.hotmart.com/P106323015I?redirectionUrl=https%3A%2F%2Fhotmart.com%2Fpt-br%2Fmarketplace%2Fprodutos%2Fmanual-do-mei-ph7eu%2FM83963025O',
                permanent: true
            },
            {
                source: '/ads/mei-de-sucesso',
                destination: 'https://go.hotmart.com/E106323036I?dp=1&redirectionUrl=https%3A%2F%2Fhotmart.com%2Fpt-br%2Fmarketplace%2Fprodutos%2Fmei-de-sucesso%2FM56039193D',
                permanent: true
            }
        ]
    },
}

export default nextConfig
