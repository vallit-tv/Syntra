
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v) {
        let val = v.join('=').trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
        }
        env[k.trim()] = val;
    }
});

const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.SUPABASE_SERVICE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

async function resetUser() {
    const email = "theorei@icloud.com";
    console.log(`Resetting setup for ${email}...`);

    const { data: { users } } = await supabase.auth.admin.listUsers();
    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
        console.error("User not found via listUsers??");
        return;
    }

    // Update user to require setup again
    const { error } = await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: {
            ...user.user_metadata,
            setup_required: true,
            setup_completed_at: null,
            access_code: null // Ensure no stale code
        }
    });

    if (error) {
        console.error("Failed to reset user:", error);
    } else {
        console.log("✅ User reset successfully!");
        console.log("Next login attempt will trigger 'Setup' flow and send a new code.");
    }
}

resetUser();
