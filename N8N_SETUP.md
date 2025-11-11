# n8n Setup Guide

**Choose your setup:**

1. **🏠 Local Setup (this guide)** - Run n8n on your PC via Docker
   - ✅ Free
   - ❌ Requires your PC to be on 24/7
   - ❌ Tunnel URL changes on restart

2. **☁️ External Hosting (recommended)** - Run n8n on a cloud server
   - ✅ Always online
   - ✅ No need to keep PC on
   - ✅ Stable URL
   - See `N8N_EXTERNAL_HOSTING.md` for details

This guide explains the local setup. For production, we recommend external hosting.

## Quick Start

### Option A: Using ngrok (Recommended - Most Reliable)

1. **Sign up for free ngrok account** (takes 2 minutes):
   - Go to https://dashboard.ngrok.com/signup
   - Verify your email

2. **Get and configure your authtoken:**
   ```bash
   # Get your authtoken from: https://dashboard.ngrok.com/get-started/your-authtoken
   ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
   ```

3. **Start n8n with ngrok:**
   ```bash
   ./start-n8n-ngrok.sh
   ```

4. **Get your n8n API key:**
   - Open n8n in your browser (use the public URL from the script output)
   - Go to Settings → API
   - Create a new API key
   - Copy the key

5. **Connect in Syntra dashboard:**
   - Go to your Syntra dashboard → Integrations
   - Click "Connect" on n8n
   - Enter the public URL (from step 3)
   - Enter your API key
   - Click "Save"

### Option B: Using Cloudflare Tunnel (Free, No Account)

⚠️ **Note:** Cloudflare tunnels can be unreliable due to network/firewall issues.

1. **Start n8n with Cloudflare tunnel:**
   ```bash
   ./start-n8n-tunnel.sh
   ```

2. **If you get Error 1033:**
   - Wait 30-60 seconds for tunnel to establish
   - Check `N8N_TROUBLESHOOTING.md` for solutions
   - Consider using ngrok (Option A) instead

3. **Get your n8n API key** (same as Option A step 4)

4. **Connect in Syntra dashboard** (same as Option A step 5)

## Current Setup

- **n8n runs locally** on your Mac via Docker
- **Cloudflare Tunnel** exposes it to the internet (free, no account needed)
- **Your Syntra dashboard** on Vercel connects to it via API

## Important Notes

### Tunnel URL Changes
⚠️ **The Cloudflare Tunnel URL changes each time you restart it!**

When you restart the tunnel, you'll need to:
1. Run `./start-n8n-tunnel.sh` again
2. Get the new public URL
3. Update it in your Syntra dashboard integrations

### Persistent URL (Optional)
For a stable URL, you can:
1. Sign up for a free Cloudflare account
2. Create a named tunnel with a custom domain
3. Use that URL instead

### n8n Data Persistence
Your n8n workflows are stored in a Docker volume (`syntra_n8n_data`), so they persist even if you restart the container.

## Manual Commands

### Start n8n only (no tunnel)
```bash
docker-compose -f docker-compose.n8n.yml up -d
```

### Start tunnel only
```bash
cloudflared tunnel --url http://localhost:5678
```

### Stop everything
```bash
./stop-n8n-tunnel.sh
```

### Check n8n status
```bash
docker ps | grep n8n
curl http://localhost:5678/healthz
```

## Access n8n

- **Local:** http://localhost:5678
- **Public:** Use the URL from `./start-n8n-tunnel.sh` output

## Troubleshooting

### n8n won't start
```bash
# Check logs
docker-compose -f docker-compose.n8n.yml logs

# Restart
docker-compose -f docker-compose.n8n.yml restart
```

### Tunnel not working
```bash
# Check tunnel logs
cat /tmp/cloudflared-n8n.log

# Restart tunnel
pkill cloudflared
./start-n8n-tunnel.sh
```

### Port already in use
If port 5678 is already in use:
1. Edit `docker-compose.n8n.yml`
2. Change `"5678:5678"` to `"5679:5678"` (or another port)
3. Update tunnel command: `cloudflared tunnel --url http://localhost:5679`

## Next Steps

1. ✅ n8n is running locally
2. ✅ Tunnel exposes it to internet
3. ⏭️ Get API key from n8n Settings → API
4. ⏭️ Connect in Syntra dashboard → Integrations
5. ⏭️ Sync workflows from Syntra dashboard

## Cost

**$0** - Everything is free:
- Docker Desktop (free)
- n8n (open source, free)
- Cloudflare Tunnel (free, no account needed)
- Vercel hosting (you're already paying for this)

Enjoy your free n8n setup! 🎉

