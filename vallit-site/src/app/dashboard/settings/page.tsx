"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
    Building,
    Users,
    Bot,
    Save,
    Loader2,
    Plus,
    MoreHorizontal,
    CheckCircle2
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function CompanySettingsPage() {
    const [activeTab, setActiveTab] = useState("general")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [company, setCompany] = useState<any>(null)
    const [members, setMembers] = useState<any[]>([])

    // Form States
    const [botSettings, setBotSettings] = useState({
        name: "",
        welcome_message: "",
        system_prompt: ""
    })

    // User Settings State
    const [user, setUser] = useState<any>(null)
    const [userForm, setUserForm] = useState({ name: "", email: "", theme: "dark" })

    useEffect(() => {
        fetchData()
        // Load theme preference
        const savedTheme = localStorage.getItem("theme") || "dark"
        setUserForm(prev => ({ ...prev, theme: savedTheme }))
    }, [])

    const fetchData = async () => {
        try {
            const { createClient } = await import("@/utils/supabase/client")
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) return

            const headers = { "Authorization": `Bearer ${session.access_token}` }

            // Fetch Company
            const resCompany = await fetch("/api/company/me", { headers })
            const dataCompany = await resCompany.json()
            setCompany(dataCompany.company)

            // Init Bot Settings form
            if (dataCompany.company?.widget_settings) {
                const s = dataCompany.company.widget_settings
                setBotSettings({
                    name: s.bot_name || "Kian",
                    welcome_message: s.welcome_message || "",
                    system_prompt: s.system_prompt || ""
                })
            }

            // Fetch User
            // We can get basic user info from session or /api/users/me (if we implement GET)
            // But layout fetches /api/company/me... 
            // We should probably fetch /api/users/me? 
            // Wait, we don't have a dedicated "get my profile" API that returns just user json?
            // "api/users/me" is usually the one.
            // Let's use session user metadata + Supabase for now, or assume we can create a simple GET /api/user/profile endpoint?
            // Actually, we can just use the name from existing session store or make a new endpoint.
            // Let's assume user name is in session.user.user_metadata or we fetch from /api/company/members and find self.
            // Or better: Use the endpoint we just modified? No that was update.
            // Let's rely on the dashboard layout fetching user? No, pages are independent.
            // Let's just create a quick GET /api/user/profile if needed, or use Supabase data.
            // Supabase session user has metadata.

            setUser({
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.name || session.user.email?.split('@')[0]
            })
            setUserForm(prev => ({
                ...prev,
                name: session.user.user_metadata?.name || "",
                email: session.user.email || ""
            }))

            // Fetch Members
            const resMembers = await fetch("/api/company/members", { headers })
            const dataMembers = await resMembers.json()
            setMembers(dataMembers.members || [])

            // If user is found in members, update name from there as it might be fresher
            const me = dataMembers.members?.find((m: any) => m.email === session.user.email)
            if (me) {
                setUserForm(prev => ({ ...prev, name: me.name }))
            }

        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveBot = async () => {
        setSaving(true)
        try {
            const { createClient } = await import("@/utils/supabase/client")
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()

            const res = await fetch(`/api/admin/companies/${company.id}/widget-settings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({
                    settings: {
                        bot_name: botSettings.name,
                        welcome_message: botSettings.welcome_message,
                        system_prompt: botSettings.system_prompt
                    }
                })
            })

            if (!res.ok) throw new Error("Failed to save")
            alert("Settings saved successfully!")

        } catch (error) {
            console.error(error)
            alert("Error saving settings")
        } finally {
            setSaving(false)
        }
    }

    const handleSaveProfile = async () => {
        setSaving(true)
        try {
            const { createClient } = await import("@/utils/supabase/client")
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()

            // Update Theme
            localStorage.setItem("theme", userForm.theme)
            document.documentElement.setAttribute("data-theme", userForm.theme)

            // Update Profile via API
            const res = await fetch("/api/user/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ name: userForm.name })
            })

            if (!res.ok) throw new Error("Failed to update profile")

            // Update Supabase Metadata to keep in sync
            await supabase.auth.updateUser({
                data: { name: userForm.name }
            })

            alert("Profile updated successfully!")
            window.location.reload() // Reload to apply theme/name changes globally

        } catch (error) {
            console.error(error)
            alert("Error updating profile")
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="p-8"><Loader2 className="w-6 h-6 animate-spin text-white/20" /></div>

    if (!company) return <div className="p-8 text-white/40">No company found.</div>

    return (
        <div className="max-w-[800px] mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-white tracking-tight">Settings</h1>
                <p className="text-white/40 text-sm mt-1">Manage your workspace, profile, and chat assistant.</p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-white/5 mb-8 overflow-x-auto">
                <button
                    onClick={() => setActiveTab("general")}
                    className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap",
                        activeTab === "general" ? "border-white text-white" : "border-transparent text-white/40 hover:text-white/60"
                    )}
                >
                    <Building className="w-4 h-4" /> General
                </button>
                <button
                    onClick={() => setActiveTab("members")}
                    className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap",
                        activeTab === "members" ? "border-white text-white" : "border-transparent text-white/40 hover:text-white/60"
                    )}
                >
                    <Users className="w-4 h-4" /> Members
                </button>
                <button
                    onClick={() => setActiveTab("bot")}
                    className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap",
                        activeTab === "bot" ? "border-white text-white" : "border-transparent text-white/40 hover:text-white/60"
                    )}
                >
                    <Bot className="w-4 h-4" /> Chat Assistant
                </button>
                <button
                    onClick={() => setActiveTab("profile")}
                    className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap",
                        activeTab === "profile" ? "border-white text-white" : "border-transparent text-white/40 hover:text-white/60"
                    )}
                >
                    <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[8px]">Me</div> Profile
                </button>
            </div>

            {/* Content */}
            <div className="space-y-6">

                {activeTab === "general" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        <div className="bg-[#111] border border-white/5 rounded-lg p-6 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-white/60 block mb-2">Company Name</label>
                                <input
                                    type="text"
                                    value={company.name}
                                    className="w-full bg-[#080808] border border-white/10 rounded-md px-3 py-2 text-white text-sm"
                                    disabled
                                />
                                <p className="text-[12px] text-white/20 mt-1.5">Contact support to change your company name.</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-white/60 block mb-2">Workspace URL</label>
                                <div className="flex items-center gap-2 text-sm text-white/40 bg-[#080808] border border-white/10 rounded-md px-3 py-2">
                                    <span>syntra.app/</span>
                                    <span className="text-white">{company.slug}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === "members" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-medium text-white/60">Team Members ({members.length})</h3>
                            <button className="flex items-center gap-2 px-3 py-1.5 bg-white text-black rounded-md text-sm font-medium hover:bg-white/90 transition-colors">
                                <Plus className="w-3.5 h-3.5" /> Invite Member
                            </button>
                        </div>

                        <div className="bg-[#111] border border-white/5 rounded-lg overflow-hidden">
                            <div className="divide-y divide-white/5">
                                {members.map((member) => (
                                    <div key={member.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white border border-white/10">
                                                {member.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-white/90">{member.name}</div>
                                                <div className="text-xs text-white/40">{member.email || "No email"}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs px-2 py-0.5 rounded border border-white/10 bg-white/5 text-white/60 uppercase tracking-wide font-medium">
                                                {member.role || "Member"}
                                            </span>
                                            <button className="text-white/20 hover:text-white transition-colors">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === "bot" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        <div className="bg-[#111] border border-white/5 rounded-lg p-6 space-y-6">

                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-white font-medium">Assistant Identity</h3>
                                    <p className="text-white/40 text-sm">Customize how your bot appears to users.</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                                    <Bot className="w-5 h-5 text-indigo-400" />
                                </div>
                            </div>

                            <div className="grid gap-4">
                                <div>
                                    <label className="text-sm font-medium text-white/60 block mb-2">Bot Name</label>
                                    <input
                                        type="text"
                                        value={botSettings.name}
                                        onChange={(e) => setBotSettings({ ...botSettings, name: e.target.value })}
                                        className="w-full bg-[#080808] border border-white/10 rounded-md px-3 py-2 text-white text-sm focus:border-indigo-500/50 transition-colors focus:outline-none"
                                        placeholder="e.g. Kian"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-white/60 block mb-2">Welcome Message</label>
                                    <input
                                        type="text"
                                        value={botSettings.welcome_message}
                                        onChange={(e) => setBotSettings({ ...botSettings, welcome_message: e.target.value })}
                                        className="w-full bg-[#080808] border border-white/10 rounded-md px-3 py-2 text-white text-sm focus:border-indigo-500/50 transition-colors focus:outline-none"
                                        placeholder="Hello! How can I help you today?"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-white/60 block mb-2">System Instructions</label>
                                    <textarea
                                        value={botSettings.system_prompt}
                                        onChange={(e) => setBotSettings({ ...botSettings, system_prompt: e.target.value })}
                                        className="w-full bg-[#080808] border border-white/10 rounded-md px-3 py-2 text-white text-sm focus:border-indigo-500/50 transition-colors focus:outline-none min-h-[120px]"
                                        placeholder="You are a helpful assistant..."
                                    />
                                    <p className="text-[12px] text-white/20 mt-1.5">
                                        These instructions define the bot's behavior and constraints. The company knowledge base is automatically appended.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5 flex justify-end">
                                <button
                                    onClick={handleSaveBot}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Configuration
                                </button>
                            </div>
                        </div>

                        {/* Installation Section */}
                        <div className="bg-[#111] border border-white/5 rounded-lg p-6 space-y-6">
                            <div>
                                <h3 className="text-white font-medium">Installation</h3>
                                <p className="text-white/40 text-sm">Add this snippet to your website to enable the chat widget.</p>
                            </div>

                            <div className="bg-[#080808] border border-white/10 rounded-md p-4 relative group">
                                <code className="text-sm font-mono text-white/70 block break-all whitespace-pre-wrap">
                                    {`<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/static/js/chat-widget.js"
  data-company-id="${company.id}"
  data-theme="glassmorphism">
</script>`}
                                </code>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(`<script src="${window.location.origin}/static/js/chat-widget.js" data-company-id="${company.id}"></script>`)
                                        alert("Copied directly to clipboard!")
                                    }}
                                    className="absolute top-2 right-2 p-2 hover:bg-white/10 rounded-md text-white/40 hover:text-white transition-colors"
                                    title="Copy to clipboard"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === "profile" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        <div className="bg-[#111] border border-white/5 rounded-lg p-6 space-y-6">
                            <div>
                                <h3 className="text-white font-medium">Profile Settings</h3>
                                <p className="text-white/40 text-sm">Manage your personal information and preferences.</p>
                            </div>

                            <div className="grid gap-4">
                                <div>
                                    <label className="text-sm font-medium text-white/60 block mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={userForm.name}
                                        onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                                        className="w-full bg-[#080808] border border-white/10 rounded-md px-3 py-2 text-white text-sm focus:border-indigo-500/50 transition-colors focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-white/60 block mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={userForm.email}
                                        disabled
                                        className="w-full bg-[#080808] border border-white/10 rounded-md px-3 py-2 text-white/50 text-sm cursor-not-allowed"
                                        title="Email change not supported yet"
                                    />
                                    <p className="text-[12px] text-white/20 mt-1.5">Email cannot be changed at this time.</p>
                                </div>

                                <div className="pt-4 border-t border-white/5">
                                    <label className="text-sm font-medium text-white/60 block mb-3">Appearance</label>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setUserForm({ ...userForm, theme: "dark" })}
                                            className={cn(
                                                "px-4 py-2 rounded-md text-sm border transition-colors",
                                                userForm.theme === "dark"
                                                    ? "bg-white/10 border-white/20 text-white"
                                                    : "bg-transparent border-white/5 text-white/40 hover:text-white/60"
                                            )}
                                        >
                                            Dark Mode
                                        </button>
                                        <button
                                            onClick={() => setUserForm({ ...userForm, theme: "light" })}
                                            className={cn(
                                                "px-4 py-2 rounded-md text-sm border transition-colors",
                                                userForm.theme === "light"
                                                    ? "bg-white text-black border-white"
                                                    : "bg-transparent border-white/5 text-white/40 hover:text-white/60"
                                            )}
                                        >
                                            Light Mode
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5 flex justify-end">
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Profile
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

            </div>
        </div>
    )
}
