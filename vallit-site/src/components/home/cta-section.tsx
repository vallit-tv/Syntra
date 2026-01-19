"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { MouseEvent, useState } from "react";
import { ButtonLink } from "@/components/ui/button";

// ... imports
// (Keeping imports as they are usually fine, but I'll overwrite the whole file content to be safe and consistent with previous tool usage pattern, or just the component parts if possible.
// The replace_file_content tool requires *exact* match on TargetContent. The previous view showed the whole file. I will replace the component definitions.)

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
        <section className="py-32 md:py-48 relative overflow-hidden bg-[#030303]">
            {/* Background Animation Layer */}
            <div className="absolute inset-0 z-0">
                <AnimatedGrid isActive={isHovered} />
            </div>

            <div className="container mx-auto px-6 max-w-4xl relative z-10">
                {/* CPU Card Metaphor */}
                <div
                    className="group relative bg-[#0A0A0A] rounded-[2.5rem] border border-[#222] p-12 md:p-20 text-center overflow-hidden shadow-2xl"
                    onMouseMove={handleMouseMove}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* CPU Pins/Metallic Border Effect */}
                    <div className="absolute inset-0 rounded-[2.5rem] border-[3px] border-transparent bg-gradient-to-b from-[#333] to-[#111] [mask-image:linear-gradient(white,white)] -z-10 opacity-50" />

                    {/* Internal Inner Glow */}
                    <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.9)] rounded-[2.5rem] pointer-events-none" />

                    {/* Spotlight Effect */}
                    <motion.div
                        className="pointer-events-none absolute -inset-px rounded-[2.5rem] opacity-0 transition duration-300 group-hover:opacity-100"
                        style={{
                            background: useMotionTemplate`
                        radial-gradient(
                        600px circle at ${mouseX}px ${mouseY}px,
                        rgba(34, 197, 94, 0.08),
                        transparent 80%
                        )
                    `,
                        }}
                    />

                    {/* Circuit Pattern Overlay on Chip */}
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05] bg-center mask-image-[radial-gradient(ellipse_at_center,black,transparent)]" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20" />

                    <div className="relative z-10 flex flex-col items-center">
                        {/* Chip Branding / Logo placeholder */}
                        <div className="mb-8 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg">
                            <div className="w-12 h-12 bg-gradient-to-br from-[var(--accent)] to-emerald-800 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
                                Ready for AI that <br className="hidden md:block" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-200 animate-gradient-x">
                                    actually works?
                                </span>
                            </h2>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-lg md:text-xl text-[#888] max-w-xl mx-auto mb-10 leading-relaxed font-light"
                        >
                            Let&apos;s build automation that fits your business. <br />
                            No templates. No complex setup. Just results.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <ButtonLink href="/pricing#contact" size="lg" className="relative overflow-hidden group/btn px-12 py-6 text-lg rounded-xl shadow-[0_0_40px_-10px_rgba(34,197,94,0.3)] hover:shadow-[0_0_60px_-10px_rgba(34,197,94,0.5)] transition-shadow duration-500">
                                <span className="relative z-10 text-white font-medium">Start your journey</span>
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
            {/* Background Tech Mesh */}
            <div className="absolute inset-0 bg-[#020202] opacity-90" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px] opacity-30" />

            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="trace-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="transparent" />
                        <stop offset="50%" stopColor="var(--accent)" stopOpacity="1" />
                        <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                <CircuitPaths isActive={isActive} side="left" count={8} />
                <CircuitPaths isActive={isActive} side="right" count={8} />
            </svg>

            {/* Central Energy Field - Pulse */}
            <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[var(--accent)]/5 blur-[120px] rounded-full pointer-events-none"
                animate={{ opacity: isActive ? 0.4 : 0.1 }}
                transition={{ duration: 0.5 }}
            />
        </div>
    )
}

function CircuitPaths({ isActive, side, count }: { isActive: boolean, side: "left" | "right", count: number }) {
    // Generate paths that "plug into" the central area (approx width of container is 896px = 56rem)
    // Screen center is 50%. Container half-width is roughly 448px. 
    // On desktop (1000px+), 50% +/- 450px is roughly where the card edges are.
    // Let's assume the sticky-outy processing lines go from edges (0% / 100%) to around 30% / 70% to mock the visuals.

    const paths = Array.from({ length: count }).map((_, i) => {
        // Distribute start Y uniformly
        const yStart = 10 + (i * (80 / count)); // 10% to 90%

        // Distribute end Y focused towards the middle
        const yEnd = 30 + (i * (40 / count));   // 30% to 70%

        const isLeft = side === "left";

        // Path construction:
        // M StartX StartY
        // H MidX
        // V EndY
        // H EndX (The "Socket" entry)

        const startX = isLeft ? "0%" : "100%";
        const midX = isLeft ? "15%" : "85%";
        const socketX = isLeft ? "30%" : "70%"; // Connects to the side of the central card area (approx)

        const d = `M ${startX} ${yStart}% H ${midX} V ${yEnd}% H ${socketX}`;

        return { id: i, d };
    });

    return (
        <g filter="url(#glow)">
            {paths.map((p, i) => (
                <g key={p.id}>
                    {/* Shadow/Base Path */}
                    <path
                        d={p.d}
                        fill="none"
                        stroke="rgba(255,255,255,0.03)"
                        strokeWidth="1.5"
                    />

                    {/* Active Data Packet */}
                    <motion.path
                        d={p.d}
                        fill="none"
                        stroke="url(#trace-gradient)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{
                            pathLength: [0, 0.4, 0],
                            opacity: [0, 1, 0],
                            pathOffset: isArrowRight(side) ? [0, 1] : [1, 0] // Direction check
                        }}
                        transition={{
                            duration: isActive ? 0.8 + Math.random() * 0.5 : 2 + Math.random() * 2,
                            repeat: Infinity,
                            ease: "linear",
                            delay: Math.random() * 2,
                        }}
                    />

                    {/* Socket Connection Checkpoint (The plug) */}
                    <circle
                        cx={side === "left" ? "30%" : "70%"}
                        cy={`${30 + (i * (40 / count))}%`}
                        r="3"
                        fill={isActive ? "var(--accent)" : "rgba(255,255,255,0.1)"}
                        className="transition-colors duration-500"
                    />
                </g>
            ))}
        </g>
    );
}

function isArrowRight(side: string) {
    return side === "left"; // Flows left to right (0 -> 1)
}
