
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env.local manually to ensure we have the values
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

console.log("Loaded Env Config for SMTP:", {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    sender: env.SMTP_SENDER,
    passLength: env.SMTP_PASS ? env.SMTP_PASS.length : 0
});

async function testSMTP() {
    const transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: parseInt(env.SMTP_PORT || '587'),
        secure: env.SMTP_PORT === '465', // false for 587, true for 465
        auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
        },
        connectionTimeout: 10000,
        debug: true,
        logger: true
    });

    try {
        console.log("Verifying SMTP connection...");
        await transporter.verify();
        console.log("✅ SMTP Connection Verified!");

        console.log("Attempting to send test email...");
        const info = await transporter.sendMail({
            from: `"Test" <${env.SMTP_SENDER || env.SMTP_USER}>`,
            to: "reicherttheo@icloud.com",
            subject: "SMTP Test Verification",
            text: "If you receive this, SMTP is working correctly from the script.",
        });
        console.log("✅ Message sent: %s", info.messageId);
    } catch (error) {
        console.error("❌ SMTP Verification Failed:", error);
    }
}

testSMTP();
