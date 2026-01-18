import { Metadata } from "next";
import { Section, SectionHeader } from "@/components/ui/section";
import { GlowGrid, GlowCard } from "@/components/ui/glow-card";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
    title: "About",
    description:
        "Learn about Vallit and our approach to done-for-you AI automation.",
};

const principles = [
    {
        icon: "🛠️",
        title: "We Build It For You",
        description:
            "No drag-and-drop platforms. No templates to configure. We build custom AI systems that fit your specific workflows and integrate with your existing tools.",
    },
    {
        icon: "🎯",
        title: "Results Over Features",
        description:
            "We measure success by outcomes: time saved, issues resolved, deals closed. Not by how many features we ship or how complex your automation looks.",
    },
    {
        icon: "🤝",
        title: "Partnership, Not SaaS",
        description:
            "We're not selling you software to figure out yourself. We work as an extension of your team, building and maintaining automation that actually works.",
    },
];

export default function AboutPage() {
    return (
        <>
            {/* Hero */}
            <section className="pt-32 pb-20 md:pt-40 md:pb-24">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="max-w-3xl">
                        <Badge variant="accent" className="mb-6">
                            About
                        </Badge>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gradient mb-6">
                            AI automation that works
                        </h1>
                        <p className="text-lg md:text-xl text-[var(--gray-300)] leading-relaxed">
                            Vallit builds AI systems that integrate into your real stack and
                            processes. We don&apos;t sell you a platform — we build and deploy
                            automation that gets work done.
                        </p>
                    </div>
                </div>
            </section>

            {/* Story */}
            <Section className="bg-[rgba(255,255,255,0.01)]">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-semibold text-white mb-6">
                        Why we started Vallit
                    </h2>
                    <div className="space-y-4 text-[var(--gray-300)] leading-relaxed">
                        <p>
                            Most AI automation tools give you a canvas and say "build your own
                            workflows." You spend weeks learning a platform, connecting APIs, and
                            debugging edge cases. By the time you&apos;re done, you&apos;ve become a
                            part-time software engineer — and you still don&apos;t have working
                            automation.
                        </p>
                        <p>
                            We think that&apos;s backwards. If you&apos;re running a business, you
                            shouldn&apos;t have to become an automation expert. You should describe
                            what you need, and someone should build it for you.
                        </p>
                        <p>
                            That&apos;s what Vallit does. We work with you to understand your
                            processes, then we build and deploy AI systems that actually work.
                            Kian — our AI assistant — handles support, scheduling, and workflows
                            end-to-end. When something needs human judgment, it escalates. When
                            something can be automated, it is.
                        </p>
                    </div>
                </div>
            </Section>

            {/* Principles */}
            <Section>
                <SectionHeader
                    badge="Why Vallit"
                    title="How we think about automation"
                />
                <GlowGrid columns={3}>
                    {principles.map((principle) => (
                        <GlowCard key={principle.title}>
                            <div className="glow-card-icon">
                                <span className="text-2xl">{principle.icon}</span>
                            </div>
                            <h3 className="glow-card-title">{principle.title}</h3>
                            <p className="glow-card-description">{principle.description}</p>
                        </GlowCard>
                    ))}
                </GlowGrid>
            </Section>

            {/* CTA */}
            <Section className="bg-[rgba(255,255,255,0.01)]">
                <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-semibold text-white mb-6">
                        Ready to work together?
                    </h2>
                    <p className="text-lg text-[var(--gray-300)] mb-8">
                        Let&apos;s discuss how we can build automation that fits your business.
                    </p>
                    <ButtonLink href="/pricing#contact" size="lg">
                        Get in Touch
                    </ButtonLink>
                </div>
            </Section>
        </>
    );
}
