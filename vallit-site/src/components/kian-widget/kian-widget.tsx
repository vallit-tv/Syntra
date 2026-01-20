"use client";

import React, { useState, useRef, useEffect } from "react";
import { CalendarView } from "./calendar-view";
import { BookingForm, BookingData } from "./booking-form";
import { defaultBotConfig, botKnowledgeBase, gettingStartedPrompts, BotResponse } from "@/lib/bot-data";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    type?: "text" | "calendar" | "form";
    metadata?: any;
}

// Simple Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: any) {
        return { hasError: true };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error("KianWidget Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // Fallback UI - just don't render the widget to avoid breaking the site
            return null;
        }
        return this.props.children;
    }
}

function KianWidgetContent() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content:
                "Hi! I'm Kian, Vallit's AI assistant. I can tell you about our automation solutions, scheduling features, or connect you with our team. How can I help?",
            type: "text",
        },
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            // inputRef.current?.focus(); // Optional: might be annoying on mobile if it pops keyboard
        }
    }, [isOpen, messages]);

    const handleSend = async (text: string) => {
        if (!text.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: text.trim(),
            type: "text",
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsTyping(true);

        try {
            // Call Python Backend API
            // In production (Vercel), we use relative path to hit the rewrite rule in vercel.json
            // Locally, we use .env.local to point to Flask
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

            // Generate or get session ID (simple local storage or memory for now)
            let sessionId = localStorage.getItem("vallit_session_id");
            if (!sessionId) {
                sessionId = `web_${Date.now()}`;
                localStorage.setItem("vallit_session_id", sessionId);
            }

            const response = await fetch(`${API_URL}/api/chat/message`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: text,
                    session_id: sessionId,
                    widget_id: "vallit-web",  // Identifier for the main site
                    // company_id: "..." // Optional: defaults to Generic/Vallit if backend handles it
                })
            });

            const data = await response.json();

            if (data.status === "success") {
                const assistantMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: data.response,
                    type: "text" // Backend needs to return type/action if needed
                };
                setMessages((prev) => [...prev, assistantMessage]);
            } else {
                // Fallback for error
                const errorMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: "I'm having trouble connecting to my brain right now. Please try again later.",
                    type: "text",
                };
                setMessages((prev) => [...prev, errorMessage]);
            }

        } catch (error) {
            console.error("Chat API Error:", error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Sorry, I can't connect to the server. Please check your internet connection.",
                type: "text",
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleQuickPrompt = (prompt: string) => {
        handleSend(prompt);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSend(input);
    };

    // Calendar Flow Handlers
    const handleSlotSelect = (date: Date) => {
        // Remove the interactive calendar from previous messages to "freeze" it (optional, but good UX)
        // For now, we just append a new message "You selected..." and show the form

        const confirmMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: `I'd like to book ${date.toLocaleString()}`,
            type: "text"
        };

        const formMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "Great! Please fill in your details to confirm the appointment.",
            type: "form",
            metadata: { selectedDate: date }
        };

        setMessages(prev => [...prev, confirmMsg, formMsg]);
    };

    const handleBookingSubmit = async (data: BookingData) => {
        setIsTyping(true);

        try {
            const response = await fetch("/api/book-appointment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    company: data.company,
                    customField: data.customField,
                    date: data.date.toISOString(),
                }),
            });

            if (!response.ok) {
                throw new Error("Booking failed");
            }

            const successMsg: Message = {
                id: Date.now().toString(),
                role: "assistant",
                content: `Great news, ${data.name}! Your appointment is confirmed for ${data.date.toLocaleDateString()} at ${data.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. I've sent a calendar invite with the Zoom link to ${data.email}.`,
                type: "text"
            };
            setMessages(prev => [...prev, successMsg]);

        } catch (error) {
            console.error("Booking Error:", error);
            const errorMsg: Message = {
                id: Date.now().toString(),
                role: "assistant",
                content: "I'm sorry, but something went wrong while scheduling the meeting. Please try again or use our contact form.",
                type: "text"
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleBookingCancel = () => {
        const cancelMsg: Message = {
            id: Date.now().toString(),
            role: "assistant",
            content: "No problem. Let me know if you want to schedule something later!",
            type: "text"
        };
        setMessages(prev => [...prev, cancelMsg]);
    };

    return (
        <>
            {/* Launcher Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${isOpen
                    ? "bg-[var(--gray-700)] rotate-180"
                    : "bg-[var(--accent)] hover:bg-[var(--accent-muted)] shadow-[0_0_30px_-5px_var(--accent-glow)]"
                    }`}
                aria-label={isOpen ? "Close chat" : "Open chat"}
            >
                {isOpen ? (
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-white"
                    >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                ) : (
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-[var(--bg-body)]"
                    >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                )}
            </button>

            {/* Chat Panel */}
            <div
                className={`fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.1)] rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${isOpen
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 translate-y-4 pointer-events-none"
                    }`}
            >
                {/* Header */}
                <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-muted)] flex items-center justify-center">
                            <span className="text-[var(--bg-body)] font-bold text-sm">{defaultBotConfig.companyName.charAt(0)}</span>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-white">{defaultBotConfig.companyName}</h3>
                            <p className="text-xs text-[var(--gray-400)]">AI Assistant</p>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="h-96 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[var(--gray-700)] scrollbar-track-transparent">
                    {messages.map((msg, index) => (
                        <div
                            key={msg.id}
                            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                        >
                            <div
                                className={`max-w-[90%] px-4 py-3 rounded-2xl text-sm leading-relaxed mb-2 ${msg.role === "user"
                                    ? "bg-[var(--accent)] text-[var(--bg-body)]"
                                    : "bg-[rgba(255,255,255,0.06)] text-[var(--gray-100)] border border-[rgba(255,255,255,0.06)]"
                                    }`}
                            >
                                {msg.content}
                            </div>

                            {/* Render different types of interactive elements only for the LATEST message of that type or if we want persistent history. 
                                For clean UX, maybe only render interactive elements if it's the last response, 
                                but User demanded it to be embedded and never take you out. 
                                So we render it inline.
                             */}

                            {msg.type === "calendar" && msg.role === "assistant" && (
                                <div className="w-full max-w-[90%] mt-1">
                                    {/* If this is not the last "calendar" request logic, we might want to disable it. 
                                        But for now let's keep it simple. */}
                                    <CalendarView
                                        onSelectSlot={handleSlotSelect}
                                        locale={defaultBotConfig.locale}
                                    />
                                </div>
                            )}

                            {msg.type === "form" && msg.role === "assistant" && (
                                <div className="w-full max-w-[90%] mt-1">
                                    <BookingForm
                                        selectedDate={msg.metadata.selectedDate}
                                        config={defaultBotConfig}
                                        onSubmit={handleBookingSubmit}
                                        onCancel={handleBookingCancel}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-[rgba(255,255,255,0.06)] text-[var(--gray-400)] px-4 py-3 rounded-2xl text-sm border border-[rgba(255,255,255,0.06)]">
                                <span className="flex gap-1">
                                    <span className="w-2 h-2 bg-[var(--gray-400)] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <span className="w-2 h-2 bg-[var(--gray-400)] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <span className="w-2 h-2 bg-[var(--gray-400)] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                </span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Prompts */}
                {messages.length === 1 && (
                    <div className="px-4 pb-3 flex flex-wrap gap-2">
                        {gettingStartedPrompts.map((prompt) => (
                            <button
                                key={prompt}
                                onClick={() => handleQuickPrompt(prompt)}
                                className="px-3 py-1.5 text-xs bg-[rgba(255,255,255,0.06)] text-[var(--gray-200)] rounded-full border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.15)] transition-all"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input */}
                <form onSubmit={handleSubmit} className="p-4 border-t border-[rgba(255,255,255,0.08)] bg-[var(--bg-elevated)]">
                    <div className="flex gap-3">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask something..."
                            className="flex-1 bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[var(--gray-500)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim()}
                            className="w-10 h-10 rounded-xl bg-[var(--accent)] text-[var(--bg-body)] flex items-center justify-center hover:bg-[var(--accent-muted)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="22" y1="2" x2="11" y2="13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        </button>
                    </div>
                </form>

                {/* Legal Footer */}
                <div className="px-4 pb-3 pt-1 text-center bg-[var(--bg-elevated)]">
                    <p className="text-[10px] text-[var(--gray-500)] leading-relaxed">
                        By using this chat, you accept our{" "}
                        <a href="/impressum" className="underline hover:text-[var(--gray-300)] transition-colors">Terms</a>
                        {" "}&amp;{" "}
                        <a href="/datenschutz" className="underline hover:text-[var(--gray-300)] transition-colors">Privacy Policy</a>
                    </p>
                    <p className="text-[10px] text-[var(--gray-600)] mt-1">
                        Powered by <span className="text-[var(--gray-500)]">Vallit</span>
                    </p>
                </div>
            </div>
        </>
    );
}

export function KianWidget() {
    return (
        <ErrorBoundary>
            <KianWidgetContent />
        </ErrorBoundary>
    );
}
