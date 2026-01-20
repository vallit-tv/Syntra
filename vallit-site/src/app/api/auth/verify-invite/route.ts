
import { NextResponse } from 'next/server';
import { verifyInviteToken } from '@/utils/tokens';
import { createClient } from '@supabase/supabase-js';

// Service client for admin checks
const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: Request) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json({ error: "Token required" }, { status: 400 });
        }

        const payload = await verifyInviteToken(token);

        if (!payload) {
            return NextResponse.json({ error: "Invalid or expired invitation" }, { status: 401 });
        }

        // Optional: Check if user claims to be set up already?
        // For now, stateless check is enough.

        return NextResponse.json({ email: payload.email });

    } catch (error) {
        return NextResponse.json({ error: "Verification failed" }, { status: 500 });
    }
}
