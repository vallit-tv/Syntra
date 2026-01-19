"use client";

import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export function Hero() {
    return (
        <section className="relative min-h-[90vh] flex items-center pt-20 pb-20 overflow-hidden perspective-[2000px]">
            {/* Background Visual Layer - Crisp & Visible */}
            <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
                <div className="w-full max-w-7xl px-6 h-full flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, rotateX: 25, y: 100, scale: 0.9 }}
                        animate={{ opacity: 1, rotateX: 12, y: 0, scale: 1 }}
                        transition={{ duration: 1.2, ease: "circOut" }}
                        style={{ transformStyle: "preserve-3d" }}
                        className="relative w-full max-w-5xl mask-image-linear-gradient(to bottom, black 70%, transparent 100%)"
                    >
                        {/* 3D Mockup Container */}
                        <div className="relative bg-[#050505] rounded-xl border border-white/10 shadow-2xl overflow-hidden ring-1 ring-white/10 rotate-x-12 transform-gpu">
                            {/* Glass Edge Highlight */}
                            <div className="absolute inset-0 rounded-xl ring-1 ring-white/20 pointer-events-none z-50 mix-blend-overlay" />

                            {/* Window Config Bar */}
                            <div className="h-10 border-b border-white/5 bg-[#0A0A0A] flex items-center px-4 gap-2">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#2A2A2A] border border-white/5" />
                                    <div className="w-3 h-3 rounded-full bg-[#2A2A2A] border border-white/5" />
                                    <div className="w-3 h-3 rounded-full bg-[#2A2A2A] border border-white/5" />
                                </div>
                            </div>

                            {/* Content Grid - Crisp Interface */}
                            <div className="grid md:grid-cols-12 gap-0 h-[700px] bg-[#030303]">
                                {/* Sidebar */}
                                <div className="md:col-span-3 border-r border-white/5 p-4 hidden md:flex flex-col gap-3 bg-[#050505]">
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                        <div key={i} className={`h-8 rounded-md w-full ${i === 2 ? 'bg-white/10' : 'bg-white/[0.02]'}`} />
                                    ))}
                                </div>
                                {/* Main Area */}
                                <div className="md:col-span-9 p-8">
                                    <div className="flex items-center justify-between mb-10">
                                        <div className="h-8 w-40 bg-white/[0.04] rounded-lg border border-white/5" />
                                        <div className="flex gap-3">
                                            <div className="h-8 w-8 rounded-full bg-white/[0.04] border border-white/5" />
                                            <div className="h-8 w-24 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-lg" />
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="group relative h-28 rounded-xl bg-[#080808] border border-white/5 w-full overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <div className="p-4 flex gap-4">
                                                    <div className="w-12 h-12 rounded-lg bg-white/5" />
                                                    <div className="space-y-2 flex-1">
                                                        <div className="h-4 w-1/3 bg-white/10 rounded" />
                                                        <div className="h-3 w-1/2 bg-white/5 rounded" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Content Layer - Text Readability protection */}
            <div className="container relative z-10 mx-auto px-6 max-w-6xl">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Readability backing for text */}
                    <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#030303]/80 via-[#030303]/60 to-transparent blur-3xl scale-150 transform -translate-y-20" />

                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <Badge variant="accent" className="mb-8 border-white/10 bg-white/5 backdrop-blur-md">
                            Done-for-you AI Automation
                        </Badge>
                    </motion.div>

                    {/* Title */}
                    <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-8 drop-shadow-2xl">
                        <span className="block overflow-hidden p-2">
                            <motion.span
                                initial={{ y: "100%", filter: "blur(20px)", opacity: 0 }}
                                animate={{ y: 0, filter: "blur(0px)", opacity: 1 }}
                                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                className="block text-gradient"
                            >
                                AI systems that work.
                            </motion.span>
                        </span>
                        <span className="block overflow-hidden p-2">
                            <motion.span
                                initial={{ y: "100%", filter: "blur(20px)", opacity: 0 }}
                                animate={{ y: 0, filter: "blur(0px)", opacity: 1 }}
                                transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                                className="block text-white"
                            >
                                Built for you.
                            </motion.span>
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                        className="text-xl md:text-2xl text-[var(--gray-300)] leading-relaxed max-w-2xl mx-auto mb-12 drop-shadow-lg"
                    >
                        Kian understands your business context, handles support, schedules
                        meetings, and executes workflows end-to-end. We build and deploy it for
                        you.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20, filter: "blur(5px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <ButtonLink href="/pricing#contact" size="lg" className="shadow-xl shadow-[var(--accent)]/20">
                            Contact Us
                        </ButtonLink>
                        <ButtonLink href="/features" variant="secondary" size="lg" className="bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-md">
                            See Features
                        </ButtonLink>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
