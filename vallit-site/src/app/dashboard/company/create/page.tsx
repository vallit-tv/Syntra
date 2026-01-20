"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Building2, ChevronRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function CreateCompanyPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState("")
    const [slug, setSlug] = useState("")
    const [error, setError] = useState("")

    // Auto-generate slug
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setName(val)
        if (!slug || slug === name.toLowerCase().replace(/[^a-z0-9]/g, '-')) {
            setSlug(val.toLowerCase().replace(/[^a-z0-9]/g, '-'))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const { createClient } = await import("@/utils/supabase/client")
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                router.push("/login")
                return
            }

            const res = await fetch("/api/company", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ name, slug })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to create company")
            }

            // Force refresh to update session context with new company claim if needed, 
            // but for now just redirect to dashboard which should fetch company
            router.push("/dashboard")
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[400px] space-y-8"
            >
                <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center mx-auto mb-6">
                        <Building2 className="w-6 h-6 text-white/60" />
                    </div>
                    <h1 className="text-2xl font-semibold text-white tracking-tight">Create your workspace</h1>
                    <p className="text-sm text-white/40">
                        Create a company to manage your team and chatbot settings.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[13px] font-medium text-white/60">Company Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={handleNameChange}
                            placeholder="Acme Inc."
                            className="w-full bg-[#0C0C0C] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all placeholder:text-white/20"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[13px] font-medium text-white/60">Workspace URL</label>
                        <div className="flex items-center">
                            <span className="text-white/30 text-sm mr-1">syntra.app/</span>
                            <input
                                type="text"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                placeholder="acme"
                                className="flex-1 bg-transparent border-b border-white/10 py-1 text-sm text-white focus:outline-none focus:border-white/40 transition-all"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                            {error}
                        </div>
                    )}

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={cn(
                                "w-full bg-white text-black font-medium h-9 rounded-md text-sm transition-all hover:bg-white/90 flex items-center justify-center gap-2",
                                loading && "opacity-70 cursor-not-allowed"
                            )}
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                <>
                                    Create Workspace <ChevronRight className="w-4 h-4 opacity-50" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}
