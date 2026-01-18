"use client";

import { motion } from "framer-motion";
import { User, Sparkles } from "lucide-react";

interface InputVisualProps {
    isActive: boolean;
}

export function InputVisual({ isActive }: InputVisualProps) {
    return (
        <div className="relative w-full h-full flex items-center justify-center bg-transparent">
            {/* Clean Interface Container */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-[320px] bg-[#0F0F0F] rounded-xl border border-white/10 p-6 shadow-2xl"
            >
                {/* User Message */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0.3, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-start gap-4 mb-6"
                >
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-neutral-400" />
                    </div>
                    <div className="bg-white/5 rounded-2xl rounded-tl-none p-4 border border-white/5">
                        <p className="text-sm text-gray-300 leading-relaxed">
                            Find a time for the product demo next week.
                        </p>
                    </div>
                </motion.div>

                {/* Kian Processing - Minimalist */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={isActive ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-start gap-4 justify-end"
                >
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex gap-1">
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={i}
                                        className="w-1 h-1 rounded-full bg-[var(--accent)]"
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                                    />
                                ))}
                            </div>
                            <span className="text-[10px] uppercase tracking-wider text-[var(--accent)] font-medium">Processing</span>
                        </div>

                        <div className="h-0.5 w-24 bg-[var(--accent)]/20 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-[var(--accent)]"
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                            />
                        </div>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center shrink-0">
                        <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
