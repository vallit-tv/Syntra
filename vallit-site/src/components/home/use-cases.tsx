import { GlowGrid, GlowCard } from "@/components/ui/glow-card";
import { SectionHeader } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";

const useCases = [
    {
        title: "Sales Operations",
        description:
            "Qualify leads, schedule demos, and update your CRM automatically. Kian handles the repetitive work so your team can close deals.",
        href: "/solutions#sales",
    },
    {
        title: "Customer Support",
        description:
            "First-line support that works 24/7. Answer common questions, create tickets, and escalate complex issues to the right team.",
        href: "/solutions#support",
    },
    {
        title: "Operations",
        description:
            "Automate internal requests, approvals, and cross-team coordination. Keep processes moving without manual follow-ups.",
        href: "/solutions#operations",
    },
    {
        title: "HR & Onboarding",
        description:
            "Streamline employee onboarding, answer HR questions, and manage routine requests without pulling your team away.",
        href: "/solutions#hr",
    },
];

export function UseCases() {
    return (
        <section className="py-24 md:py-32 bg-[rgba(255,255,255,0.01)]">
            <div className="container mx-auto px-6 max-w-6xl">
                <SectionHeader
                    badge="Use Cases"
                    title="Built for real work"
                    subtitle="See how teams use Kian to automate their most time-consuming tasks."
                />

                <GlowGrid columns={2}>
                    {useCases.map((useCase) => (
                        <GlowCard key={useCase.title}>
                            <h3 className="glow-card-title text-xl">{useCase.title}</h3>
                            <p className="glow-card-description mb-4">{useCase.description}</p>
                            <ButtonLink href={useCase.href} variant="ghost" size="sm">
                                Learn more →
                            </ButtonLink>
                        </GlowCard>
                    ))}
                </GlowGrid>
            </div>
        </section>
    );
}
