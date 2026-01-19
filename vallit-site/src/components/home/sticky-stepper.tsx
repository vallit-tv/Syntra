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
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="lg:grid lg:grid-cols-2 lg:gap-20">
                    {/* Left Column: Sticky Navigation associated with "60 Seconds Kian" */}
                    <div className="hidden lg:block h-full">
                        <div className="sticky top-40 space-y-4">
                            <h2 className="text-3xl font-bold text-white mb-8 px-6">
                                How Kian works <br />
                                <span className="text-[var(--accent)]">in 60 seconds.</span>
                            </h2>
                            <div className="space-y-2">
                                {steps.map((step, index) => (
                                    <button
                                        key={step.id}
                                        onClick={() => {
                                            stepRefs.current[index]?.scrollIntoView({
                                                behavior: "smooth",
                                                block: "center",
                                            });
                                        }}
                                        className="group relative w-full text-left px-6 py-4 rounded-2xl transition-all duration-300 hover:bg-white/5"
                                    >
                                        {/* Active Indicator Background */}
                                        {activeStep === index && (
                                            <motion.div
                                                layoutId="activeSideTab"
                                                className="absolute inset-0 bg-white/10 rounded-2xl border border-white/5"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}

                                        <div className="relative z-10 flex items-center justify-between">
                                            <div>
                                                <span className={`text-lg font-semibold transition-colors duration-300 ${activeStep === index ? "text-white" : "text-neutral-500 group-hover:text-neutral-300"}`}>
                                                    {step.title}
                                                </span>
                                                {/* Show description on active step only in sidebar? Maybe too cluttered. Let's keep it simple as per request for "Bar of Categories" */}
                                            </div>
                                            {activeStep === index && (
                                                <motion.div
                                                    layoutId="activeDot"
                                                    className="w-2 h-2 rounded-full bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]"
                                                />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Scrollable Content */}
                    <div className="space-y-32 pb-40 relative z-10">
                        {steps.map((step, index) => (
                            <div
                                key={step.id}
                                ref={(el) => {
                                    stepRefs.current[index] = el;
                                }}
                                className="scroll-mt-40 min-h-[60vh] flex flex-col justify-center"
                            >
                                {/* Mobile Title (only visible on small screens) */}
                                <div className="lg:hidden mb-6">
                                    <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                                </div>

                                {/* Visual Container */}
                                <div className={`relative h-[400px] w-full bg-[#0A0A0A] rounded-3xl border transition-all duration-700 overflow-hidden group mb-8
                                    ${activeStep === index
                                        ? "border-[var(--accent)]/30 shadow-[0_0_80px_-20px_rgba(34,197,94,0.15)] opacity-100"
                                        : "border-white/5 opacity-40 grayscale"
                                    }`}>

                                    {/* Inner Glow */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

                                    <step.VisualComponent isActive={activeStep === index} />
                                </div>

                                {/* Description Text */}
                                <div className="max-w-md">
                                    <p className="text-xl text-neutral-300 leading-relaxed font-light">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
