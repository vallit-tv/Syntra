"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
    LayoutGrid,
    Users,
    Settings,
    LogOut,
    ChevronDown,
    Search,
    Bell,
    PanelLeftClose,
    PanelLeftOpen,
    Plus,
    Command,
    HelpCircle,
    Inbox
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

    const handleLogout = async () => {
        try {
            const { supabase } = await import("@/lib/supabase")
            await supabase.auth.signOut()
            router.push("/login")
        } catch (error) {
            console.error("Logout failed", error)
        }
    }

    // Linear-style navigation groups
    const navGroups = [
        {
            label: "", // Top section
            items: [
                { name: "Inbox", href: "/dashboard/inbox", icon: Inbox, count: 2 },
                { name: "My Issues", href: "/dashboard/my-issues", icon: LayoutGrid },
            ]
        },
        {
            label: "Workspace",
            items: [
                { name: "Overview", href: "/dashboard", icon: LayoutGrid },
                { name: "Admin Console", href: "/dashboard/admin", icon: Users },
                { name: "Settings", href: "/dashboard/settings", icon: Settings },
            ]
        }
    ]

    return (
        <div className="flex h-screen w-full bg-[#080808] text-[#e5e5e5] font-sans overflow-hidden antialiased selection:bg-white/20">

            {/* Sidebar */}
            <aside
                className={cn(
                    "flex flex-col border-r border-[#1F1F1F] bg-[#0C0C0C]/50 backdrop-blur-xl transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] z-30 shrink-0",
                    isSidebarCollapsed ? "w-[60px]" : "w-[260px]"
                )}
            >
                {/* Workspace Switcher / Header */}
                <div className="h-14 px-4 flex items-center shrink-0">
                    <button
                        className={cn(
                            "flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors w-full text-left group",
                            isSidebarCollapsed && "justify-center px-0"
                        )}
                    >
                        <div className="w-5 h-5 rounded-[4px] bg-gradient-to-br from-indigo-500 to-violet-600 shadow-inner flex items-center justify-center shrink-0 text-[10px] font-bold text-white relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            V
                        </div>
                        {!isSidebarCollapsed && (
                            <>
                                <span className="font-medium text-[13px] text-white/90 truncate flex-1">Vallit Network</span>
                                <ChevronDown className="w-3.5 h-3.5 text-white/40" />
                            </>
                        )}
                    </button>
                </div>

                {/* Action Button (Compose/New) */}
                <div className="px-4 mb-2 shrink-0">
                    <button
                        className={cn(
                            "flex items-center gap-2 border border-[#2A2A2A] bg-[#121212] hover:bg-[#1A1A1A] hover:border-[#333] text-white/90 rounded-md transition-all shadow-sm",
                            isSidebarCollapsed ? "w-8 h-8 justify-center rounded-lg" : "w-full px-3 py-1.5"
                        )}
                    >
                        <Plus className="w-4 h-4 shrink-0" />
                        {!isSidebarCollapsed && (
                            <span className="text-[13px] font-medium pr-1">New Issue</span>
                        )}
                        {!isSidebarCollapsed && (
                            <span className="ml-auto text-[10px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">C</span>
                        )}
                    </button>
                </div>

                {/* Search (Sidebar version) */}
                {!isSidebarCollapsed && (
                    <div className="px-4 mb-4 shrink-0">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] text-white/40 hover:text-white/60 hover:bg-white/5 cursor-text transition-colors">
                            <Search className="w-3.5 h-3.5" />
                            <span>Search...</span>
                            <span className="ml-auto flex items-center gap-0.5 text-[10px]">
                                <Command className="w-3 h-3" /> K
                            </span>
                        </div>
                    </div>
                )}

                {/* Navigation Items */}
                <div className="flex-1 overflow-y-auto px-2 py-2 space-y-6 scrollbar-none">
                    {navGroups.map((group, idx) => (
                        <div key={idx} className="space-y-0.5">
                            {group.label && !isSidebarCollapsed && (
                                <div className="px-3 pb-2 pt-1">
                                    <h3 className="text-[11px] font-medium text-white/40 uppercase tracking-wider">{group.label}</h3>
                                </div>
                            )}
                            {group.items.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-2.5 px-3 py-1.5 rounded-[6px] text-[13px] transition-all group relative",
                                            isActive
                                                ? "bg-white/[0.08] text-white font-medium"
                                                : "text-white/60 hover:bg-white/5 hover:text-white/90"
                                        )}
                                        title={isSidebarCollapsed ? item.name : undefined}
                                    >
                                        <item.icon className={cn(
                                            "w-4 h-4 shrink-0 transition-colors",
                                            isActive ? "text-white" : "text-white/40 group-hover:text-white/60"
                                        )} />
                                        {!isSidebarCollapsed && (
                                            <span className="truncate flex-1">{item.name}</span>
                                        )}
                                        {!isSidebarCollapsed && item.count && (
                                            <span className="text-[10px] font-medium min-w-[16px] h-4 flex items-center justify-center rounded-sm bg-white/10 text-white/60 px-1">
                                                {item.count}
                                            </span>
                                        )}
                                    </Link>
                                )
                            })}
                        </div>
                    ))}
                </div>

                {/* Sidebar Footer */}
                <div className="p-2 border-t border-[#1F1F1F] shrink-0 space-y-0.5">
                    <button
                        onClick={() => { }} // Open Help
                        className={cn(
                            "flex items-center gap-2.5 px-3 py-1.5 rounded-[6px] text-[13px] text-white/40 hover:text-white hover:bg-white/5 transition-all w-full text-left",
                            isSidebarCollapsed && "justify-center px-0"
                        )}
                    >
                        <HelpCircle className="w-4 h-4 shrink-0" />
                        {!isSidebarCollapsed && <span>Help & Support</span>}
                    </button>

                    <button
                        onClick={handleLogout}
                        className={cn(
                            "flex items-center gap-2.5 px-3 py-1.5 rounded-[6px] text-[13px] text-white/40 hover:text-white hover:bg-white/5 transition-all w-full text-left",
                            isSidebarCollapsed && "justify-center px-0"
                        )}
                    >
                        <LogOut className="w-4 h-4 shrink-0" />
                        {!isSidebarCollapsed && <span>Log out</span>}
                    </button>

                    <div className={cn("pt-1 flex", isSidebarCollapsed ? "justify-center" : "justify-end px-2")}>
                        <button
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className="flex items-center justify-center w-6 h-6 rounded hover:bg-white/5 text-white/20 hover:text-white transition-colors"
                        >
                            {isSidebarCollapsed ? <PanelLeftOpen className="w-3.5 h-3.5" /> : <PanelLeftClose className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#080808] relative">

                {/* Subtle top subtle gradient/glow */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#111111] to-transparent pointer-events-none" />

                <div className="flex-1 overflow-auto p-0 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {/* Content padding wrapper */}
                    <div className="min-h-full">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    )
}
