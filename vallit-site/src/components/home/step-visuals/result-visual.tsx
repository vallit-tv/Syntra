"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, User } from "lucide-react";

interface ResultVisualProps {
    isActive: boolean;
}

export function ResultVisual({ isActive }: ResultVisualProps) {
    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <motion.div
                className="relative bg-[#0F0F0F] rounded-xl border border-white/10 w-[300px] overflow-hidden shadow-2xl"
                initial={{ scale: 0.95, opacity: 0.5 }}
                animate={isActive ? { scale: 1, opacity: 1 } : { scale: 0.95, opacity: 0.5 }}
                transition={{ duration: 0.5 }}
            >
                {/* Status Bar */}
                <div className="bg-[var(--accent)]/10 border-b border-[var(--accent)]/10 p-4 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[var(--accent)]" />
                    <span className="text-[var(--accent)] font-medium text-sm">Action Completed</span>
                </div>

                {/* Content */}
                <div className="p-6">
                    <h3 className="text-white font-semibold text-lg mb-1">Product Demo</h3>
                    <p className="text-gray-400 text-sm mb-6">Invitation sent to 3 participants</p>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-gray-300 bg-white/5 p-3 rounded-lg border border-white/5">
                            <Clock className="w-4 h-4 text-neutral-500" />
                            <span>Thus, Oct 24 • 14:00</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-300 bg-white/5 p-3 rounded-lg border border-white/5">
                            <User className="w-4 h-4 text-neutral-500" />
                            <span>Video Call (Google Meet)</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
