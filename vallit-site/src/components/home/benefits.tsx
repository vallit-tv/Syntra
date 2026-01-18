"use client";

import { SectionHeader } from "@/components/ui/section";
import { motion } from "framer-motion";
import {
    MessageSquare,
    Calendar as CalendarIcon,
    Workflow,
    ShieldCheck,
    Blocks,
    Zap,
    CheckCircle2,
    Clock,
    MoreHorizontal
} from "lucide-react";
import React from "react";

import { PremiumBackground } from "@/components/ui/premium-background";

export function Benefits() {
    return (
        <section className="py-24 md:py-32 relative overflow-hidden">
            <PremiumBackground />
            <div className="container mx-auto px-6 max-w-6xl relative z-10">
                <SectionHeader
                    badge="Why Kian"
                    title="Automation that actually works"
                    subtitle="No drag-and-drop builders. No endless configuration. Just AI systems that understand your business and get work done."
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[420px]">
                    {/* Card 1: Intelligent Support (Span 2) */}
                    <BentoCard
                        className="md:col-span-2"
                        title="Intelligent Support"
                        description="Kian answers questions in real-time, drawing from your knowledge base. 24/7 availability."
                        icon={MessageSquare}
                        visual={<SupportUI />}
                    />

                    {/* Card 2: Smart Scheduling (Span 1) */}
                    <BentoCard
                        title="Smart Scheduling"
                        description="Coordinates meetings automatically with your availability rules."
                        icon={CalendarIcon}
                        visual={<CalendarUI />}
                    />

                    {/* Card 3: Workflow Automation (Span 1) */}
                    <BentoCard
                        title="Workflow Automation"
                        description="Executes complex multi-step actions across your stack."
                        icon={Workflow}
                        visual={<WorkflowUI />}
                    />

                    {/* Card 4: Deep Integrations (Span 2) */}
                    <BentoCard
                        className="md:col-span-2"
                        title="Deep Integrations"
                        description="Works with Slack, Google Workspace, Notion, HubSpot, and your internal APIs."
                        icon={Blocks}
                        visual={<IntegrationsUI />}
                    />

                    {/* Card 5: Human-in-the-Loop (Span 1) */}
                    <BentoCard
                        title="Human-in-the-Loop"
                        description="Seamless escalation to human verification when needed."
                        icon={ShieldCheck}
                        visual={<HumanLoopUI />}
                    />

                    {/* Card 6: Managed Delivery (Span 2) */}
                    <BentoCard
                        className="md:col-span-2"
                        title="Managed Delivery"
                        description="We build, deploy, and maintain your AI infrastructure."
                        icon={Zap}
                        visual={<ManagedUI />}
                    />
                </div>
            </div>
        </section>
    );
}

function BentoCard({
    className,
    title,
    description,
    icon: Icon,
    visual,
}: {
    className?: string;
    title: string;
    description: string;
    icon: any;
    visual: React.ReactNode;
}) {
    return (
        <div
            className={`group relative overflow-hidden rounded-3xl bg-[#0A0A0A] border border-white/10 hover:border-white/20 transition-all duration-300 shadow-2xl ${className}`}
        >
            {/* Visual Area */}
            <div className="absolute inset-x-0 top-0 h-[55%] flex items-center justify-center overflow-hidden bg-[#0A0A0A]">
                {/* Inner lighting effect - simplified */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
                <div className="relative w-full h-full p-8 md:p-10 flex items-center justify-center">
                    {visual}
                </div>
            </div>

            {/* Content */}
            <div className="absolute inset-x-0 bottom-0 z-20 p-8 flex flex-col justify-end bg-[#0A0A0A] border-t border-white/5 h-[45%]">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-[#888] group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-lg font-medium text-white tracking-tight">{title}</h3>
                </div>
                <p className="text-[15px] text-[#666] group-hover:text-[#888] transition-colors leading-relaxed pl-11 max-w-lg">
                    {description}
                </p>
            </div>
        </div>
    );
}

// --- PREMIUM VISUALS ---

function SupportUI() {
    return (
        <div className="w-full max-w-[280px] bg-[#0A0A0A] rounded-xl border border-white/[0.08] shadow-2xl overflow-hidden relative font-sans transform group-hover:scale-105 transition-transform duration-500">
            {/* Header */}
            <div className="h-9 border-b border-white/[0.06] flex items-center px-4 bg-white/[0.01]">
                <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#2B2B2B]" />
                    <div className="w-2 h-2 rounded-full bg-[#2B2B2B]" />
                    <div className="w-2 h-2 rounded-full bg-[#2B2B2B]" />
                </div>
                <div className="ml-auto text-[9px] uppercase tracking-wider text-gray-600 font-medium">Support Agent</div>
            </div>

            {/* Chat Area */}
            <div className="p-4 space-y-3 text-[12px] h-[160px] relative">
                {/* Message 1 */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                >
                    <div className="w-5 h-5 rounded-full bg-white/10 flex-shrink-0" />
                    <div className="bg-[#1A1A1A] border border-white/[0.06] px-3 py-2 rounded-2xl rounded-tl-sm text-gray-300 max-w-[200px]">
                        Can you verify deployment?
                    </div>
                </motion.div>

                {/* Message 2 (Kian) */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex gap-3 flex-row-reverse"
                >
                    <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center flex-shrink-0 text-[9px] text-[var(--accent)] font-bold">K</div>
                    <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 px-3 py-2 rounded-2xl rounded-tr-sm text-[var(--accent)] max-w-[200px]">
                        Production v2.4.0 is live.
                        <div className="mt-1.5 flex items-center gap-1.5 opacity-70">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span className="text-[9px]">Verified</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

function CalendarUI() {
    return (
        <div className="w-full max-w-[240px] bg-[#0A0A0A] rounded-xl border border-white/[0.08] shadow-2xl relative overflow-hidden font-sans transform group-hover:scale-105 transition-transform duration-500">
            {/* Calendar Header */}
            <div className="px-3 py-2 border-b border-white/[0.06] flex justify-between items-center bg-white/[0.01]">
                <span className="text-[10px] font-medium text-white">October</span>
                <div className="flex gap-1.5 text-[8px] text-gray-500">
                    <span className="text-white">Day</span>
                    <span>Week</span>
                    <span>Month</span>
                </div>
            </div>

            {/* Grid */}
            <div className="relative h-[140px] bg-[#050505]">
                {/* Time Lines */}
                {[9, 10, 11, 12].map((t, i) => (
                    <div key={t} className="absolute w-full border-b border-white/[0.03] flex items-center px-3" style={{ top: `${i * 33}%` }}>
                        <span className="text-[8px] text-gray-700 font-mono -mt-[20%]">{t}:00</span>
                    </div>
                ))}

                {/* Current Time Line */}
                <div className="absolute top-[45%] w-full h-px bg-red-500/50 z-20 flex items-center">
                    <div className="w-1 h-1 rounded-full bg-red-500 -ml-0.5" />
                </div>

                {/* Event Block */}
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    whileInView={{ height: 60, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="absolute top-[35%] left-[20%] right-3 bg-[var(--accent)]/10 border-l-2 border-[var(--accent)] rounded-r-sm px-2 py-1.5 z-10"
                >
                    <div className="flex justify-between items-start">
                        <span className="text-[9px] font-medium text-[var(--accent)]">Client Demo</span>
                        <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center">
                            <Clock className="w-1.5 h-1.5 text-[var(--accent)]" />
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

function WorkflowUI() {
    return (
        <div className="w-full h-full flex items-center justify-center relative">
            {/* SVG Graph */}
            <svg width="300" height="150" viewBox="0 0 300 150">
                {/* Definitions */}
                <defs>
                    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
                        <stop offset="50%" stopColor="rgba(255,255,255,0.2)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
                    </linearGradient>
                </defs>

                {/* Connection Paths */}
                <path d="M50 75 L110 75" stroke="url(#lineGrad)" strokeWidth="1" />
                <path d="M150 75 L210 50" stroke="url(#lineGrad)" strokeWidth="1" />
                <path d="M150 75 L210 100" stroke="url(#lineGrad)" strokeWidth="1" />

                {/* Nodes */}
                {/* Trigger */}
                <g transform="translate(30, 55)">
                    <rect width="40" height="40" rx="8" fill="#0A0A0A" stroke="rgba(255,255,255,0.1)" />
                    <path d="M12 20 L28 20" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
                    <path d="M20 12 L20 28" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
                </g>

                {/* Process */}
                <g transform="translate(110, 55)">
                    <rect width="40" height="40" rx="8" fill="#0A0A0A" stroke="rgba(0,212,170,0.5)" />
                    <Zap x="10" y="10" width="20" height="20" className="text-[var(--accent)]" />
                </g>

                {/* End 1 */}
                <g transform="translate(210, 30)">
                    <rect width="40" height="40" rx="8" fill="#0A0A0A" stroke="rgba(255,255,255,0.1)" />
                </g>

                {/* End 2 */}
                <g transform="translate(210, 80)">
                    <rect width="40" height="40" rx="8" fill="#0A0A0A" stroke="rgba(255,255,255,0.1)" />
                </g>

                {/* Data Packet Animation */}
                <circle r="3" fill="var(--accent)">
                    <animateMotion
                        dur="2s"
                        repeatCount="indefinite"
                        path="M50 75 L110 75"
                    />
                </circle>
            </svg>
        </div>
    )
}

function IntegrationsUI() {
    return (
        <div className="w-full flex items-center justify-center p-6 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="grid grid-cols-4 gap-4 md:gap-8 opacity-70">
                {['Slack', 'Notion', 'Google', 'HubSpot'].map((n, i) => (
                    <motion.div
                        key={n}
                        className="w-14 h-14 rounded-2xl bg-[#0A0A0A] border border-white/[0.08] flex items-center justify-center shadow-lg group-hover:border-[var(--accent)]/30 group-hover:bg-[var(--accent)]/5 transition-all"
                        whileHover={{ y: -4, scale: 1.05 }}
                    >
                        <div className="w-6 h-6 bg-white/20 rounded-md" />
                        {/* In a real scenario, use actual SVG logos here */}
                    </motion.div>
                ))}
            </div>

            {/* Connecting Lines Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <svg className="w-full h-full">
                    <path d="M100 80 Q 200 150 500 80" fill="none" stroke="url(#lineGrad)" strokeWidth="1" strokeDasharray="4 4" />
                </svg>
            </div>
        </div>
    )
}

function HumanLoopUI() {
    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="relative w-[280px] bg-[#0A0A0A] border border-white/[0.08] rounded-xl p-4 shadow-2xl">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-800 border border-white/10 flex-shrink-0" />
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[11px] font-medium text-white">Review Request</span>
                            <span className="text-[9px] text-gray-500">2m ago</span>
                        </div>
                        <p className="text-[11px] text-gray-400 mb-3 leading-relaxed">
                            Confidence score <span className="text-red-400">low (45%)</span>. Please review the drafted response before sending.
                        </p>
                        <div className="flex gap-2">
                            <button className="flex-1 bg-white/[0.05] hover:bg-white/[0.1] border border-white/5 py-1.5 rounded text-[10px] text-white transition-colors">Edit</button>
                            <button className="flex-1 bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 border border-[var(--accent)]/20 py-1.5 rounded text-[10px] text-[var(--accent)] transition-colors">Approve</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function ManagedUI() {
    return (
        <div className="w-full h-full flex items-center justify-center p-6">
            <div className="w-full max-w-[400px] bg-[#050505] rounded-xl border border-white/[0.08] p-4 font-mono text-[10px] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-6 bg-white/[0.03] border-b border-white/[0.05] flex items-center px-2 gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                </div>

                <div className="mt-6 space-y-1.5 opacity-80">
                    <div className="flex text-gray-400">
                        <span className="text-gray-600 mr-2">1</span>
                        <span>import <span className="text-purple-400">{"{ Kian }"}</span> from <span className="text-green-400">'@syntra/core'</span>;</span>
                    </div>
                    <div className="flex text-gray-400">
                        <span className="text-gray-600 mr-2">2</span>
                        <span></span>
                    </div>
                    <div className="flex text-gray-400">
                        <span className="text-gray-600 mr-2">3</span>
                        <span>const system = new Kian.System(<span className="text-blue-400">{"{ mode: 'prod' }"}</span>);</span>
                    </div>
                    <div className="flex text-gray-400">
                        <span className="text-gray-600 mr-2">4</span>
                        <span>await system.deploy();</span>
                    </div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1 }}
                        className="flex text-[var(--accent)] mt-2 border-t border-white/5 pt-2"
                    >
                        <span className="mr-2">➜</span>
                        <span>Deployment successful (143ms)</span>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
