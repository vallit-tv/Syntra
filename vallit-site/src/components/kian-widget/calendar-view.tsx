"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

interface CalendarViewProps {
    onSelectSlot: (date: Date) => void;
    locale?: "en" | "de";
}

export function CalendarView({ onSelectSlot, locale = "en" }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState<Date | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [availableSlots, setAvailableSlots] = useState<Date[]>([]);

    // Calculate the first available date (1.5 days from now)
    useEffect(() => {
        const now = new Date();
        // Add 1.5 days (36 hours)
        const minDate = new Date(now.getTime() + 36 * 60 * 60 * 1000);

        // Reset to start of that day to check slots, but keep the specific time for validation if needed
        // Actually simplicity: just start showing slots from that calculated day

        // If it's a weekend, maybe pushing to Monday is better, but obeying strict "1.5 days" rule first.
        // Let's settle on a "View Date" starting from minDate.
        setCurrentDate(minDate);
    }, []);

    // Generate slots for the currently viewed date
    useEffect(() => {
        if (!currentDate) return;

        const slots: Date[] = [];
        const startHour = 8;
        const endHour = 18;

        for (let h = startHour; h < endHour; h++) {
            const slot = new Date(currentDate);
            slot.setHours(h, 0, 0, 0);
            slots.push(slot);
        }
        setAvailableSlots(slots);
    }, [currentDate]);

    const handlePrevDay = () => {
        if (!currentDate) return;
        const prev = new Date(currentDate);
        prev.setDate(prev.getDate() - 1);

        // Don't allow going back past minDate logic (simplified check)
        const now = new Date();
        const minDate = new Date(now.getTime() + 36 * 60 * 60 * 1000);
        if (prev.toDateString() === minDate.toDateString() || prev > minDate) {
            setCurrentDate(prev);
        } else {
            // Allow going back to the min start date
            setCurrentDate(new Date(minDate));
        }
    };

    const handleNextDay = () => {
        if (!currentDate) return;
        const next = new Date(currentDate);
        next.setDate(next.getDate() + 1);
        setCurrentDate(next);
    };

    const formatDate = (date: Date) => {
        if (!date) return "";
        return date.toLocaleDateString(locale === "de" ? "de-DE" : "en-US", {
            weekday: "short",
            day: "numeric",
            month: "short",
        });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString(locale === "de" ? "de-DE" : "en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: locale !== "de", // 24h for DE, 12h for EN usually, but business contexts in EN often use 12h
        });
    };

    if (!currentDate) return null;

    return (
        <div className="bg-[rgba(0,0,0,0.2)] rounded-xl p-4 border border-[rgba(255,255,255,0.08)]">
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={handlePrevDay}
                    className="p-1 hover:bg-[rgba(255,255,255,0.1)] rounded-full transition-colors"
                >
                    <ChevronLeft size={16} className="text-gray-400" />
                </button>
                <span className="text-sm font-medium text-white">{formatDate(currentDate)}</span>
                <button
                    onClick={handleNextDay}
                    className="p-1 hover:bg-[rgba(255,255,255,0.1)] rounded-full transition-colors"
                >
                    <ChevronRight size={16} className="text-gray-400" />
                </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((slot) => (
                    <button
                        key={slot.toISOString()}
                        onClick={() => onSelectSlot(slot)}
                        className="flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg bg-[rgba(255,255,255,0.05)] hover:bg-[var(--accent)] hover:text-[var(--bg-body)] text-xs text-gray-300 transition-all border border-[rgba(255,255,255,0.05)] hover:border-[var(--accent)]"
                    >
                        <Clock size={10} />
                        {formatTime(slot)}
                    </button>
                ))}
            </div>
        </div>
    );
}
