"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/features", label: "Features" },
    { href: "/solutions", label: "Solutions" },
    { href: "/pricing", label: "Pricing" },
    { href: "/about", label: "About" },
];

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isMobileMenuOpen]);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? "bg-[rgba(5,5,5,0.85)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.08)]"
                : "bg-transparent"
                }`}
        >
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="text-xl font-bold text-white hover:opacity-80 transition-opacity"
                    >
                        Vallit
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-sm font-medium transition-colors relative ${pathname === link.href
                                    ? "text-white"
                                    : "text-[var(--gray-400)] hover:text-white"
                                    }`}
                            >
                                {link.label}
                                {pathname === link.href && (
                                    <span className="absolute -bottom-[22px] left-0 right-0 h-px bg-white shadow-[0_-2px_8px_rgba(255,255,255,0.5)]" />
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* Desktop CTA */}
                    <div className="hidden md:flex items-center gap-3">
                        <ButtonLink href="https://console.vallit.net" variant="secondary" size="sm" external>
                            Dashboard
                        </ButtonLink>
                        <ButtonLink href="/pricing#contact" size="sm">
                            Contact
                        </ButtonLink>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 z-[60]"
                        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={isMobileMenuOpen}
                    >
                        <span
                            className={`w-6 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? "rotate-45 translate-y-2" : ""
                                }`}
                        />
                        <span
                            className={`w-6 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : ""
                                }`}
                        />
                        <span
                            className={`w-6 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
                                }`}
                        />
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                className={`fixed inset-0 bg-[var(--bg-body)] z-50 flex flex-col items-center justify-center gap-8 transition-all duration-500 md:hidden ${isMobileMenuOpen
                    ? "opacity-100 pointer-events-auto"
                    : "opacity-0 pointer-events-none"
                    }`}
            >
                {navLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`text-2xl font-medium transition-colors ${pathname === link.href
                            ? "text-white"
                            : "text-[var(--gray-400)] hover:text-white"
                            }`}
                    >
                        {link.label}
                    </Link>
                ))}
                <ButtonLink href="https://console.vallit.net" variant="secondary" size="lg" className="mt-4" external>
                    Dashboard
                </ButtonLink>
                <ButtonLink href="/pricing#contact" size="lg">
                    Contact
                </ButtonLink>
            </div>
        </header>
    );
}
