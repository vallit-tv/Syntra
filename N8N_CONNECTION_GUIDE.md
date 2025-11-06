# n8n Connection Guide

This guide explains how to connect your locally running n8n instance (via ngrok) to your Syntra dashboard hosted on Vercel.

## Prerequisites

1. n8n running locally via Docker (see `N8N_SETUP.md`)
2. ngrok tunnel active (see `start-n8n-ngrok.sh`)
3. Admin role in Syntra dashboard

## Step 1: Get Your n8n Public URL

When you run `./start-n8n-ngrok.sh`, you'll see output like:

```
✓ n8n is now accessible at:
  Local:  http://localhost:5678
  Public: https://unbiographical-uncontrastably-alberto.ngrok-free.dev
```

**Copy the Public URL** - this is what you'll use in the Syntra dashboard.

## Step 2: Get Your n8n API Key

1. Open your n8n instance in a browser (use the Public URL from ngrok)
2. Log in to n8n
3. Go to **Settings** → **API**
4. Click **Create API Key**
5. Give it a name (e.g., "Syntra Dashboard")
6. **Copy the API key** - you'll need this in the next step

## Step 3: Connect in Syntra Dashboard

1. Log in to your Syntra dashboard (hosted on Vercel)
2. Navigate to **Dashboard** → **Integrations**
3. Find the **n8n** card
4. Click **Connect n8n** (admin-only button)
5. Enter:
   - **n8n API URL**: Your ngrok public URL (e.g., `https://xxx.ngrok-free.dev`)
   - **n8n API Key**: The API key you created in Step 2
6. Click **Connect**

The dashboard will test the connection and save it if successful.

## Step 4: Sync Workflows

Once connected:

1. Go to **Dashboard** → **Workflows**
2. Click **Sync with n8n** to fetch workflows from your n8n instance
3. Your workflows will appear in the Syntra dashboard

## Important Notes

- **Keep ngrok running**: The tunnel must stay active for the connection to work
- **ngrok URLs change**: If you restart ngrok, you'll get a new URL and need to update the connection
- **API Key security**: The API key is stored securely in your database
- **Admin only**: Only users with the `admin` role can connect n8n

## Troubleshooting

### Connection fails with "Cannot connect to n8n"
- Check that ngrok is still running: `ps aux | grep ngrok`
- Verify the ngrok URL is correct
- Make sure n8n is accessible via the ngrok URL in your browser

### Connection fails with "Invalid API key"
- Verify the API key in n8n Settings → API
- Make sure you copied the entire key (no spaces)
- Try creating a new API key

### Connection works but sync fails
- Check that the n8n instance is running: `docker ps | grep n8n`
- Verify the API key has proper permissions in n8n
- Check the browser console for detailed error messages

## Next Steps

- Set up a persistent ngrok URL (requires ngrok account)
- Consider using Cloudflare Tunnel for a more stable connection
- Explore workflow automation features in the Syntra dashboard

