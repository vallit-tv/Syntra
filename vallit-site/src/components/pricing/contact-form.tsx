"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface FormData {
    name: string;
    company: string;
    email: string;
    teamSize: string;
    interest: string;
    message: string;
}

const teamSizes = [
    "1-10 employees",
    "11-50 employees",
    "51-200 employees",
    "201-500 employees",
    "500+ employees",
];

const interests = [
    "Customer Support Automation",
    "Scheduling & Coordination",
    "Sales Operations",
    "Internal Operations",
    "HR & Onboarding",
    "Other / Multiple",
];

export function ContactForm() {
    const [formData, setFormData] = useState<FormData>({
        name: "",
        company: "",
        email: "",
        teamSize: "",
        interest: "",
        message: "",
    });
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
        "idle"
    );
    const [honeypot, setHoneypot] = useState("");

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Honeypot check
        if (honeypot) {
            setStatus("success");
            return;
        }

        // Basic validation
        if (!formData.name || !formData.email || !formData.company) {
            return;
        }

        setStatus("submitting");

        // Simulate form submission
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // In production, this would send to your backend
        console.log("Form submitted:", formData);

        setStatus("success");
    };

    if (status === "success") {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[var(--accent-dim)] mx-auto mb-6 flex items-center justify-center">
                    <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">
                    Thanks for reaching out!
                </h3>
                <p className="text-[var(--gray-300)]">
                    We&apos;ll get back to you within 24 hours.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Honeypot */}
            <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
            />

            <div className="grid md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                    <label
                        htmlFor="name"
                        className="block text-sm font-medium text-[var(--gray-200)] mb-2"
                    >
                        Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-white placeholder-[var(--gray-500)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                        placeholder="Your name"
                    />
                </div>

                {/* Company */}
                <div>
                    <label
                        htmlFor="company"
                        className="block text-sm font-medium text-[var(--gray-200)] mb-2"
                    >
                        Company <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        required
                        className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-white placeholder-[var(--gray-500)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                        placeholder="Company name"
                    />
                </div>
            </div>

            {/* Email */}
            <div>
                <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[var(--gray-200)] mb-2"
                >
                    Email <span className="text-red-500">*</span>
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-white placeholder-[var(--gray-500)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                    placeholder="you@company.com"
                />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Team Size */}
                <div>
                    <label
                        htmlFor="teamSize"
                        className="block text-sm font-medium text-[var(--gray-200)] mb-2"
                    >
                        Team Size
                    </label>
                    <select
                        id="teamSize"
                        name="teamSize"
                        value={formData.teamSize}
                        onChange={handleChange}
                        className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--accent)] transition-colors appearance-none cursor-pointer"
                    >
                        <option value="" className="bg-[var(--bg-body)]">
                            Select team size
                        </option>
                        {teamSizes.map((size) => (
                            <option key={size} value={size} className="bg-[var(--bg-body)]">
                                {size}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Interest */}
                <div>
                    <label
                        htmlFor="interest"
                        className="block text-sm font-medium text-[var(--gray-200)] mb-2"
                    >
                        Interested In
                    </label>
                    <select
                        id="interest"
                        name="interest"
                        value={formData.interest}
                        onChange={handleChange}
                        className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--accent)] transition-colors appearance-none cursor-pointer"
                    >
                        <option value="" className="bg-[var(--bg-body)]">
                            Select area of interest
                        </option>
                        {interests.map((interest) => (
                            <option key={interest} value={interest} className="bg-[var(--bg-body)]">
                                {interest}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Message */}
            <div>
                <label
                    htmlFor="message"
                    className="block text-sm font-medium text-[var(--gray-200)] mb-2"
                >
                    Message
                </label>
                <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-white placeholder-[var(--gray-500)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
                    placeholder="Tell us about your automation needs..."
                />
            </div>

            {/* Submit */}
            <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={status === "submitting"}
            >
                {status === "submitting" ? "Sending..." : "Send Message"}
            </Button>
        </form>
    );
}
