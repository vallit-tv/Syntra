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
        id: "automation",
        keywords: ["automate", "automation", "automatisieren", "automatisierung"],
        content: "I can help automate customer support, meeting scheduling, workflow execution, and more. Kian understands your business context and handles tasks end-to-end. Would you like to learn about a specific area?",
    },
    {
        id: "scheduling",
        keywords: ["schedule", "scheduling", "calendar", "termin", "kalender", "appointment"],
        content: "I can help you schedule an appointment with our team. Please select a time that works for you.",
        action: "calendar",
    },
    {
        id: "pricing",
        keywords: ["price", "pricing", "cost", "kosten", "preis"],
        content: "We offer tailored solutions for every business. To give you an exact quote, we'd need to understand your requirements better. Shall we set up a quick call?",
        action: "calendar", // Driving to calendar is usually better for sales
    },
    {
        id: "contact",
        keywords: ["contact", "email", "mail", "kontakt", "sprechen", "talk"],
        content: "I'd be happy to connect you with our team! You can either book a direct slot or leave your details.",
        action: "calendar",
    },
    {
        id: "fallback",
        keywords: [],
        content: "I'm not sure I quite understood that. However, our team certainly can! Would you like to schedule a quick chat to discuss your needs?",
        action: "calendar",
    }
];

export const gettingStartedPrompts = [
    "What can you automate?",
    "Book an appointment",
    "Pricing info",
    "Contact support"
];
