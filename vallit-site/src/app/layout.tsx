import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { KianWidget } from "@/components/kian-widget/kian-widget";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Vallit – Done-for-you AI Automation",
    template: "%s | Vallit",
  },
  description:
    "Vallit builds and deploys AI automation systems that integrate into your real stack. Kian handles support, scheduling, and workflows end-to-end.",
  keywords: [
    "AI automation",
    "managed AI",
    "enterprise automation",
    "Kian AI",
    "workflow automation",
    "support automation",
    "scheduling AI",
  ],
  authors: [{ name: "Vallit" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Vallit",
    title: "Vallit – Done-for-you AI Automation",
    description:
      "We build and deploy AI systems that integrate into your real stack and processes.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vallit – Done-for-you AI Automation",
    description:
      "We build and deploy AI systems that integrate into your real stack and processes.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} antialiased`}>
        {/* Skip to main content (Accessibility) */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        {/* Global background glow layer */}
        <div className="global-glow" aria-hidden="true" />

        {/* Navigation */}
        <Navbar />

        {/* Main Content */}
        <main id="main-content">{children}</main>

        {/* Footer */}
        <Footer />

        {/* Kian Chatbot Widget */}
        <KianWidget />
      </body>
    </html>
  );
}
