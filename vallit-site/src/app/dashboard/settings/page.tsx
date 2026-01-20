
export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-lg font-medium text-white mb-1">Settings</h1>
                <p className="text-[13px] text-white/40">Manage your account and workspace preferences.</p>
            </div>

            <div className="grid gap-6 max-w-2xl">
                {/* Profile Section */}
                <section className="space-y-4">
                    <h2 className="text-[13px] font-medium text-white/60 uppercase tracking-wider border-b border-white/[0.08] pb-2">Profile</h2>

                    <div className="grid gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-medium text-white/80">Display Name</label>
                            <input
                                type="text"
                                placeholder="Your Name"
                                className="w-full h-9 px-3 bg-[#111] border border-white/10 rounded-md text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-medium text-white/80">Email</label>
                            <input
                                type="email"
                                disabled
                                defaultValue="theorei@icloud.com"
                                className="w-full h-9 px-3 bg-[#111] border border-white/10 rounded-md text-[13px] text-white/40 cursor-not-allowed"
                            />
                        </div>
                    </div>
                </section>

                {/* Workspace Section */}
                <section className="space-y-4 pt-4">
                    <h2 className="text-[13px] font-medium text-white/60 uppercase tracking-wider border-b border-white/[0.08] pb-2">Workspace</h2>

                    <div className="p-3 rounded-md bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                        <div>
                            <div className="text-[13px] font-medium text-white">Syntra Network</div>
                            <div className="text-[12px] text-white/40">Free Plan</div>
                        </div>
                        <button className="px-3 py-1.5 bg-white text-black text-[12px] font-medium rounded hover:bg-white/90 transition-colors">
                            Manage
                        </button>
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="space-y-4 pt-8">
                    <h2 className="text-[13px] font-medium text-red-500/60 uppercase tracking-wider border-b border-red-500/10 pb-2">Danger Zone</h2>
                    <button className="px-3 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 text-[12px] font-medium rounded transition-colors">
                        Delete Account
                    </button>
                </section>
            </div>
        </div>
    )
}
