<!-- ebee6d3c-285b-46c4-970f-438a177495af 03a22536-a189-4a6e-8377-ba7a1ab0fba8 -->
# AI Agent Platform - Full Stack Implementation Plan

## Phase 1: Backend Infrastructure & Authentication

### 1.1 Supabase Setup & Database Schema

**File: `web/supabase-schema.sql`**

- Extend existing `notion_events` table
- Add tables:
  - `users` (authentication, profiles)
  - `workflows` (automation workflows)
  - `workflow_runs` (execution history)
  - `api_keys` (user API keys for integrations)
  - `analytics_events` (tracking user actions)
  - `notion_pages` (cached Notion data)
- Set up Row Level Security (RLS) policies
- Create database functions for common operations

### 1.2 Authentication System

**Files:**

- `web/app/api/auth/[...nextauth]/route.js` - NextAuth.js setup
- `web/lib/auth.js` - Auth utilities
- `web/middleware.js` - Protected route middleware

**Implementation:**

- Use Supabase Auth or NextAuth.js
- Email/password authentication
- Protected dashboard routes
- Session management
- User profile management

### 1.3 Environment Configuration

**File: `web/.env.local`**

```
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NOTION_TOKEN=secret_...
NOTION_SIGNING_SECRET=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://syntra.vercel.app
```

## Phase 2: OpenAI Agent Integration

### 2.1 OpenAI Client Setup

**File: `web/lib/openai.js`**

- Initialize OpenAI client
- Helper functions for:
  - Workflow analysis
  - Data pattern recognition
  - Natural language to workflow conversion
  - Insight generation

### 2.2 Agent Core Functions

**File: `web/lib/agent/core.js`**

- Workflow execution engine
- Data analysis pipeline
- Context management
- Prompt engineering utilities

### 2.3 API Routes for Agent

**Files:**

- `web/app/api/agent/analyze/route.js` - Data analysis endpoint
- `web/app/api/agent/workflow/route.js` - Workflow management
- `web/app/api/agent/chat/route.js` - Conversational interface

## Phase 3: Dashboard Features

### 3.1 User Authentication UI

**Files:**

- `web/app/login/page.js` - Update with real auth
- `web/app/register/page.js` - New registration page
- `web/components/AuthGuard.js` - Protected route wrapper

**Features:**

- Login form with validation
- Registration with email verification
- Password reset flow
- Session persistence

### 3.2 Dashboard Interface

**File: `web/app/dashboard/page.js`**

Replace placeholder with:

- User profile section
- Active workflows overview
- Real-time analytics widgets
- Quick actions panel
- Recent activity feed

### 3.3 Analytics Dashboard

**Files:**

- `web/app/dashboard/analytics/page.js` - Analytics page
- `web/components/analytics/Charts.js` - Chart components
- `web/lib/analytics.js` - Analytics data fetching

**Features:**

- Workflow execution metrics
- Data processing statistics
- Cost tracking (OpenAI API usage)
- Performance graphs (Chart.js or Recharts)

### 3.4 API Integration Management

**Files:**

- `web/app/dashboard/integrations/page.js` - Integrations page
- `web/components/integrations/ConnectorCard.js` - Integration cards

**Integrations:**

- Notion (already started)
- OpenAI (configuration)
- Webhooks (custom endpoints)
- API key management

## Phase 4: Notion Integration Enhancement

### 4.1 Complete Webhook Handler

**File: `web/app/api/notion-webhook/route.js`**

- Add HMAC signature verification
- Store events in Supabase
- Trigger AI analysis on new pages
- Update workflow status

### 4.2 Notion API Client

**File: `web/lib/notion.js`**

```javascript
- fetchPage(pageId)
- updatePage(pageId, properties)
- queryDatabase(databaseId, filter)
- createPage(databaseId, properties)
- analyzePageContent(pageId) // AI analysis
```

### 4.3 Notion-to-Workflow Bridge

**File: `web/lib/notion/workflow-bridge.js`**

- Parse Notion pages as workflow definitions
- Execute workflows based on Notion triggers
- Update Notion with workflow results
- Sync analytics back to Notion

## Phase 5: Workflow Engine

### 5.1 Workflow Builder UI

**Files:**

- `web/app/dashboard/workflows/page.js` - Workflow list
- `web/app/dashboard/workflows/new/page.js` - Create workflow
- `web/components/workflow/Builder.js` - Visual workflow builder

**Features:**

- Drag-and-drop workflow designer
- Trigger configuration (Notion, webhooks, schedule)
- Action blocks (AI analysis, data transform, notifications)
- Condition logic

### 5.2 Workflow Execution Engine

**File: `web/lib/workflow/executor.js`**

- Parse workflow definition
- Execute steps sequentially
- Handle errors and retries
- Log execution to database
- AI-powered decision making at each step

### 5.3 Workflow Templates

**File: `web/data/workflow-templates.json`**

Pre-built templates:

- Notion page analysis
- Data extraction and categorization
- Automated reporting
- Alert generation

## Phase 6: Real-time Features

### 6.1 WebSocket Setup (optional, use Supabase Realtime)

**File: `web/lib/realtime.js`**

- Supabase Realtime subscriptions
- Live workflow status updates
- Real-time analytics

### 6.2 Notifications System

**File: `web/components/Notifications.js`**

- Toast notifications
- Workflow completion alerts
- Error notifications

## Implementation Order (Recommended)

1. **Week 1: Foundation**

   - Supabase schema
   - Authentication (login/register)
   - Basic dashboard layout

2. **Week 2: OpenAI Integration**

   - OpenAI client setup
   - Basic agent API endpoints
   - Simple analysis feature

3. **Week 3: Notion Integration**

   - Complete webhook handler
   - Notion API client
   - Notion-to-AI pipeline

4. **Week 4: Workflows**

   - Workflow database schema
   - Basic workflow execution
   - Simple workflow builder UI

5. **Week 5: Analytics & Polish**

   - Analytics dashboard
   - Real-time updates
   - Error handling
   - Testing

## Key Dependencies to Install

```json
{
  "dependencies": {
    "next": "^14.2.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@supabase/supabase-js": "^2.39.0",
    "next-auth": "^4.24.5",
    "openai": "^4.28.0",
    "@notionhq/client": "^2.2.14",
    "zod": "^3.22.4",
    "react-hook-form": "^7.49.3",
    "recharts": "^2.10.3",
    "date-fns": "^3.0.6"
  }
}
```

## Critical Files to Create/Update

**Immediate Priority:**

1. `web/lib/supabase.js` - Supabase client
2. `web/lib/openai.js` - OpenAI client
3. `web/lib/notion.js` - Notion client
4. `web/app/api/auth/[...nextauth]/route.js` - Auth
5. `web/supabase-complete-schema.sql` - Full database schema

**Secondary Priority:**

6. `web/app/dashboard/page.js` - Real dashboard
7. `web/app/api/agent/analyze/route.js` - AI analysis
8. `web/app/api/notion-webhook/route.js` - Complete webhook
9. `web/components/workflow/Builder.js` - Workflow UI
10. `web/lib/workflow/executor.js` - Workflow engine

### To-dos

- [ ] Create complete Supabase schema with all required tables and RLS policies
- [ ] Implement user authentication with NextAuth.js and Supabase
- [ ] Set up OpenAI, Supabase, and Notion API clients
- [ ] Create functional dashboard with real data and user profile
- [ ] Complete Notion webhook handler with signature verification and AI analysis
- [ ] Build API endpoints for AI agent (analyze, workflow, chat)
- [ ] Create analytics dashboard with charts and real-time metrics
- [ ] Build workflow execution engine with AI-powered decision making
- [ ] Create visual workflow builder UI
- [ ] Build API integration management interface