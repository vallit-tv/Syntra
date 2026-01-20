
import { NextResponse } from 'next/server';
import { verifyInviteToken } from '@/utils/tokens';
import { createClient } from '@supabase/supabase-js';

// Service client for updates
const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: Request) {
    try {
        const { token, password } = await request.json();

        if (!token || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const payload = await verifyInviteToken(token);

        if (!payload) {
            return NextResponse.json({ error: "Invalid or expired invitation" }, { status: 401 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
        }

        // Update User Password
        const { error: updateError } = await supabase.auth.admin.updateUserById(payload.userId, {
            password: password,
            email_confirm: true // Confirm email if not verified
        });

        if (updateError) {
            console.error("Update user error:", updateError);
            return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
        }

        // Optional: Mark metadata as setup_complete if we were tracking it
        await supabase.auth.admin.updateUserById(payload.userId, {
            user_metadata: { setup_complete: true }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Complete setup error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
