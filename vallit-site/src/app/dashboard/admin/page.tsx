
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function AdminPage() {
    // 1. Verify Admin (Server-side)
    const cookieStore = await cookies()
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_KEY!, // Use service key to list users
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )

    // Check current session via standard auth first
    /* 
       Note: We use service key above to list *all* users, but we must verify 
       the *requesting* user is an admin. Service key bypasses RLS, so we 
       need manual check.
       BUT: We don't have the user's session attached to the service client 
       in a way that validates their role easily without headers.
       
       Better approach:
       1. Get current user via standard method (user token).
       2. Check metadata role.
       3. If admin, use Service Client to fetch data.
    */

    // Standard client to get current user
    const { createServerClient } = await import('@supabase/ssr')
    const userClient = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll() { }
            }
        }
    )

    const { data: { user } } = await userClient.auth.getUser()

    if (!user) return redirect("/login")

    // Check if admin (Assuming 'role' in metadata, or we can check simple email allowlist for now)
    const isAdmin = user.user_metadata?.role === 'admin' || user.email === 'theorei@icloud.com'

    if (!isAdmin) {
        return (
            <div className="flex h-[50vh] items-center justify-center text-white/40">
                You do not have permission to view this page.
            </div>
        )
    }

    // LIST USERS (Service Role)
    const { data: { users }, error } = await supabase.auth.admin.listUsers()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-medium text-white">Members</h1>
                    <p className="text-[13px] text-white/40">Manage your team and workspace access.</p>
                </div>
                <button className="h-8 px-3 bg-white text-black text-[13px] font-medium rounded-md hover:bg-white/90 transition-colors">
                    Invite Member
                </button>
            </div>

            <div className="border border-white/[0.08] rounded-lg overflow-hidden bg-[#0C0C0C]">
                <table className="w-full text-left text-[13px]">
                    <thead className="bg-white/[0.02] border-b border-white/[0.08]">
                        <tr>
                            <th className="px-4 py-3 font-medium text-white/40 font-normal">User</th>
                            <th className="px-4 py-3 font-medium text-white/40 font-normal">Role</th>
                            <th className="px-4 py-3 font-medium text-white/40 font-normal">Status</th>
                            <th className="px-4 py-3 font-medium text-white/40 font-normal">Joined</th>
                            <th className="px-4 py-3 font-medium text-white/40 font-normal text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                        {users?.map((u) => (
                            <tr key={u.id} className="group hover:bg-white/[0.02] transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-[10px] font-bold text-white border border-white/10">
                                            {u.email?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-medium text-white/90">{u.email}</div>
                                            {/* <div className="text-[11px] text-white/30">{u.id}</div> */}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-white/60">
                                    <span className="capitalize">{u.user_metadata?.role || 'Member'}</span>
                                </td>
                                <td className="px-4 py-3">
                                    {u.user_metadata?.setup_required ? (
                                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[11px]">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                            Pending Setup
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[11px]">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            Active
                                        </div>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-white/40 font-mono text-[12px]">
                                    {new Date(u.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button className="text-white/20 hover:text-white transition-colors">
                                        ...
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
