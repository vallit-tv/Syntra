"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
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
        <section ref={containerRef} className="relative py-24 md:py-32">
            {/* Floating Dock Navigation */}
            <div className="sticky top-8 z-50 flex justify-center mb-24 pointer-events-none">
                <div className="pointer-events-auto bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 rounded-full p-2 flex items-center gap-1 shadow-2xl ring-1 ring-white/5">
                    {steps.map((step, index) => {
                        const isActive = activeStep === index;
                        return (
                            <button
                                key={step.id}
                                onClick={() => {
                                    stepRefs.current[index]?.scrollIntoView({
                                        behavior: "smooth",
                                        block: "center",
                                    });
                                }}
                                className="relative px-5 py-2 rounded-full text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-white/10 border border-white/5 rounded-full"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className={`relative z-10 transition-colors duration-300 ${isActive ? "text-white" : "text-neutral-400 hover:text-neutral-200"}`}>
                                    {step.title}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content Stack */}
            <div className="container mx-auto px-6 max-w-5xl space-y-32 md:space-y-48">
                {steps.map((step, index) => (
                    <div
                        key={step.id}
                        ref={(el) => {
                            stepRefs.current[index] = el;
                        }}
                        className="scroll-mt-40 grid md:grid-cols-2 gap-12 items-center"
                    >
                        {/* Text Block */}
                        <div className={`space-y-6 ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl font-bold text-white mb-6">
                                {index + 1}
                            </div>
                            <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                                {step.title}
                            </h3>
                            <p className="text-lg text-neutral-400 leading-relaxed">
                                {step.description}
                            </p>
                        </div>

                        {/* Visual Block */}
                        <div className={`relative ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                            <div className={`relative h-[400px] w-full bg-[#0A0A0A] rounded-3xl border transition-all duration-700 overflow-hidden group
                                ${activeStep === index
                                    ? "border-[var(--accent)]/30 shadow-[0_0_80px_-20px_rgba(34,197,94,0.15)] opacity-100"
                                    : "border-white/5 opacity-40 grayscale"
                                }`}>

                                {/* Inner Glow */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

                                <step.VisualComponent isActive={activeStep === index} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
