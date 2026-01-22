import React from "react";
import Link from "next/link";

export default function BrandPage() {
    return (
        <main className="min-h-screen pt-32 pb-20">
            <div className="container mx-auto px-6 max-w-6xl">
                {/* Hero */}
                <section className="text-center mb-24">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-[var(--gray-400)]">
                        Vallit Brand
                    </h1>
                    <p className="text-xl text-[var(--gray-400)] max-w-2xl mx-auto">
                        Our logo and brand assets. Download them for use in your projects or media coverage.
                        Please do not modify the logo geometry.
                    </p>
                </section>

                {/* Logo Section */}
                <section className="border-t border-[rgba(255,255,255,0.08)] pt-16 mb-24">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-6">
                        <div>
                            <h2 className="text-2xl font-semibold text-white mb-2">Logo</h2>
                            <p className="text-[var(--gray-400)]">The primary mark used across all applications.</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Dark Background */}
                        <div className="border border-[rgba(255,255,255,0.08)] bg-[var(--bg-card)] rounded-xl overflow-hidden">
                            <div className="h-64 flex items-center justify-center bg-[#050505] text-white">
                                <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 20H70L60 40H10L20 20Z" fill="currentColor" />
                                    <path d="M25 45H85L75 65H15L25 45Z" fill="currentColor" fillOpacity="0.8" />
                                    <path d="M30 70H60L50 90H20L30 70Z" fill="currentColor" fillOpacity="0.6" />
                                </svg>
                            </div>
                            <div className="p-5 flex justify-between items-center bg-[#111] border-t border-[rgba(255,255,255,0.08)]">
                                <span className="font-medium text-white text-sm">Logomark (Dark)</span>
                                <a
                                    href="/images/logo.svg"
                                    download="vallit-logo.svg"
                                    className="text-sm font-medium text-white px-3 py-1.5 rounded-md border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                                >
                                    Download SVG
                                </a>
                            </div>
                        </div>

                        {/* Light Background */}
                        <div className="border border-[rgba(255,255,255,0.08)] bg-[var(--bg-card)] rounded-xl overflow-hidden">
                            <div className="h-64 flex items-center justify-center bg-white text-black">
                                <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 20H70L60 40H10L20 20Z" fill="currentColor" />
                                    <path d="M25 45H85L75 65H15L25 45Z" fill="currentColor" fillOpacity="0.8" />
                                    <path d="M30 70H60L50 90H20L30 70Z" fill="currentColor" fillOpacity="0.6" />
                                </svg>
                            </div>
                            <div className="p-5 flex justify-between items-center bg-[#111] border-t border-[rgba(255,255,255,0.08)]">
                                <span className="font-medium text-white text-sm">Logomark (Light)</span>
                                <a
                                    href="/images/logo.svg"
                                    download="vallit-logo.svg"
                                    className="text-sm font-medium text-white px-3 py-1.5 rounded-md border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                                >
                                    Download SVG
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Colors */}
                <section className="border-t border-[rgba(255,255,255,0.08)] pt-16">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-6">
                        <div>
                            <h2 className="text-2xl font-semibold text-white mb-2">Colors</h2>
                            <p className="text-[var(--gray-400)]">Monochromatic precision.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { name: "Black", hex: "#000000", bg: "#000000" },
                            { name: "White", hex: "#FFFFFF", bg: "#FFFFFF" },
                            { name: "Surface", hex: "#111111", bg: "#111111" },
                            { name: "Border", hex: "#222222", bg: "#222222" },
                        ].map((color) => (
                            <div key={color.name} className="border border-[rgba(255,255,255,0.08)] bg-[#111] rounded-xl p-2">
                                <div
                                    className="h-28 w-full rounded-lg mb-3 border border-[rgba(255,255,255,0.05)]"
                                    style={{ backgroundColor: color.bg }}
                                ></div>
                                <div className="px-2 pb-2">
                                    <span className="block font-medium text-white text-sm mb-1">{color.name}</span>
                                    <code className="text-xs text-[var(--gray-400)]">{color.hex}</code>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
