
export default function ViewsPage() {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/20"><rect width="7" height="7" x="3" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="14" rx="1"></rect><rect width="7" height="7" x="3" y="14" rx="1"></rect></svg>
            </div>
            <div>
                <h1 className="text-lg font-medium text-white">Views</h1>
                <p className="text-sm text-white/40">Custom filters and data views.</p>
            </div>
        </div>
    )
}
