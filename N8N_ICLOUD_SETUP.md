# n8n iCloud Calendar Node Setup Guide

This guide explains how to set up the iCloud Calendar community node for your n8n instance.

## Quick Setup

Run the setup script:

```bash
./setup-n8n-icloud.sh
```

This will:
1. Stop your current n8n container
2. Build a custom Docker image with the iCloud Calendar node
3. Start n8n with the new image

## Manual Setup

If you prefer to set it up manually:

```bash
# Stop n8n
docker-compose -f docker-compose.n8n.yml down

# Build the custom image
docker-compose -f docker-compose.n8n.yml build

# Start n8n
docker-compose -f docker-compose.n8n.yml up -d
```

## Verifying the Installation

1. Open n8n at `http://localhost:5678`
2. Create a new workflow
3. Click the "+" button to add a node
4. Search for "iCloud Calendar"
5. You should see the iCloud Calendar node in the results

## Setting Up Credentials

To use the iCloud Calendar node, you need to configure it with your Apple ID credentials:

### Step 1: Generate an App-Specific Password

1. Go to [Apple ID account page](https://appleid.apple.com)
2. Sign in with your Apple ID
3. Navigate to **Security** > **App-Specific Passwords**
4. Click **Generate Password**
5. Give it a name (e.g., "n8n iCloud Calendar")
6. Copy the generated password (you won't see it again!)

### Step 2: Configure in n8n

1. In your n8n workflow, add the iCloud Calendar node
2. Click on the node to configure it
3. Click **Create New Credential**
4. Enter:
   - **Apple ID**: Your Apple ID email address
   - **Password**: The app-specific password you generated
5. Click **Save**
6. Test the connection

## Available Operations

The iCloud Calendar node supports the following operations:

- **List Calendars**: Retrieve all calendars associated with your account
- **Get Calendar Details**: Get detailed information about a specific calendar
- **Get Events**: Retrieve events from a calendar (with date filtering)
- **Get Single Event**: Retrieve a specific event by ID
- **Create Event**: Create a new calendar event
- **Delete Event**: Delete an existing event

## Troubleshooting

### Node Not Appearing

If the iCloud Calendar node doesn't appear in n8n:

1. **Check the container logs**:
   ```bash
   docker-compose -f docker-compose.n8n.yml logs n8n
   ```

2. **Verify the package is installed**:
   ```bash
   docker exec syntra-n8n npm list -g n8n-nodes-icloud
   ```

3. **Rebuild the image**:
   ```bash
   docker-compose -f docker-compose.n8n.yml build --no-cache
   docker-compose -f docker-compose.n8n.yml up -d
   ```

### Authentication Issues

- Make sure you're using an **app-specific password**, not your regular Apple ID password
- Verify your Apple ID email is correct
- Check that two-factor authentication is enabled on your Apple ID (required for app-specific passwords)

### Timezone Issues

- The node uses IANA timezone names (e.g., `America/New_York`)
- Ensure your system timezone is correctly configured
- Events are stored in UTC and converted based on your timezone settings

## Adding More Community Nodes

To add more community nodes in the future, you can:

1. **Update the Dockerfile** (recommended for persistent nodes):
   ```dockerfile
   RUN npm install -g n8n-nodes-icloud@0.2.7 n8n-nodes-other-node@version
   ```

2. **Install in running container** (temporary, lost on restart):
   ```bash
   docker exec -it syntra-n8n npm install -g n8n-nodes-other-node
   docker-compose -f docker-compose.n8n.yml restart
   ```

## Alternative: Volume-Based Installation

If you prefer not to rebuild the image every time you add a node, you can use a volume-based approach:

1. Create a directory for custom nodes:
   ```bash
   mkdir -p ./n8n-custom-nodes
   ```

2. Install nodes in that directory:
   ```bash
   cd n8n-custom-nodes
   npm init -y
   npm install n8n-nodes-icloud@0.2.7
   ```

3. Update `docker-compose.n8n.yml` to mount the volume and set the environment variable:
   ```yaml
   environment:
     - N8N_CUSTOM_EXTENSIONS=/home/node/.n8n/custom
   volumes:
     - n8n_data:/home/node/.n8n
     - ./n8n-custom-nodes:/home/node/.n8n/custom
   ```

## Resources

- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)
- [n8n-nodes-icloud GitHub Repository](https://github.com/ozdreamwalk/n8n-ozdreamtools-icloud)
- [Apple App-Specific Passwords Guide](https://support.apple.com/en-us/102654)

## Notes

- The iCloud Calendar node is in BETA - test thoroughly before using in production
- The node uses CalDAV API to interact with iCloud Calendar
- Rate limits may apply for API requests
- The node requires Node.js 18.10.0+ (already satisfied by n8n Docker image)

