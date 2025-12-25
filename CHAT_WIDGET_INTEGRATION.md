# Chat Widget Integration Guide

## Quick Start

Add the Syntra AI chat widget to your website with a single script tag:

```html
<script 
  src="https://your-domain.com/widget/embed.js"
  data-widget-id="default"
  data-theme="glassmorphism"
  data-position="bottom-right">
</script>
```

Place this code before the closing `</body>` tag of your HTML.

---

## Configuration Options

| Attribute | Values | Default | Description |
|-----------|--------|---------|-------------|
| `data-widget-id` | string | `"default"` | Widget configuration ID |
| `data-theme` | `minimal`, `glassmorphism`, `corporate`, `dark`, `gradient`, `rounded` | `"glassmorphism"` | Visual theme |
| `data-position` | `bottom-right`, `bottom-left`, `top-right`, `top-left` | `"bottom-right"` | Widget position |
| `data-title` | string | `"AI Assistant"` | Header title |
| `data-welcome-message` | string | `"Hi! 👋 How can I help you today?"` | Initial greeting |
| `data-placeholder` | string | `"Type your message..."` | Input placeholder |
| `data-branding` | `true`, `false` | `true` | Show "Powered by Syntra" |
| `data-api-url` | URL | Auto-detected | API endpoint base URL |

---

## Environment Variables

```bash
# Required for AI responses
OPENAI_API_KEY=sk-...

# Optional: Use GPT-4o-mini (cheaper) or GPT-4 (smarter)
OPENAI_MODEL=gpt-4o-mini

# Optional: n8n workflow integration
N8N_CHAT_WEBHOOK_URL=https://your-n8n.app.n8n.cloud/webhook/chat

# Optional: Custom system prompt
CHAT_SYSTEM_PROMPT="You are a helpful assistant for..."
```

---

## n8n Workflow Setup

### 1. Create Webhook Node

1. In n8n, add a **Webhook** node
2. Set HTTP Method to `POST`
3. Set Path to `chat`
4. Copy the webhook URL

### 2. Webhook Payload

The widget sends this payload:

```json
{
  "session_id": "abc123...",
  "message": "User's message",
  "timestamp": "2024-01-15T10:30:00Z",
  "context": {
    "page_url": "https://example.com/page",
    "page_title": "Page Title"
  },
  "conversation_history": [
    {"role": "user", "content": "Previous message"},
    {"role": "assistant", "content": "Previous response"}
  ]
}
```

### 3. Process with AI

Add an **OpenAI** or **HTTP Request** node to call ChatGPT:

```json
{
  "model": "gpt-4o-mini",
  "messages": [
    {"role": "system", "content": "Your system prompt..."},
    {"role": "user", "content": "{{ $json.message }}"}
  ]
}
```

### 4. Send Response Back

Add an **HTTP Request** node to POST back to Syntra:

**URL:** `https://your-syntra.com/api/chat/webhook`

**Body:**
```json
{
  "session_id": "{{ $('Webhook').item.json.session_id }}",
  "response": "{{ $('OpenAI').item.json.choices[0].message.content }}",
  "execution_id": "{{ $execution.id }}"
}
```

---

## JavaScript API

After the widget loads, you can control it programmatically:

```javascript
// Access the widget instance
const widget = window.syntraChat;

// Open/close the widget
widget.open();
widget.close();
widget.toggle();

// Change theme dynamically
widget.setTheme('dark');

// Clear conversation
widget.clearHistory();

// Destroy widget
widget.destroy();
```

---

## Database Setup

Run this migration in your Supabase SQL Editor:

```sql
-- See database_migration_chat.sql for full schema
```

This creates:
- `chat_sessions` - Conversation sessions
- `chat_messages` - Individual messages
- `widget_configs` - Widget configurations

---

## Troubleshooting

### Widget not appearing
- Check console for JavaScript errors
- Verify the script URL is accessible
- Ensure no CSS conflicts with `z-index: 999999`

### Messages not sending
1. Check browser Network tab for API errors
2. Verify `OPENAI_API_KEY` is set
3. Check Supabase connection

### n8n not receiving webhooks
1. Verify `N8N_CHAT_WEBHOOK_URL` is set correctly
2. Check n8n workflow is activated
3. Review n8n execution logs

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat/message` | POST | Send a message |
| `/api/chat/history/<session_id>` | GET | Get conversation history |
| `/api/chat/webhook` | POST | n8n callback endpoint |
| `/api/chat/config` | GET | Get widget configuration |
| `/widget/embed.js` | GET | Widget JavaScript |
| `/widget/styles.css` | GET | Widget CSS |
| `/widget-demo` | GET | Demo page |
