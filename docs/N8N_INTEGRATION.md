# n8n Daily Summary Workflow Integration Guide

## Overview

This guide explains how to set up the n8n workflow that processes wake events from the Syntra Flask backend and generates personalized daily summaries. The workflow receives a webhook trigger, manages conversation state in Supabase, fetches user-specific data, and generates AI-powered daily advice.

## Webhook Payload Format

The Flask backend sends the following payload to the n8n webhook:

```json
{
  "user_uuid": "123e4567-e89b-12d3-a456-426614174000",
  "timestamp": "2024-01-15T08:00:00Z",
  "event": "awake",
  "source": "phone_automation"
}
```

**Fields**:
- `user_uuid`: UUID of the authenticated Syntra user (from Supabase `users` table)
- `timestamp`: ISO 8601 UTC timestamp of the wake event
- `event`: Always `"awake"` for wake events
- `source`: Source identifier (e.g., `"phone_automation"`, `"vallit_frontend"`)

## Workflow Architecture

```
Webhook Trigger
    ↓
Check/Create Conversation (Supabase)
    ↓
Fetch Oura Data (Oura API)
    ↓
Fetch Weather Data (Weather API)
    ↓
Fetch Calendar Events (Calendar API)
    ↓
Fetch KIT Events (KIT API)
    ↓
Fetch Teutonia Calendar (Teutonia API)
    ↓
Combine All Data
    ↓
Generate AI Daily Summary (OpenAI)
    ↓
Log Result (Supabase: ai_advice_history)
```

## Step 1: Webhook Node Configuration

### Create Webhook Node

1. In n8n, add a **Webhook** node
2. Set **HTTP Method** to `POST`
3. Set **Path** to `daily-summary` (or match your URL)
4. Set **Response Mode** to `Response Node` (if you want to return status)
5. Save the webhook URL (e.g., `https://vyrez.app.n8n.cloud/webhook/daily-summary`)

### Extract Payload

The webhook node automatically passes the request body as `{{ $json }}`. Access fields:
- `{{ $json.user_uuid }}` - User UUID
- `{{ $json.timestamp }}` - Event timestamp
- `{{ $json.event }}` - Event type
- `{{ $json.source }}` - Source identifier

## Step 2: Supabase - Check/Create Conversation

### 2.1 Check Conversation Exists

Add a **Supabase** node to check if a conversation exists:

**Node Type**: Supabase

**Operation**: `Get`

**Table**: `conversations`

**Filters**:
```
user_id = {{ $json.user_uuid }}
```

**Output**: Returns conversation row if exists, or empty array if not found

### 2.2 IF Node - Conversation Exists?

Add an **IF** node to check if conversation was found:

**Condition**:
```
{{ $json.length }} > 0
```

**True Path**: Conversation exists → Continue with existing `conversation_id`
**False Path**: No conversation → Create new one

### 2.3 Create Conversation (False Path)

Add a **Supabase** node to create a new conversation:

**Node Type**: Supabase

**Operation**: `Insert`

**Table**: `conversations`

**Fields**:
```json
{
  "user_id": "{{ $json.user_uuid }}",
  "created_at": "{{ $json.timestamp }}",
  "updated_at": "{{ $json.timestamp }}",
  "status": "active"
}
```

**Output**: Returns created conversation with `id` (conversation_id)

### 2.4 Merge Conversation ID

Add a **Set** node to ensure `conversation_id` is available:

**Fields**:
```json
{
  "conversation_id": "{{ $json.id }}",
  "user_uuid": "{{ $('Webhook').item.json.user_uuid }}",
  "timestamp": "{{ $('Webhook').item.json.timestamp }}"
}
```

This ensures both paths (existing or new conversation) have the same data structure.

## Step 3: Fetch User-Specific Data

### 3.1 Get User Integrations from Supabase

Before fetching external data, retrieve the user's integration credentials:

**Node Type**: Supabase

**Operation**: `Get`

**Table**: `integrations`

**Filters**:
```
user_id = {{ $json.user_uuid }}
AND is_active = true
```

This returns Oura API key, calendar credentials, etc.

### 3.2 Fetch Oura Data

Add an **HTTP Request** node:

**Method**: `GET`

**URL**: `https://api.ouraring.com/v2/usercollection/daily_readiness`

**Headers**:
```
Authorization: Bearer {{ $('Get Integrations').item.json.find(i => i.service_type === 'oura').api_key }}
```

**Parse Response**: Extract readiness score, sleep data, activity data

### 3.3 Fetch Weather Data

Add an **HTTP Request** node:

**Method**: `GET`

**URL**: `https://api.openweathermap.org/data/2.5/weather`

**Query Parameters**:
```
lat={{ user_latitude }}
lon={{ user_longitude }}
appid={{ WEATHER_API_KEY }}
```

**Note**: You may need to fetch user location from Supabase `users` table or use a default location.

### 3.4 Fetch Calendar Events

Add an **HTTP Request** node for Google Calendar (or your calendar service):

**Method**: `GET`

**URL**: `https://www.googleapis.com/calendar/v3/calendars/primary/events`

**Headers**:
```
Authorization: Bearer {{ $('Get Integrations').item.json.find(i => i.service_type === 'google_calendar').api_key }}
```

**Query Parameters**:
```
timeMin={{ $json.timestamp }}
timeMax={{ $json.timestamp + 24h }}
singleEvents=true
orderBy=startTime
```

### 3.5 Fetch KIT Events

Add an **HTTP Request** node for KIT events (customize to your KIT API):

**Method**: `GET`

**URL**: `https://kit-api.example.com/events`

**Headers**:
```
Authorization: Bearer {{ $('Get Integrations').item.json.find(i => i.service_type === 'kit').api_key }}
```

**Query Parameters**:
```
user_id={{ $json.user_uuid }}
date={{ $json.timestamp }}
```

### 3.6 Fetch Teutonia Calendar

Add an **HTTP Request** node for Teutonia calendar:

**Method**: `GET`

**URL**: `https://teutonia-api.example.com/calendar`

**Headers**:
```
Authorization: Bearer {{ $('Get Integrations').item.json.find(i => i.service_type === 'teutonia').api_key }}
```

## Step 4: Combine All Data

Add a **Set** node to combine all fetched data:

**Fields**:
```json
{
  "conversation_id": "{{ $('Merge Conversation ID').item.json.conversation_id }}",
  "user_uuid": "{{ $('Merge Conversation ID').item.json.user_uuid }}",
  "timestamp": "{{ $('Merge Conversation ID').item.json.timestamp }}",
  "oura_data": "{{ $('Fetch Oura').item.json }}",
  "weather_data": "{{ $('Fetch Weather').item.json }}",
  "calendar_events": "{{ $('Fetch Calendar').item.json.items }}",
  "kit_events": "{{ $('Fetch KIT Events').item.json.events }}",
  "teutonia_events": "{{ $('Fetch Teutonia').item.json.events }}"
}
```

## Step 5: Generate AI Daily Summary

### 5.1 Build Prompt

Add a **Set** node to build the prompt for OpenAI:

**Fields**:
```json
{
  "messages": [
    {
      "role": "system",
      "content": "You are a personal daily summary assistant. Analyze the user's data and provide personalized advice for the day."
    },
    {
      "role": "user",
      "content": "Here is my data for today:\n\nOura Readiness: {{ $json.oura_data.score }}\nSleep Score: {{ $json.oura_data.sleep.score }}\nWeather: {{ $json.weather_data.weather[0].description }}, {{ $json.weather_data.main.temp }}°C\nCalendar Events: {{ $json.calendar_events.length }} events\nKIT Events: {{ $json.kit_events.length }} events\n\nGenerate a personalized daily summary and advice."
    }
  ],
  "conversation_id": "{{ $json.conversation_id }}",
  "user_uuid": "{{ $json.user_uuid }}"
}
```

### 5.2 Call OpenAI API

Add an **HTTP Request** node:

**Method**: `POST`

**URL**: `https://api.openai.com/v1/chat/completions`

**Headers**:
```
Authorization: Bearer {{ $env.OPENAI_API_KEY }}
Content-Type: application/json
```

**Body**:
```json
{
  "model": "gpt-4",
  "messages": "{{ $json.messages }}",
  "temperature": 0.7,
  "max_tokens": 1000
}
```

**Parse Response**: Extract `choices[0].message.content` as the daily summary

### 5.3 Format Summary

Add a **Set** node to format the final summary:

**Fields**:
```json
{
  "conversation_id": "{{ $('Combine Data').item.json.conversation_id }}",
  "user_uuid": "{{ $('Combine Data').item.json.user_uuid }}",
  "summary": "{{ $('Call OpenAI').item.json.choices[0].message.content }}",
  "timestamp": "{{ $('Combine Data').item.json.timestamp }}",
  "metadata": {
    "oura_score": "{{ $('Combine Data').item.json.oura_data.score }}",
    "weather": "{{ $('Combine Data').item.json.weather_data.weather[0].description }}",
    "event_count": "{{ $('Combine Data').item.json.calendar_events.length }}"
  }
}
```

## Step 6: Log Result to Supabase

### 6.1 Insert into ai_advice_history

Add a **Supabase** node:

**Node Type**: Supabase

**Operation**: `Insert`

**Table**: `ai_advice_history`

**Fields**:
```json
{
  "conversation_id": "{{ $json.conversation_id }}",
  "user_id": "{{ $json.user_uuid }}",
  "advice_text": "{{ $json.summary }}",
  "metadata": "{{ $json.metadata }}",
  "created_at": "{{ $json.timestamp }}",
  "source": "daily_summary"
}
```

### 6.2 Update Conversation

Add a **Supabase** node to update the conversation's last activity:

**Node Type**: Supabase

**Operation**: `Update`

**Table**: `conversations`

**Filters**:
```
id = {{ $json.conversation_id }}
```

**Fields**:
```json
{
  "updated_at": "{{ $json.timestamp }}",
  "last_advice_id": "{{ $('Insert ai_advice_history').item.json.id }}"
}
```

## Step 7: Error Handling

### 7.1 Try-Catch Pattern

Wrap each API call in error handling:

**Add IF nodes** after each HTTP Request:
- **Condition**: `{{ $json.error }}` exists
- **True Path**: Log error and continue with default values
- **False Path**: Continue normally

### 7.2 Log Errors to Supabase

Add a **Supabase** node to log errors:

**Table**: `workflow_executions` or `error_logs`

**Fields**:
```json
{
  "user_id": "{{ $json.user_uuid }}",
  "workflow_name": "daily_summary",
  "error": "{{ $json.error }}",
  "timestamp": "{{ $now }}"
}
```

## Database Schema Requirements

### conversations Table

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_advice_id UUID REFERENCES ai_advice_history(id),
  status TEXT DEFAULT 'active'
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
```

### ai_advice_history Table

```sql
CREATE TABLE ai_advice_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  advice_text TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT DEFAULT 'daily_summary'
);

CREATE INDEX idx_ai_advice_history_user_id ON ai_advice_history(user_id);
CREATE INDEX idx_ai_advice_history_conversation_id ON ai_advice_history(conversation_id);
CREATE INDEX idx_ai_advice_history_created_at ON ai_advice_history(created_at DESC);
```

### integrations Table (if not exists)

```sql
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL, -- 'oura', 'google_calendar', 'kit', 'teutonia'
  api_key TEXT,
  config JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, service_type)
);

CREATE INDEX idx_integrations_user_id ON integrations(user_id);
CREATE INDEX idx_integrations_service_type ON integrations(service_type);
```

## Testing the Workflow

### Test with Manual Webhook Call

Use cURL to test:

```bash
curl -X POST https://vyrez.app.n8n.cloud/webhook/daily-summary \
  -H "Content-Type: application/json" \
  -d '{
    "user_uuid": "YOUR_USER_UUID",
    "timestamp": "2024-01-15T08:00:00Z",
    "event": "awake",
    "source": "phone_automation"
  }'
```

Replace `YOUR_USER_UUID` with an actual UUID from your Supabase `users` table.

### Verify Results

1. Check `conversations` table for conversation creation/update
2. Check `ai_advice_history` table for logged advice
3. Review n8n execution logs for any errors
4. Verify all API integrations (Oura, Weather, Calendar, etc.) are working

## Environment Variables in n8n

Set these in n8n settings:

- `OPENAI_API_KEY`: Your OpenAI API key
- `WEATHER_API_KEY`: Your OpenWeatherMap API key (if used)
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_KEY`: Your Supabase service role key

## Workflow Activation

1. **Save** the workflow in n8n
2. **Activate** the workflow (toggle switch in top-right)
3. **Copy** the webhook URL
4. **Set** `N8N_WEBHOOK_URL` environment variable in Flask backend to this URL
5. **Test** by calling the `/api/wake` endpoint from iOS Shortcuts

## Next Steps

Once the workflow is active:

1. iOS Shortcuts triggers `/api/wake` when you wake up
2. Flask endpoint forwards to n8n webhook with `user_uuid`
3. n8n workflow processes and generates daily summary
4. Result is logged in Supabase `ai_advice_history` table
5. User can view summary in Syntra dashboard (future feature)

## Troubleshooting

### Webhook Not Receiving Requests

- Check n8n workflow is activated
- Verify webhook URL matches `N8N_WEBHOOK_URL` in Flask backend
- Check n8n execution logs for incoming requests

### Conversation Not Found/Created

- Verify `user_uuid` exists in `users` table
- Check Supabase connection credentials
- Review Supabase node filters

### API Integration Failures

- Verify API keys in `integrations` table for the user
- Check API key expiration
- Review error logs in n8n execution history

### OpenAI Generation Fails

- Verify `OPENAI_API_KEY` is set in n8n
- Check OpenAI API quota/rate limits
- Review prompt format and token limits

