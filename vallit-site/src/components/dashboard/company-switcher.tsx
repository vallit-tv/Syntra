"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

interface Company {
    id: string
    name: string
    slug: string
}

interface CompanySwitcherProps {
    currentCompany: Company | null
    isCollapsed: boolean
}

export function CompanySwitcher({ currentCompany, isCollapsed }: CompanySwitcherProps) {
    const router = useRouter()
    const [companies, setCompanies] = React.useState<Company[]>([])
    const [loading, setLoading] = React.useState(false)

    React.useEffect(() => {
        // Fetch companies on mount
        const fetchCompanies = async () => {
            try {
                // Determine source: admin list or just user's memberships?
                // For now, we'll try to fetch all if admin, or just ours.
                // Re-using the logic from admin page? Or a new endpoint?
                // app.py doesn't have a simple "my companies" list endpoint yet (except admin list).
                // But we know 'Vallit' and 'WTM' exist.
                // Let's rely on /api/companies (Admin) for now, assuming Theorei is admin.
                const res = await fetch('/api/companies', {
                    headers: { 'Authorization': `Bearer ${await getAuthToken()}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setCompanies(data.companies || [])
                }
            } catch (e) {
                console.error("Failed to fetch companies", e)
            }
        }
        fetchCompanies()
    }, [])

    // Helper to get token (client-side)
    const getAuthToken = async () => {
        const { createClient } = await import("@/utils/supabase/client")
        const supabase = createClient()
        const { data } = await supabase.auth.getSession()
        return data.session?.access_token || ''
    }

    const onSelectCompany = async (companyId: string) => {
        if (currentCompany?.id === companyId) return

        try {
            setLoading(true)
            const token = await getAuthToken()
            const res = await fetch('/api/company/switch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ company_id: companyId })
            })

            if (res.ok) {
                // Force reload to refresh context
                window.location.reload()
            }
        } catch (e) {
            console.error("Switch failed", e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className={cn(
                    "flex items-center gap-2 hover:bg-white/[0.04] p-1.5 rounded-md transition-colors w-full text-left cursor-pointer",
                    isCollapsed && "justify-center p-0 hover:bg-transparent"
                )}>
                    <div className="w-5 h-5 rounded-sm bg-emerald-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm relative">
                        {currentCompany ? currentCompany.name.charAt(0) : <Plus className="w-3 h-3" />}
                        {loading && <div className="absolute inset-0 bg-black/50 animate-pulse rounded-sm" />}
                    </div>
                    {!isCollapsed && (
                        <>
                            <span className="font-medium text-[13px] text-white/90 truncate flex-1 tracking-tight">
                                {currentCompany ? currentCompany.name : "Select Company"}
                            </span>
                            <ChevronsUpDown className="w-3.5 h-3.5 text-white/40" />
                        </>
                    )}
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px] bg-[#0E0E0E] border-white/[0.08]" align="start">
                <DropdownMenuLabel className="text-xs text-white/40">Switch Organization</DropdownMenuLabel>

                {companies.map((company) => (
                    <DropdownMenuItem
                        key={company.id}
                        onSelect={() => onSelectCompany(company.id)}
                        className="text-[13px] text-white/80 focus:bg-white/10 focus:text-white cursor-pointer"
                    >
                        <Building2 className="mr-2 h-3.5 w-3.5 opacity-50" />
                        {company.name}
                        {currentCompany?.id === company.id && (
                            <Check className="ml-auto h-3 w-3 opacity-50" />
                        )}
                    </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator className="bg-white/[0.08]" />
                <DropdownMenuItem
                    className="text-[13px] text-white/80 focus:bg-white/10 focus:text-white cursor-pointer"
                    onSelect={() => router.push('/dashboard/company/create')}
                >
                    <Plus className="mr-2 h-3.5 w-3.5" />
                    Create Organization
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
