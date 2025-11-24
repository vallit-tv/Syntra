# Daily Summary System Verification & Setup Guide

## 1. Database Setup (Supabase)
You need to create the required tables for the Daily Summary system.

1.  Go to your **Supabase Dashboard** -> **SQL Editor**.
2.  Open the file `database_migration_fix.sql` (NOT the previous one) from this repository.
3.  Copy the contents and paste them into the SQL Editor.
4.  Click **Run**.
5.  Verify that the following tables are created/updated:
    *   `conversations`
    *   `ai_advice_history`
    *   `integrations`

## 2. Environment Configuration (Vercel)
Ensure the following environment variables are set in your Vercel project settings:

*   `N8N_WEBHOOK_URL`: The URL of your n8n webhook (e.g., `https://vyrez.app.n8n.cloud/webhook/daily-summary`).
*   `SUPABASE_URL`: Your Supabase project URL.
*   `SUPABASE_SERVICE_KEY`: Your Supabase service role key.
*   `FLASK_SECRET_KEY`: A strong random string for session security.
*   `APP_URL`: `https://vallit.net` (Optional, but good practice).

**Action Required:**
If `N8N_WEBHOOK_URL` is missing, add it now.

## 3. iOS Shortcut Setup
To trigger the Daily Summary from your iPhone:

1.  Open the **Shortcuts** app.
2.  Create a new Shortcut named **"Wake Up Syntra"**.
3.  Add the **"Get Contents of URL"** action.
4.  Configure it as follows:
    *   **URL**: `https://vallit.net/api/wake`
    *   **Method**: `POST`
    *   **Headers**:
        *   `Content-Type`: `application/json`
    *   **Request Body**: `JSON`
        *   Add a new field: `event` (Text) -> `awake`
5.  **CRITICAL:** You must be logged in to `vallit.net` on Safari for this to work, as it shares the session cookies.
    *   Open Safari on your iPhone.
    *   Go to `https://vallit.net/login` and log in.
    *   The Shortcut will now be able to authenticate using your Safari session cookies.

## 4. Testing the Pipeline

### Method A: cURL (Local Testing)
If you are running the app locally (`flask run`), you can test with cURL. You need your session cookie.

1.  Log in to the app in your browser.
2.  Open Developer Tools -> Application -> Cookies.
3.  Copy the value of `syntra_session`.
4.  Run:
    ```bash
    curl -X POST http://localhost:5000/api/wake \
      -H "Content-Type: application/json" \
      -d '{"event": "awake"}' \
      -b "syntra_session=PASTE_YOUR_COOKIE_HERE"
    ```

### Method B: End-to-End (Production)
1.  Ensure you are logged in on your phone's Safari.
2.  Run the **"Wake Up Syntra"** Shortcut.
3.  **Check n8n:** Go to your n8n dashboard and check the "Executions" tab for the "Daily Summary" workflow. You should see a new successful execution.
4.  **Check Supabase:**
    *   Check the `conversations` table for a new entry.
    *   Check `ai_advice_history` for the generated advice.

## 5. Troubleshooting

*   **Empty Result in Shortcut:**
    *   **Cause 1:** You haven't redeployed the app to Vercel after the changes. **Action:** Redeploy now.
    *   **Cause 2:** You are not logged in. **Action:** Open Safari, go to `https://vallit.net/login`, and log in.
    *   **Cause 3:** The Shortcut isn't showing the output. **Action:** Add a "Quick Look" action after "Get Contents of URL" to see the raw response.
    *   **Cause 4:** Vercel is blocking the request. **Action:** Check Vercel logs.

*   **401 Unauthorized:** You are not logged in. Log in via Safari (or the browser you are using).
*   **400 Invalid Request:** The JSON body is incorrect. Ensure it is exactly `{"event": "awake"}`.
*   **502 Bad Gateway:** The Flask app couldn't reach n8n. Check your `N8N_WEBHOOK_URL` and ensure the n8n workflow is active.
*   **Database Errors:** Ensure you ran the SQL migration script.

## Summary of Changes
*   **Modified `app.py`:** Added `/api/wake` endpoint and `N8N_WEBHOOK_URL` environment check.
*   **Created `database_migration_daily_summary.sql`:** SQL script to create missing tables.
