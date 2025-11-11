# How to Start n8n Server

**⚠️ IMPORTANT:** You have two options:
1. **Local setup (this guide)** - Runs on your PC via Docker (requires your PC to be on)
2. **External hosting (recommended)** - Runs on a cloud server 24/7 - See `N8N_EXTERNAL_HOSTING.md` for details

## Local Setup (Current)

The n8n server runs locally on your machine and is exposed to the internet via a tunnel so that Vercel can access it.

**Note:** This requires your PC to be running 24/7. For production use, consider external hosting (see `N8N_EXTERNAL_HOSTING.md`).

## Quick Start

### Option 1: Using ngrok (Recommended)

1. **Sign up for a free ngrok account** (if you haven't already):
   - Go to https://dashboard.ngrok.com/signup
   - It's free and takes 2 minutes

2. **Configure ngrok with your authtoken**:
   ```bash
   ngrok config add-authtoken YOUR_AUTHTOKEN
   ```
   (Get your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken)

3. **Start n8n with ngrok**:
   ```bash
   ./start-n8n-ngrok.sh
   ```

4. **Copy the public URL** that's displayed (e.g., `https://abc123.ngrok-free.app`)

5. **Update in Syntra Admin Panel**:
   - Log into your Syntra dashboard as admin
   - Go to Admin Panel → n8n Settings
   - Paste the ngrok URL
   - Save

### Option 2: Using Cloudflare Tunnel

1. **Start n8n with Cloudflare Tunnel**:
   ```bash
   ./start-n8n-tunnel.sh
   ```

2. **Copy the public URL** that's displayed (e.g., `https://abc123.trycloudflare.com`)

3. **Update in Syntra Admin Panel**:
   - Log into your Syntra dashboard as admin
   - Go to Admin Panel → n8n Settings
   - Paste the Cloudflare URL
   - Save

## Stopping n8n

To stop n8n and the tunnel:

**If using ngrok:**
```bash
./stop-n8n-ngrok.sh
```

**If using Cloudflare Tunnel:**
```bash
./stop-n8n-tunnel.sh
```

## Troubleshooting

### n8n won't start
- Make sure Docker is running: `docker ps`
- Check if port 5678 is already in use: `lsof -i :5678`
- View n8n logs: `docker-compose -f docker-compose.n8n.yml logs`

### Tunnel URL not working
- Wait 30-60 seconds for the tunnel to fully establish
- Check tunnel logs: `tail -f /tmp/ngrok-n8n.log` or `tail -f /tmp/cloudflared-n8n.log`
- Try restarting: stop and start again

### Can't access n8n from Vercel
- Make sure the URL in the admin panel matches exactly (including `https://`)
- Test the URL in your browser first: `https://YOUR-URL/healthz` should return `{"status":"ok"}`
- Check that the tunnel is still running: `ps aux | grep ngrok` or `ps aux | grep cloudflared`

## Getting n8n API Key

1. Open n8n in your browser: `http://localhost:5678` (or use the public URL)
2. Go to **Settings** → **API**
3. Click **Create API Key**
4. Copy the API key
5. Paste it in the Syntra Admin Panel → n8n Settings

## Important Notes

- **The tunnel URL changes** every time you restart (unless you have a paid ngrok account)
- **Update the URL in Syntra** whenever you restart the tunnel
- **Keep your terminal open** - closing it will stop the tunnel
- **Your PC must stay on** - if you shut down your computer, n8n stops
- **For production**, consider external hosting - see `N8N_EXTERNAL_HOSTING.md` for options (n8n Cloud, VPS, Railway, etc.)

## Want to Host Externally Instead?

If you don't want to keep your PC running 24/7, check out `N8N_EXTERNAL_HOSTING.md` for options to host n8n on:
- **n8n Cloud** ($20/month) - Managed service, zero maintenance
- **VPS** ($5-20/month) - Self-hosted, full control
- **Railway/Render** ($5-10/month) - Easy PaaS deployment

Syntra works with any n8n instance - you just need to set the `N8N_URL` and `N8N_API_KEY` environment variables.

