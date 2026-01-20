"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
    CheckCircle2,
    Circle,
    Clock,
    Filter,
    LayoutGrid,
    MoreHorizontal,
    Plus,
    Activity
} from "lucide-react"

export default function DashboardOverview() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { createClient } = await import("@/utils/supabase/client")
                const supabase = createClient()
                const { data: { session } } = await supabase.auth.getSession()

                if (!session) {
                    console.error("No session found")
                    return
                }

                const res = await fetch("/api/users/me", {
                    headers: {
                        "Authorization": `Bearer ${session.access_token}`
                    }
                })
                const data = await res.json()
                setUser(data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // Mock data for "Linear"-like widgets until we hook up real issue tracking
    // Since User asked for "company profiles", we'll list companies here if admin, 
    // or "My Projects" if user.
    const projects = [
        { name: "Website Redesign", status: "In Progress", progress: 65, updated: "2h ago" },
        { name: "Q1 Marketing Campaign", status: "Backlog", progress: 0, updated: "1d ago" },
        { name: "Mobile App Beta", status: "Done", progress: 100, updated: "3d ago" },
    ]

    const recentActivity = [
        { user: "Vyrez", action: "created new project", target: "Internal Tools", time: "12m ago" },
        { user: "Theo", action: "commented on", target: "API Integration", time: "1h ago" },
        { user: "System", action: "deployed", target: "Production", time: "2h ago" },
    ]

    if (loading) {
        return (
            <div className="p-8 pt-12 animate-pulse">
                <div className="h-8 w-48 bg-white/5 rounded mb-8" />
                <div className="h-64 w-full bg-white/5 rounded-xl border border-white/5" />
            </div>
        )
    }

    return (
        <div className="p-8 pt-12 max-w-[1200px] mx-auto space-y-10">

            {/* Header Section */}
            <div className="flex items-end justify-between border-b border-white/5 pb-5">
                <div>
                    <h1 className="text-2xl font-semibold text-white tracking-tight mb-1">
                        {user ? `Good afternoon, ${user.name}` : 'Welcome back'}
                    </h1>
                    <p className="text-[13px] text-white/40 font-medium flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                        System is operational
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-white/20 font-mono">v2.5.0</span>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Getting Started / Company Info */}
                <div className="bg-[#111] border border-white/5 rounded-xl p-6">
                    <h2 className="text-lg font-medium text-white mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <a href="/dashboard/settings" className="block p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group">
                            <div className="mb-3 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                <LayoutGrid className="w-4 h-4" />
                            </div>
                            <h3 className="text-sm font-medium text-white mb-1">Manage Workspace</h3>
                            <p className="text-xs text-white/40">Configure company settings and members.</p>
                        </a>

                        <a href="/dashboard/chat-preview" className="block p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group">
                            <div className="mb-3 w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                <Clock className="w-4 h-4" />
                            </div>
                            <h3 className="text-sm font-medium text-white mb-1">Test Chatbot</h3>
                            <p className="text-xs text-white/40">Preview your assistant in real-time.</p>
                        </a>
                    </div>
                </div>

                {/* Status / Overview (Simplified) */}
                <div className="bg-[#111] border border-white/5 rounded-xl p-6 flex flex-col justify-between">
                    <div>
                        <h2 className="text-lg font-medium text-white mb-2">Platform Status</h2>
                        <p className="text-sm text-white/40">Your instance is running smoothly.</p>
                    </div>

                    <div className="mt-8 space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-[#080808] border border-white/5">
                            <span className="text-sm text-white/60">Database</span>
                            <span className="text-xs text-emerald-400 font-medium px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">Connected</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-[#080808] border border-white/5">
                            <span className="text-sm text-white/60">AI Engine</span>
                            <span className="text-xs text-emerald-400 font-medium px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">Operational</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
