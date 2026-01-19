"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

export default function LoginPage() {
    const router = useRouter()
    const [step, setStep] = useState<"name" | "password" | "setup">("name")
    const [name, setName] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const handleNameSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            // Temporary: we need a way to check strictly if user exists without login
            // For now, we will try to login. API needs 'password' usually, but let's see if we can check existence first.
            // Actually, my backend update for api_login checks status first!
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            })

            const data = await res.json()

            if (res.status === 200) {
                if (data.status === "setup_required") {
                    setStep("setup") // Or handle password setup flow? User request: "just able to login when I created the name before"
                    // Wait, if "created the name before", it means user exists.
                    // If setup_required, it means they exist but no password.
                    // But if they just created the name, maybe they don't have a password yet.
                    // Let's assume for now regular users have passwords.
                    setError("Account setup required. Please contact admin.")
                } else if (data.status === "success") {
                    // This path shouldn't happen without password if password is required.
                    // But if previously logged in?
                    router.push("/dashboard")
                }
            } else if (res.status === 400 && data.error === "Password required") {
                setStep("password")
            } else if (res.status === 401) {
                setError("User not found or invalid access.")
            } else {
                setError(data.error || "Something went wrong")
            }
        } catch (err) {
            setError("Failed to connect to server")
        } finally {
            setIsLoading(false)
        }
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, password }),
            })

            const data = await res.json()

            if (res.ok && data.status === "success") {
                router.push("/dashboard")
            } else {
                setError(data.error || "Login failed")
            }
        } catch (err) {
            setError("An error occurred. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0d0d0d] text-[#e5e5e5] font-sans selection:bg-white/20">

            <div className="w-full max-w-[360px] px-6">

                {/* Logo or Brand */}
                <div className="mb-12 text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-white/10 to-transparent border border-white/5 mb-6">
                        <div className="w-4 h-4 bg-white rounded-sm shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                    </div>
                    <h1 className="text-xl font-medium tracking-tight text-white mb-2">Welcome back</h1>
                    <p className="text-sm text-white/40">Enter your credentials to access the workspace.</p>
                </div>

                <div className="relative">
                    <AnimatePresence mode="wait">
                        {step === "name" && (
                            <motion.form
                                key="name-form"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleNameSubmit}
                                className="space-y-4"
                            >
                                <div className="space-y-1.5">
                                    <label htmlFor="name" className="text-[11px] uppercase tracking-wider text-white/40 font-medium ml-1">Username</label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        autoFocus
                                        className="w-full h-11 px-4 bg-[#141414] border border-white/5 rounded-lg focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all text-sm placeholder:text-white/20 hover:border-white/10"
                                        placeholder="Enter your username"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading || !name}
                                    className={cn(
                                        "w-full h-11 flex items-center justify-center gap-2 bg-white text-black rounded-lg font-medium text-sm transition-all hover:bg-white/90 focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-[#0d0d0d]",
                                        (isLoading || !name) && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue <ArrowRight className="w-4 h-4" /></>}
                                </button>
                            </motion.form>
                        )}

                        {step === "password" && (
                            <motion.form
                                key="password-form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleLogin}
                                className="space-y-4"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <button
                                        type="button"
                                        onClick={() => setStep("name")}
                                        className="text-xs text-white/40 hover:text-white transition-colors flex items-center gap-1"
                                    >
                                        ← {name}
                                    </button>
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="password" className="text-[11px] uppercase tracking-wider text-white/40 font-medium ml-1">Password</label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoFocus
                                        className="w-full h-11 px-4 bg-[#141414] border border-white/5 rounded-lg focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all text-sm placeholder:text-white/20 hover:border-white/10"
                                        placeholder="Enter your password"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading || !password}
                                    className={cn(
                                        "w-full h-11 flex items-center justify-center gap-2 bg-white text-black rounded-lg font-medium text-sm transition-all hover:bg-white/90 focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-[#0d0d0d]",
                                        (isLoading || !password) && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center"
                        >
                            {error}
                        </motion.div>
                    )}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-xs text-white/20">
                        Protected by <span className="text-white/40">Vallit Security</span>
                    </p>
                </div>

            </div>
        </div>
    )
}
