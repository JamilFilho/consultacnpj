function calcularDigitoVerificador(base: string): string {
  const pesosPrimeiroDigito = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const pesosSegundoDigito = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

  const calcularDigito = (nums: number[], pesos: number[]): number => {
    const soma = nums.reduce((acc, num, i) => acc + num * pesos[i], 0)
    const resto = soma % 11
    return resto < 2 ? 0 : 11 - resto
  }

  const nums = base.split('').map(Number)

  const dv1 = calcularDigito(nums, pesosPrimeiroDigito)
  const dv2 = calcularDigito([...nums, dv1], pesosSegundoDigito)

  return `${dv1}${dv2}`
}

/**
 * Dado um CNPJ qualquer (matriz ou filial), retorna o CNPJ da matriz (ordem 0001)
 * da mesma raiz, com o dígito verificador recalculado.
 *
 * Retorna null se o CNPJ informado não tiver 14 dígitos válidos.
 */
export function getCnpjMatriz(cnpj: string): string | null {
  const clean = cnpj.replace(/\D/g, '')
  if (clean.length !== 14) return null

  const raiz = clean.slice(0, 8)
  const base = raiz + '0001'
  const dv = calcularDigitoVerificador(base)

  return base + dv
}