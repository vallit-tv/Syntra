# n8n Setup - Quick Reference

## The Situation

**Current Setup:** n8n runs locally on your PC via Docker, exposed via ngrok/Cloudflare tunnel.

**Problem:** This requires your PC to be running 24/7, and the tunnel URL changes on restart.

**Solution:** Host n8n externally on a cloud server.

## Quick Answer

**You don't need Docker on your PC!** Syntra can connect to any n8n instance on the internet.

Just set these environment variables in Vercel:
```
N8N_URL=https://your-n8n-instance.com
N8N_API_KEY=your-api-key-here
```

## External Hosting Options (Recommended)

### 1. n8n Cloud (Easiest)
- **Cost:** $20/month
- **Setup:** 5 minutes
- **Maintenance:** None
- **Link:** https://n8n.io/pricing

### 2. Self-Hosted on VPS (Best Value)
- **Cost:** $5-20/month
- **Setup:** 1-2 hours
- **Maintenance:** Medium
- **Providers:** DigitalOcean, Linode, Vultr, AWS Lightsail
- **Guide:** See `N8N_EXTERNAL_HOSTING.md`

### 3. Railway/Render (Easy PaaS)
- **Cost:** $5-10/month
- **Setup:** 15 minutes
- **Maintenance:** Low
- **Guide:** See `N8N_EXTERNAL_HOSTING.md`

## What to Do Now

1. **Choose an external hosting option** (see `N8N_EXTERNAL_HOSTING.md`)
2. **Set up n8n** on your chosen platform
3. **Get your n8n URL and API key**
4. **Configure in Vercel:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add `N8N_URL` = your n8n URL
   - Add `N8N_API_KEY` = your API key
   - Redeploy
5. **Stop local Docker setup** (if you were using it):
   ```bash
   ./stop-n8n-ngrok.sh
   docker-compose -f docker-compose.n8n.yml down
   ```

## Documentation

- **`N8N_EXTERNAL_HOSTING.md`** - Complete guide for external hosting options
- **`N8N_START_GUIDE.md`** - Local setup guide (if you want to keep using local)
- **`N8N_SETUP.md`** - Original setup documentation
- **`N8N_TROUBLESHOOTING.md`** - Troubleshooting guide

## Why Docker Was Used

The Docker setup was a quick way to get n8n running for testing. But for production, external hosting is better because:
- ✅ Your PC doesn't need to be on 24/7
- ✅ Stable URL that doesn't change
- ✅ Better reliability
- ✅ Professional setup

## Need Help?

Check `N8N_EXTERNAL_HOSTING.md` for detailed step-by-step guides for each hosting option.

