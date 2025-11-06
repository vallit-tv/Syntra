# n8n Tunnel Troubleshooting

## Current Issue: Cloudflare Tunnel Connection Problems

If you're getting Error 1033 or the tunnel URL isn't working, here are solutions:

## Solution 1: Wait Longer (Recommended First Try)

Cloudflare tunnels can take 30-60 seconds to fully establish. Try:

```bash
# Check if tunnel is running
ps aux | grep cloudflared

# Wait 30 seconds, then test the URL
sleep 30
curl https://YOUR-TUNNEL-URL.trycloudflare.com/healthz
```

## Solution 2: Use ngrok (Requires Free Account)

1. **Sign up for free ngrok account:**
   - Go to https://dashboard.ngrok.com/signup
   - It's free, just requires email

2. **Get your authtoken:**
   - After signup, go to https://dashboard.ngrok.com/get-started/your-authtoken
   - Copy your authtoken

3. **Configure ngrok:**
   ```bash
   ngrok config add-authtoken YOUR_AUTHTOKEN
   ```

4. **Start n8n with ngrok:**
   ```bash
   ./start-n8n-ngrok.sh
   ```

## Solution 3: Use Local Access Only (For Testing)

If you're just testing locally and don't need Vercel access:

1. **Access n8n directly:**
   - Open: http://localhost:5678
   - Get API key from Settings → API

2. **For local testing, you can:**
   - Use `localhost:5678` in your local Syntra instance
   - Or use your Mac's local IP: `http://YOUR_LOCAL_IP:5678`

## Solution 4: Check Network/Firewall

Cloudflare tunnels might be blocked by:
- Corporate firewalls
- VPN connections
- Network restrictions

Try:
- Disconnect VPN if connected
- Try a different network
- Check if port 5678 is accessible locally: `curl http://localhost:5678/healthz`

## Solution 5: Restart Everything

```bash
# Stop everything
./stop-n8n-tunnel.sh

# Wait a moment
sleep 5

# Start fresh
./start-n8n-tunnel.sh
```

## Quick Test Commands

```bash
# Check n8n is running locally
curl http://localhost:5678/healthz
# Should return: {"status":"ok"}

# Check tunnel process
ps aux | grep cloudflared

# Check tunnel logs
tail -f /tmp/cloudflared-n8n.log

# Get current tunnel URL
cat /tmp/cloudflared-n8n.url 2>/dev/null || echo "No URL file"
```

## Alternative: Use Your Mac's Public IP (Advanced)

If you have a static IP or can configure port forwarding:

1. Find your public IP: `curl ifconfig.me`
2. Configure router port forwarding (5678 → your Mac's local IP)
3. Use: `http://YOUR_PUBLIC_IP:5678`

⚠️ **Security Warning:** This exposes n8n to the internet without authentication. Only use if you understand the risks.

## Recommended: ngrok with Free Account

For the most reliable solution:
1. Sign up for free ngrok account (takes 2 minutes)
2. Configure authtoken
3. Use `./start-n8n-ngrok.sh`

This gives you:
- ✅ Stable URLs
- ✅ Free tier (sufficient for personal use)
- ✅ Better reliability than Cloudflare quick tunnels
- ✅ Web interface at http://localhost:4040

