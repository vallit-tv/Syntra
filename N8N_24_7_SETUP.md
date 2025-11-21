# n8n 24/7 Setup Guide

This guide provides solutions for running n8n workflows 24/7 without interruption. Free ngrok tunnels expire after ~2 hours, so you need a persistent solution.

## Quick Solutions (Ranked by Reliability)

### Option 1: Auto-Restart Monitor Script (Quick Fix) ⚡

**Best for:** Development, testing, temporary use

This script automatically restarts ngrok when it expires and updates your `.env` file.

```bash
# Start the monitor
chmod +x monitor-ngrok.sh
./monitor-ngrok.sh

# Stop the monitor
./stop-ngrok-monitor.sh
```

**Pros:**
- Free
- Works immediately
- Auto-updates `.env` file

**Cons:**
- URL changes every ~2 hours (requires app restart)
- Not ideal for production
- Brief downtime during restart (~10 seconds)

**Note:** Your app will automatically reload when deployed to Vercel.

---

### Option 2: ngrok Paid Plan (Easiest) 💰

**Best for:** Production, when you need a stable URL

ngrok offers reserved domains that never expire.

1. **Sign up for ngrok paid plan** ($8/month):
   - Go to https://dashboard.ngrok.com/billing
   - Choose a plan with reserved domains

2. **Reserve a domain**:
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ngrok http 5678 --domain=your-reserved-domain.ngrok-free.app
   ```

3. **Update start script** to use reserved domain:
   ```bash
   # Edit start-n8n-ngrok.sh
   # Change: ngrok http 5678
   # To: ngrok http 5678 --domain=your-reserved-domain.ngrok-free.app
   ```

**Pros:**
- Stable URL that never changes
- No downtime
- Professional solution

**Cons:**
- Costs $8/month
- Still requires ngrok process to stay running

---

### Option 3: Deploy n8n on VPS/Cloud (Most Reliable) 🚀

**Best for:** Production, maximum reliability

Deploy n8n on a cloud server with a public IP or domain.

#### Option 3a: Deploy on Railway/Render/Fly.io

1. **Railway** (Recommended - easiest):
   ```bash
   # Install Railway CLI
   npm i -g @railway/cli
   
   # Login
   railway login
   
   # Create new project
   railway init
   
   # Deploy n8n
   railway up
   ```

2. **Render**:
   - Create a new Web Service
   - Use Dockerfile.n8n
   - Set port to 5678
   - Add environment variables

3. **Fly.io**:
   ```bash
   fly launch
   fly deploy
   ```

#### Option 3b: Deploy on VPS (DigitalOcean, Linode, etc.)

1. **Set up VPS**:
   ```bash
   # SSH into your VPS
   ssh user@your-vps-ip
   
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   
   # Clone your repo
   git clone your-repo
   cd your-repo
   
   # Start n8n
   docker-compose -f docker-compose.n8n.yml up -d
   ```

2. **Set up domain** (optional but recommended):
   - Point your domain to VPS IP
   - Use nginx as reverse proxy
   - Set up SSL with Let's Encrypt

3. **Update docker-compose.n8n.yml**:
   ```yaml
   environment:
     - N8N_HOST=your-domain.com
     - WEBHOOK_URL=https://your-domain.com/
     - N8N_EDITOR_BASE_URL=https://your-domain.com/
   ```

**Pros:**
- Most reliable
- Full control
- Can use custom domain
- No tunnel expiration

**Cons:**
- Requires server management
- Costs $5-20/month for VPS
- More setup complexity

---

### Option 4: Cloudflare Tunnel (Free Alternative) 🆓

**Best for:** Free solution with better stability than ngrok

You already have `start-n8n-tunnel.sh`! Cloudflare Tunnel is more stable than free ngrok.

```bash
# Use Cloudflare Tunnel instead of ngrok
./start-n8n-tunnel.sh
```

**For 24/7 with domain** (requires free Cloudflare account):

1. **Set up Cloudflare Tunnel with domain**:
   ```bash
   # Install cloudflared
   brew install cloudflared  # macOS
   
   # Login
   cloudflared tunnel login
   
   # Create tunnel
   cloudflared tunnel create n8n
   
   # Configure tunnel
   cloudflared tunnel route dns n8n your-subdomain.yourdomain.com
   
   # Run tunnel
   cloudflared tunnel run n8n
   ```

2. **Update docker-compose** to use your domain

**Pros:**
- Free
- More stable than free ngrok
- Can use your own domain

**Cons:**
- Still requires tunnel process
- Slightly more complex setup

---

### Option 5: Use n8n Cloud (Managed Service) ☁️

**Best for:** Zero infrastructure management

n8n offers a managed cloud service.

1. Sign up at https://n8n.io/cloud
2. Use the provided URL directly
3. No tunnel needed!

**Pros:**
- Zero setup
- Managed by n8n team
- Always available

**Cons:**
- Costs $20/month
- Less control over infrastructure

---

## Recommended Setup for Production

**For immediate use:** Use Option 1 (monitor script) while setting up Option 3.

**For production:** Use Option 3 (VPS deployment) with a domain.

## Environment Variable Changes

On Vercel, environment variables are managed through the Vercel dashboard. Changes are automatically picked up on the next deployment.

## Troubleshooting

### Monitor script not working
- Check logs: `tail -f /tmp/ngrok-monitor.log`
- Verify ngrok is installed: `which ngrok`
- Check n8n is running: `docker ps | grep n8n`

### URL changes but app doesn't update
- Redeploy on Vercel after updating environment variables
- Check environment variables in Vercel dashboard
- Verify `N8N_URL` environment variable

### Workflows not triggering
- Check webhook URLs in n8n workflows
- Verify `WEBHOOK_URL` in docker-compose matches your public URL
- Test webhook endpoint directly

## Next Steps

1. **Immediate:** Start the monitor script (`./monitor-ngrok.sh`)
2. **Short-term:** Set up ngrok paid plan or Cloudflare Tunnel
3. **Long-term:** Deploy n8n on VPS for maximum reliability

