import React from "react";
import Link from "next/link";

const footerLinks = {
    product: [
        { href: "/features", label: "Features" },
        { href: "/solutions", label: "Solutions" },
        { href: "/pricing", label: "Pricing" },
    ],
    company: [
        { href: "/about", label: "About" },
        { href: "/brand", label: "Brand" },
        { href: "/pricing#contact", label: "Contact" },
    ],
    legal: [
        { href: "/impressum", label: "Impressum" },
        { href: "/datenschutz", label: "Privacy Policy" },
    ],
};

export function Footer() {
    return (
        <footer className="border-t border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.3)]">
            <div className="container mx-auto px-6 max-w-6xl py-16 md:py-20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-xl font-bold text-white hover:opacity-80 transition-opacity"
                        >
                            <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                                <path d="M20 20H70L60 40H10L20 20Z" fill="currentColor" />
                                <path d="M25 45H85L75 65H15L25 45Z" fill="currentColor" fillOpacity="0.8" />
                                <path d="M30 70H60L50 90H20L30 70Z" fill="currentColor" fillOpacity="0.6" />
                            </svg>
                            Vallit
                        </Link>
                        <p className="mt-4 text-sm text-[var(--gray-400)] leading-relaxed max-w-xs">
                            Done-for-you AI automation. We build and deploy AI systems that
                            integrate into your real stack and processes.
                        </p>
                        {/* Social Links */}
                        <div className="flex gap-4 mt-6">
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="LinkedIn"
                                className="text-[var(--gray-400)] hover:text-white transition-colors"
                            >
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                                    <rect x="2" y="9" width="4" height="12" />
                                    <circle cx="4" cy="4" r="2" />
                                </svg>
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Twitter / X"
                                className="text-[var(--gray-400)] hover:text-white transition-colors"
                            >
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
                        <ul className="space-y-3">
                            {footerLinks.product.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-[var(--gray-400)] hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-[var(--gray-400)] hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
                        <ul className="space-y-3">
                            {footerLinks.legal.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-[var(--gray-400)] hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-16 pt-8 border-t border-[rgba(255,255,255,0.08)] flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-[var(--gray-500)]">
                        © {new Date().getFullYear()} Vallit. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <Link
                            href="/impressum"
                            className="text-sm text-[var(--gray-500)] hover:text-[var(--gray-300)] transition-colors"
                        >
                            Impressum
                        </Link>
                        <Link
                            href="/datenschutz"
                            className="text-sm text-[var(--gray-500)] hover:text-[var(--gray-300)] transition-colors"
                        >
                            Privacy
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
