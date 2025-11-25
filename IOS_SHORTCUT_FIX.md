# iOS Shortcut Configuration Issue - Troubleshooting

## Problem

Your iOS Shortcut is showing "Enable JavaScript to continue" with a Vercel Security Checkpoint error. This happens because of URL and authentication issues.

## Issues Found

### 1. ❌ Wrong URL
**Current:** `https://vallit.net/api/wake`  
**Should be:** `https://syntra-3igk4xegv-vallit.vercel.app/api/wake`

Or if vallit.net is configured as a custom domain, it needs to be properly set up in Vercel.

### 2. ⚠️ Authorization Header Format
**Current:** `YOUR_API_KEY_HERE`  
**Should include "Bearer ":** `Bearer YOUR_API_KEY_HERE`

> **Note:** Looking at your screenshot, it seems you may have the "Bearer " prefix added, but it's hard to tell if the space is there.

## Quick Fix for Your iOS Shortcut

![Shortcut Configuration](/Users/theoreichert/.gemini/antigravity/brain/c36fd4b5-aea1-4923-a713-3729cfff4523/uploaded_image_1764068570913.png)

### Update These Settings:

1. **URL:** Change to `https://syntra-3igk4xegv-vallit.vercel.app/api/wake`

2. **Authorization Header:** Make sure it includes "Bearer " (with a space):
   ```
   Bearer YOUR_API_KEY_HERE
   ```

3. **Body:** Keep as is:
   ```json
   {
     "event": "awake"
   }
   ```

## If You Want to Use vallit.net

You need to configure a custom domain in Vercel:

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add `vallit.net` as a custom domain
3. Update your DNS records to point to Vercel

Until then, use the Vercel deployment URL: `https://syntra-3igk4xegv-vallit.vercel.app`

## Testing the Endpoint

You can test if the endpoint works using curl:

```bash
curl -X POST https://syntra-3igk4xegv-vallit.vercel.app/api/wake \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -d '{"event": "awake"}'
```

Expected response should be something like:
```json
{
  "success": true,
  "message": "Wake event received"
}
```

## Common Issues

### Vercel Security Checkpoint
- This appears when Vercel detects suspicious traffic
- Using the correct URL and headers should avoid this
- Make sure you're using HTTPS (not HTTP)

### Empty Response Box
- Usually means the endpoint returned an error
- Check the Authorization header format
- Verify the URL is correct
- Ensure the API key is valid

## Next Steps

1. Update your iOS Shortcut with the correct URL
2. Verify the Authorization header has "Bearer " prefix
3. Test the shortcut
4. If it still doesn't work, we can add more detailed error logging to the endpoint
