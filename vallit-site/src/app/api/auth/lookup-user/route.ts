
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service client for checking user status
const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: "Email required" }, { status: 400 });
        }

        const { data: { users }, error } = await supabase.auth.admin.listUsers();

        if (error) throw error;

        const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

        if (!user) {
            return NextResponse.json({ status: 'unknown' });
        }

        // Logic check:
        // 1. If explicit setup_required is true
        // 2. OR if we want to force this based on the user request context (user wants to setup)
        // Since this is just a check, we stick to metadata.
        // BUT, given the user is trying to fix their account, maybe we should treat 'setup_required' more loosely?
        // No, let's keep it strict. The 'send-code' endpoint is what sets the flag to true.

        // HOWEVER, to enable the flow where "user wants to generate code",
        // we might need to tell the UI "Hey, this user exists".
        // If the user has NO password set (unlikely to know), we rely on flags.

        const needsSetup = user.user_metadata?.setup_required === true;

        // If I manually cleared it, I need to manually set it back or use the send-code endpoint.
        // Since I can't easily reset it from here without auth, I'll rely on the manual script I run once, 
        // OR the user can use the "Reset Password" flow (which is email based) -> but Supabase email is broken.
        // So the user is stuck if setup_required is false but they don't know password.

        // Solution: If the user fails login X times, or requests help?
        // For now, I will manually run the script to output 'setup_required: true' for the admin user.

        return NextResponse.json({
            status: needsSetup ? 'setup_required' : 'active',
            email: user.email
        });

    } catch (error) {
        console.error("Lookup error:", error);
        return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
    }
}
