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
        fetch("/api/users/me")
            .then(res => res.json())
            .then(data => setUser(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
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
                        Everything is operating normally
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-white/20 font-mono">v2.4.0</span>
                </div>
            </div>

            {/* Main Grid: Projects & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Col: Projects / Issues */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-[#111111] border border-white/5 rounded-lg p-4 hover:border-white/10 transition-colors group cursor-pointer">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-1.5 rounded bg-blue-500/10 text-blue-400">
                                    <Circle className="w-4 h-4" />
                                </div>
                                <span className="text-[13px] text-white/40 font-medium">Open Issues</span>
                            </div>
                            <div className="text-2xl font-semibold text-white/90">12</div>
                        </div>
                        <div className="bg-[#111111] border border-white/5 rounded-lg p-4 hover:border-white/10 transition-colors group cursor-pointer">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-1.5 rounded bg-orange-500/10 text-orange-400">
                                    <Clock className="w-4 h-4" />
                                </div>
                                <span className="text-[13px] text-white/40 font-medium">In Progress</span>
                            </div>
                            <div className="text-2xl font-semibold text-white/90">5</div>
                        </div>
                        <div className="bg-[#111111] border border-white/5 rounded-lg p-4 hover:border-white/10 transition-colors group cursor-pointer">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-1.5 rounded bg-purple-500/10 text-purple-400">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                                <span className="text-[13px] text-white/40 font-medium">Completed</span>
                            </div>
                            <div className="text-2xl font-semibold text-white/90">84</div>
                        </div>
                    </div>

                    {/* Projects List */}
                    <div className="bg-[#0C0C0C] border border-[#1f1f1f] rounded-xl overflow-hidden shadow-sm">
                        <div className="px-5 py-3 border-b border-[#1f1f1f] flex items-center justify-between bg-[#111111]/50">
                            <h3 className="text-[13px] font-medium text-white/70">Active Projects</h3>
                            <div className="flex gap-2">
                                <button className="p-1 hover:bg-white/5 rounded text-white/40 hover:text-white transition-colors">
                                    <Filter className="w-3.5 h-3.5" />
                                </button>
                                <button className="p-1 hover:bg-white/5 rounded text-white/40 hover:text-white transition-colors">
                                    <Plus className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                        <div className="divide-y divide-[#1f1f1f]">
                            {projects.map((project, i) => (
                                <div key={i} className="px-5 py-3.5 flex items-center justify-between hover:bg-white/[0.02] group transition-colors cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded bg-gradient-to-tr from-white/10 to-transparent border border-white/5 flex items-center justify-center text-[10px] font-bold text-white/40">
                                            {project.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-[13px] font-medium text-white/80 group-hover:text-white transition-colors">{project.name}</div>
                                            <div className="text-[11px] text-white/30 flex items-center gap-2">
                                                <span>Variable Inc.</span>
                                                <span className="w-0.5 h-0.5 rounded-full bg-white/20" />
                                                <span>{project.updated}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-white/20 rounded-full" style={{ width: `${project.progress}%` }} />
                                        </div>
                                        <div className={`text-[11px] px-2 py-0.5 rounded border ${project.status === 'In Progress' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                                project.status === 'Done' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                    'bg-white/5 text-white/40 border-white/5'
                                            }`}>
                                            {project.status}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Right Col: Activity Feed */}
                <div className="space-y-6">
                    <div className="bg-[#0C0C0C] border border-[#1f1f1f] rounded-xl overflow-hidden h-full flex flex-col">
                        <div className="px-5 py-3 border-b border-[#1f1f1f] bg-[#111111]/50">
                            <h3 className="text-[13px] font-medium text-white/70">Activity</h3>
                        </div>
                        <div className="p-4 space-y-4 flex-1">
                            {recentActivity.map((act, i) => (
                                <div key={i} className="flex gap-3 relative">
                                    {i < recentActivity.length - 1 && (
                                        <div className="absolute top-8 left-3.5 bottom-[-16px] w-[1px] bg-white/5" />
                                    )}
                                    <div className="w-7 h-7 rounded-full bg-[#1A1A1A] border border-white/5 flex items-center justify-center shrink-0 z-10">
                                        <Activity className="w-3 h-3 text-white/40" />
                                    </div>
                                    <div className="pt-0.5 pb-2">
                                        <p className="text-[12px] text-white/80 leading-relaxed">
                                            <span className="font-medium text-white">{act.user}</span> <span className="text-white/40">{act.action}</span> <span className="text-white/60">{act.target}</span>
                                        </p>
                                        <p className="text-[10px] text-white/20 mt-0.5">{act.time}</p>
                                    </div>
                                </div>
                            ))}

                            <div className="pt-4 mt-auto">
                                <button className="w-full py-2 text-[11px] font-medium text-white/30 hover:text-white/60 hover:bg-white/5 rounded transition-colors text-center border border-dashed border-white/5">
                                    View all activity
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
