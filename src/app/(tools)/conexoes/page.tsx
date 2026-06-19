'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Network, Search, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { normalizarCNPJ, formatarCNPJ, validarCNPJ } from '@/lib/cnpj-generator'

export default function ConexoesPage() {
  const router = useRouter()
  const [valor, setValor] = useState('')
  const [erro, setErro] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    setErro(null)

    // Aplica máscara enquanto digita, mas preserva letras (CNPJ alfanumérico)
    const normalizado = normalizarCNPJ(raw)
    if (normalizado.length <= 14) {
      setValor(normalizado.length === 14 ? formatarCNPJ(normalizado) : raw.toUpperCase())
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const normalizado = normalizarCNPJ(valor)

    if (normalizado.length === 0) {
      setErro('Informe um CNPJ.')
      return
    }

    if (normalizado.length !== 14) {
      setErro(`CNPJ incompleto — faltam ${14 - normalizado.length} caractere(s).`)
      return
    }

    if (!validarCNPJ(normalizado)) {
      setErro('CNPJ inválido. Verifique os dígitos verificadores.')
      return
    }

    router.push(`/conexoes/${normalizado}`)
  }

  return (
    <main className="h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      <div className="w-full px-12">
        {/* Ícone + título */}
        <div className="flex flex-col items-center gap-3 mb-10">
          <div className="size-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
            <Network className="size-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
              Malha de conexões
            </h1>
            <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
              Visualize a rede de sócios e empresas relacionadas a um CNPJ.
            </p>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
            <Input
              value={valor}
              onChange={handleChange}
              placeholder="00.000.000/0001-00"
              autoComplete="off"
              autoFocus
              inputMode="text"
              className="pl-10 h-11 font-mono text-sm tracking-wide bg-white border-slate-200 focus-visible:ring-blue-500 placeholder:font-sans placeholder:tracking-normal"
              aria-label="CNPJ"
              aria-describedby={erro ? 'cnpj-erro' : undefined}
            />
          </div>

          {erro && (
            <p id="cnpj-erro" className="text-xs text-red-600 px-0.5" role="alert">
              {erro}
            </p>
          )}

          <Button
            type="submit"
            className="h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium gap-2"
          >
            Consultar malha
            <ArrowRight className="size-4" />
          </Button>
        </form>

        {/* Rodapé informativo */}
        <p className="mt-8 text-center text-xs text-slate-400 leading-relaxed">
          Aceita CNPJ numérico e o novo formato alfanumérico (vigente a partir de julho/2026).
        </p>
      </div>
    </main>
  )
}