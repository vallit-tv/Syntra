# Wake Webhook Endpoint - iOS Shortcuts Integration

## Overview

The `/api/wake` endpoint provides a privacy-preserving way for phone automation (iOS Shortcuts, Android Tasker, etc.) to trigger the Syntra Daily Summary workflow. The endpoint automatically attaches the authenticated user's UUID server-side, ensuring no PII is ever exposed to client devices.

## Privacy Guarantees

- **No PII in Requests**: The endpoint rejects any request containing user_id, uuid, email, name, or other PII fields
- **Server-Side User Resolution**: User UUID is retrieved from authenticated session only (via `auth.current_user()`)
- **No PII in Responses**: Error messages never expose internal user IDs or database details
- **Masked Logging**: UUIDs in logs are masked to prevent PII exposure

## Authentication

This endpoint requires authentication. The phone automation must include valid session cookies from a logged-in Syntra session.

## Endpoint Details

**URL**: `POST https://your-backend.vercel.app/api/wake`

**Request Format**:
```json
{
  "event": "awake"
}
```

**Success Response** (`200 OK`):
```json
{
  "status": "ok"
}
```

**Error Response** (`400/401/500`):
```json
{
  "status": "error",
  "message": "Generic error message"
}
```

## iOS Shortcuts Configuration

### Step 1: Create New Shortcut

1. Open the **Shortcuts** app on your iPhone
2. Tap the **+** button to create a new shortcut
3. Name it "Wake Syntra" or similar

### Step 2: Add Web Request Action

1. Tap **Add Action**
2. Search for **"Get Contents of URL"**
3. Tap to add it

### Step 3: Configure the Web Request

**Method**: `POST`

**URL**: 
```
https://your-backend.vercel.app/api/wake
```
(Replace `your-backend.vercel.app` with your actual Vercel deployment URL)

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```
{
  "event": "awake"
}
```

**Important**: 
- Do NOT include any user_id, uuid, email, or other PII in the request
- The endpoint will reject requests containing PII fields

### Step 4: Handle Response (Optional)

Add actions to handle the response:

1. **Get Value for** → `Contents of URL`
2. **If** → `Contents of URL` contains `"status": "ok"`
3. **Show Notification** → "Daily summary triggered"
4. **Otherwise**
5. **Show Notification** → "Failed to trigger daily summary"

### Step 5: Set Up Automation Trigger

1. Tap the shortcut name at the top
2. Tap **Automation** tab
3. Tap **+** to create new automation
4. Choose **Personal Automation**
5. Select **Wake Up** (or **Time of Day** after Oura sync)
6. Configure trigger timing (e.g., "After 6:00 AM")
7. Add action: **Run Shortcut** → Select "Wake Syntra"
8. Turn off **Ask Before Running** if desired
9. Tap **Done**

## Android Tasker Configuration

If using Tasker for Android automation:

1. Create new **Task** named "Wake Syntra"
2. Add action: **HTTP Request**
3. Configure:
   - **Method**: POST
   - **URL**: `https://your-backend.vercel.app/api/wake`
   - **Headers**: `Content-Type: application/json`
   - **Body**: `{"event": "awake"}`
4. Create **Profile** → **Time** → Set trigger time
5. Link profile to task

## cURL Example

For testing from command line:

```bash
curl -X POST https://your-backend.vercel.app/api/wake \
  -H "Content-Type: application/json" \
  -H "Cookie: session=YOUR_SESSION_COOKIE" \
  -d '{"event": "awake"}'
```

**Note**: Replace `YOUR_SESSION_COOKIE` with a valid session cookie from a logged-in Syntra session.

## Authentication via Session Cookie

Since iOS Shortcuts and phone automation tools use HTTP requests, they rely on session cookies for authentication. To enable this:

1. **First-time setup**: Log into Syntra in Safari on your iPhone
2. **Enable Cookies**: Ensure Safari allows cookies from your domain
3. **Shortcuts Permissions**: When running the shortcut for the first time, Shortcuts may prompt for permission to access cookies

### Alternative: API Key Authentication (Future Enhancement)

For more robust authentication without session cookies, consider implementing API key authentication:

1. Generate API key in Syntra dashboard
2. Include in request header: `Authorization: Bearer YOUR_API_KEY`
3. Update endpoint to support API key authentication

## Troubleshooting

### "Authentication required" Error

- Ensure you're logged into Syntra in Safari with cookies enabled
- Verify the shortcut has permission to access cookies
- Try logging out and back into Syntra, then retry the shortcut

### "Invalid request format" Error

- Ensure request body is exactly: `{"event": "awake"}`
- Verify Content-Type header is set to `application/json`
- Do NOT include user_id, uuid, email, or other PII fields

### "Failed to process wake event" Error

- Check that `N8N_WEBHOOK_URL` environment variable is set (or default URL is accessible)
- Verify n8n webhook endpoint is active and accessible
- Check server logs for detailed error information (with masked UUIDs)

## Privacy-First Design

This endpoint is designed with privacy as the core principle:

1. **Client sends minimal data**: Only `{"event": "awake"}` - no user identification
2. **Server resolves user**: User UUID retrieved from authenticated session server-side
3. **No PII in logs**: UUIDs are masked in logs as `[USER_ID]` in production
4. **Generic errors**: Error messages never expose internal details or user IDs
5. **PII rejection**: Any request containing PII fields is immediately rejected

This ensures that even if the phone automation is compromised, no user identification information can be extracted.

## Next Steps

After the webhook is triggered:

1. Flask endpoint forwards to n8n Daily Summary webhook
2. n8n workflow receives `user_uuid`, `event`, `timestamp`, `source`
3. n8n workflow processes Daily Summary:
   - Fetches Oura data
   - Gets weather information
   - Retrieves calendar events
   - Generates AI-powered daily summary
   - Logs result in `ai_advice_history` table

See `N8N_INTEGRATION.md` for detailed n8n workflow setup.

