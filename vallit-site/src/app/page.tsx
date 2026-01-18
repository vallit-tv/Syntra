import { Hero } from "@/components/home/hero";
import { Benefits } from "@/components/home/benefits";
import { StickyStepper } from "@/components/home/sticky-stepper";
import { UseCases } from "@/components/home/use-cases";
import { Section, SectionHeader } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { CTASection } from "@/components/home/cta-section";

// Social proof logos placeholder
const logos = [
  "Company A",
  "Company B",
  "Company C",
  "Company D",
  "Company E",
  "Company F",
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <Hero />

      {/* Social Proof */}
      <section className="py-12 border-y border-[rgba(255,255,255,0.06)]">
        <div className="container mx-auto px-6 max-w-6xl">
          <p className="text-center text-sm text-[var(--gray-500)] mb-8">
            Trusted by teams at
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {logos.map((logo) => (
              <div
                key={logo}
                className="h-8 px-6 flex items-center justify-center text-[var(--gray-600)] text-sm font-medium opacity-50"
              >
                {logo}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <Benefits />

      {/* Kian in 60 Seconds */}
      <Section id="how-it-works" className="bg-[rgba(255,255,255,0.01)]">
        <SectionHeader
          badge="How It Works"
          title="Kian in 60 seconds"
          subtitle="From customer message to completed action — see how Kian handles requests end-to-end."
        />
        <StickyStepper />
      </Section>

      {/* Use Cases */}
      <UseCases />

      {/* Security & Trust */}
      <Section>
        <div className="max-w-3xl mx-auto text-center">
          <SectionHeader
            badge="Security"
            title="Enterprise-ready from day one"
            subtitle="Your data stays yours. We follow security-first practices and offer EU hosting options."
          />
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {[
              {
                title: "EU Hosting Available",
                description: "Keep your data in European data centers",
              },
              {
                title: "GDPR-Aligned",
                description: "Built with privacy regulations in mind",
              },
              {
                title: "Audit Logs",
                description: "Full visibility into every action Kian takes",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-6 bg-[rgba(255,255,255,0.02)] rounded-xl border border-[rgba(255,255,255,0.06)]"
              >
                <h3 className="text-white font-medium mb-2">{item.title}</h3>
                <p className="text-sm text-[var(--gray-400)]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Final CTA */}
      <CTASection />
    </>
  );
}
