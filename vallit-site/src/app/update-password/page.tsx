
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

export default function UpdatePasswordPage() {
    const router = useRouter()
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")
        setMessage("")

        try {
            const { supabase } = await import("@/lib/supabase")
            const { error } = await supabase.auth.updateUser({ password })

            if (error) {
                setError(error.message)
            } else {
                setMessage("Password updated successfully! Redirecting...")
                setTimeout(() => router.push("/dashboard"), 1500)
            }
        } catch (err) {
            setError("An error occurred.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#080808] text-white font-sans">
            <div className="w-full max-w-sm px-6">
                <h1 className="text-xl font-medium mb-2 text-center">Set New Password</h1>
                <p className="text-sm text-white/40 mb-8 text-center">Enter your new strong password below.</p>

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="New password"
                        className="w-full h-11 px-4 bg-[#141414] border border-white/5 rounded-lg focus:outline-none focus:border-white/20 text-sm"
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !password}
                        className="w-full h-11 flex items-center justify-center bg-white text-black rounded-lg font-medium text-sm hover:bg-white/90 disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
                    </button>
                </form>

                {message && <div className="mt-4 p-3 rounded bg-green-500/10 text-green-400 text-xs text-center">{message}</div>}
                {error && <div className="mt-4 p-3 rounded bg-red-500/10 text-red-400 text-xs text-center">{error}</div>}
            </div>
        </div>
    )
}
