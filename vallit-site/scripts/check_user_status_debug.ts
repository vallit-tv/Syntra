
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

async function checkUser() {
    console.log("Checking user status...");

    // List users (filtering by email locally since listUsers doesn't support filter in all versions check)
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error("Error listing users:", error);
        return;
    }

    console.log(`Found ${users.length} users:`);
    users.forEach(u => {
        console.log(`- ${u.email} (ID: ${u.id})`);
        console.log(`  Confirmed: ${u.email_confirmed_at}`);
        console.log(`  Metadata:`, JSON.stringify(u.user_metadata));
    });
}

checkUser();
