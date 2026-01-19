"use client";

import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export function Hero() {
    return (
        <section className="relative min-h-[90vh] flex items-center pt-20 pb-20 overflow-hidden">
            {/* Background Visual Layer */}
            <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
                <div className="w-full max-w-6xl px-6 h-full flex items-center justify-center perspective-[2000px]">
                    <motion.div
                        initial={{ opacity: 0, rotateX: 20, y: 100, scale: 0.9 }}
                        animate={{ opacity: 0.4, rotateX: 10, y: 0, scale: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        style={{ transformStyle: "preserve-3d" }}
                        className="relative w-full max-w-4xl opacity-50 blur-[2px] mask-image-linear-gradient(to bottom, black 50%, transparent 100%)"
                    >
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent-dim)] to-transparent opacity-20 blur-[120px] -z-10" />

                        {/* Mock UI Main Frame */}
                        <div className="bg-[#0A0A0A] rounded-xl border border-white/5 shadow-2xl overflow-hidden ring-1 ring-white/5 mx-auto max-w-4xl rotate-x-12">
                            {/* Window Config Bar */}
                            <div className="h-10 border-b border-white/5 bg-white/[0.02] flex items-center px-4 gap-2">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#FF5F57] opacity-50" />
                                    <div className="w-3 h-3 rounded-full bg-[#FEBC2E] opacity-50" />
                                    <div className="w-3 h-3 rounded-full bg-[#28C840] opacity-50" />
                                </div>
                            </div>

                            {/* Content Grid */}
                            <div className="grid md:grid-cols-12 gap-0 h-[600px] bg-[#0A0A0A]">
                                {/* Sidebar */}
                                <div className="md:col-span-3 border-r border-white/5 p-4 hidden md:flex flex-col gap-2">
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                        <div key={i} className="h-8 rounded-md bg-white/[0.03] w-full" />
                                    ))}
                                </div>
                                {/* Main Area */}
                                <div className="md:col-span-9 p-6">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="h-8 w-32 bg-white/[0.05] rounded-md" />
                                        <div className="flex gap-2">
                                            <div className="h-8 w-8 rounded-full bg-white/[0.05]" />
                                            <div className="h-8 w-24 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-md" />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="h-24 rounded-xl bg-white/[0.02] border border-white/5 w-full" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Content Layer */}
            <div className="container relative z-10 mx-auto px-6 max-w-6xl">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <Badge variant="accent" className="mb-8">
                            Done-for-you AI Automation
                        </Badge>
                    </motion.div>

                    {/* Title */}
                    <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-8">
                        <span className="block overflow-hidden">
                            <motion.span
                                initial={{ y: "100%", filter: "blur(20px)", opacity: 0 }}
                                animate={{ y: 0, filter: "blur(0px)", opacity: 1 }}
                                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                className="block text-gradient"
                            >
                                AI systems that work.
                            </motion.span>
                        </span>
                        <span className="block overflow-hidden">
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
                        className="text-xl md:text-2xl text-[var(--gray-300)] leading-relaxed max-w-2xl mx-auto mb-12"
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
                        <ButtonLink href="/pricing#contact" size="lg">
                            Contact Us
                        </ButtonLink>
                        <ButtonLink href="/features" variant="secondary" size="lg">
                            See Features
                        </ButtonLink>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
