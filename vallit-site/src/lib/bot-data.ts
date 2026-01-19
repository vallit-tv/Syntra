export interface BotConfig {
    companyName: string;
    primaryColor: string;
    customFieldLabel: string; // e.g., "Seminar Interest" or "Project Type"
    locale: "en" | "de";
}

export interface BotResponse {
    id: string;
    keywords: string[];
    content: string;
    action?: "calendar" | "contact_form";
}

export const defaultBotConfig: BotConfig = {
    companyName: "Vallit",
    primaryColor: "#22c55e",
    customFieldLabel: "Topic of Interest",
    locale: "en",
};

export const botKnowledgeBase: BotResponse[] = [
    {
        id: "greeting",
        keywords: ["hey", "hi", "hello", "hallo", "greetings", "moin"],
        content: "Hello! I'm Kian. I can tell you about our automation services, scheduling features, or help you find the right contact. What are you looking for?",
    },
    {
        id: "automation",
        keywords: ["automate", "automation", "automatisieren", "automatisierung"],
        content: "I can help automate customer support, meeting scheduling, workflow execution, and more. Kian understands your business context and handles tasks end-to-end. Would you like to learn about a specific area?",
    },
    {
        id: "scheduling",
        keywords: ["schedule", "scheduling", "calendar", "termin", "kalender", "appointment"],
        content: "Our scheduling agent manages calendars, sends invites, and handles rescheduling automatically. It works with Google Calendar and Outlook. Would you like to see a demo?",
        // action: "calendar", // Disabled for Vallit main site - specific booking is for clients only
    },
    {
        id: "pricing",
        keywords: ["price", "pricing", "cost", "kosten", "preis"],
        content: "We offer tailored solutions for every business. To give you an exact quote, we'd need to understand your requirements better. You can check our pricing page for more details.",
        // action: "calendar", 
    },
    {
        id: "contact",
        keywords: ["contact", "email", "mail", "kontakt", "sprechen", "talk"],
        content: "I'd be happy to connect you with our team! Please use the contact form on our website to reach out.",
        action: "contact_form", // Changed to generic text or handled differently
    },
    {
        id: "fallback",
        keywords: [],
        content: "I'm not sure I quite understood that. However, our team certainly can! Please browse our solutions page or contact us directly.",
        // action: "calendar",
    }
];

export const gettingStartedPrompts = [
    "What can you automate?",
    "How does it work?", // Changed from "Show scheduling"
    "Pricing info",
    "Contact support"
];
