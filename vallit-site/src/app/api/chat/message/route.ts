import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { message, session_id } = body;

        if (!message) {
            return NextResponse.json({ error: "Message required" }, { status: 400 });
        }

        if (!process.env.OPENAI_API_KEY) {
            console.error("Missing OPENAI_API_KEY");
            return NextResponse.json({
                status: "error",
                response: "My brain is offline (Missing API Key). Please tell the developer."
            });
        }

        // Vallit Sales Bot System Prompt
        const systemPrompt = `You are Kian, the AI assistant for Vallit Network (vallit.net).
Your goal is to help businesses understand how AI automation can save them time and money.

CORE SERVICES:
1. **AI Appointment Booking**: Automated scheduling via Chat/WhatsApp.
2. **Customer Support Bots**: 24/7 intelligent answers.
3. **Workflow Automation**: Connecting tools like Zoom, HubSpot, Email, etc.

TONE: Professional, helpful, concise, and innovation-focused.
If queried about "prices", say we offer custom enterprise solutions and suggest booking a call.

If the user asks "What can you do?", list the Core Services.
Keep answers under 3 sentences unless detailed explanation is requested.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message },
            ],
            temperature: 0.7,
            max_tokens: 300,
        });

        const aiResponse = completion.choices[0].message.content;

        return NextResponse.json({
            status: "success",
            session_id: session_id,
            response: aiResponse,
        });

    } catch (error) {
        console.error("Chat API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
