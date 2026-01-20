
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: Request) {
    try {
        const { email, code, password } = await request.json();

        if (!email || !code || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
        }

        // 1. Find User
        const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 });
        const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // 2. Verify Code
        const storedCode = user.user_metadata?.access_code;
        const needsSetup = user.user_metadata?.setup_required;

        // 2. Verify Code
        const storedCode = user.user_metadata?.access_code;
        const needsSetup = user.user_metadata?.setup_required;

        // Debug logging removed for security
        // console.log("Verifying setup:", { ... });

        // Ensure we strictly check for setup_required to prevent overwriting active users
        // Loose comparison for code to handle string/number mismatches
        if (!needsSetup || String(storedCode).trim() !== String(code).trim()) {
            return NextResponse.json({
                error: "Invalid access code",
                details: `Stored: ${storedCode}, Recv: ${code}, Setup: ${needsSetup}` // Debugging details in response
            }, { status: 401 });
        }

        // 3. Update Password & Clear Metadata
        const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
            password: password,
            email_confirm: true,
            user_metadata: {
                ...user.user_metadata,
                setup_required: false,
                access_code: null, // Clear code
                setup_completed_at: new Date().toISOString()
            }
        });

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Complete setup error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
