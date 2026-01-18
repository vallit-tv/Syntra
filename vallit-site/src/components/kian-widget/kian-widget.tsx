"use client";

import React, { useState, useRef, useEffect } from "react";

const quickPrompts = [
    "What can you automate?",
    "Show scheduling",
    "Pricing info",
    "Talk to Vallit",
];

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

const placeholderResponses: Record<string, string> = {
    "What can you automate?":
        "I can help automate customer support, meeting scheduling, workflow execution, and more. Kian understands your business context and handles tasks end-to-end. Would you like to learn about a specific area?",
    "Show scheduling":
        "Kian handles calendar coordination automatically. It finds optimal meeting times, sends invites, manages rescheduling, and syncs with your existing tools like Google Calendar or Outlook. No back-and-forth emails needed.",
    "Pricing info":
        "We offer three plans: Starter (€149/mo), Growth (€499/mo), and Scale (€1,499/mo). Enterprise plans are also available. All plans include managed setup and deployment. Want me to explain the differences?",
    "Talk to Vallit":
        "I'd be happy to connect you with our team! Please share your email and company name, and someone will reach out within 24 hours. Or you can use the contact form on our pricing page.",
};

export function KianWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content:
                "Hi! I'm Kian, Vallit's AI assistant. I can tell you about our automation solutions, scheduling features, or connect you with our team. How can I help?",
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
            inputRef.current?.focus();
        }
    }, [isOpen, messages]);

    const handleSend = async (text: string) => {
        if (!text.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: text.trim(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsTyping(true);

        // Simulate response delay
        await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 500));

        // Get response (placeholder logic)
        const response =
            placeholderResponses[text] ||
            "Thanks for your message! Our team at Vallit builds custom AI automation solutions. For specific questions, please reach out through our contact form and we'll get back to you within 24 hours.";

        const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: response,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setIsTyping(false);
    };

    const handleQuickPrompt = (prompt: string) => {
        handleSend(prompt);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSend(input);
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
                            <span className="text-[var(--bg-body)] font-bold text-sm">K</span>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-white">Kian</h3>
                            <p className="text-xs text-[var(--gray-400)]">Vallit AI Assistant</p>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="h-80 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                                    ? "bg-[var(--accent)] text-[var(--bg-body)]"
                                    : "bg-[rgba(255,255,255,0.06)] text-[var(--gray-100)] border border-[rgba(255,255,255,0.06)]"
                                    }`}
                            >
                                {msg.content}
                            </div>
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
                {messages.length <= 1 && (
                    <div className="px-4 pb-3 flex flex-wrap gap-2">
                        {quickPrompts.map((prompt) => (
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
                <form onSubmit={handleSubmit} className="p-4 border-t border-[rgba(255,255,255,0.08)]">
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
                <div className="px-4 pb-3 pt-1 text-center">
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
