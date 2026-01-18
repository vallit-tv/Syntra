"use client";

import React from "react";

export function PremiumBackground() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            {/* 1. Base Grid (Subtle Lines) */}
            <div
                className="absolute inset-0 z-0 opacity-[0.03]"
                style={{
                    backgroundImage: `
            linear-gradient(to right, #808080 1px, transparent 1px),
            linear-gradient(to bottom, #808080 1px, transparent 1px)
          `,
                    backgroundSize: '48px 48px',
                    maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)'
                }}
            />

            {/* 2. Atmospheric Glows (The premium feel) */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[var(--accent)] rounded-full mix-blend-screen opacity-[0.03] blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500 rounded-full mix-blend-screen opacity-[0.02] blur-[150px]" />

            {/* 3. Vignette (Focus on content) */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#08090a] via-transparent to-[#08090a] z-0" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#08090a] via-transparent to-[#08090a] z-0" />
        </div>
    );
}
