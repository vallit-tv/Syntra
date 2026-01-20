"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
    Inbox,
    Building2,
    UserCircle,
    CheckCircle2,
    Menu
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
    const [userEmail, setUserEmail] = useState<string | null>(null)

    const [companyName, setCompanyName] = useState<string | null>(null)

    useEffect(() => {
        // Fetch user email and company
        const getUserAndCompany = async () => {
            const { createClient } = await import("@/utils/supabase/client")
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()

            if (session?.user?.email) setUserEmail(session.user.email)

            if (session) {
                try {
                    const res = await fetch("/api/company/me", {
                        headers: { "Authorization": `Bearer ${session.access_token}` }
                    })
                    const data = await res.json()
                    if (data.company) {
                        setCompanyName(data.company.name)
                    } else if (pathname !== '/dashboard/company/create') {
                        // Redirect to create company if none exists
                        window.location.href = '/dashboard/company/create'
                    }
                } catch (e) {
                    console.error("Failed to fetch company", e)
                }
            }
        }
        getUserAndCompany()
    }, [pathname])

    const handleLogout = async () => {
        try {
            await fetch("/auth/signout", { method: "POST" })
            window.location.href = "/login"
        } catch (error) {
            console.error("Logout failed", error)
            window.location.href = "/login"
        }
    }

    const navGroups = [
        {
            label: "Workspace",
            items: [
                { name: "Inbox", href: "/dashboard/inbox", icon: Inbox, count: 2 },
                { name: "My Issues", href: "/dashboard", icon: CheckCircle2 },
                { name: "Views", href: "/dashboard/views", icon: LayoutGrid },
            ]
        },
        {
            label: "Admin",
            items: [
                { name: "Organization", href: "/dashboard/admin/org", icon: Building2 },
                { name: "Members", href: "/dashboard/admin", icon: Users },
                { name: "Settings", href: "/dashboard/settings", icon: Settings },
            ]
        }
    ]

    return (
        <div className="flex h-screen w-full bg-[#080808] text-[#e5e5e5] font-sans overflow-hidden antialiased">

            {/* Sidebar */}
            <aside
                className={cn(
                    "flex flex-col border-r border-white/[0.08] bg-[#0E0E0E] transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] z-30 shrink-0 select-none",
                    isSidebarCollapsed ? "w-[56px]" : "w-[240px]"
                )}
            >
                {/* Header (Company) */}
                <div className="h-12 flex items-center px-3 border-b border-white/[0.04]">
                    <Link href={companyName ? "/dashboard" : "/dashboard/company/create"} className={cn(
                        "flex items-center gap-2 hover:bg-white/[0.04] p-1.5 rounded-md transition-colors w-full text-left",
                        isSidebarCollapsed && "justify-center p-0 hover:bg-transparent"
                    )}>
                        <div className="w-5 h-5 rounded-sm bg-emerald-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm">
                            {companyName ? companyName.charAt(0) : <Plus className="w-3 h-3" />}
                        </div>
                        {!isSidebarCollapsed && (
                            <>
                                <span className="font-medium text-[13px] text-white/90 truncate flex-1 tracking-tight">
                                    {companyName || "Create Company"}
                                </span>
                                <ChevronDown className="w-3.5 h-3.5 text-white/40" />
                            </>
                        )}
                    </Link>
                </div>

                {/* Quick Actions */}
                <div className="p-3 pb-2 space-y-1">
                    {!isSidebarCollapsed && (
                        <button className="flex items-center gap-2 w-full px-2 py-1.5 bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.06] rounded-md text-[13px] text-white/90 transition-all shadow-sm group">
                            <Plus className="w-4 h-4 text-white/60 group-hover:text-white" />
                            <span className="font-medium">New Issue</span>
                            <span className="ml-auto text-[10px] text-white/30 bg-black/20 px-1.5 rounded-sm border border-white/5">C</span>
                        </button>
                    )}
                    <button className={cn(
                        "flex items-center gap-2 w-full px-2 py-1.5 hover:bg-white/[0.04] rounded-md text-[13px] text-white/60 transition-colors group",
                        isSidebarCollapsed && "justify-center px-0"
                    )}>
                        <Search className="w-4 h-4 text-white/40 group-hover:text-white/60" />
                        {!isSidebarCollapsed && (
                            <>
                                <span className="text-white/40">Search</span>
                                <span className="ml-auto flex items-center gap-0.5 text-[10px] text-white/20">
                                    <Command className="w-3 h-3" />K
                                </span>
                            </>
                        )}
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto px-2 space-y-6 pt-2">
                    {navGroups.map((group, idx) => (
                        <div key={idx} className="space-y-0.5">
                            {!isSidebarCollapsed && group.label && (
                                <div className="px-2 py-1.5">
                                    <h3 className="text-[11px] font-medium text-white/30 uppercase tracking-wider">{group.label}</h3>
                                </div>
                            )}
                            {group.items.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[13px] transition-colors relative group",
                                            isActive
                                                ? "bg-white/[0.08] text-white font-medium"
                                                : "text-white/60 hover:bg-white/[0.04] hover:text-white/80"
                                        )}
                                        title={isSidebarCollapsed ? item.name : undefined}
                                    >
                                        <item.icon className={cn(
                                            "w-4 h-4 shrink-0",
                                            isActive ? "text-white" : "text-white/40 group-hover:text-white/60"
                                        )} />
                                        {!isSidebarCollapsed && (
                                            <span className="truncate flex-1">{item.name}</span>
                                        )}
                                        {!isSidebarCollapsed && item.count !== undefined && (
                                            <span className="text-[10px] font-medium min-w-[18px] h-[18px] flex items-center justify-center rounded bg-white/[0.08] text-white/60 shadow-sm border border-white/[0.04]">
                                                {item.count}
                                            </span>
                                        )}
                                    </Link>
                                )
                            })}
                        </div>
                    ))}
                </div>

                {/* Footer / User */}
                <div className="p-2 border-t border-white/[0.08] mt-auto">
                    <button
                        onClick={handleLogout}
                        className={cn(
                            "flex items-center gap-2.5 w-full hover:bg-white/[0.04] p-1.5 rounded-md transition-colors group text-left",
                            isSidebarCollapsed && "justify-center p-0"
                        )}
                    >
                        <div className="relative">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white border border-white/10 shrink-0">
                                {userEmail ? userEmail.charAt(0).toUpperCase() : <UserCircle className="w-4 h-4" />}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-[#0E0E0E]" />
                        </div>

                        {!isSidebarCollapsed && (
                            <div className="flex-1 min-w-0">
                                <div className="text-[12px] font-medium text-white/90 truncate">{userEmail || 'Loading...'}</div>
                                <div className="text-[11px] text-white/40 truncate">Log out</div>
                            </div>
                        )}
                    </button>

                    <div className={cn("mt-1 flex", isSidebarCollapsed ? "justify-center" : "justify-end px-1")}>
                        <button
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className="text-white/20 hover:text-white/60 transition-colors p-1"
                        >
                            {isSidebarCollapsed ? <PanelLeftOpen className="w-3 h-3" /> : <PanelLeftClose className="w-3 h-3" />}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#080808]">
                {/* Top Bar */}
                <div className="h-12 border-b border-white/[0.08] flex items-center px-6 shrink-0 bg-[#080808]/50 backdrop-blur-sm z-20">
                    <div className="flex items-center gap-2 text-[13px] text-white/40">
                        <span className="hover:text-white/60 cursor-pointer transition-colors">Syntra</span>
                        <span className="text-white/20">/</span>
                        <span className="text-white/90 font-medium">Dashboard</span>
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                        <button className="text-white/40 hover:text-white transition-colors relative">
                            <Bell className="w-4 h-4" />
                            <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full border border-[#080808]" />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <div className="max-w-[1200px] mx-auto animate-in fade-in duration-500 slide-in-from-bottom-2">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    )
}
