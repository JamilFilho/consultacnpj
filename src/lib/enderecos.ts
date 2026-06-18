import { kv } from "@vercel/kv"
import crypto from "crypto"

export function gerarChaveEndereco(data: {
  uf?: string
  municipio?: string
  logradouro?: string
  numero?: string
}) {
  const endereco = [
    data.uf?.trim().toUpperCase() ?? "",
    data.municipio?.trim().toUpperCase() ?? "",
    data.logradouro?.trim().toUpperCase() ?? "",
    data.numero?.trim().toUpperCase() ?? "",
  ].join("|")

  return crypto
    .createHash("sha256")
    .update(endereco)
    .digest("hex")
}

export async function getEmpresasMesmoEndereco(
  data: {
    cnpj: string
    uf?: string
    municipio?: string
    logradouro?: string
    numero?: string
  }
) {
  const enderecoKey =
    gerarChaveEndereco(data)

  // Retrieve the set members as an array of strings. The generic type should be an array type,
  // not a single string, to satisfy the type constraint expected by the KV client.
  const cnpjs = await kv.smembers<string[]>(
    `endereco:${enderecoKey}`
  )

  const empresas = await Promise.all(
    cnpjs.map(async (cnpj) =>
      kv.get(`empresa:${cnpj}`)
    )
  )

  return empresas.filter(
    (empresa: any) =>
      empresa &&
      empresa.cnpj !== data.cnpj
  )
}