import { Metadata } from "next";
import { Section, SectionHeader } from "@/components/ui/section";
import { GlowGrid, GlowCard } from "@/components/ui/glow-card";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
    title: "Solutions",
    description:
        "See how Vallit builds AI automation for Sales Ops, Customer Support, Operations, Finance, and HR teams.",
};

const solutions = [
    {
        id: "sales",
        title: "Sales Operations",
        subtitle: "Close more deals with less manual work",
        problem:
            "Your sales team spends too much time on admin: qualifying leads, scheduling demos, updating the CRM, and chasing follow-ups.",
        whatWeBuild:
            "We build Kian to handle lead intake, qualification conversations, demo scheduling, and CRM updates. Your team gets notified when leads are ready to talk.",
        outcomes: [
            "Faster lead response times",
            "Consistent qualification process",
            "CRM always up to date",
            "More time for selling",
        ],
    },
    {
        id: "support",
        title: "Customer Support",
        subtitle: "24/7 first-line support that actually resolves issues",
        problem:
            "Support tickets pile up. Customers wait for answers to common questions. Your team burns out on repetitive requests.",
        whatWeBuild:
            "Kian answers common questions from your knowledge base, creates tickets for complex issues, and escalates to the right agent when needed.",
        outcomes: [
            "Instant responses to common questions",
            "Reduced ticket volume for your team",
            "Smart routing and escalation",
            "Consistent support quality",
        ],
    },
    {
        id: "operations",
        title: "Operations",
        subtitle: "Keep internal processes moving without manual follow-ups",
        problem:
            "Internal requests get stuck. Approvals take forever. Cross-team coordination requires endless Slack messages and email chains.",
        whatWeBuild:
            "We automate internal request handling, approval workflows, and cross-team coordination. Kian tracks status and follows up automatically.",
        outcomes: [
            "Faster internal request resolution",
            "Automated approval flows",
            "Clear status visibility",
            "Less time chasing people",
        ],
    },
    {
        id: "finance",
        title: "Finance & Admin",
        subtitle: "Automate routine finance and administrative tasks",
        problem:
            "Expense approvals, invoice processing, and routine financial requests take too much time and create bottlenecks.",
        whatWeBuild:
            "Kian handles expense pre-approvals, invoice data extraction, and common finance questions. Complex cases go to your finance team.",
        outcomes: [
            "Faster expense processing",
            "Consistent policy enforcement",
            "Reduced manual data entry",
            "Clear audit trails",
        ],
    },
    {
        id: "hr",
        title: "HR & Onboarding",
        subtitle: "Streamline employee experience from day one",
        problem:
            "HR teams answer the same questions repeatedly. Onboarding is fragmented across too many tools and manual steps.",
        whatWeBuild:
            "We build Kian to guide new hires through onboarding, answer HR questions, and handle routine requests like PTO and benefits inquiries.",
        outcomes: [
            "Consistent onboarding experience",
            "Instant answers to HR questions",
            "Reduced HR admin burden",
            "Better employee experience",
        ],
    },
];

export default function SolutionsPage() {
    return (
        <>
            {/* Hero */}
            <section className="pt-32 pb-20 md:pt-40 md:pb-24">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="max-w-3xl">
                        <Badge variant="accent" className="mb-6">
                            Solutions
                        </Badge>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gradient mb-6">
                            Built for real teams
                        </h1>
                        <p className="text-lg md:text-xl text-[var(--gray-300)] leading-relaxed mb-8">
                            We build custom AI automation for your specific workflows. Here are
                            the most common use cases — but we can build for almost any
                            operational process.
                        </p>
                        <ButtonLink href="/pricing#contact">Discuss Your Workflow</ButtonLink>
                    </div>
                </div>
            </section>

            {/* Solutions Grid */}
            <section className="pb-12">
                <div className="container mx-auto px-6 max-w-6xl">
                    <GlowGrid columns={3}>
                        {solutions.map((solution) => (
                            <a key={solution.id} href={`#${solution.id}`}>
                                <GlowCard>
                                    <h3 className="glow-card-title">{solution.title}</h3>
                                    <p className="glow-card-description">{solution.subtitle}</p>
                                </GlowCard>
                            </a>
                        ))}
                    </GlowGrid>
                </div>
            </section>

            {/* Solution Details */}
            {solutions.map((solution, index) => (
                <Section
                    key={solution.id}
                    id={solution.id}
                    className={index % 2 === 0 ? "bg-[rgba(255,255,255,0.01)]" : ""}
                >
                    <div className="max-w-4xl mx-auto">
                        <Badge className="mb-4">{solution.title}</Badge>
                        <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
                            {solution.subtitle}
                        </h2>

                        <div className="grid md:grid-cols-2 gap-8 mt-12">
                            {/* Problem */}
                            <div className="p-6 bg-[rgba(255,255,255,0.02)] rounded-xl border border-[rgba(255,255,255,0.06)]">
                                <h3 className="text-sm font-medium text-[var(--gray-400)] uppercase tracking-wide mb-3">
                                    The Problem
                                </h3>
                                <p className="text-[var(--gray-200)] leading-relaxed">
                                    {solution.problem}
                                </p>
                            </div>

                            {/* What We Build */}
                            <div className="p-6 bg-[rgba(255,255,255,0.02)] rounded-xl border border-[rgba(255,255,255,0.06)]">
                                <h3 className="text-sm font-medium text-[var(--gray-400)] uppercase tracking-wide mb-3">
                                    What We Build
                                </h3>
                                <p className="text-[var(--gray-200)] leading-relaxed">
                                    {solution.whatWeBuild}
                                </p>
                            </div>
                        </div>

                        {/* Outcomes */}
                        <div className="mt-8">
                            <h3 className="text-sm font-medium text-[var(--gray-400)] uppercase tracking-wide mb-4">
                                Outcomes
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-3">
                                {solution.outcomes.map((outcome) => (
                                    <div
                                        key={outcome}
                                        className="flex items-center gap-3 p-3 bg-[rgba(255,255,255,0.02)] rounded-lg border border-[rgba(255,255,255,0.04)]"
                                    >
                                        <span className="w-5 h-5 rounded-full bg-[var(--accent-dim)] flex items-center justify-center flex-shrink-0">
                                            <svg
                                                width="12"
                                                height="12"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="var(--accent)"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </span>
                                        <span className="text-sm text-[var(--gray-200)]">{outcome}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="mt-10">
                            <ButtonLink href="/pricing#contact" variant="secondary">
                                Discuss {solution.title} →
                            </ButtonLink>
                        </div>
                    </div>
                </Section>
            ))}

            {/* Final CTA */}
            <Section>
                <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-semibold text-white mb-6">
                        Don&apos;t see your use case?
                    </h2>
                    <p className="text-lg text-[var(--gray-300)] mb-8">
                        We build custom automation for almost any operational workflow. Let&apos;s
                        talk about what you need.
                    </p>
                    <ButtonLink href="/pricing#contact" size="lg">
                        Contact Us
                    </ButtonLink>
                </div>
            </Section>
        </>
    );
}
