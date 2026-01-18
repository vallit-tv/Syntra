import React from "react";

interface BadgeProps {
    children: React.ReactNode;
    variant?: "default" | "accent";
    className?: string;
}

export function Badge({
    children,
    variant = "default",
    className = "",
}: BadgeProps) {
    const baseStyles =
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium tracking-wide uppercase";

    const variantStyles = {
        default:
            "bg-[rgba(255,255,255,0.06)] text-[var(--gray-200)] border border-[rgba(255,255,255,0.08)]",
        accent:
            "bg-[var(--accent-dim)] text-[var(--accent)] border border-[var(--accent-dim)]",
    };

    return (
        <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
            {children}
        </span>
    );
}
