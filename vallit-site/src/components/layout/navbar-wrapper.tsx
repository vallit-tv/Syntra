"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"

export function NavbarWrapper() {
    const pathname = usePathname()
    // Hide navbar on dashboard routes and auth routes if needed
    if (pathname?.startsWith("/dashboard")) return null

    return <Navbar />
}
