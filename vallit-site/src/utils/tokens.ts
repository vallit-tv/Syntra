import { SignJWT, jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function signInviteToken(payload: { userId: string; email: string }) {
    return await new SignJWT({ ...payload, type: 'invite' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(SECRET);
}

export async function verifyInviteToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, SECRET);
        if (payload.type !== 'invite') return null;
        return payload as { userId: string; email: string };
    } catch (error) {
        return null;
    }
}
