
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function UpdatePasswordPage() {
    const router = useRouter()
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const supabase = createClientComponentClient()

    useEffect(() => {
        // Handle code exchange if present in URL (for invites acting as password reset/recovery)
        // Although better handled in callback, client side auth can snatch the session too
        const handleSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                // If no session, try to exchange hash/code?
                // supabase-js client automatically handles hash fragment token exchange.
                // But for code flow with SSR, we might need manual exchange if callback wasn't hit.
                // Let's assume the user is validly logged in or the client handles it.
            }
        }
        handleSession()
    }, [supabase])

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        setIsLoading(true)
        setError("")

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            })

            if (updateError) {
                throw updateError
            }

            setSuccess(true)
            setTimeout(() => {
                router.push("/dashboard")
            }, 2000)

        } catch (err: any) {
            setError(err.message || "Failed to update password")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#080808] text-white font-sans selection:bg-white/20">
            <div className="w-full max-w-[340px] px-6">

                <div className="mb-10 text-center">
                    <div className="w-10 h-10 bg-white rounded-xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-white/10">
                        <div className="w-4 h-4 bg-black rounded-sm" />
                    </div>
                    <h1 className="text-xl font-medium tracking-tight text-white mb-2">Set new password</h1>
                    <p className="text-[13px] text-white/40">Secure your account to continue.</p>
                </div>

                <AnimatePresence mode="wait">
                    {!success ? (
                        <motion.form
                            key="reset-form"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onSubmit={handleUpdatePassword}
                            className="space-y-4"
                        >
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-medium text-white/40 uppercase tracking-wider ml-1">New Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Minimum 6 characters"
                                    className="w-full h-10 px-3 bg-[#111] border border-white/10 rounded-md text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all"
                                    autoFocus
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-medium text-white/40 uppercase tracking-wider ml-1">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter password"
                                    className="w-full h-10 px-3 bg-[#111] border border-white/10 rounded-md text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all"
                                    required
                                    minLength={6}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !password || !confirmPassword}
                                className="w-full h-10 bg-white text-black text-[13px] font-medium rounded-md hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Update Password"}
                            </button>
                        </motion.form>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center space-y-4 bg-emerald-500/5 p-6 rounded-xl border border-emerald-500/10"
                        >
                            <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-white font-medium text-sm">Password Updated</h3>
                                <p className="text-white/40 text-[12px] mt-1">Redirecting to dashboard...</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-3 rounded-lg bg-red-500/5 border border-red-500/10 flex items-start gap-3"
                    >
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <span className="text-[12px] text-red-400 leading-relaxed">{error}</span>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
