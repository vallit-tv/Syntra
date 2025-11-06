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

# Kill any existing ngrok processes
pkill -f "ngrok http" 2>/dev/null
sleep 1

# Start ngrok tunnel
echo "Starting ngrok tunnel..."
ngrok http 5678 > /tmp/ngrok-n8n.log 2>&1 &
NGROK_PID=$!

# Wait for ngrok to start
echo "Waiting for ngrok to establish tunnel..."
sleep 5

# Get the public URL from ngrok API
for i in {1..10}; do
    sleep 1
    PUBLIC_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"https://[^"]*"' | head -1 | cut -d'"' -f4)
    if [ -n "$PUBLIC_URL" ]; then
        # Test if URL is working
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PUBLIC_URL/healthz" 2>/dev/null || echo "000")
        if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
            break
        fi
    fi
    echo -n "."
done
echo ""

if [ -z "$PUBLIC_URL" ]; then
    echo "✗ Failed to get ngrok URL. Check /tmp/ngrok-n8n.log"
    echo "You can also check http://localhost:4040 for the ngrok web interface"
    kill $NGROK_PID 2>/dev/null
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
echo "Ngrok web interface: http://localhost:4040"
echo "To stop: ./stop-n8n-ngrok.sh"
echo "Ngrok PID: $NGROK_PID"
echo "$NGROK_PID" > /tmp/ngrok-n8n.pid
echo "$PUBLIC_URL" > /tmp/ngrok-n8n.url
echo "=========================================="

