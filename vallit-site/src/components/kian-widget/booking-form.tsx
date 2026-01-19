"use client";

import React, { useState } from "react";
import { BotConfig } from "@/lib/bot-data";

interface BookingFormProps {
    selectedDate: Date;
    config: BotConfig;
    onSubmit: (data: BookingData) => void;
    onCancel: () => void;
}

export interface BookingData {
    name: string;
    email: string;
    company: string;
    customField: string;
    date: Date;
}

export function BookingForm({ selectedDate, config, onSubmit, onCancel }: BookingFormProps) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        company: "",
        customField: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            date: selectedDate,
        });
    };

    const formatDateTime = (date: Date) => {
        return date.toLocaleString(config.locale === "de" ? "de-DE" : "en-US", {
            weekday: "short",
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="bg-[rgba(0,0,0,0.2)] rounded-xl p-4 border border-[rgba(255,255,255,0.08)] animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="mb-4 text-sm text-[var(--gray-300)] border-b border-[rgba(255,255,255,0.08)] pb-2">
                Booking for <span className="text-[var(--accent)] font-medium">{formatDateTime(selectedDate)}</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <input
                        required
                        type="text"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2 text-sm text-white placeholder-[var(--gray-500)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                    />
                </div>
                <div>
                    <input
                        required
                        type="email"
                        placeholder="Work Email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2 text-sm text-white placeholder-[var(--gray-500)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                    />
                </div>
                <div>
                    <input
                        required
                        type="text"
                        placeholder="Company Name"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2 text-sm text-white placeholder-[var(--gray-500)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-xs text-[var(--gray-400)] mb-1 ml-1">{config.customFieldLabel}</label>
                    <input
                        type="text"
                        placeholder={config.customFieldLabel}
                        value={formData.customField}
                        onChange={(e) => setFormData({ ...formData, customField: e.target.value })}
                        className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2 text-sm text-white placeholder-[var(--gray-500)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                    />
                </div>

                <div className="flex gap-2 pt-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 py-2 text-xs text-[var(--gray-400)] hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex-1 bg-[var(--accent)] text-[var(--bg-body)] rounded-lg py-2 text-xs font-semibold hover:bg-[var(--accent-muted)] transition-colors shadow-lg shadow-[var(--accent-glow)/20]"
                    >
                        Confirm Booking
                    </button>
                </div>
            </form>
        </div>
    );
}
