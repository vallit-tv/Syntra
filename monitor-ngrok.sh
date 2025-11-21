#!/bin/bash

# Monitor and auto-restart ngrok when it expires
# This script runs in the background and checks ngrok every 5 minutes

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="/tmp/ngrok-monitor.log"
PID_FILE="/tmp/ngrok-monitor.pid"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

check_ngrok() {
    # Check if ngrok process is running
    if ! pgrep -f "ngrok http" > /dev/null; then
        return 1
    fi
    
    # Check if ngrok API is responding
    if ! curl -s http://localhost:4040/api/tunnels > /dev/null 2>&1; then
        return 1
    fi
    
    # Check if we can get a valid URL
    PUBLIC_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"https://[^"]*"' | head -1 | cut -d'"' -f4)
    if [ -z "$PUBLIC_URL" ]; then
        return 1
    fi
    
    # Test if URL is actually working
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PUBLIC_URL/healthz" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" != "200" ] && [ "$HTTP_CODE" != "404" ]; then
        return 1
    fi
    
    return 0
}

restart_ngrok() {
    log "ngrok appears to be down or expired. Restarting..."
    
    # Kill any existing ngrok processes
    pkill -f "ngrok http" 2>/dev/null
    sleep 2
    
    # Start ngrok
    cd "$SCRIPT_DIR"
    if [ -f "./start-n8n-ngrok.sh" ]; then
        ./start-n8n-ngrok.sh >> "$LOG_FILE" 2>&1
        
        # Wait a bit for ngrok to start
        sleep 5
        
        # Get new URL and update .env
        NEW_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"https://[^"]*"' | head -1 | cut -d'"' -f4)
        if [ -n "$NEW_URL" ]; then
            if [ -f "$SCRIPT_DIR/.env" ]; then
                if [[ "$OSTYPE" == "darwin"* ]]; then
                    sed -i '' "s|N8N_URL=.*|N8N_URL=$NEW_URL|" "$SCRIPT_DIR/.env"
                else
                    sed -i "s|N8N_URL=.*|N8N_URL=$NEW_URL|" "$SCRIPT_DIR/.env"
                fi
                log "Updated .env with new URL: $NEW_URL"
            fi
            log "ngrok restarted successfully. New URL: $NEW_URL"
        else
            log "ERROR: Failed to get new ngrok URL after restart"
        fi
    else
        log "ERROR: start-n8n-ngrok.sh not found in $SCRIPT_DIR"
    fi
}

# Main monitoring loop
monitor_loop() {
    log "ngrok monitor started (PID: $$)"
    
    while true; do
        if ! check_ngrok; then
            restart_ngrok
        else
            # Log status every hour (12 checks)
            if [ $(($(date +%M) % 60)) -eq 0 ]; then
                PUBLIC_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"https://[^"]*"' | head -1 | cut -d'"' -f4)
                log "ngrok is healthy. URL: $PUBLIC_URL"
            fi
        fi
        
        # Check every 5 minutes
        sleep 300
    done
}

# Handle script termination
cleanup() {
    log "Monitor stopped"
    rm -f "$PID_FILE"
    exit 0
}

trap cleanup SIGTERM SIGINT

# Check if already running
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p "$OLD_PID" > /dev/null 2>&1; then
        echo "Monitor is already running (PID: $OLD_PID)"
        exit 1
    fi
fi

# Start monitoring in background
monitor_loop &
MONITOR_PID=$!
echo $MONITOR_PID > "$PID_FILE"

log "ngrok monitor started in background (PID: $MONITOR_PID)"
log "Logs: $LOG_FILE"
log "To stop: kill $MONITOR_PID or run ./stop-ngrok-monitor.sh"

