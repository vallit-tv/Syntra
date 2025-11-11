#!/bin/bash

# Script to rebuild n8n with iCloud Calendar community node

echo "=========================================="
echo "Setting up n8n with iCloud Calendar node"
echo "=========================================="
echo ""

# Stop existing n8n container
echo "Stopping existing n8n container..."
docker-compose -f docker-compose.n8n.yml down

# Build the custom n8n image with iCloud node
echo ""
echo "Building custom n8n image with iCloud Calendar node..."
docker-compose -f docker-compose.n8n.yml build --no-cache

# Start n8n
echo ""
echo "Starting n8n with the new image..."
docker-compose -f docker-compose.n8n.yml up -d

# Wait for n8n to be ready
echo "Waiting for n8n to start..."
sleep 5

# Check if n8n is running
if curl -s http://localhost:5678/healthz > /dev/null; then
    echo "✓ n8n is running on http://localhost:5678"
    echo ""
    # Verify the node is installed in the container
    echo "Verifying iCloud Calendar node installation..."
    if docker exec syntra-n8n test -d /home/node/n8n-custom-nodes/node_modules/n8n-nodes-icloud; then
        echo "✓ iCloud Calendar node is installed"
    else
        echo "⚠ Warning: Could not verify node installation in container"
        echo "  Check container logs if the node doesn't appear in n8n"
    fi
    echo ""
    echo "=========================================="
    echo "Setup complete!"
    echo "=========================================="
    echo ""
    echo "The iCloud Calendar node should now be available in n8n."
    echo "To use it:"
    echo "1. Open n8n at http://localhost:5678"
    echo "2. Create a new workflow"
    echo "3. Search for 'iCloud Calendar' in the node selector"
    echo "4. Configure it with your Apple ID and app-specific password"
    echo ""
    echo "To set up credentials:"
    echo "1. Go to Apple ID account page (appleid.apple.com)"
    echo "2. Sign in with your Apple ID"
    echo "3. Go to Security > App-Specific Passwords"
    echo "4. Generate a new password for n8n"
    echo "5. Use your Apple ID email and the generated password in n8n"
    echo ""
    echo "If the node doesn't appear, check logs: docker-compose -f docker-compose.n8n.yml logs n8n"
else
    echo "✗ n8n failed to start"
    echo "Check the logs with: docker-compose -f docker-compose.n8n.yml logs"
    exit 1
fi

