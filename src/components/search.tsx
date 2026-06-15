"use client"

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Button } from '@/components/ui/button';
import { DatabaseSearch, SearchIcon } from 'lucide-react';
import { Turnstile } from "next-turnstile";

export default function Search() {
    const [cnpj, setCnpj] = useState('')
    const [turnstileStatus, setTurnstileStatus] = useState<"success" | "error" | "expired" | "required">("required");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const router = useRouter()
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setError(null);
        setIsLoading(true);

        if (turnstileStatus !== "success") {
            setError("Please verify you are not a robot");
            setIsLoading(false);
            return;
        }

        const cleaned = cnpj.replace(/\D/g, '')
        if (!cleaned) {
            return
        }


        router.push(`/p/${cleaned}`)
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
        <form onSubmit={handleSearch} className="flex flex-col">
            <div className="w-full flex flex-col md:flex-row gap-2">
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
            </div>

            <Turnstile
                className='w-2/3'
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                retry="auto"
                refreshExpired="auto"
                sandbox={process.env.NODE_ENV === "development"}
                onError={() => {
                    setTurnstileStatus("error");
                    setError("Security check failed. Please try again.");
                }}
                onExpire={() => {
                    setTurnstileStatus("expired");
                    setError("Security check expired. Please verify again.");
                }}
                onLoad={() => {
                    setTurnstileStatus("required");
                    setError(null);
                }}
                onVerify={(token) => {
                    setTurnstileStatus("success");
                    setError(null);
                }}
            />
        </form>
    )
}