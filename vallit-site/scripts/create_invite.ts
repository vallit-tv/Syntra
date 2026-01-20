import { createClient } from '@supabase/supabase-js';
import { SignJWT } from 'jose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Re-using env loader
function loadEnv(filePath: string) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        const env: Record<string, string> = {};
        for (const line of lines) {
            if (!line || line.startsWith('#')) continue;
            const parts = line.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                let value = parts.slice(1).join('=').trim();
                if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                env[key] = value;
            }
        }
        return env;
    } catch (err) {
        return {};
    }
}

const envPath = path.resolve(__dirname, '../.env.local');
const env = loadEnv(envPath);

const supabaseUrl = process.env.SUPABASE_URL || env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: SUPABASE_URL or SUPABASE_SERVICE_KEY not found');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const SECRET = new TextEncoder().encode(supabaseServiceKey);

async function createInvite() {
    const args = process.argv.slice(2);
    const email = args[0];

    if (!email) {
        console.error('Usage: npx ts-node --esm scripts/create_invite.ts <email>');
        process.exit(1);
    }

    try {
        console.log(`Checking user ${email}...`);

        let userId: string;

        // 1. Get or Create User
        // Try to list by email (slow but reliable for ensuring exists)
        const { data: usersData } = await supabase.auth.admin.listUsers();
        let user = usersData?.users.find(u => u.email === email);

        if (!user) {
            console.log('User not found. Creating user...');
            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                email,
                password: 'temp-password-' + Math.random().toString(36), // Temp random password
                email_confirm: true
            });
            if (createError) throw createError;
            user = newUser.user;
            console.log(`Created user: ${user.id}`);
        } else {
            console.log(`Found existing user: ${user.id}`);
        }

        userId = user.id;

        // 2. Generate Token
        // This MUST match the verification logic in src/utils/tokens.ts
        const token = await new SignJWT({ userId, email })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('7d')
            .sign(SECRET);

        const link = `https://vallit.net/setup-account?token=${token}`;

        console.log('');
        console.log('✅ Invitation Link Generated:');
        console.log('='.repeat(80));
        console.log(link);
        console.log('='.repeat(80));
        console.log('');
        console.log('Send this link to the user. It allows them to set their password immediately.');

    } catch (err: any) {
        console.error('Error:', err.message);
    }
}

createInvite();
