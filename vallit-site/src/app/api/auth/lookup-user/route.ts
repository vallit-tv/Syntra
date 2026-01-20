
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

        // List users to find by email (Service role required)
        // Since we can't filter by email in listUsers efficiently without pagination if there are many users,
        // but for now this is fine. 
        // Optimized way: Use getUserById is not possible if we don't have ID.
        // We accept listUsers overhead for this specific onboarding flow.
        const { data: { users }, error } = await supabase.auth.admin.listUsers();

        if (error) throw error;

        const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

        if (!user) {
            // Return 'unknown' allows the UI to just ask for password (and fail normally)
            // preventing user enumeration if desired, OR we can be explicit for this use case.
            // Client wants "Integrated designed option", so explicit is better for UX.
            return NextResponse.json({ status: 'unknown' });
        }

        const needsSetup = user.user_metadata?.setup_required === true;

        return NextResponse.json({
            status: needsSetup ? 'setup_required' : 'active',
            email: user.email
        });

    } catch (error) {
        console.error("Lookup error:", error);
        return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
    }
}
