#!/bin/bash

# Start n8n with Docker Compose
echo "Starting n8n..."
docker-compose -f docker-compose.n8n.yml up -d

# Wait for n8n to be ready
echo "Waiting for n8n to start..."
sleep 5

# Check if n8n is running
if curl -s http://localhost:5678/healthz > /dev/null; then
    echo "✓ n8n is running on http://localhost:5678"
else
    echo "✗ n8n failed to start"
    exit 1
fi

# Start Cloudflare Tunnel
echo "Starting Cloudflare Tunnel..."
# Kill any existing tunnel
pkill -f "cloudflared tunnel" 2>/dev/null
sleep 1

cloudflared tunnel --url http://localhost:5678 > /tmp/cloudflared-n8n.log 2>&1 &
TUNNEL_PID=$!

# Wait for tunnel to establish (longer wait)
echo "Waiting for tunnel to establish (this may take 10-15 seconds)..."
for i in {1..15}; do
    sleep 1
    PUBLIC_URL=$(grep -o 'https://[^ ]*\.trycloudflare\.com' /tmp/cloudflared-n8n.log 2>/dev/null | head -1)
    if [ -n "$PUBLIC_URL" ]; then
        # Test if URL is actually working
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PUBLIC_URL/healthz" 2>/dev/null || echo "000")
        if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
            break
        fi
    fi
    echo -n "."
done
echo ""

# Extract the public URL
PUBLIC_URL=$(grep -o 'https://[^ ]*\.trycloudflare\.com' /tmp/cloudflared-n8n.log 2>/dev/null | head -1)

if [ -z "$PUBLIC_URL" ]; then
    echo "✗ Failed to get tunnel URL. Check /tmp/cloudflared-n8n.log"
    echo "Last 10 lines of log:"
    tail -10 /tmp/cloudflared-n8n.log
    kill $TUNNEL_PID 2>/dev/null
    exit 1
fi

echo ""
echo "=========================================="
echo "✓ n8n is now accessible at:"
echo "  Local:  http://localhost:5678"
echo "  Public: $PUBLIC_URL"
echo ""
echo "Use this public URL in your Syntra dashboard!"
echo ""
echo "To stop: ./stop-n8n-tunnel.sh"
echo "Tunnel PID: $TUNNEL_PID"
echo "$TUNNEL_PID" > /tmp/cloudflared-n8n.pid
echo "$PUBLIC_URL" > /tmp/cloudflared-n8n.url
echo "=========================================="

