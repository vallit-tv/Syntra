import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: "Privacy policy and data protection information for Vallit.",
};

export default function DatenschutzPage() {
    return (
        <div className="pt-32 pb-20 md:pt-40 md:pb-24">
            <div className="container mx-auto px-6 max-w-3xl">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
                    Privacy Policy
                </h1>

                <div className="prose prose-invert max-w-none space-y-8 text-[var(--gray-300)]">
                    <div className="p-6 bg-[rgba(255,255,255,0.03)] rounded-xl border border-[rgba(255,255,255,0.08)]">
                        <p className="text-[var(--gray-400)] text-sm mb-4">
                            ⚠️ Placeholder: Replace with your actual privacy policy
                        </p>
                    </div>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">
                            1. Introduction
                        </h2>
                        <p>
                            We take the protection of your personal data very seriously. This
                            privacy policy explains how we collect, use, and protect your
                            information when you use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">
                            2. Data Controller
                        </h2>
                        <p>
                            The data controller responsible for data processing on this website
                            is:
                        </p>
                        <p>
                            Vallit GmbH
                            <br />
                            [Address]
                            <br />
                            Email: privacy@vallit.net
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">
                            3. Data We Collect
                        </h2>
                        <p>We may collect the following types of data:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Contact information (name, email, company)</li>
                            <li>Usage data (pages visited, features used)</li>
                            <li>Communication data (support requests, feedback)</li>
                            <li>Technical data (IP address, browser type)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">
                            4. How We Use Your Data
                        </h2>
                        <p>We use your data to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Provide and improve our services</li>
                            <li>Respond to your inquiries</li>
                            <li>Send relevant communications (with your consent)</li>
                            <li>Comply with legal obligations</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">
                            5. Data Sharing
                        </h2>
                        <p>
                            We do not sell your personal data. We may share data with service
                            providers who help us operate our business, subject to appropriate
                            data protection agreements.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">
                            6. Data Retention
                        </h2>
                        <p>
                            We retain your data only as long as necessary for the purposes
                            described in this policy or as required by law.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">
                            7. Your Rights
                        </h2>
                        <p>Under GDPR, you have the right to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Access your personal data</li>
                            <li>Rectify inaccurate data</li>
                            <li>Request deletion of your data</li>
                            <li>Restrict processing of your data</li>
                            <li>Data portability</li>
                            <li>Object to processing</li>
                        </ul>
                        <p className="mt-4">
                            To exercise these rights, contact us at privacy@vallit.net.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">
                            8. Cookies
                        </h2>
                        <p>
                            We use essential cookies to ensure our website functions properly.
                            We may also use analytics cookies to understand how visitors use
                            our site. You can manage cookie preferences in your browser
                            settings.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">
                            9. Security
                        </h2>
                        <p>
                            We implement appropriate technical and organizational measures to
                            protect your data against unauthorized access, alteration, or
                            destruction.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">
                            10. Changes to This Policy
                        </h2>
                        <p>
                            We may update this privacy policy from time to time. We will notify
                            you of significant changes by posting a notice on our website.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">
                            11. Contact
                        </h2>
                        <p>
                            For privacy-related inquiries, contact us at:
                            <br />
                            Email: privacy@vallit.net
                        </p>
                    </section>

                    <p className="text-sm text-[var(--gray-500)] mt-8">
                        Last updated: January 2026
                    </p>
                </div>
            </div>
        </div>
    );
}
