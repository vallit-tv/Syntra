import React from "react";
import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    children: React.ReactNode;
    className?: string;
}

interface ButtonLinkProps {
    href: string;
    variant?: ButtonVariant;
    size?: ButtonSize;
    children: React.ReactNode;
    className?: string;
    external?: boolean;
}

const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-body)] disabled:opacity-50 disabled:pointer-events-none";

const variantStyles: Record<ButtonVariant, string> = {
    primary:
        "bg-white text-[#0a0a0a] hover:bg-gray-100 hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] active:scale-[0.98]",
    secondary:
        "bg-transparent text-white border border-[rgba(255,255,255,0.15)] hover:border-[rgba(255,255,255,0.3)] hover:bg-[rgba(255,255,255,0.05)] active:scale-[0.98]",
    ghost:
        "bg-transparent text-[var(--gray-200)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]",
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: "h-8 px-3 text-sm rounded-md gap-1.5",
    md: "h-10 px-5 text-sm rounded-lg gap-2",
    lg: "h-12 px-7 text-base rounded-lg gap-2.5",
};

export function Button({
    variant = "primary",
    size = "md",
    children,
    className = "",
    ...props
}: ButtonProps) {
    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

export function ButtonLink({
    href,
    variant = "primary",
    size = "md",
    children,
    className = "",
    external = false,
}: ButtonLinkProps) {
    const classes = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

    if (external) {
        return (
            <a
                href={href}
                className={classes}
                target="_blank"
                rel="noopener noreferrer"
            >
                {children}
            </a>
        );
    }

    return (
        <Link href={href} className={classes}>
            {children}
        </Link>
    );
}
