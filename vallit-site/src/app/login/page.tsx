"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, ArrowRight, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export default function LoginPage() {
    const router = useRouter()
    const [step, setStep] = useState<"email" | "password" | "setup">("email")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [accessCode, setAccessCode] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [message, setMessage] = useState("")

    useEffect(() => {
        // Prefetch dashboard
        router.prefetch("/dashboard")
    }, [router])

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return

        setIsLoading(true)
        setError("")

        try {
            // Check user status
            const res = await fetch("/api/auth/lookup-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            })

            const data = await res.json()

            if (data.status === 'setup_required') {
                setStep("setup")
            } else {
                setStep("password")
            }
        } catch (err) {
            // Fallback to password step on error to avoid leaking info or blocking
            setStep("password")
        } finally {
            setIsLoading(false)
        }
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const { createClient } = await import("@/utils/supabase/client")
            const supabase = createClient()

            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            })

            if (authError) {
                setError(authError.message === "Invalid login credentials" ? "Invalid credentials" : authError.message)
            } else if (data.session) {
                router.push("/dashboard")
            }
        } catch (err) {
            setError("An error occurred. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSetup = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const res = await fetch("/api/auth/complete-setup-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code: accessCode, password })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Setup failed")
            }

            // Auto login after setup? Or just redirect to login with password field
            // Let's auto login if possible. But we don't have session.
            // Client needs to sign in now.

            const { createClient } = await import("@/utils/supabase/client")
            const supabase = createClient()

            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (signInError) throw signInError

            if (signInError) throw signInError

            setMessage("Setup complete! Redirecting to dashboard...")

            // Use hard redirect to ensure session cookies are picked up cleanly
            window.location.href = "/dashboard"

        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    const [cooldown, setCooldown] = useState(0)
    const [isSendingCode, setIsSendingCode] = useState(false)

    const sendingRef = useRef(false)

    // Effect to send code when entering setup step
    useEffect(() => {
        if (step === 'setup' && !accessCode && !sendingRef.current) {
            sendAccessCode()
        }
    }, [step])

    const sendAccessCode = async () => {
        if (cooldown > 0 || sendingRef.current) return

        sendingRef.current = true
        setIsSendingCode(true)
        setError("")
        setMessage("")

        try {
            const res = await fetch("/api/auth/send-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to send code")
            }

            setMessage("Access code sent to your email.")
            setCooldown(60) // 60s cooldown for resend

        } catch (err: any) {
            setError(err.message)
            sendingRef.current = false // Allow retry on error
        } finally {
            setIsSendingCode(false)
            // Note: We keep sendingRef.current = true on success to prevent auto-resend on re-renders
        }
    }

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setInterval(() => setCooldown(c => c - 1), 1000)
            return () => clearInterval(timer)
        }
    }, [cooldown])

    const handleResetPassword = async () => {
        if (cooldown > 0) return
        // Manually trigger setup flow (effectively a password reset)
        setStep("setup")
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#080808] text-white font-sans selection:bg-white/20">
            <div className="w-full max-w-[340px] px-6">

                <div className="mb-10 text-center">
                    <div className="w-10 h-10 bg-white rounded-xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-white/10">
                        <div className="w-4 h-4 bg-black rounded-sm" />
                    </div>
                    <h1 className="text-xl font-medium tracking-tight text-white mb-2">
                        {step === 'setup' ? 'Setup Account' : 'Sign in to Syntra'}
                    </h1>
                    <p className="text-[13px] text-white/40">
                        {step === 'setup' ? 'Check your email for the code.' : 'Welcome back to the workspace.'}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {step === "email" ? (
                        <motion.form
                            key="email-form"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            onSubmit={handleEmailSubmit}
                            className="space-y-4"
                        >
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-medium text-white/40 uppercase tracking-wider ml-1">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    className="w-full h-10 px-3 bg-[#111] border border-white/10 rounded-md text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all"
                                    autoFocus
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!email || isLoading}
                                className="w-full h-10 bg-white text-black text-[13px] font-medium rounded-md hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <>Continue <ArrowRight className="w-3.5 h-3.5" /></>}
                            </button>
                        </motion.form>
                    ) : step === "setup" ? (
                        <motion.form
                            key="setup-form"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            onSubmit={handleSetup}
                            className="space-y-4"
                        >
                            <div className="flex items-center gap-3 mb-2 p-2 rounded-lg bg-white/5 border border-white/5">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500/20 to-blue-500/0 flex items-center justify-center border border-blue-500/20 text-[10px] text-blue-500 font-bold">
                                    {email.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[12px] font-medium text-white truncate">{email}</div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setStep("email"); setError(""); }}
                                    className="text-[10px] text-white/40 hover:text-white transition-colors"
                                >
                                    Change
                                </button>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-[11px] font-medium text-white/40 uppercase tracking-wider">Access Code</label>
                                    {isSendingCode && <span className="text-[10px] text-white/40 animate-pulse">Sending...</span>}
                                </div>
                                <input
                                    type="text"
                                    value={accessCode}
                                    onChange={(e) => setAccessCode(e.target.value)}
                                    placeholder={isSendingCode ? "Waiting for code..." : "6-digit code"}
                                    className="w-full h-10 px-3 bg-[#111] border border-white/10 rounded-md text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all"
                                    autoFocus
                                    required
                                    disabled={isSendingCode}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-medium text-white/40 uppercase tracking-wider ml-1">New Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Choose a password"
                                    className="w-full h-10 px-3 bg-[#111] border border-white/10 rounded-md text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all"
                                    required
                                    minLength={6}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !accessCode || !password}
                                className="w-full h-10 bg-white text-black text-[13px] font-medium rounded-md hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Complete Setup & Sign In"}
                            </button>

                            <div className="pt-2 text-center">
                                <button
                                    type="button"
                                    onClick={sendAccessCode}
                                    disabled={cooldown > 0 || isSendingCode}
                                    className="text-[11px] text-white/30 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {cooldown > 0 ? `Resend available in ${cooldown}s` : "Resend Code"}
                                </button>
                            </div>
                        </motion.form>
                    ) : (
                        <motion.form
                            key="password-form"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            onSubmit={handleLogin}
                            className="space-y-4"
                        >
                            <div className="flex items-center gap-3 mb-2 p-2 rounded-lg bg-white/5 border border-white/5">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-500/20 to-emerald-500/0 flex items-center justify-center border border-emerald-500/20 text-[10px] text-emerald-500 font-bold">
                                    {email.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[12px] font-medium text-white truncate">{email}</div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep("email")
                                        setPassword("")
                                        setError("")
                                        setMessage("")
                                    }}
                                    className="text-[10px] text-white/40 hover:text-white transition-colors"
                                >
                                    Change
                                </button>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-[11px] font-medium text-white/40 uppercase tracking-wider">Password</label>
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password..."
                                    className="w-full h-10 px-3 bg-[#111] border border-white/10 rounded-md text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all"
                                    autoFocus
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !password}
                                className="w-full h-10 bg-white text-black text-[13px] font-medium rounded-md hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Sign in"}
                            </button>

                            <div className="pt-4 text-center">
                                <button
                                    type="button"
                                    onClick={handleResetPassword}
                                    disabled={cooldown > 0}
                                    className="text-[11px] text-white/30 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {cooldown > 0
                                        ? `Resend available in ${cooldown}s`
                                        : "First time here? Set up password"}
                                </button>
                            </div>
                        </motion.form>
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

                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-3"
                    >
                        <AlertCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-[12px] text-emerald-400 leading-relaxed">{message}</span>
                    </motion.div>
                )}

                <div className="mt-12 flex items-center justify-center gap-4">
                    <a href="#" className="text-[11px] text-white/20 hover:text-white/40 transition-colors">Privacy</a>
                    <a href="#" className="text-[11px] text-white/20 hover:text-white/40 transition-colors">Terms</a>
                    <a href="#" className="text-[11px] text-white/20 hover:text-white/40 transition-colors">Contact</a>
                </div>
            </div>
        </div>
    )
}
