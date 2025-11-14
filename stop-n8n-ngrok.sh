#!/bin/bash

# Stop ngrok
if [ -f /tmp/ngrok-n8n.pid ]; then
    NGROK_PID=$(cat /tmp/ngrok-n8n.pid)
    echo "Stopping ngrok (PID: $NGROK_PID)..."
    kill $NGROK_PID 2>/dev/null
    pkill -f "ngrok http" 2>/dev/null
    rm /tmp/ngrok-n8n.pid /tmp/ngrok-n8n.url 2>/dev/null
    echo "✓ ngrok stopped"
else
    echo "No ngrok process found"
    pkill -f "ngrok http" 2>/dev/null
fi

# Stop n8n
echo "Stopping n8n..."
docker-compose -f docker-compose.n8n.yml down
echo "✓ n8n stopped"

