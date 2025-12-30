# URGENT: Vercel Deployment Protection Blocking API Access

## The Problem

Your Vercel deployment has **Deployment Protection** enabled, which is blocking ALL requests to your API, including:
- iOS Shortcuts
- curl requests  
- Any external automation

This is why you're seeing the "Authentication Required" / "Vercel Authentication" page.

## Immediate Solution

1. **Go to Vercel Dashboard**: https://vercel.com/vallit/syntra/settings/security

2. **Navigate to**: Settings → Deployment Protection (or Security)

3. **Choose ONE of these options**:

   **Option A: Disable Protection (Recommended)**
   - Set to: "Standard Protection" → **OFF**
   - OR: "Only protect preview deployments" 
   - Make sure Production is accessible without authentication

   **Option B: Allow Bypass for Specific Paths**
   - If you must keep protection, you can configure path-based bypass
   - But this is more complex and may not work with iOS Shortcuts

## After Changing Settings

1. **Wait 1-2 minutes** for Vercel to apply changes
2. **Test with curl**:
   ```bash
   curl -X POST https://syntra-3igk4xegv-vallit.vercel.app/api/wake \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_API_KEY_HERE" \
     -d '{"event": "awake"}'
   ```

3. **Expected response** (if working):
   - JSON response from your API
   - NOT an HTML authentication page

4. **Then test iOS Shortcut** - it should work!

## Why This Happened

Vercel's Deployment Protection is designed to:
- Protect preview/staging deployments
- Require authentication before accessing your site
- Prevent unauthorized access

But it also blocks:
- ❌ API endpoints
- ❌ Webhooks
- ❌ iOS Shortcuts
- ❌ Any automated access

## For Production APIs

For production, you want:
- ✅ **No deployment protection** on production deployments
- ✅ **API key authentication** within your app (which you already have!)
- ✅ Protection only on preview/development deployments (optional)

Your app already has proper API key authentication (`Authorization: Bearer sk_live_...`), so you don't need Vercel's deployment protection blocking everything.

---

**Go disable that protection now, and your iOS Shortcut will work!** 🚀
