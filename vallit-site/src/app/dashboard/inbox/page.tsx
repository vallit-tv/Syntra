
export default function InboxPage() {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/20"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>
            </div>
            <div>
                <h1 className="text-lg font-medium text-white">Inbox</h1>
                <p className="text-sm text-white/40">Notifications and tasks will appear here.</p>
            </div>
        </div>
    )
}
