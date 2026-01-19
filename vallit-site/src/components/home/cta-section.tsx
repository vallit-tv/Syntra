"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { MouseEvent, useState } from "react";
import { ButtonLink } from "@/components/ui/button";

export function CTASection() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    const [isHovered, setIsHovered] = useState(false);

    return (
        <section className="py-24 md:py-32 relative overflow-hidden">
            {/* Background Animation Layer */}
            <div className="absolute inset-0 z-0">
                <AnimatedGrid isActive={isHovered} />
            </div>

            <div className="container mx-auto px-6 max-w-5xl relative z-10">
                <div
                    className="group relative bg-[#0A0A0A] rounded-3xl border border-white/10 p-12 md:p-24 text-center overflow-hidden"
                    onMouseMove={handleMouseMove}
                >
                    {/* Spotlight Effect */}
                    <motion.div
                        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
                        style={{
                            background: useMotionTemplate`
                        radial-gradient(
                        650px circle at ${mouseX}px ${mouseY}px,
                        rgba(34, 197, 94, 0.1),
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
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
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

function AnimatedGrid({ isActive }: { isActive: boolean }) {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
            {/* Base grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />

            {/* CPU Cores connecting to center */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="transparent" />
                        <stop offset="50%" stopColor="var(--accent)" />
                        <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                </defs>

                {/* Left Side Connections */}
                {[20, 40, 60, 80].map((y, i) => (
                    <g key={`left-${i}`}>
                        {/* Static Path */}
                        <path
                            d={`M 0 ${y}% C 30% ${y}%, 30% 50%, 50% 50%`}
                            fill="none"
                            stroke="rgba(255,255,255,0.08)"
                            strokeWidth="1.5"
                        />
                        {/* Animated Pulse */}
                        <motion.path
                            d={`M 0 ${y}% C 30% ${y}%, 30% 50%, 50% 50%`}
                            fill="none"
                            stroke="url(#line-gradient)"
                            strokeWidth="3"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{
                                pathLength: 1,
                                opacity: [0, 1, 0],
                                transition: {
                                    duration: isActive ? 0.5 : 2, // Faster when active
                                    repeat: Infinity,
                                    ease: "linear",
                                    delay: i * (isActive ? 0.1 : 0.5),
                                    repeatDelay: isActive ? 0.1 : 1
                                }
                            }}
                        />
                    </g>
                ))}

                {/* Right Side Connections */}
                {[20, 40, 60, 80].map((y, i) => (
                    <g key={`right-${i}`}>
                        <path
                            d={`M 100% ${y}% C 70% ${y}%, 70% 50%, 50% 50%`}
                            fill="none"
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="1"
                        />
                        <motion.path
                            d={`M 100% ${y}% C 70% ${y}%, 70% 50%, 50% 50%`}
                            fill="none"
                            stroke="url(#line-gradient)"
                            strokeWidth="2"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{
                                pathLength: 1,
                                opacity: [0, 1, 0],
                                transition: {
                                    duration: isActive ? 0.5 : 2, // Faster when active
                                    repeat: Infinity,
                                    ease: "linear",
                                    delay: i * (isActive ? 0.1 : 0.5) + 0.5,
                                    repeatDelay: isActive ? 0.1 : 1
                                }
                            }}
                        />
                    </g>
                ))}
            </svg>

            {/* Central Pulse Effect behind button */}
            <motion.div
                animate={{
                    scale: isActive ? [1, 1.2, 1] : [1, 1.1, 1],
                    opacity: isActive ? 0.8 : 0.3
                }}
                transition={{
                    duration: isActive ? 1 : 2,
                    repeat: Infinity
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-[var(--accent)]/10 rounded-full blur-3xl"
            />
        </div>
    )
}
