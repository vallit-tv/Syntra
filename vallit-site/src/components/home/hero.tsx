"use client";

import { ButtonLink } from "@/components/ui/button";
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

    // Animation Variants for sequential entrance
    const fadeInUp = {
        hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
        visible: { opacity: 1, y: 0, filter: "blur(0px)" }
    };

    return (
        <section ref={containerRef} className="relative pt-32 pb-0 md:pt-48 overflow-hidden bg-[#020202]">

            {/* 1. Text Content Layer */}
            <div className="container relative z-20 mx-auto px-6 max-w-5xl text-center mb-0">
                <motion.div
                    style={{ opacity, y }}
                    initial="hidden"
                    animate="visible"
                    transition={{ staggerChildren: 0.2 }}
                >
                    {/* Title */}
                    <motion.h1
                        variants={fadeInUp}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 drop-shadow-2xl"
                    >
                        AI systems that work. <br />
                        <span className="text-[var(--accent)]">Built for you.</span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        variants={fadeInUp}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-xl md:text-2xl text-[var(--gray-300)] leading-relaxed max-w-2xl mx-auto mb-12"
                    >
                        Kian understands your business context, handles support, schedules
                        meetings, and executes workflows end-to-end.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        variants={fadeInUp}
                        transition={{ duration: 0.8, ease: "easeOut" }}
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

            {/* 2. Visual Layer (Bottom - Overlapped & Tilted) */}
            <div className="relative w-full max-w-[1400px] mx-auto perspective-[2000px] z-10 -mt-20 md:-mt-32 pointer-events-none">
                <motion.div
                    initial={{ opacity: 0, rotateX: 30, y: 100, filter: "blur(10px)" }}
                    animate={{ opacity: 1, rotateX: 20, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 1.4, ease: "circOut", delay: 0.4 }}
                    style={{
                        transformStyle: "preserve-3d",
                        transformOrigin: "top center",
                    }}
                    className="relative w-full"
                >
                    {/* The 3D Console/Interface */}
                    <div className="relative mx-auto w-full md:w-[90%] aspect-[16/9] bg-[#050505] rounded-t-2xl border-t border-x border-white/10 shadow-[0_-20px_60px_-20px_rgba(255,255,255,0.05)] overflow-hidden ring-1 ring-white/5">

                        {/* Subtle Grid Overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />

                        {/* Internal Reflection */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

                        {/* Status Bar */}
                        <div className="h-10 border-b border-white/5 bg-[#080808] flex items-center px-6 justify-between relative z-10">
                            <div className="flex gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#FB5454]" />
                                <div className="w-2.5 h-2.5 rounded-full bg-[#FDBB2E]" />
                                <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-white/40 font-mono border border-white/5">dashboard.tsx</div>
                                <div className="text-[10px] font-mono text-white/20">VALLIT_OS_V4.2.0</div>
                            </div>
                        </div>

                        {/* Content Grid - Enhanced UI Details */}
                        <div className="flex h-full relative z-10">

                            {/* SIDEBAR: Iconic Navigation */}
                            <div className="w-16 hidden md:flex flex-col items-center py-6 gap-6 border-r border-white/5 bg-[#070707]">
                                <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center">
                                    <div className="w-4 h-4 rounded bg-[var(--accent)]" />
                                </div>
                                <div className="w-full h-px bg-white/5 my-2" />
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className={`w-8 h-8 rounded-lg border flex items-center justify-center ${i === 1 ? 'bg-white/5 border-white/10' : 'border-transparent opacity-40'}`}>
                                        <div className="w-4 h-4 rounded-sm bg-white/20" />
                                    </div>
                                ))}
                                <div className="mt-auto w-8 h-8 rounded-full border border-white/10 bg-white/5" />
                            </div>

                            {/* MAIN AREA */}
                            <div className="flex-1 bg-[#030303] flex">

                                {/* Code/Editor Column */}
                                <div className="flex-1 p-6 font-mono text-xs text-white/40 hidden lg:block">
                                    <div className="flex gap-4 mb-4 text-[var(--accent)]/60 bg-[var(--accent)]/5 p-2 rounded w-fit border border-[var(--accent)]/10">
                                        <span>✓ System Operational</span>
                                        <span className="opacity-50">|</span>
                                        <span>Latency: 12ms</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex gap-4"><span className="text-white/10 select-none">01</span> <span className="text-purple-400">import</span> <span className="text-yellow-100">{`{ Kian }`}</span> <span className="text-purple-400">from</span> <span className="text-green-400">'@vallit/core'</span>;</div>
                                        <div className="flex gap-4"><span className="text-white/10 select-none">02</span> </div>
                                        <div className="flex gap-4"><span className="text-white/10 select-none">03</span> <span className="text-purple-400">async function</span> <span className="text-blue-400">initializeWorkflow</span>() {`{`}</div>
                                        <div className="flex gap-4"><span className="text-white/10 select-none">04</span>    <span className="text-purple-400">const</span> agent = <span className="text-purple-400">await</span> Kian.<span className="text-blue-400">connect</span>();</div>
                                        <div className="flex gap-4"><span className="text-white/10 select-none">05</span>    </div>
                                        <div className="flex gap-4"><span className="text-white/10 select-none">06</span>    <span className="text-gray-500">// Analyzing context...</span></div>
                                        <div className="flex gap-4"><span className="text-white/10 select-none">07</span>    <span className="text-purple-400">await</span> agent.<span className="text-blue-400">analyze</span>({`{`}</div>
                                        <div className="flex gap-4"><span className="text-white/10 select-none">08</span>        source: <span className="text-green-400">"email"</span>,</div>
                                        <div className="flex gap-4"><span className="text-white/10 select-none">09</span>        intent: <span className="text-green-400">"scheduling"</span>,</div>
                                        <div className="flex gap-4"><span className="text-white/10 select-none">10</span>        priority: <span className="text-orange-400">"high"</span></div>
                                        <div className="flex gap-4"><span className="text-white/10 select-none">11</span>    {`}`});</div>
                                        <div className="flex gap-4"><span className="text-white/10 select-none">12</span> {`}`}</div>
                                    </div>
                                </div>

                                {/* Widgets / Graph Column */}
                                <div className="w-full lg:w-[400px] border-l border-white/5 bg-[#050505] p-6 flex flex-col gap-4">
                                    <div className="h-32 rounded-xl bg-[#0A0A0A] border border-white/5 p-4 relative overflow-hidden">
                                        <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2">Activity Volume</div>
                                        <div className="flex items-end gap-1 h-16 w-full opacity-50">
                                            {[40, 60, 30, 80, 50, 90, 70, 40, 60, 80, 50, 70].map((h, i) => (
                                                <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-white/10 rounded-t-sm" />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex-1 rounded-xl bg-[#0A0A0A] border border-white/5 p-4">
                                        <div className="text-[10px] uppercase tracking-wider text-white/30 mb-4">Live Events</div>
                                        <div className="space-y-3">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="flex gap-3 items-center p-2 rounded hover:bg-white/5 transition-colors">
                                                    <div className={`w-2 h-2 rounded-full ${i === 1 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-white/20'}`} />
                                                    <div className="flex-1">
                                                        <div className="bg-white/10 h-2 w-20 rounded mb-1" />
                                                        <div className="bg-white/5 h-1.5 w-12 rounded" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Fade Mask */}
                        <div className="absolute inset-0 z-50 bg-gradient-to-b from-transparent via-transparent to-[#020202] pointer-events-none" />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
