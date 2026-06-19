// lib/cnpj-generator.ts
//
// Gerador de CNPJ válido para fins de teste — numérico (formato atual) e
// alfanumérico (novo formato, vigente a partir de julho/2026 conforme
// Instrução Normativa RFB nº 2.229/2024).
//
// Algoritmo (idêntico em essência ao CNPJ numérico clássico, módulo 11):
// 1. As 12 primeiras posições podem ser dígitos (0-9) ou letras maiúsculas
//    (A-Z, sem acento) no formato alfanumérico; só dígitos no formato clássico.
// 2. Cada caractere é convertido para valor numérico via ASCII - 48.
//    Isso faz '0'..'9' mapearem para 0..9 (compatibilidade com o cálculo
//    clássico) e 'A'..'Z' mapearem para 17..42.
// 3. DV1 = módulo 11 sobre as 12 posições, pesos [5,4,3,2,9,8,7,6,5,4,3,2].
// 4. DV2 = módulo 11 sobre as 13 posições (12 + DV1), pesos
//    [6,5,4,3,2,9,8,7,6,5,4,3,2].
// 5. Se o resto da divisão por 11 for 0 ou 1, o DV é 0; caso contrário,
//    DV = 11 - resto.
// 6. Os dois dígitos verificadores são SEMPRE numéricos, em ambos os formatos.

export type FormatoCNPJ = 'numerico' | 'alfanumerico'

const PESOS_DV1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
const PESOS_DV2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

// Letras permitidas no formato alfanumérico. Algumas fontes técnicas (ENCAT)
// especulam exclusão de letras visualmente ambíguas (I, O, U, Q, F), mas a
// Receita Federal não confirmou oficialmente uma lista restrita até a
// publicação deste código — por isso usamos o conjunto completo A-Z.
const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const ALFANUMERICOS = '0123456789' + LETRAS

// Converte um caractere (dígito ou letra) para seu valor numérico de cálculo:
// código ASCII do caractere menos 48. '0' (ASCII 48) -> 0, '9' (ASCII 57) -> 9,
// 'A' (ASCII 65) -> 17, 'Z' (ASCII 90) -> 42.
function valorAscii(char: string): number {
  return char.charCodeAt(0) - 48
}

function calcularDV(base: string, pesos: number[]): number {
  const soma = base
    .split('')
    .reduce((acc, char, i) => acc + valorAscii(char) * pesos[i], 0)

  const resto = soma % 11

  return resto < 2 ? 0 : 11 - resto
}

function caractereAleatorio(formato: FormatoCNPJ): string {
  const conjunto = formato === 'alfanumerico' ? ALFANUMERICOS : '0123456789'
  return conjunto[Math.floor(Math.random() * conjunto.length)]
}

/**
 * Gera um CNPJ válido (12 posições aleatórias + 2 dígitos verificadores
 * calculados), sem máscara, no formato solicitado.
 */
export function gerarCNPJ(formato: FormatoCNPJ = 'numerico'): string {
  let base = ''
  for (let i = 0; i < 12; i++) {
    base += caractereAleatorio(formato)
  }

  const dv1 = calcularDV(base, PESOS_DV1)
  const dv2 = calcularDV(base + dv1, PESOS_DV2)

  return `${base}${dv1}${dv2}`
}

/**
 * Gera múltiplos CNPJs válidos, garantindo que não haja duplicados no lote.
 */
export function gerarLoteCNPJ(quantidade: number, formato: FormatoCNPJ = 'numerico'): string[] {
  const resultado = new Set<string>()

  // Para o formato numérico, o espaço de busca é menor (10^12 combinações
  // de base), então em tese poderia colidir com quantidades extremas — mas
  // pedidos de até alguns milhares são instantâneos e sem risco prático de
  // loop infinito.
  while (resultado.size < quantidade) {
    resultado.add(gerarCNPJ(formato))
  }

  return Array.from(resultado)
}

/**
 * Aplica a máscara visual de CNPJ (00.000.000/0001-00), funcionando para
 * ambos os formatos já que a máscara não depende do tipo de caractere.
 */
export function formatarCNPJ(cnpj: string): string {
  if (cnpj.length !== 14) return cnpj
  return cnpj.replace(/^(.{2})(.{3})(.{3})(.{4})(.{2})$/, '$1.$2.$3/$4-$5')
}

/**
 * Remove máscara (pontuação) e normaliza para maiúsculas, preservando
 * letras — diferente de um simples `replace(/\D/g, '')`, que descartaria
 * as letras do CNPJ alfanumérico (formato vigente a partir de 2026).
 *
 * Usado em qualquer lugar do projeto que receba um CNPJ "como o usuário
 * digitou" e precise da forma canônica de 14 caracteres para usar como
 * chave de cache, parâmetro de URL de API externa, etc.
 */
export function normalizarCNPJ(cnpjComOuSemMascara: string): string {
  return cnpjComOuSemMascara.replace(/[.\-/\s]/g, '').toUpperCase()
}

/**
 * Valida se um CNPJ (com ou sem máscara) tem dígitos verificadores
 * corretos. Aceita tanto o formato numérico quanto alfanumérico.
 */
export function validarCNPJ(cnpjComOuSemMascara: string): boolean {
  return diagnosticarCNPJ(cnpjComOuSemMascara).valido
}

export type MotivoInvalidez =
  | 'vazio'
  | 'tamanho_incorreto'
  | 'caractere_invalido'
  | 'todos_iguais'
  | 'dv_incorreto'

export type DiagnosticoCNPJ = {
  entradaOriginal: string
  limpo: string
  valido: boolean
  formatoDetectado: FormatoCNPJ | null
  base: string | null
  dvInformado: string | null
  dvCalculado: string | null
  motivoInvalidez: MotivoInvalidez | null
  mensagem: string
}

// CNPJs com todos os 12 primeiros caracteres iguais (ex: 00000000000000,
// 11111111111111) calculam DV válido pela fórmula, mas são sequências
// triviais que a Receita Federal não emite — vale sinalizar separadamente
// de um "válido" genérico, já que costumam ser erro de digitação/preenchimento
// (campo zerado, placeholder esquecido) em vez de um CNPJ real digitado errado.
function todosCaracteresIguais(base: string): boolean {
  return base.split('').every((c) => c === base[0])
}

/**
 * Roda a validação completa de um CNPJ e devolve um diagnóstico estruturado:
 * o que foi detectado, por que é válido ou não, e uma mensagem pronta para
 * exibição. Usado pela página de validação para explicar o resultado em
 * vez de só retornar um booleano.
 */
export function diagnosticarCNPJ(cnpjComOuSemMascara: string): DiagnosticoCNPJ {
  const entradaOriginal = cnpjComOuSemMascara
  const limpo = normalizarCNPJ(cnpjComOuSemMascara)

  const base_: DiagnosticoCNPJ = {
    entradaOriginal,
    limpo,
    valido: false,
    formatoDetectado: null,
    base: null,
    dvInformado: null,
    dvCalculado: null,
    motivoInvalidez: null,
    mensagem: '',
  }

  if (limpo.length === 0) {
    return {
      ...base_,
      motivoInvalidez: 'vazio',
      mensagem: 'Digite um CNPJ para validar.',
    }
  }

  if (limpo.length !== 14) {
    return {
      ...base_,
      motivoInvalidez: 'tamanho_incorreto',
      mensagem: `Um CNPJ tem 14 caracteres (sem contar a máscara). O valor informado tem ${limpo.length}.`,
    }
  }

  if (!/^[0-9A-Z]{12}[0-9]{2}$/.test(limpo)) {
    return {
      ...base_,
      motivoInvalidez: 'caractere_invalido',
      mensagem:
        'As 12 primeiras posições aceitam apenas letras (A-Z) e números; os 2 dígitos verificadores finais devem ser numéricos.',
    }
  }

  const base = limpo.slice(0, 12)
  const dv1Informado = limpo[12]
  const dv2Informado = limpo[13]
  const formatoDetectado: FormatoCNPJ = /^[0-9]{12}$/.test(base) ? 'numerico' : 'alfanumerico'

  if (todosCaracteresIguais(base)) {
    return {
      ...base_,
      formatoDetectado,
      base,
      dvInformado: `${dv1Informado}${dv2Informado}`,
      motivoInvalidez: 'todos_iguais',
      mensagem:
        'Todos os caracteres da base são iguais — provavelmente um placeholder ou campo zerado, não um CNPJ real.',
    }
  }

  const dv1Calculado = calcularDV(base, PESOS_DV1)
  const dv2Calculado = calcularDV(base + dv1Calculado, PESOS_DV2)
  const dvCalculado = `${dv1Calculado}${dv2Calculado}`
  const dvInformado = `${dv1Informado}${dv2Informado}`

  if (dvCalculado !== dvInformado) {
    return {
      ...base_,
      formatoDetectado,
      base,
      dvInformado,
      dvCalculado,
      motivoInvalidez: 'dv_incorreto',
      mensagem: `O dígito verificador informado (${dvInformado}) não corresponde ao calculado (${dvCalculado}).`,
    }
  }

  return {
    ...base_,
    valido: true,
    formatoDetectado,
    base,
    dvInformado,
    dvCalculado,
    mensagem: 'CNPJ matematicamente válido.',
  }
}