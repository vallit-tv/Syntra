"use client";

import { motion } from "framer-motion";
import { Check, Terminal } from "lucide-react";

interface ActionVisualProps {
    isActive: boolean;
}

export function ActionVisual({ isActive }: ActionVisualProps) {
    const actions = [
        "Checking calendar availability",
        "Analyzing team priorities",
        "Selecting optimal time slots",
        "Preparing calendar invites",
    ];

    return (
        <div className="relative w-full h-full flex items-center justify-center font-mono text-sm">
            <motion.div
                className="w-[340px] bg-[#0A0A0A] rounded-lg border border-white/10 overflow-hidden shadow-2xl"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                {/* Minimal Header */}
                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5 text-neutral-500" />
                        <span className="text-xs text-neutral-500">kian_exec</span>
                    </div>
                    <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-white/10" />
                        <div className="w-2 h-2 rounded-full bg-white/10" />
                    </div>
                </div>

                {/* List Body */}
                <div className="p-6 space-y-4">
                    {actions.map((text, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-4 flex justify-center">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0 }}
                                    transition={{ delay: i * 0.8 + 0.5 }}
                                >
                                    <Check className="w-3.5 h-3.5 text-[var(--accent)]" />
                                </motion.div>
                            </div>
                            <motion.div
                                initial={{ opacity: 0.3 }}
                                animate={isActive ? { opacity: 1 } : { opacity: 0.3 }}
                                transition={{ delay: i * 0.8 }}
                                className="text-gray-300 text-xs tracking-wide"
                            >
                                {text}
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={isActive ? { opacity: [0, 1, 0] } : { opacity: 0 }}
                                    transition={{ duration: 0.8, delay: i * 0.8 }}
                                >...</motion.span>
                            </motion.div>
                        </div>
                    ))}
                </div>

                {/* Progress Line */}
                <motion.div
                    className="h-0.5 bg-[var(--accent)]"
                    initial={{ width: 0 }}
                    animate={isActive ? { width: "100%" } : { width: 0 }}
                    transition={{ duration: 4, ease: "linear" }}
                />
            </motion.div>
        </div>
    );
}
