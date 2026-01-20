"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
    role: 'user' | 'assistant'
    content: string
}

export default function ChatPreviewPage() {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [initLoading, setInitLoading] = useState(true)
    const [company, setCompany] = useState<any>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        fetchCompany()
    }, [])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const fetchCompany = async () => {
        try {
            const { createClient } = await import("@/utils/supabase/client")
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()

            if (session) {
                const res = await fetch("/api/company/me", {
                    headers: { "Authorization": `Bearer ${session.access_token}` }
                })
                const data = await res.json()
                if (data.company) {
                    setCompany(data.company)
                    // Set initial welcome message
                    const welcome = data.company.widget_settings?.welcome_message || "Hello! How can I help you today?"
                    setMessages([{ role: 'assistant', content: welcome }])
                }
            }
        } finally {
            setInitLoading(false)
        }
    }

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!input.trim() || loading || !company) return

        const userMsg = input.trim()
        setInput("")
        setMessages(prev => [...prev, { role: 'user', content: userMsg }])
        setLoading(true)

        try {
            // Need session ID for history
            const sessionId = localStorage.getItem('preview_session_id') || `preview_${Math.random().toString(36).substr(2, 9)}`
            localStorage.setItem('preview_session_id', sessionId)

            const { createClient } = await import("@/utils/supabase/client")
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()

            // Call API
            // Note: In real app we might use a dedicated preview endpoint or just the public widget API
            // For preview, we'll use the widget API but pass the company_id explicitly
            // Actually widget API expects public access usually, but here we are authed.
            // Let's use the standard widget endpoint.

            const res = await fetch("/api/chat/message", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMsg,
                    company_id: company.id,
                    session_key: sessionId,
                    widget_id: 'preview'
                })
            })

            const data = await res.json()

            if (data.error) {
                throw new Error(data.error)
            }

            setMessages(prev => [...prev, { role: 'assistant', content: data.response }])

        } catch (error) {
            console.error(error)
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please check your configuration." }])
        } finally {
            setLoading(false)
        }
    }

    if (initLoading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-white/20" /></div>
    if (!company) return <div className="p-8 text-white/40">Please create a company first.</div>

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col max-w-4xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-white tracking-tight">Chat Preview</h1>
                    <p className="text-white/40 text-sm mt-1">Test your bot configuration in real-time.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-medium">
                    <Sparkles className="w-3 h-3" />
                    <span>Using {company.widget_settings?.model || 'gpt-4o'}</span>
                </div>
            </div>

            <div className="flex-1 bg-[#0E0E0E] border border-white/5 rounded-2xl overflow-hidden flex flex-col shadow-2xl relative">
                {/* Header Mockup */}
                <div className="h-14 border-b border-white/5 bg-[#111] flex items-center px-4 justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-white">{company.widget_settings?.bot_name || "Kian"}</div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[10px] text-white/40">Online</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {messages.map((msg, i) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={i}
                            className={cn(
                                "flex gap-3 max-w-[80%]",
                                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                            )}
                        >
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-white/5",
                                msg.role === 'user' ? "bg-white/10" : "bg-indigo-500/20"
                            )}>
                                {msg.role === 'user' ? <User className="w-4 h-4 text-white/60" /> : <Bot className="w-4 h-4 text-indigo-400" />}
                            </div>

                            <div className={cn(
                                "p-3 rounded-2xl text-sm leading-relaxed",
                                msg.role === 'user'
                                    ? "bg-white text-black rounded-tr-none"
                                    : "bg-[#1A1A1A] text-white/90 border border-white/5 rounded-tl-none"
                            )}>
                                {msg.content}
                            </div>
                        </motion.div>
                    ))}
                    {loading && (
                        <div className="flex gap-3 max-w-[80%]">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-white/5">
                                <Bot className="w-4 h-4 text-indigo-400" />
                            </div>
                            <div className="bg-[#1A1A1A] border border-white/5 px-4 py-3 rounded-2xl rounded-tl-none">
                                <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-[#111] border-t border-white/5">
                    <form onSubmit={handleSend} className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message..."
                            className="w-full bg-[#080808] border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-white/20"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || loading}
                            className="absolute right-2 top-2 p-1.5 bg-white text-black rounded-lg hover:bg-white/90 transition-colors disabled:opacity-0 disabled:pointer-events-none"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
