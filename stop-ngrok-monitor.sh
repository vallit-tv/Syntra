#!/bin/bash

# Stop the ngrok monitor

PID_FILE="/tmp/ngrok-monitor.pid"

if [ -f "$PID_FILE" ]; then
    MONITOR_PID=$(cat "$PID_FILE")
    if ps -p "$MONITOR_PID" > /dev/null 2>&1; then
        echo "Stopping ngrok monitor (PID: $MONITOR_PID)..."
        kill "$MONITOR_PID" 2>/dev/null
        sleep 1
        if ps -p "$MONITOR_PID" > /dev/null 2>&1; then
            kill -9 "$MONITOR_PID" 2>/dev/null
        fi
        rm -f "$PID_FILE"
        echo "✓ ngrok monitor stopped"
    else
        echo "Monitor process not found"
        rm -f "$PID_FILE"
    fi
else
    echo "No monitor PID file found. Monitor may not be running."
    # Try to kill any monitor processes
    pkill -f "monitor-ngrok.sh" 2>/dev/null
fi

