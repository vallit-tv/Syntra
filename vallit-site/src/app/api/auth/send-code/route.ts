
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

// Configure Nodemailer
// Configure Nodemailer
// console.log("SMTP Config Loading...", { ... });

if (!process.env.SMTP_HOST) {
    throw new Error("SMTP_HOST is not defined in environment variables. Please restart the server.");
}

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // false for 587 (STARTTLS)
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: "Email required" }, { status: 400 });
        }

        // 1. Find User (limit to 1000 to catch more users)
        const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 });
        const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

        if (!user) {
            // Silently fail or return success to prevent enumeration?
            // For this specific internal app flow, we can return error or success.
            // Let's return error for debugging clarity as per user request.
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // 2. Refresh Code (Always generate new one on request)
        const accessCode = Math.floor(100000 + Math.random() * 900000).toString();

        // 3. Update Metadata
        // We force setup_required = true if they requested a code? 
        // Or only if they are already in that state?
        // User said: "if you type ... an email ... but got no password ... designed option to create"
        // If they have no password (or we can't check that easily), we rely on metadata.
        // Let's assume if they call this endpoint, they are verified by the UI flow to be in 'setup' state OR they are requesting a reset.
        // But for now, let's stick to updating existing metadata.

        const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
            user_metadata: {
                ...user.user_metadata,
                setup_required: true, // Re-enable setup if they requested a code
                access_code: accessCode
            }
        });

        if (updateError) throw updateError;

        // 4. Send Email
        const mailOptions = {
            from: `"Syntra Auth" <${process.env.SMTP_SENDER || process.env.SMTP_USER}>`,
            to: email,
            subject: 'Your Syntra Access Code',
            text: `Your access code is: ${accessCode}\n\nEnter this code to set up your account password.`,
            html: `
                <div style="font-family: sans-serif; color: #333;">
                    <h2>Setup Your Account</h2>
                    <p>Use the following access code to complete your account setup:</p>
                    <div style="font-size: 24px; font-weight: bold; background: #f4f4f5; padding: 12px; display: inline-block; border-radius: 8px; letter-spacing: 2px;">
                        ${accessCode}
                    </div>
                    <p style="margin-top: 20px; font-size: 14px; color: #666;">If you didn't request this, you can ignore this email.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Send code error:", error);
        return NextResponse.json({ error: "Failed to send code: " + error.message }, { status: 500 });
    }
}
