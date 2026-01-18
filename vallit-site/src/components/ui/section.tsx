"use client";

import React, { useRef, useEffect, useState } from "react";

interface SectionProps {
    children: React.ReactNode;
    className?: string;
    id?: string;
    animate?: boolean;
}

interface SectionHeaderProps {
    badge?: string;
    title: string;
    subtitle?: string;
    centered?: boolean;
    className?: string;
}

export function Section({
    children,
    className = "",
    id,
    animate = true,
}: SectionProps) {
    const sectionRef = useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = useState(!animate);

    useEffect(() => {
        if (!animate) return;

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if (prefersReducedMotion) {
            setIsVisible(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            {
                threshold: 0.1,
                rootMargin: "0px 0px -50px 0px",
            }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, [animate]);

    return (
        <section
            ref={sectionRef}
            id={id}
            className={`py-24 md:py-32 relative transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                } ${className}`}
        >
            <div className="container mx-auto px-6 max-w-6xl">{children}</div>
        </section>
    );
}

export function SectionHeader({
    badge,
    title,
    subtitle,
    centered = true,
    className = "",
}: SectionHeaderProps) {
    return (
        <div
            className={`mb-16 ${centered ? "text-center max-w-3xl mx-auto" : ""} ${className}`}
        >
            {badge && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium tracking-wide uppercase bg-[rgba(255,255,255,0.06)] text-[var(--gray-200)] border border-[rgba(255,255,255,0.08)] mb-4">
                    {badge}
                </span>
            )}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-gradient mb-4">
                {title}
            </h2>
            {subtitle && (
                <p className="text-lg md:text-xl text-[var(--gray-300)] leading-relaxed">
                    {subtitle}
                </p>
            )}
        </div>
    );
}
