#!/bin/bash

# Stop Cloudflare Tunnel
if [ -f /tmp/cloudflared-n8n.pid ]; then
    TUNNEL_PID=$(cat /tmp/cloudflared-n8n.pid)
    echo "Stopping Cloudflare Tunnel (PID: $TUNNEL_PID)..."
    kill $TUNNEL_PID 2>/dev/null
    rm /tmp/cloudflared-n8n.pid /tmp/cloudflared-n8n.url 2>/dev/null
    echo "✓ Tunnel stopped"
else
    echo "No tunnel process found"
fi

# Stop n8n
echo "Stopping n8n..."
docker-compose -f docker-compose.n8n.yml down
echo "✓ n8n stopped"

