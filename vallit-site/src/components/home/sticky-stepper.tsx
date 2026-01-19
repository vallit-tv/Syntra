"use client";

import React, { useState, useEffect, useRef } from "react";
import { InputVisual } from "./step-visuals/input-visual";
import { ContextVisual } from "./step-visuals/context-visual";
import { ActionVisual } from "./step-visuals/action-visual";
import { ResultVisual } from "./step-visuals/result-visual";

interface Step {
    id: string;
    title: string;
    description: string;
    VisualComponent: React.ComponentType<{ isActive: boolean }>;
}

const steps: Step[] = [
    {
        id: "input",
        title: "Input",
        description:
            "Customer sends a message via chat, email, or form. Kian receives and processes it instantly.",
        VisualComponent: InputVisual,
    },
    {
        id: "context",
        title: "Context",
        description:
            "Kian understands your business. It accesses your knowledge base, policies, and current state to form context.",
        VisualComponent: ContextVisual,
    },
    {
        id: "action",
        title: "Action",
        description:
            "Kian takes action. It schedules meetings, updates systems, or escalates to humans when needed.",
        VisualComponent: ActionVisual,
    },
    {
        id: "result",
        title: "Result",
        description:
            "Customer receives a response. Task is completed. Everything is logged and synced with your tools.",
        VisualComponent: ResultVisual,
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
                rootMargin: "-20% 0px -20% 0px",
            }
        );

        stepRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={containerRef} className="relative">
            <div className="lg:grid lg:grid-cols-2 lg:gap-20">
                {/* Left: Step titles (sticky on desktop) */}
                <div className="hidden lg:block h-full">
                    <div className="sticky top-40 space-y-2">
                        {steps.map((step, index) => (
                            <button
                                key={step.id}
                                onClick={() => {
                                    stepRefs.current[index]?.scrollIntoView({
                                        behavior: "smooth",
                                        block: "center",
                                    });
                                }}
                                className="group relative w-full text-left px-6 py-4 rounded-full transition-colors"
                            >
                                {/* Active Background Pill */}
                                {activeStep === index && (
                                    <div
                                        className="absolute inset-0 bg-white/10 border border-white/5 rounded-full backdrop-blur-sm transition-all duration-300"
                                    />
                                )}

                                <div className="relative flex items-center justify-between z-10">
                                    <span className={`text-lg font-medium transition-colors duration-300 ${activeStep === index ? "text-white" : "text-neutral-500 group-hover:text-neutral-300"}`}>
                                        {step.title}
                                    </span>
                                    {activeStep === index && (
                                        <div className="w-2 h-2 rounded-full bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]" />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Step content */}
                <div className="space-y-40 pb-40">
                    {steps.map((step, index) => (
                        <div
                            key={step.id}
                            ref={(el) => {
                                stepRefs.current[index] = el;
                            }}
                            className="scroll-mt-40"
                        >
                            {/* Mobile step indicator */}
                            <div className="lg:hidden flex items-center gap-3 mb-6">
                                <span className="w-8 h-8 rounded-full bg-[var(--accent)] text-[var(--bg-body)] flex items-center justify-center text-sm font-medium">
                                    {index + 1}
                                </span>
                                <span className="text-xl font-semibold text-white">
                                    {step.title}
                                </span>
                            </div>

                            {/* Visual Container */}
                            <div className="relative group">
                                <div className={`relative h-[400px] w-full bg-[#0A0A0A] rounded-2xl border transition-all duration-500 overflow-hidden
                  ${activeStep === index
                                        ? "border-[var(--accent)]/50 shadow-[0_0_50px_-20px_rgba(34,197,94,0.1)]"
                                        : "border-white/10 opacity-50 grayscale"
                                    }`}>
                                    <step.VisualComponent isActive={activeStep === index} />
                                </div>
                            </div>

                            {/* Description */}
                            <p className="mt-8 text-neutral-400 text-lg leading-relaxed max-w-lg">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
