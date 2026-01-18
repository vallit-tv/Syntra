import { Metadata } from "next";
import { Section, SectionHeader } from "@/components/ui/section";
import { GlowGrid, GlowCard } from "@/components/ui/glow-card";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContactForm } from "@/components/pricing/contact-form";

export const metadata: Metadata = {
    title: "Pricing",
    description:
        "Transparent pricing for managed AI automation. Starter, Growth, Scale, and Enterprise plans available.",
};

const plans = [
    {
        name: "Starter",
        price: "€149",
        period: "/mo",
        description: "For small teams getting started with AI automation",
        features: [
            "1 Kian deployment",
            "Up to 500 conversations/mo",
            "Email + chat support",
            "Basic integrations",
            "Managed setup included",
        ],
        cta: "Get Started",
        popular: false,
    },
    {
        name: "Growth",
        price: "€499",
        period: "/mo",
        description: "For growing teams with more complex workflows",
        features: [
            "Up to 3 Kian deployments",
            "Up to 2,000 conversations/mo",
            "Priority support",
            "Advanced integrations",
            "Custom workflows",
            "Approval flows",
        ],
        cta: "Get Started",
        popular: true,
    },
    {
        name: "Scale",
        price: "€1,499",
        period: "/mo",
        description: "For teams running multiple automation systems",
        features: [
            "Unlimited Kian deployments",
            "Up to 10,000 conversations/mo",
            "Dedicated support",
            "All integrations",
            "Custom development",
            "SLA guarantee",
            "Quarterly reviews",
        ],
        cta: "Get Started",
        popular: false,
    },
];

const enterpriseFeatures = [
    "Unlimited conversations",
    "Custom SLA",
    "Dedicated account manager",
    "On-premise options",
    "Custom security requirements",
    "White-label available",
];

export default function PricingPage() {
    return (
        <>
            {/* Hero */}
            <section className="pt-32 pb-16 md:pt-40 md:pb-20">
                <div className="container mx-auto px-6 max-w-6xl text-center">
                    <Badge variant="accent" className="mb-6">
                        Pricing
                    </Badge>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gradient mb-6">
                        Simple, transparent pricing
                    </h1>
                    <p className="text-lg md:text-xl text-[var(--gray-300)] max-w-2xl mx-auto">
                        All plans include managed setup and deployment. We build your
                        automation systems — you don&apos;t have to figure it out yourself.
                    </p>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="pb-24">
                <div className="container mx-auto px-6 max-w-6xl">
                    <GlowGrid columns={3}>
                        {plans.map((plan) => (
                            <GlowCard key={plan.name}>
                                <div className="relative">
                                    {plan.popular && (
                                        <span className="absolute -top-3 -right-3 px-3 py-1 bg-[var(--accent)] text-[var(--bg-body)] text-xs font-medium rounded-full">
                                            Popular
                                        </span>
                                    )}
                                    <h3 className="text-xl font-semibold text-white mb-2">
                                        {plan.name}
                                    </h3>
                                    <div className="flex items-baseline gap-1 mb-3">
                                        <span className="text-4xl font-bold text-white">
                                            {plan.price}
                                        </span>
                                        <span className="text-[var(--gray-400)]">{plan.period}</span>
                                    </div>
                                    <p className="text-sm text-[var(--gray-400)] mb-6">
                                        {plan.description}
                                    </p>
                                    <ul className="space-y-3 mb-8">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-start gap-3">
                                                <span className="w-5 h-5 rounded-full bg-[var(--accent-dim)] flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <svg
                                                        width="10"
                                                        height="10"
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
                                                <span className="text-sm text-[var(--gray-200)]">
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                    <ButtonLink
                                        href="#contact"
                                        variant={plan.popular ? "primary" : "secondary"}
                                        className="w-full justify-center"
                                    >
                                        {plan.cta}
                                    </ButtonLink>
                                </div>
                            </GlowCard>
                        ))}
                    </GlowGrid>
                </div>
            </section>

            {/* Enterprise */}
            <section className="py-24 bg-[rgba(255,255,255,0.01)]">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <Badge className="mb-4">Enterprise</Badge>
                            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
                                Need more?
                            </h2>
                            <p className="text-lg text-[var(--gray-300)] mb-8">
                                For large organizations with custom requirements, we offer
                                enterprise plans with dedicated support, custom SLAs, and
                                flexible deployment options.
                            </p>
                            <ul className="grid sm:grid-cols-2 gap-3 mb-8">
                                {enterpriseFeatures.map((feature) => (
                                    <li key={feature} className="flex items-center gap-3">
                                        <span className="w-5 h-5 rounded-full bg-[var(--accent-dim)] flex items-center justify-center flex-shrink-0">
                                            <svg
                                                width="10"
                                                height="10"
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
                                        <span className="text-sm text-[var(--gray-200)]">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <ButtonLink href="#contact" size="lg">
                                Contact Sales
                            </ButtonLink>
                        </div>
                        <div className="h-64 md:h-80 bg-[rgba(255,255,255,0.02)] rounded-2xl border border-[rgba(255,255,255,0.06)] flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-muted)] mx-auto mb-4 flex items-center justify-center">
                                    <span className="text-[var(--bg-body)] text-2xl font-bold">E</span>
                                </div>
                                <p className="text-sm text-[var(--gray-500)]">Enterprise</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Form */}
            <Section id="contact">
                <div className="max-w-2xl mx-auto">
                    <SectionHeader
                        title="Get in touch"
                        subtitle="Ready to discuss your automation needs? Fill out the form below and we'll get back to you within 24 hours."
                    />
                    <div className="bg-[rgba(255,255,255,0.02)] rounded-2xl border border-[rgba(255,255,255,0.08)] p-8 md:p-10">
                        <ContactForm />
                    </div>
                </div>
            </Section>

            {/* FAQ */}
            <Section className="bg-[rgba(255,255,255,0.01)]">
                <SectionHeader
                    title="Common questions"
                    subtitle="Have other questions? Reach out and we'll help."
                />
                <div className="max-w-3xl mx-auto space-y-6">
                    {[
                        {
                            q: "What does 'managed setup' mean?",
                            a: "We handle everything. Our team builds your automation systems, configures integrations, and deploys Kian for you. You don't need to learn a platform or configure anything yourself.",
                        },
                        {
                            q: "Can I change plans later?",
                            a: "Yes. You can upgrade or downgrade your plan at any time. We'll help you migrate if needed.",
                        },
                        {
                            q: "What counts as a conversation?",
                            a: "A conversation is a single interaction session with Kian. If a customer sends multiple messages in one session, that's one conversation.",
                        },
                        {
                            q: "Do you offer discounts for annual billing?",
                            a: "Yes. Contact us for annual pricing — we offer significant discounts for annual commitments.",
                        },
                    ].map((faq) => (
                        <div
                            key={faq.q}
                            className="p-6 bg-[rgba(255,255,255,0.02)] rounded-xl border border-[rgba(255,255,255,0.06)]"
                        >
                            <h3 className="text-white font-medium mb-2">{faq.q}</h3>
                            <p className="text-[var(--gray-300)] text-sm leading-relaxed">
                                {faq.a}
                            </p>
                        </div>
                    ))}
                </div>
            </Section>
        </>
    );
}
