"use client";

import { motion } from "framer-motion";
import { Database, Calendar, Mail, FileText, BrainCircuit } from "lucide-react";

interface ContextVisualProps {
    isActive: boolean;
}

export function ContextVisual({ isActive }: ContextVisualProps) {
    return (
        <div className="relative w-full h-full flex items-center justify-center bg-transparent select-none">

            {/* SVG Layer for Connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <defs>
                    <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
                        <stop offset="50%" stopColor="rgba(255,255,255,0.2)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
                    </linearGradient>
                </defs>

                {/* Connection Lines - Pushed further to edges (15% and 85%) */}
                <ConnectionLine x1="50%" y1="15%" x2="50%" y2="50%" isActive={isActive} delay={0} />
                <ConnectionLine x1="85%" y1="50%" x2="50%" y2="50%" isActive={isActive} delay={0.2} />
                <ConnectionLine x1="50%" y1="85%" x2="50%" y2="50%" isActive={isActive} delay={0.4} />
                <ConnectionLine x1="15%" y1="50%" x2="50%" y2="50%" isActive={isActive} delay={0.6} />
            </svg>

            {/* Central Knowledge Node */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={isActive ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0.5 }}
                    transition={{ duration: 0.5 }}
                    className="w-20 h-20 rounded-2xl bg-[#0F0F0F] border border-[var(--accent)]/30 
                        flex items-center justify-center shadow-[0_0_30px_-10px_rgba(0,212,170,0.3)]"
                >
                    <BrainCircuit className="w-9 h-9 text-[var(--accent)]" />

                    {/* Inner Pulse */}
                    <motion.div
                        animate={isActive ? { scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 rounded-2xl bg-[var(--accent)]/10"
                    />
                </motion.div>
            </div>

            {/* Satellite Nodes - Pushed to 15% / 85% */}

            {/* Top: Calendar */}
            <SatelliteNode
                icon={Calendar}
                label="Calendar"
                position="top-[15%] left-1/2 -translate-x-1/2 -translate-y-1/2"
                isActive={isActive}
                delay={0}
            />

            {/* Right: CRM */}
            <SatelliteNode
                icon={Database}
                label="CRM"
                position="top-1/2 left-[85%] -translate-x-1/2 -translate-y-1/2"
                isActive={isActive}
                delay={0.2}
            />

            {/* Bottom: Docs */}
            <SatelliteNode
                icon={FileText}
                label="Docs"
                position="top-[85%] left-1/2 -translate-x-1/2 -translate-y-1/2"
                isActive={isActive}
                delay={0.4}
            />

            {/* Left: Email */}
            <SatelliteNode
                icon={Mail}
                label="Email"
                position="top-1/2 left-[15%] -translate-x-1/2 -translate-y-1/2"
                isActive={isActive}
                delay={0.6}
            />

        </div>
    );
}

function ConnectionLine({ x1, y1, x2, y2, isActive, delay }: any) {
    return (
        <>
            {/* Base Line */}
            <line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="white"
                strokeOpacity="0.1"
                strokeWidth="1.5"
                strokeDasharray="4 4"
            />
            {/* Animated Packet */}
            {isActive && (
                <motion.circle
                    r="3"
                    fill="var(--accent)"
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: [0, 1, 0],
                        cx: [x1, x2],
                        cy: [y1, y2]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear",
                        delay: delay
                    }}
                />
            )}
        </>
    )
}

function SatelliteNode({ icon: Icon, label, position, isActive, delay }: any) {
    return (
        <motion.div
            className={`absolute ${position} z-10 flex flex-col items-center gap-2`} // reduced gap
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0.2, scale: 0.8 }}
            transition={{ delay, duration: 0.4 }}
        >
            <div className="w-12 h-12 rounded-xl bg-[#0A0A0A] border border-white/10 flex items-center justify-center shadow-lg group hover:border-white/20 transition-colors">
                <Icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            </div>
            <span className="text-[10px] font-medium tracking-wide text-gray-500 uppercase bg-[#050505] px-2 py-0.5 rounded border border-white/5">
                {label}
            </span>
        </motion.div>
    )
}
