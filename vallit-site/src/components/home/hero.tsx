"use client";

import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export function Hero() {
    return (
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Badge */}
                    <Badge variant="accent" className="mb-6">
                        Done-for-you AI Automation
                    </Badge>

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6">
                        <span className="text-gradient">AI systems that work.</span>
                        <br />
                        <span className="text-white">Built for you.</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg md:text-xl text-[var(--gray-300)] leading-relaxed max-w-2xl mx-auto mb-10">
                        Kian understands your business context, handles support, schedules
                        meetings, and executes workflows end-to-end. We build and deploy it for
                        you.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <ButtonLink href="/pricing#contact" size="lg">
                            Contact Us
                        </ButtonLink>
                        <ButtonLink href="/features" variant="secondary" size="lg">
                            See Features
                        </ButtonLink>
                    </div>
                </div>

                {/* Hero Visual */}
                <div className="mt-16 md:mt-24 relative">
                    <div className="relative mx-auto max-w-4xl">
                        {/* Glow effect behind */}
                        <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent-dim)] to-transparent opacity-30 blur-3xl -z-10" />

                        {/* Mock UI */}
                        <motion.div
                            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="bg-[rgba(255,255,255,0.02)] backdrop-blur-sm rounded-2xl border border-[rgba(255,255,255,0.08)] p-4 md:p-6"
                        >
                            <div className="grid md:grid-cols-3 gap-4">
                                {/* Chat Panel */}
                                <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent-dim)] to-transparent opacity-20 blur-[100px] -z-10 transform translate-y-20" />

                                {/* Mock UI Main Frame */}
                                <div className="bg-[#0A0A0A] rounded-xl border border-white/10 shadow-2xl overflow-hidden ring-1 ring-white/5">
                                    {/* Window Config Bar */}
                                    <div className="h-10 border-b border-white/5 bg-white/[0.02] flex items-center px-4 gap-2">
                                        <div className="flex gap-2">
                                            <div className="w-3 h-3 rounded-full bg-[#FF5F57] opacity-50" />
                                            <div className="w-3 h-3 rounded-full bg-[#FEBC2E] opacity-50" />
                                            <div className="w-3 h-3 rounded-full bg-[#28C840] opacity-50" />
                                        </div>
                                    </div>

                                    {/* Content Grid */}
                                    <div className="grid md:grid-cols-12 gap-0 h-[500px] md:h-[600px] bg-[#0A0A0A]">
                                        {/* Sidebar */}
                                        <div className="md:col-span-3 border-r border-white/5 p-4 hidden md:flex flex-col gap-2">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div key={i} className="h-8 rounded-md bg-white/[0.03] w-full" />
                                            ))}
                                            <div className="mt-auto">
                                                <div className="h-10 rounded-md bg-white/[0.03] w-full" />
                                            </div>
                                        </div>

                                        {/* Main Area */}
                                        <div className="md:col-span-9 p-6">
                                            {/* Header mock */}
                                            <div className="flex items-center justify-between mb-8">
                                                <div className="h-8 w-32 bg-white/[0.05] rounded-md" />
                                                <div className="flex gap-2">
                                                    <div className="h-8 w-8 rounded-full bg-white/[0.05]" />
                                                    <div className="h-8 w-24 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-md" />
                                                </div>
                                                <motion.div
                                                    initial={{ opacity: 0, x: 20, filter: "blur(5px)" }}
                                                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                                    transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
                                                    className="bg-[var(--bg-elevated)] rounded-xl border border-[rgba(255,255,255,0.06)] p-4"
                                                >
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                                        <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                                        <span className="ml-2 text-xs text-[var(--gray-500)]">
                                                            Workflows
                                                        </span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {[
                                                            { label: "Lead Intake", status: "active" },
                                                            { label: "Support Ticket", status: "done" },
                                                            { label: "Onboarding", status: "pending" },
                                                        ].map((item, i) => (
                                                            <div
                                                                key={i}
                                                                className="flex items-center justify-between text-xs p-2 rounded-lg bg-[rgba(255,255,255,0.03)]"
                                                            >
                                                                <span className="text-[var(--gray-300)]">{item.label}</span>
                                                                <span
                                                                    className={`w-2 h-2 rounded-full ${item.status === "active"
                                                                        ? "bg-[var(--accent)] animate-pulse"
                                                                        : item.status === "done"
                                                                            ? "bg-green-500"
                                                                            : "bg-[var(--gray-500)]"
                                                                        }`}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
