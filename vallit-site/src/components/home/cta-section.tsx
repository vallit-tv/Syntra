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
            {/* Darker Grid Background */}
            <div className="absolute inset-0 bg-[#050505] opacity-80" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />

            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="trace-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="transparent" />
                        <stop offset="50%" stopColor="var(--accent)" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                </defs>

                <CircuitPaths isActive={isActive} side="left" count={12} />
                <CircuitPaths isActive={isActive} side="right" count={12} />
            </svg>

            {/* Central Core Glow */}
            <motion.div
                animate={{
                    scale: isActive ? [1, 1.5, 1] : [1, 1.1, 1],
                    opacity: isActive ? 0.6 : 0.2,
                }}
                transition={{
                    duration: isActive ? 0.8 : 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[var(--accent)]/20 rounded-full blur-[80px] mix-blend-screen"
            />
        </div>
    )
}

function CircuitPaths({ isActive, side, count }: { isActive: boolean, side: "left" | "right", count: number }) {
    const paths = Array.from({ length: count }).map((_, i) => {
        // Calculate vertical positions
        const yStart = 10 + (i * (80 / count)); // Spread from 10% to 90%
        const yEnd = 45 + (i * (10 / count));   // Converge to center 45-55%

        // Manhattan routing points
        const xStart = side === "left" ? "0%" : "100%";
        const xEnd = "50%";
        const midX = side === "left" ? "30%" : "70%";

        // Path logic: Start -> Horizontal to Mid -> Vertical to EndY -> Horizontal to Center
        // Using straightforward L-shapes for "circuit" look
        const pathData = side === "left"
            ? `M 0 ${yStart}% H ${15 + (i % 3) * 5}% V ${yEnd}% H 50%`
            : `M 100% ${yStart}% H ${85 - (i % 3) * 5}% V ${yEnd}% H 50%`;

        return { id: i, d: pathData, delay: i * 0.1 };
    });

    return (
        <g>
            {paths.map((p) => (
                <g key={p.id}>
                    {/* Background Trace */}
                    <path
                        d={p.d}
                        fill="none"
                        stroke="rgba(255,255,255,0.03)"
                        strokeWidth="1"
                        className="transition-all duration-500"
                        style={{ stroke: isActive ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)" }}
                    />

                    {/* Active Data Packet */}
                    <motion.path
                        d={p.d}
                        fill="none"
                        stroke="url(#trace-gradient)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{
                            pathLength: [0, 0.3, 0], // Moving dash effect
                            opacity: [0, 1, 0],
                            pathOffset: [0, 1]       // Move along path
                        }}
                        transition={{
                            duration: isActive ? 1 + Math.random() : 3 + Math.random() * 2,
                            repeat: Infinity,
                            ease: "linear",
                            delay: Math.random() * 2,
                            repeatDelay: isActive ? 0 : Math.random()
                        }}
                    />
                </g>
            ))}
        </g>
    );
}
