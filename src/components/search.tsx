"use client"

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Button } from '@/components/ui/button';
import { DatabaseSearch, SearchIcon } from 'lucide-react';
import { Turnstile } from "next-turnstile";

interface SearchProps {
    nav?: boolean
}

export default function Search({nav}:SearchProps) {
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


        router.push(`/consulta/${cleaned}`)
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
            <div className="flex flex-col md:flex-row gap-2">
                <input
                    type="text"
                    placeholder="00.000.000/0000-00"
                    value={cnpj}
                    onChange={handleCNPJChange}
                    maxLength={18}
                    className={`
                        flex-1 rounded-md border px-4 font-mono text-md tracking-wide bg-background focus:outline-none focus:ring-2 focus:ring-ring
                        ${nav ? "py-1" : "py-2"}
                        `}
                    autoFocus
                />
                <Button 
                    className={`h-full ${nav ? "py-1.5" : "py-2.5"}`}
                    type="submit"
                >
                    <DatabaseSearch />
                    Consultar CNPJ
                </Button>
            </div>

            <Turnstile
                className='w-2/3'
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                retry="auto"
                refreshExpired="auto"
                // sandbox={process.env.NODE_ENV === "development"}
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