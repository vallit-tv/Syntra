"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { MouseEvent } from "react";
import { ButtonLink } from "@/components/ui/button";

export function CTASection() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <section className="py-24 md:py-32 relative overflow-hidden">
            {/* Background Animation Layer */}
            <div className="absolute inset-0 z-0">
                <AnimatedGrid />
            </div>

            <div className="container mx-auto px-6 max-w-5xl relative z-10">
                <div
                    className="group relative bg-[#050505] rounded-3xl border border-white/5 p-12 md:p-24 text-center overflow-hidden"
                    onMouseMove={handleMouseMove}
                >
                    {/* Spotlight Effect */}
                    <motion.div
                        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
                        style={{
                            background: useMotionTemplate`
                        radial-gradient(
                        650px circle at ${mouseX}px ${mouseY}px,
                        rgba(0, 212, 170, 0.1),
                        transparent 80%
                        )
                    `,
                        }}
                    />
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />

                    <div className="relative z-10 flex flex-col items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
                                Ready for AI that <br className="hidden md:block" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50">
                                    actually works?
                                </span>
                            </h2>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-lg md:text-xl text-[#888] max-w-xl mx-auto mb-10 leading-relaxed"
                        >
                            Let&apos;s build automation that fits your business. <br />
                            No templates. No complex setup. Just results.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <ButtonLink href="/pricing#contact" size="lg" className="relative overflow-hidden group/btn">
                                <span className="relative z-10">Start your journey</span>
                                <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform ease-in-out" />
                            </ButtonLink>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function AnimatedGrid() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
            <div className="absolute w-full h-full bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />

            {/* Moving horizontal lines */}
            {[10, 40, 70].map((top, i) => (
                <motion.div
                    key={i}
                    className="absolute h-px w-full bg-gradient-to-r from-transparent via-[var(--accent)]/50 to-transparent"
                    style={{ top: `${top}%` }}
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{
                        duration: 8 + i * 2,
                        repeat: Infinity,
                        ease: "linear",
                        delay: i * 2
                    }}
                />
            ))}
        </div>
    )
}
