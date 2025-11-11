# Hosting n8n Externally (Not on Your PC)

You don't need to run n8n locally! Syntra can connect to any n8n instance that's accessible on the internet.

## Why the Docker Setup Exists

The Docker setup with tunnels is just one option for getting n8n running quickly. But if you want n8n to run 24/7 without keeping your PC on, you should host it externally.

## External Hosting Options

### Option 1: n8n Cloud (Easiest - Recommended)

**Cost:** Starting at $20/month

1. **Sign up for n8n Cloud:**
   - Go to https://n8n.io/pricing
   - Choose a plan (Starter is $20/month)
   - Create an account

2. **Get your n8n URL and API key:**
   - Your n8n URL will be: `https://your-workspace.n8n.cloud`
   - Go to Settings → API
   - Create an API key
   - Copy the API key

3. **Configure in Syntra:**
   - Set environment variables in Vercel:
     ```
     N8N_URL=https://your-workspace.n8n.cloud
     N8N_API_KEY=your-api-key-here
     ```
   - Or use the Admin Panel → n8n Settings (if you have admin UI for this)

**Pros:**
- ✅ No setup required
- ✅ Always online
- ✅ Managed by n8n team
- ✅ Automatic backups
- ✅ No maintenance

**Cons:**
- ❌ Costs money ($20+/month)
- ❌ Limited customization

---

### Option 2: Self-Hosted on VPS (Most Flexible)

**Cost:** $5-20/month (DigitalOcean, Linode, etc.)

#### Step 1: Get a VPS

1. Sign up for a VPS provider:
   - **DigitalOcean:** https://www.digitalocean.com (starting at $5/month)
   - **Linode:** https://www.linode.com (starting at $5/month)
   - **Vultr:** https://www.vultr.com (starting at $5/month)
   - **AWS Lightsail:** https://aws.amazon.com/lightsail (starting at $3.50/month)

2. Create a droplet/server:
   - Choose Ubuntu 22.04 LTS
   - Minimum: 1GB RAM, 1 vCPU (2GB RAM recommended)
   - Choose a datacenter close to you

#### Step 2: Install Docker on VPS

SSH into your server and run:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y

# Add your user to docker group (optional, but recommended)
sudo usermod -aG docker $USER
```

#### Step 3: Deploy n8n with Docker

Create a directory and docker-compose file:

```bash
mkdir n8n
cd n8n
nano docker-compose.yml
```

Paste this configuration:

```yaml
version: "3.8"

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - N8N_HOST=your-domain.com
      - WEBHOOK_URL=https://your-domain.com/
      - N8N_EDITOR_BASE_URL=https://your-domain.com/
      - GENERIC_TIMEZONE=UTC
    volumes:
      - n8n_data:/home/node/.n8n
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:5678/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  n8n_data:
```

#### Step 4: Set Up Domain and SSL (Optional but Recommended)

**Option A: Use Cloudflare (Free SSL)**

1. Point your domain to your VPS IP
2. Use Cloudflare for DNS
3. Enable Cloudflare proxy (orange cloud)
4. Use Cloudflare Tunnel (free) to expose n8n:

```bash
# Install cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Authenticate (follow prompts)
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create n8n

# Create config file
mkdir -p ~/.cloudflared
nano ~/.cloudflared/config.yml
```

Config file content:
```yaml
tunnel: <tunnel-id>
credentials-file: /home/youruser/.cloudflared/<tunnel-id>.json

ingress:
  - hostname: n8n.yourdomain.com
    service: http://localhost:5678
  - service: http_status:404
```

Run tunnel:
```bash
cloudflared tunnel run n8n
```

**Option B: Use Nginx with Let's Encrypt (Free SSL)**

1. Install Nginx and Certbot:
```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

2. Configure Nginx:
```bash
sudo nano /etc/nginx/sites-available/n8n
```

Paste:
```nginx
server {
    listen 80;
    server_name n8n.yourdomain.com;

    location / {
        proxy_pass http://localhost:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

3. Enable site and get SSL:
```bash
sudo ln -s /etc/nginx/sites-available/n8n /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d n8n.yourdomain.com
```

#### Step 5: Start n8n

```bash
docker-compose up -d
```

#### Step 6: Get API Key

1. Open `https://n8n.yourdomain.com` (or `http://your-vps-ip:5678` if no domain)
2. Complete the setup wizard
3. Go to Settings → API
4. Create an API key
5. Copy the key

#### Step 7: Configure in Syntra

Set environment variables in Vercel:
```
N8N_URL=https://n8n.yourdomain.com
N8N_API_KEY=your-api-key-here
```

**Pros:**
- ✅ Full control
- ✅ Can customize everything
- ✅ One-time setup
- ✅ Cost-effective ($5-20/month)

**Cons:**
- ❌ Requires server management
- ❌ Need to handle backups yourself
- ❌ Need to keep server updated

---

### Option 3: Railway.app (Easy PaaS)

**Cost:** $5/month + usage

1. **Sign up for Railway:**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Deploy n8n:**
   - Click "New Project"
   - Select "Deploy from GitHub"
   - Use n8n template or create from Dockerfile
   - Railway will give you a URL like `https://n8n-production.up.railway.app`

3. **Get API key:**
   - Open your Railway n8n URL
   - Complete setup
   - Go to Settings → API
   - Create API key

4. **Configure in Syntra:**
   ```
   N8N_URL=https://n8n-production.up.railway.app
   N8N_API_KEY=your-api-key-here
   ```

**Pros:**
- ✅ Easy deployment
- ✅ Automatic SSL
- ✅ No server management
- ✅ Free tier available (limited)

**Cons:**
- ❌ Can get expensive with usage
- ❌ Less control than VPS

---

### Option 4: Render.com (Easy PaaS)

**Cost:** $7/month (Free tier available but sleeps after inactivity)

1. **Sign up for Render:**
   - Go to https://render.com
   - Sign up

2. **Deploy n8n:**
   - Click "New +" → "Web Service"
   - Connect your GitHub (or use public n8n repo)
   - Use these settings:
     - **Build Command:** (leave empty, uses Docker)
     - **Start Command:** (leave empty, uses Docker)
     - **Environment:** Docker
   - Add environment variables:
     ```
     N8N_HOST=0.0.0.0
     N8N_PORT=10000
     WEBHOOK_URL=https://your-service.onrender.com/
     ```
   - Render will give you a URL

3. **Get API key and configure** (same as Railway)

**Pros:**
- ✅ Very easy setup
- ✅ Automatic SSL
- ✅ Free tier (but sleeps)

**Cons:**
- ❌ Free tier sleeps after 15 minutes inactivity
- ❌ Paid tier starts at $7/month

---

## Recommended Setup

**For Production:**
- **Best:** n8n Cloud ($20/month) - Zero maintenance
- **Budget:** Self-hosted on VPS ($5/month) - Full control

**For Development:**
- Use the local Docker setup (free, but requires your PC to be on)

## After Setting Up External n8n

1. **Remove local Docker setup** (if you were using it):
   ```bash
   ./stop-n8n-ngrok.sh  # or stop-n8n-tunnel.sh
   docker-compose -f docker-compose.n8n.yml down
   ```

2. **Configure Syntra:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add:
     - `N8N_URL` = Your external n8n URL
     - `N8N_API_KEY` = Your n8n API key
   - Redeploy your Vercel app

3. **Test Connection:**
   - Go to Syntra Admin Panel → n8n Settings
   - Verify connection status shows "Connected"
   - Test syncing workflows

## Security Notes

- ✅ Always use HTTPS for n8n (never HTTP in production)
- ✅ Keep your n8n API key secret
- ✅ Use strong passwords for n8n admin account
- ✅ Enable 2FA if available
- ✅ Regularly update n8n to latest version
- ✅ Set up automatic backups

## Backup Strategy

**For self-hosted n8n:**

```bash
# Backup n8n data
docker exec n8n tar czf /tmp/n8n-backup.tar.gz /home/node/.n8n
docker cp n8n:/tmp/n8n-backup.tar.gz ./n8n-backup-$(date +%Y%m%d).tar.gz

# Restore backup
docker cp ./n8n-backup-20240101.tar.gz n8n:/tmp/
docker exec n8n tar xzf /tmp/n8n-backup-20240101.tar.gz -C /
```

Or use automated backup solutions like:
- **BorgBackup**
- **Restic**
- **Duplicati**

---

## Quick Comparison

| Option | Cost | Setup Time | Maintenance | Reliability |
|--------|------|------------|-------------|-------------|
| n8n Cloud | $20/mo | 5 min | None | ⭐⭐⭐⭐⭐ |
| VPS (Self-hosted) | $5-20/mo | 1-2 hours | Medium | ⭐⭐⭐⭐ |
| Railway | $5+/mo | 15 min | Low | ⭐⭐⭐⭐ |
| Render | $7/mo | 15 min | Low | ⭐⭐⭐ |
| Local (Docker) | Free | 10 min | High (PC must be on) | ⭐⭐ |

---

## Need Help?

- **n8n Documentation:** https://docs.n8n.io
- **n8n Community:** https://community.n8n.io
- **Self-hosting Guide:** https://docs.n8n.io/hosting/installation/docker/

