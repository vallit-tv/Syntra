import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
    return (
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Badge */}
                    <Badge variant="accent" className="mb-6">
                        Done-for-you AI Automation
                    </Badge>

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6">
                        <span className="text-gradient">AI systems that work.</span>
                        <br />
                        <span className="text-white">Built for you.</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg md:text-xl text-[var(--gray-300)] leading-relaxed max-w-2xl mx-auto mb-10">
                        Kian understands your business context, handles support, schedules
                        meetings, and executes workflows end-to-end. We build and deploy it for
                        you.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <ButtonLink href="/pricing#contact" size="lg">
                            Contact Us
                        </ButtonLink>
                        <ButtonLink href="/features" variant="secondary" size="lg">
                            See Features
                        </ButtonLink>
                    </div>
                </div>

                {/* Hero Visual */}
                <div className="mt-16 md:mt-24 relative">
                    <div className="relative mx-auto max-w-4xl">
                        {/* Glow effect behind */}
                        <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent-dim)] to-transparent opacity-30 blur-3xl -z-10" />

                        {/* Mock UI */}
                        <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-sm rounded-2xl border border-[rgba(255,255,255,0.08)] p-4 md:p-6">
                            <div className="grid md:grid-cols-3 gap-4">
                                {/* Chat Panel */}
                                <div className="bg-[var(--bg-elevated)] rounded-xl border border-[rgba(255,255,255,0.06)] p-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                        <span className="ml-2 text-xs text-[var(--gray-500)]">Chat</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-3">
                                            <p className="text-xs text-[var(--gray-300)]">
                                                Can I reschedule my meeting?
                                            </p>
                                        </div>
                                        <div className="bg-[var(--accent-dim)] rounded-lg p-3 ml-4">
                                            <p className="text-xs text-[var(--accent)]">
                                                Done! Moved to Thursday 3pm.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Calendar Panel */}
                                <div className="bg-[var(--bg-elevated)] rounded-xl border border-[rgba(255,255,255,0.06)] p-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                        <span className="ml-2 text-xs text-[var(--gray-500)]">
                                            Scheduling
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {["10:00 AM - Team Sync", "2:00 PM - Client Demo", "4:30 PM - Review"].map(
                                            (item, i) => (
                                                <div
                                                    key={i}
                                                    className={`text-xs p-2 rounded-lg ${i === 1
                                                            ? "bg-[var(--accent-dim)] text-[var(--accent)]"
                                                            : "bg-[rgba(255,255,255,0.03)] text-[var(--gray-400)]"
                                                        }`}
                                                >
                                                    {item}
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>

                                {/* Workflow Panel */}
                                <div className="bg-[var(--bg-elevated)] rounded-xl border border-[rgba(255,255,255,0.06)] p-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                        <span className="ml-2 text-xs text-[var(--gray-500)]">
                                            Workflows
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {[
                                            { label: "Lead Intake", status: "active" },
                                            { label: "Support Ticket", status: "done" },
                                            { label: "Onboarding", status: "pending" },
                                        ].map((item, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center justify-between text-xs p-2 rounded-lg bg-[rgba(255,255,255,0.03)]"
                                            >
                                                <span className="text-[var(--gray-300)]">{item.label}</span>
                                                <span
                                                    className={`w-2 h-2 rounded-full ${item.status === "active"
                                                            ? "bg-[var(--accent)] animate-pulse"
                                                            : item.status === "done"
                                                                ? "bg-green-500"
                                                                : "bg-[var(--gray-500)]"
                                                        }`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
