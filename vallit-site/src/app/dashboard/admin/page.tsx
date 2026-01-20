"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Loader2, Search, Filter, MoreHorizontal, Shield, User, Building } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AdminDashboard() {
    const [users, setUsers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [filterRole, setFilterRole] = useState<string | null>(null)

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { createClient } = await import("@/utils/supabase/client")
                const supabase = createClient()
                const { data: { session } } = await supabase.auth.getSession()

                if (!session) {
                    console.error("No session found")
                    return
                }

                const res = await fetch("/api/admin/users", {
                    headers: {
                        "Authorization": `Bearer ${session.access_token}`
                    }
                })

                if (res.ok) {
                    const data = await res.json()
                    setUsers(data)
                } else {
                    console.error("Failed to fetch users")
                }
            } catch (err) {
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchUsers()
    }, [])

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesRole = filterRole ? user.role === filterRole : true
        return matchesSearch && matchesRole
    })

    return (
        <div className="p-8 pt-12 max-w-[1200px] mx-auto space-y-8">

            {/* Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-xl font-semibold text-white tracking-tight">Company Administration</h1>
                <p className="text-[13px] text-white/40">Manage users, roles, and company access across the platform.</p>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1 max-w-sm">
                    <div className="relative w-full">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-9 pl-9 pr-3 bg-[#111] border border-white/10 rounded-md text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-[#111] border border-white/10 rounded-md p-0.5">
                        <button
                            onClick={() => setFilterRole(null)}
                            className={cn(
                                "px-3 py-1 text-[12px] font-medium rounded-sm transition-colors",
                                !filterRole ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
                            )}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilterRole('admin')}
                            className={cn(
                                "px-3 py-1 text-[12px] font-medium rounded-sm transition-colors",
                                filterRole === 'admin' ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
                            )}
                        >
                            Admins
                        </button>
                        <button
                            onClick={() => setFilterRole('worker')}
                            className={cn(
                                "px-3 py-1 text-[12px] font-medium rounded-sm transition-colors",
                                filterRole === 'worker' ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
                            )}
                        >
                            Workers
                        </button>
                    </div>

                    <button className="h-9 px-3 bg-white text-black text-[13px] font-medium rounded-md hover:bg-white/90 transition-colors flex items-center gap-2">
                        <User className="w-3.5 h-3.5" />
                        Invite User
                    </button>
                </div>
            </div>

            {/* Dense Table */}
            <div className="rounded-lg border border-[#1f1f1f] bg-[#0C0C0C] overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-[#1f1f1f] bg-[#111]/30">
                            <th className="px-5 py-2.5 font-medium text-white/30 text-[11px] uppercase tracking-wider w-[40px] text-center"></th>
                            <th className="px-5 py-2.5 font-medium text-white/30 text-[11px] uppercase tracking-wider">User</th>
                            <th className="px-5 py-2.5 font-medium text-white/30 text-[11px] uppercase tracking-wider">Role</th>
                            <th className="px-5 py-2.5 font-medium text-white/30 text-[11px] uppercase tracking-wider">Company Attributes</th>
                            <th className="px-5 py-2.5 font-medium text-white/30 text-[11px] uppercase tracking-wider text-right">Last Active</th>
                            <th className="px-5 py-2.5 font-medium text-white/30 text-[11px] uppercase tracking-wider w-[50px]"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1f1f1f]">
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-white/20">
                                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 opacity-50" />
                                    <span className="text-xs">Syncing data...</span>
                                </td>
                            </tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-white/20">
                                    <span className="text-xs">No users match your filters.</span>
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors cursor-default">
                                    <td className="px-5 py-3 text-center">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500/20 border border-emerald-500/50 mx-auto" title="Active" />
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-7 h-7 rounded-full bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/60">
                                                {user.name?.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="text-[13px] font-medium text-white/90">{user.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border",
                                            user.role === 'admin'
                                                ? "bg-purple-400/10 text-purple-400 border-purple-400/20"
                                                : "bg-white/5 text-white/40 border-white/5"
                                        )}>
                                            {user.role === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        {user.company_name ? (
                                            <div className="flex items-center gap-2 text-[12px] text-white/70">
                                                <Building className="w-3.5 h-3.5 text-white/30" />
                                                {user.company_name}
                                            </div>
                                        ) : (
                                            <span className="text-[12px] text-white/20 italic">Unassigned</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <span className="text-[12px] text-white/30 font-mono">
                                            {new Date(user.created_at || Date.now()).toLocaleDateString()}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <button className="text-white/20 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="text-[11px] text-white/20 text-center">
                Showing {filteredUsers.length} users in workspace.
            </div>

        </div>
    )
}
