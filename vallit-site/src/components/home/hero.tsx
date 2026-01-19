"use client";

import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });

    const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    return (
        <section ref={containerRef} className="relative pt-32 pb-0 md:pt-48 overflow-hidden bg-[#020202]">

            {/* 1. Text Content Layer (Top) */}
            <div className="container relative z-20 mx-auto px-6 max-w-5xl text-center mb-12 sm:mb-20">
                <motion.div style={{ opacity, y }}>
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
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 drop-shadow-2xl">
                        AI systems that work. <br />
                        <span className="text-[#888]">Built for you.</span>
                    </h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                        className="text-xl md:text-2xl text-[var(--gray-300)] leading-relaxed max-w-2xl mx-auto mb-12"
                    >
                        Kian understands your business context, handles support, schedules
                        meetings, and executes workflows end-to-end.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <ButtonLink href="/pricing#contact" size="lg" className="shadow-lg shadow-[var(--accent)]/20 px-8 py-6 text-lg">
                            Contact Us
                        </ButtonLink>
                        <ButtonLink href="/features" variant="secondary" size="lg" className="bg-white/5 border border-white/10 hover:bg-white/10 px-8 py-6 text-lg">
                            See Features
                        </ButtonLink>
                    </motion.div>
                </motion.div>
            </div>

            {/* 2. Visual Layer (Bottom - Tilted Console) */}
            <div className="relative w-full max-w-[1400px] mx-auto perspective-[2000px] z-10">
                <motion.div
                    initial={{ opacity: 0, rotateX: 30, y: 100 }}
                    animate={{ opacity: 1, rotateX: 20, y: 0 }}
                    transition={{ duration: 1.4, ease: "circOut", delay: 0.2 }}
                    style={{
                        transformStyle: "preserve-3d",
                        transformOrigin: "top center",
                    }}
                    className="relative w-full"
                >
                    {/* The 3D Console/Interface */}
                    <div className="relative mx-auto w-full md:w-[90%] aspect-[16/9] bg-[#050505] rounded-t-2xl border-t border-x border-white/10 shadow-[0_-20px_60px_-20px_rgba(255,255,255,0.05)] overflow-hidden ring-1 ring-white/5">

                        {/* Internal Reflection / Gloss */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

                        {/* Status Bar */}
                        <div className="h-12 border-b border-white/5 bg-[#080808] flex items-center px-6 justify-between">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-white/10" />
                                <div className="w-3 h-3 rounded-full bg-white/10" />
                            </div>
                            <div className="text-xs font-mono text-white/20">VALLIT_OS_V4.2.0</div>
                        </div>

                        {/* Content Grid */}
                        <div className="p-8 grid grid-cols-12 gap-6 h-full bg-[#030303]">
                            {/* Left Panel */}
                            <div className="col-span-3 hidden md:flex flex-col gap-4 border-r border-white/5 pr-6">
                                <div className="h-8 w-24 bg-white/5 rounded-md" />
                                <div className="space-y-2 mt-4">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="h-10 w-full bg-white/[0.02] rounded-lg border border-white/[0.02]" />
                                    ))}
                                </div>
                            </div>

                            {/* Main Board */}
                            <div className="col-span-12 md:col-span-9 flex flex-col gap-6">
                                <div className="flex justify-between items-center">
                                    <div className="h-10 w-48 bg-white/5 rounded-lg" />
                                    <div className="h-10 w-10 rounded-full bg-[var(--accent)]/20 border border-[var(--accent)]/30" />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="aspect-video bg-[#0A0A0A] rounded-xl border border-white/5 relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    ))}
                                </div>
                                <div className="h-40 bg-[#0A0A0A] rounded-xl border border-white/5" />
                            </div>
                        </div>

                        {/* Bottom Fade Mask (Linear Style) */}
                        <div className="absolute inset-0 z-50 bg-gradient-to-b from-transparent via-transparent to-[#020202] pointer-events-none" />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
