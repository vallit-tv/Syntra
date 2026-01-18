"use client";

import React, { useState, useEffect, useRef } from "react";

interface Step {
    id: string;
    title: string;
    description: string;
    visual: React.ReactNode;
}

const steps: Step[] = [
    {
        id: "input",
        title: "Input",
        description:
            "Customer sends a message via chat, email, or form. Kian receives and processes it instantly.",
        visual: (
            <div className="relative w-full h-full flex items-center justify-center">
                <div className="w-64 bg-[rgba(255,255,255,0.03)] rounded-2xl border border-[rgba(255,255,255,0.08)] p-4 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--accent-dim)] flex items-center justify-center">
                            <span className="text-[var(--accent)] text-xs font-bold">C</span>
                        </div>
                        <div className="flex-1">
                            <div className="h-2 w-20 bg-[rgba(255,255,255,0.1)] rounded" />
                        </div>
                    </div>
                    <div className="bg-[rgba(255,255,255,0.05)] rounded-xl p-3 ml-11">
                        <p className="text-sm text-[var(--gray-200)]">
                            Hi, I need to schedule a meeting with your sales team.
                        </p>
                    </div>
                    <div className="flex justify-center">
                        <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-ping" />
                    </div>
                </div>
            </div>
        ),
    },
    {
        id: "context",
        title: "Context",
        description:
            "Kian understands your business. It accesses your knowledge base, processes, and current state to form context.",
        visual: (
            <div className="relative w-full h-full flex items-center justify-center">
                <div className="grid grid-cols-2 gap-3 max-w-xs">
                    {["Products", "Policies", "Calendar", "CRM"].map((item, i) => (
                        <div
                            key={item}
                            className="bg-[rgba(255,255,255,0.03)] rounded-xl border border-[rgba(255,255,255,0.08)] p-4 text-center"
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            <div className="w-10 h-10 rounded-lg bg-[var(--accent-dim)] mx-auto mb-2 flex items-center justify-center">
                                <span className="text-[var(--accent)] text-lg">
                                    {["📦", "📋", "📅", "👥"][i]}
                                </span>
                            </div>
                            <p className="text-xs text-[var(--gray-300)]">{item}</p>
                        </div>
                    ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-20 h-20 rounded-full border-2 border-[var(--accent)] border-dashed animate-spin opacity-20" style={{ animationDuration: "10s" }} />
                </div>
            </div>
        ),
    },
    {
        id: "action",
        title: "Action",
        description:
            "Kian takes action. It schedules meetings, sends responses, updates systems, or escalates to humans when needed.",
        visual: (
            <div className="relative w-full h-full flex items-center justify-center">
                <div className="space-y-3 w-64">
                    {[
                        { icon: "✓", text: "Checking calendar availability...", done: true },
                        { icon: "✓", text: "Finding optimal time slot...", done: true },
                        { icon: "→", text: "Sending calendar invite...", done: false },
                    ].map((item, i) => (
                        <div
                            key={i}
                            className={`flex items-center gap-3 p-3 rounded-xl border ${item.done
                                    ? "bg-[rgba(0,212,170,0.05)] border-[var(--accent-dim)]"
                                    : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]"
                                }`}
                        >
                            <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${item.done
                                        ? "bg-[var(--accent)] text-[var(--bg-body)]"
                                        : "bg-[rgba(255,255,255,0.1)] text-[var(--gray-400)]"
                                    }`}
                            >
                                {item.icon}
                            </span>
                            <span className={`text-sm ${item.done ? "text-[var(--gray-200)]" : "text-[var(--gray-400)]"}`}>
                                {item.text}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        ),
    },
    {
        id: "result",
        title: "Result",
        description:
            "Customer receives a response. Meeting is booked. Everything is logged and synced with your tools.",
        visual: (
            <div className="relative w-full h-full flex items-center justify-center">
                <div className="w-72 bg-[rgba(255,255,255,0.03)] rounded-2xl border border-[rgba(255,255,255,0.08)] overflow-hidden">
                    <div className="bg-[var(--accent-dim)] px-4 py-3 border-b border-[rgba(255,255,255,0.08)]">
                        <p className="text-sm font-medium text-[var(--accent)]">Meeting Confirmed</p>
                    </div>
                    <div className="p-4 space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">📅</span>
                            <div>
                                <p className="text-sm text-white font-medium">Sales Demo Call</p>
                                <p className="text-xs text-[var(--gray-400)]">Tomorrow at 2:00 PM</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[var(--gray-400)]">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            Synced to Google Calendar
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[var(--gray-400)]">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            Logged in CRM
                        </div>
                    </div>
                </div>
            </div>
        ),
    },
];

export function StickyStepper() {
    const [activeStep, setActiveStep] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = stepRefs.current.findIndex((ref) => ref === entry.target);
                        if (index !== -1) {
                            setActiveStep(index);
                        }
                    }
                });
            },
            {
                threshold: 0.5,
                rootMargin: "-40% 0px -40% 0px",
            }
        );

        stepRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={containerRef} className="relative">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16">
                {/* Left: Step titles (sticky on desktop) */}
                <div className="hidden lg:block">
                    <div className="sticky top-32 space-y-2">
                        {steps.map((step, index) => (
                            <button
                                key={step.id}
                                onClick={() => {
                                    stepRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" });
                                }}
                                className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${activeStep === index
                                        ? "bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)]"
                                        : "hover:bg-[rgba(255,255,255,0.03)]"
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <span
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${activeStep === index
                                                ? "bg-[var(--accent)] text-[var(--bg-body)]"
                                                : "bg-[rgba(255,255,255,0.1)] text-[var(--gray-400)]"
                                            }`}
                                    >
                                        {index + 1}
                                    </span>
                                    <span
                                        className={`text-lg font-medium transition-colors ${activeStep === index ? "text-white" : "text-[var(--gray-400)]"
                                            }`}
                                    >
                                        {step.title}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Step content */}
                <div className="space-y-24 lg:space-y-32">
                    {steps.map((step, index) => (
                        <div
                            key={step.id}
                            ref={(el) => {
                                stepRefs.current[index] = el;
                            }}
                            className="scroll-mt-32"
                        >
                            {/* Mobile step indicator */}
                            <div className="lg:hidden flex items-center gap-3 mb-6">
                                <span className="w-8 h-8 rounded-full bg-[var(--accent)] text-[var(--bg-body)] flex items-center justify-center text-sm font-medium">
                                    {index + 1}
                                </span>
                                <span className="text-xl font-semibold text-white">{step.title}</span>
                            </div>

                            {/* Visual */}
                            <div className="h-64 md:h-80 bg-[rgba(255,255,255,0.02)] rounded-2xl border border-[rgba(255,255,255,0.06)] mb-6 overflow-hidden">
                                {step.visual}
                            </div>

                            {/* Description */}
                            <p className="text-[var(--gray-300)] text-lg leading-relaxed">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
