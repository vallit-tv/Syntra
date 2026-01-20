"use client"

import { usePathname } from "next/navigation"
import { Footer } from "@/components/layout/footer"

export function FooterWrapper() {
    const pathname = usePathname()
    // Hide footer on dashboard routes
    if (pathname?.startsWith("/dashboard")) return null
    if (pathname?.startsWith("/chat-preview")) return null // Also hide on standalone chat preview if it exists

    return <Footer />
}
