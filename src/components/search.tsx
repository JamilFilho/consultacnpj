"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Button } from '@/components/ui/button'
import { DatabaseSearch, SearchIcon } from 'lucide-react'

export default function Search() {
    const [cnpj, setCnpj] = useState('')
    
    const router = useRouter()
    const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    const cleaned = cnpj.replace(/\D/g, '')
    if (!cleaned) {
        return
    }

    router.push(`/${cleaned}`)
    }

    const formatCNPJ = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 14) {
        return cleaned
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
    }
    return cleaned
    }

    const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCnpj(formatCNPJ(e.target.value))
    }

    return(
        <form onSubmit={handleSearch} className="flex flex-row gap-2">
            <InputGroup>
                <InputGroupAddon>
                    <SearchIcon />
                </InputGroupAddon>
                <InputGroupInput
                    type="text"
                    placeholder="00.000.000/0000-00"
                    value={cnpj}
                    onChange={handleCNPJChange}
                    maxLength={18}
                />
            </InputGroup>
            <Button type="submit">
                <DatabaseSearch />
                Consultar CNPJ
            </Button>
        </form>
    )
}