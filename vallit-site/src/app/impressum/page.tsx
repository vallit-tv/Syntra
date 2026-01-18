import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Impressum",
    description: "Legal notice and company information for Vallit.",
};

export default function ImpressumPage() {
    return (
        <div className="pt-32 pb-20 md:pt-40 md:pb-24">
            <div className="container mx-auto px-6 max-w-3xl">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
                    Impressum
                </h1>

                <div className="prose prose-invert max-w-none space-y-8 text-[var(--gray-300)]">
                    <div className="p-6 bg-[rgba(255,255,255,0.03)] rounded-xl border border-[rgba(255,255,255,0.08)]">
                        <p className="text-[var(--gray-400)] text-sm mb-4">
                            ⚠️ Placeholder: Replace with your actual legal information
                        </p>
                    </div>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">
                            Company Information
                        </h2>
                        <p>
                            Vallit GmbH
                            <br />
                            [Street Address]
                            <br />
                            [Postal Code] [City]
                            <br />
                            Germany
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">
                            Contact
                        </h2>
                        <p>
                            Email: contact@vallit.net
                            <br />
                            Phone: [Phone Number]
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">
                            Registration
                        </h2>
                        <p>
                            Commercial Register: [Registry Court]
                            <br />
                            Registration Number: HRB [Number]
                            <br />
                            VAT ID: DE [Number]
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">
                            Represented by
                        </h2>
                        <p>[Managing Director Name]</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">
                            Responsible for Content
                        </h2>
                        <p>
                            [Name]
                            <br />
                            [Address]
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">
                            Dispute Resolution
                        </h2>
                        <p>
                            The European Commission provides a platform for online dispute
                            resolution (OS):{" "}
                            <a
                                href="https://ec.europa.eu/consumers/odr"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[var(--accent)] hover:underline"
                            >
                                https://ec.europa.eu/consumers/odr
                            </a>
                        </p>
                        <p>
                            We are not willing or obliged to participate in dispute resolution
                            proceedings before a consumer arbitration board.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
