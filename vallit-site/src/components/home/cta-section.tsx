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
        <section className="py-24 md:py-32 relative overflow-hidden bg-[#020202] min-h-[800px] flex items-center justify-center">
            {/* Background Animation Layer - Radial Grid */}
            <div className="absolute inset-0 z-0">
                <RadialCircuitGrid isActive={isHovered} />
            </div>

            <div className="container mx-auto px-6 max-w-5xl relative z-10 flex flex-col items-center justify-center">

                {/* THE "CORE" - Sci-Fi Reactor Design */}
                <div
                    className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] flex items-center justify-center mb-16 select-none"
                    onMouseMove={handleMouseMove}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* 1. Outer Tech Ring (Static) */}
                    <div className="absolute inset-0 rounded-full border border-white/5 bg-[#050505]/80 backdrop-blur-sm" />

                    {/* 2. Rotating Dash Ring */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-[10%] rounded-full border border-dashed border-white/10 opacity-30"
                    />
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-[15%] rounded-full border border-dotted border-[var(--accent)]/20 opacity-40"
                    />

                    {/* 3. Glowing Core Container */}
                    <div className="absolute inset-[25%] rounded-full bg-[#001a0f] border border-[var(--accent)]/30 shadow-[0_0_50px_rgba(34,197,94,0.1)] flex items-center justify-center overflow-hidden group">

                        {/* Inner Gradient Pulse */}
                        <motion.div
                            animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.1, 1] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--accent),transparent_70%)] opacity-20"
                        />

                        {/* Center Icon/Logo */}
                        <div className="relative z-10 w-16 h-16 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-2xl">
                            <svg className="w-8 h-8 text-[var(--accent)] drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                    </div>

                    {/* 4. Mouse-following Highlight */}
                    <motion.div
                        className="pointer-events-none absolute -inset-[20%] rounded-full opacity-0 transition duration-500 group-hover:opacity-100"
                        style={{
                            background: useMotionTemplate`
                                radial-gradient(
                                    300px circle at ${mouseX}px ${mouseY}px,
                                    rgba(34, 197, 94, 0.15),
                                    transparent 80%
                                )
                            `,
                        }}
                    />
                </div>

                {/* Text Content - Floating below */}
                <div className="text-center relative z-20 max-w-2xl bg-black/40 backdrop-blur-md p-8 rounded-3xl border border-white/5 shadow-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight drop-shadow-xl">
                            Ready for AI that <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] via-emerald-200 to-[var(--accent)] animate-gradient-x">
                                actually works?
                            </span>
                        </h2>
                    </motion.div>

                    <ButtonLink href="/pricing#contact" size="lg" className="shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:shadow-[0_0_50px_rgba(34,197,94,0.5)] transition-shadow duration-500">
                        Start your journey
                    </ButtonLink>
                </div>
            </div>
        </section>
    );
}

function RadialCircuitGrid({ isActive }: { isActive: boolean }) {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none flex items-center justify-center">
            {/* Darker Grid Background */}
            <div className="absolute inset-0 bg-[#020202]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />

            <svg className="absolute w-[150%] h-[150%] animate-spin-slow-reverse" style={{ animationDuration: '60s' }} viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="radial-trace" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="transparent" />
                        <stop offset="50%" stopColor="var(--accent)" stopOpacity="1" />
                        <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                </defs>

                <RadialTraces isActive={isActive} count={12} />
            </svg>
        </div>
    )
}

function RadialTraces({ isActive, count }: { isActive: boolean, count: number }) {
    // Generate radial paths radiating FROM center outwards (or inwards)
    // Center of viewBox is 500, 500

    // Core logical radius in SVG units: ~170 (slightly overlapping 400px width visual element on desktop)
    const innerR = 170;
    const outerR = 600;

    const paths = Array.from({ length: count }).map((_, i) => {
        const angleDeg = (i * (360 / count)) + (i % 2 * 10); // Offset slightly
        const angleRad = (angleDeg * Math.PI) / 180;

        // Use consistent start radius
        const startX = 500 + Math.cos(angleRad) * innerR;
        const startY = 500 + Math.sin(angleRad) * innerR;

        // Kink further out to ensure clean exit from core
        const kinkR = 350 + (Math.random() * 50);
        const kinkX = 500 + Math.cos(angleRad + (i % 2 ? 0.05 : -0.05)) * kinkR;
        const kinkY = 500 + Math.sin(angleRad + (i % 2 ? 0.05 : -0.05)) * kinkR;

        const endX = 500 + Math.cos(angleRad) * outerR;
        const endY = 500 + Math.sin(angleRad) * outerR;

        const d = `M ${startX} ${startY} L ${kinkX} ${kinkY} L ${endX} ${endY}`;

        return { id: i, d };
    });

    return (
        <g>
            {paths.map((p) => (
                <g key={p.id}>
                    {/* Connection Dot at Core Interface */}
                    <circle cx={p.d.split(' ')[1]} cy={p.d.split(' ')[2]} r="3" fill={isActive ? "var(--accent)" : "rgba(255,255,255,0.15)"} className="transition-colors duration-500" />

                    {/* Base Path */}
                    <path
                        d={p.d}
                        fill="none"
                        stroke="rgba(255,255,255,0.03)"
                        strokeWidth="1"
                    />

                    {/* Active Packet */}
                    <motion.path
                        d={p.d}
                        fill="none"
                        stroke="url(#radial-trace)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{
                            pathLength: [0, 0.4, 0],
                            opacity: [0, 1, 0],
                            pathOffset: [0, 1]
                        }}
                        transition={{
                            duration: 1.5 + Math.random(),
                            repeat: Infinity,
                            ease: "linear",
                            delay: Math.random() * 2
                        }}
                    />
                </g>
            ))}
        </g>
    );
}
