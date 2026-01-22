#!/bin/bash

# Kill any existing processes on port 5001 and 3000 (optional but good for clean start)
# lsof -ti:5001 | xargs kill -9 2>/dev/null

echo "Starting Syntra Development Environment..."
echo "----------------------------------------"

# Start Backend (Python) on Port 5001
echo "Starting Backend (app.py) on port 5001..."
python3 app.py &
BACKEND_PID=$!

# Wait a moment for backend to initialize
sleep 2

# Start Frontend (Next.js)
echo "Starting Frontend (Next.js)..."
cd vallit-site
npm run dev

# Cleanup function
cleanup() {
    echo "Stopping Backend..."
    kill $BACKEND_PID
    exit
}

# Trap SIGINT (Ctrl+C)
trap cleanup SIGINT

# Wait for backend
wait $BACKEND_PID
