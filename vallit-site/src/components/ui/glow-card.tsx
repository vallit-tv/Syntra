"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";

interface GlowCardProps {
    children: React.ReactNode;
    className?: string;
}

interface GlowGridProps {
    children: React.ReactNode;
    className?: string;
    columns?: 2 | 3 | 4;
}

export function GlowCard({ children, className = "" }: GlowCardProps) {
    return (
        <div className={`glow-card ${className}`}>
            <div className="glow-card-content">{children}</div>
        </div>
    );
}

export function GlowGrid({
    children,
    className = "",
    columns = 3,
}: GlowGridProps) {
    const gridRef = useRef<HTMLDivElement>(null);
    const [isTouch, setIsTouch] = useState(false);
    const rafId = useRef<number | null>(null);

    // Detect touch device
    useEffect(() => {
        setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
    }, []);

    // Check for reduced motion preference
    const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const handlePointerMove = useCallback(
        (e: PointerEvent) => {
            if (isTouch || prefersReducedMotion) return;
            if (!gridRef.current) return;

            // Cancel any pending animation frame
            if (rafId.current) {
                cancelAnimationFrame(rafId.current);
            }

            rafId.current = requestAnimationFrame(() => {
                const cards = gridRef.current?.querySelectorAll(".glow-card");
                if (!cards) return;

                cards.forEach((card) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    (card as HTMLElement).style.setProperty("--mouse-x", `${x}px`);
                    (card as HTMLElement).style.setProperty("--mouse-y", `${y}px`);
                });
            });
        },
        [isTouch, prefersReducedMotion]
    );

    useEffect(() => {
        const grid = gridRef.current;
        if (!grid || isTouch) return;

        grid.addEventListener("pointermove", handlePointerMove);

        return () => {
            grid.removeEventListener("pointermove", handlePointerMove);
            if (rafId.current) {
                cancelAnimationFrame(rafId.current);
            }
        };
    }, [handlePointerMove, isTouch]);

    const gridCols = {
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    };

    return (
        <div
            ref={gridRef}
            className={`glow-grid grid gap-6 ${gridCols[columns]} ${className}`}
        >
            {children}
        </div>
    );
}
