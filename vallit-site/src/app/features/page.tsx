import { Metadata } from "next";
import { Section, SectionHeader } from "@/components/ui/section";
import { GlowGrid, GlowCard } from "@/components/ui/glow-card";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
    title: "Features",
    description:
        "Explore Kian's capabilities: context engine, managed automations, scheduling, support, integrations, governance, and security.",
};

const featureCategories = [
    {
        id: "context",
        badge: "Core",
        title: "Kian Context Engine",
        description:
            "Kian doesn't just follow scripts. It understands your business — products, policies, processes, and current state — to make intelligent decisions.",
        features: [
            "Learns from your knowledge base, docs, and FAQs",
            "Maintains context across conversations",
            "Adapts responses based on customer history",
        ],
    },
    {
        id: "managed",
        badge: "Delivery",
        title: "Managed Automations",
        description:
            "We build your automations for you. No drag-and-drop builders, no templates. Custom systems designed for your specific workflows.",
        features: [
            "Dedicated implementation by our team",
            "Custom-built for your stack and processes",
            "Ongoing optimization and maintenance",
        ],
    },
    {
        id: "scheduling",
        badge: "Capability",
        title: "Scheduling & Coordination",
        description:
            "Kian handles meeting coordination end-to-end. It checks availability, proposes times, sends invites, and manages rescheduling.",
        features: [
            "Calendar integration (Google, Outlook, CalDAV)",
            "Automatic time zone handling",
            "Intelligent scheduling based on priorities",
        ],
    },
    {
        id: "support",
        badge: "Capability",
        title: "Support Automation",
        description:
            "First-line support that actually resolves issues. Kian answers questions, creates tickets, and knows when to escalate to humans.",
        features: [
            "Real-time responses based on your knowledge base",
            "Smart ticket creation and routing",
            "Automatic escalation for complex issues",
        ],
    },
    {
        id: "integrations",
        badge: "Platform",
        title: "Integrations",
        description:
            "Kian connects to your existing tools. We handle the integration work so Kian can take action across your entire stack.",
        features: [
            "Slack, Teams, and messaging platforms",
            "Google Workspace and Microsoft 365",
            "CRMs: Salesforce, HubSpot, Pipedrive, and more",
            "Notion, Airtable, and database tools",
        ],
    },
    {
        id: "governance",
        badge: "Control",
        title: "Governance & Oversight",
        description:
            "Stay in control with human-in-the-loop workflows, approval gates, and complete audit logs of every action Kian takes.",
        features: [
            "Configurable approval workflows",
            "Human escalation triggers",
            "Complete audit trail and logging",
        ],
    },
    {
        id: "security",
        badge: "Trust",
        title: "Security & Compliance",
        description:
            "Built with security-first practices. EU hosting available, GDPR-aligned approach, and enterprise-grade data protection.",
        features: [
            "EU hosting options available",
            "GDPR-aligned data handling",
            "Encrypted data at rest and in transit",
            "Role-based access control",
        ],
    },
];

export default function FeaturesPage() {
    return (
        <>
            {/* Hero */}
            <section className="pt-32 pb-20 md:pt-40 md:pb-24">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="max-w-3xl">
                        <Badge variant="accent" className="mb-6">
                            Features
                        </Badge>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gradient mb-6">
                            Everything Kian can do
                        </h1>
                        <p className="text-lg md:text-xl text-[var(--gray-300)] leading-relaxed mb-8">
                            Explore the capabilities we build into your AI automation systems.
                            Every feature is configured and deployed by our team — not left for
                            you to figure out.
                        </p>
                        <div className="flex gap-4">
                            <ButtonLink href="/pricing#contact">Contact Us</ButtonLink>
                            <ButtonLink href="/solutions" variant="secondary">
                                See Use Cases
                            </ButtonLink>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Directory Navigation */}
            <section className="border-y border-[rgba(255,255,255,0.06)] sticky top-16 md:top-20 bg-[var(--bg-body)]/95 backdrop-blur-lg z-40">
                <div className="container mx-auto px-6 max-w-6xl">
                    <nav className="flex gap-1 overflow-x-auto py-4 -mx-6 px-6 md:mx-0 md:px-0">
                        {featureCategories.map((cat) => (
                            <a
                                key={cat.id}
                                href={`#${cat.id}`}
                                className="px-4 py-2 text-sm text-[var(--gray-400)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-colors whitespace-nowrap"
                            >
                                {cat.title.split(" ").slice(-1)[0]}
                            </a>
                        ))}
                    </nav>
                </div>
            </section>

            {/* Feature Sections */}
            {featureCategories.map((category, index) => (
                <Section
                    key={category.id}
                    id={category.id}
                    className={index % 2 === 1 ? "bg-[rgba(255,255,255,0.01)]" : ""}
                >
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        {/* Content */}
                        <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                            <Badge className="mb-4">{category.badge}</Badge>
                            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
                                {category.title}
                            </h2>
                            <p className="text-lg text-[var(--gray-300)] leading-relaxed mb-8">
                                {category.description}
                            </p>
                            <ul className="space-y-3">
                                {category.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3">
                                        <span className="w-5 h-5 rounded-full bg-[var(--accent-dim)] flex items-center justify-center flex-shrink-0 mt-0.5">
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
                                        <span className="text-[var(--gray-200)]">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Visual placeholder */}
                        <div
                            className={`h-64 md:h-80 bg-[rgba(255,255,255,0.02)] rounded-2xl border border-[rgba(255,255,255,0.06)] flex items-center justify-center ${index % 2 === 1 ? "lg:order-1" : ""
                                }`}
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-2xl bg-[var(--accent-dim)] mx-auto mb-4 flex items-center justify-center">
                                    <span className="text-[var(--accent)] text-2xl">
                                        {["🧠", "🛠️", "📅", "💬", "🔗", "👁️", "🔒"][index]}
                                    </span>
                                </div>
                                <p className="text-sm text-[var(--gray-500)]">
                                    {category.title}
                                </p>
                            </div>
                        </div>
                    </div>
                </Section>
            ))}

            {/* CTA */}
            <Section>
                <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-semibold text-white mb-6">
                        Ready to see it in action?
                    </h2>
                    <p className="text-lg text-[var(--gray-300)] mb-8">
                        Let&apos;s discuss which features make sense for your business.
                    </p>
                    <ButtonLink href="/pricing#contact" size="lg">
                        Get in Touch
                    </ButtonLink>
                </div>
            </Section>
        </>
    );
}
