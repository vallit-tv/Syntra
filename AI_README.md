# AI Development Guidelines for Syntra/Vallit

> [!IMPORTANT]
> **READ THIS BEFORE MODIFYING CODE**
> This project uses a **Hybrid Vercel Architecture** (Next.js Frontend + Python/Flask Backend).

## 🚨 The Golden Rule: Routing
**If you add a new route to `app.py` (e.g., `@app.route('/new-page')`), you MUST explicitly add it to `vercel.json`.**

If you fail to do this, Vercel will route the request to Next.js, resulting in a **404 Not Found**.

### Correct `vercel.json` Pattern:
```json
{
    "src": "/your-new-route",
    "dest": "/app.py"
}
```

## 🏗 Architecture Overview

### 1. Frontend: Next.js (`vallit-site/`)
*   **Purpose**: All UI, Pages, and Static Content.
*   **Location**: `vallit-site/src/app`
*   **Best Practice**: Create ALL new user-facing pages here.
*   **Static Assets**: Place images/JS/CSS in `vallit-site/public/`.

### 2. Backend: Python Flask (`app.py`)
*   **Purpose**: API Endpoints, Database Logic, Auth, Chatbot Engine.
*   **Location**: Root directory.
*   **Best Practice**: Use strictly for `/api/...` endpoints.
*   **Legacy**: Some HTML pages are still served by Flask templates (`templates/`). Moving these to Next.js is preferred.

## 🛠 Common Pitfalls to Avoid

1.  **The "404" Trap**: Adding a Python route without updating `vercel.json`.
2.  **Static Files**: Using `flask.send_file` for static assets is fragile on Vercel. **Use `vallit-site/public/`** instead.
3.  **Localhost Proxy**: `next.config.ts` has rewrites to `127.0.0.1` for local dev. **These MUST be conditioned on `NODE_ENV === 'development'`**.
4.  **CORS**: All Flask error responses (including 500s) **MUST** include CORS headers, otherwise the frontend cannot read the error message.

## 🚀 Deployment
*   **Vercel**: Deploys automatically on push.
*   **Diagnostics**: Check `https://vallit.net/api/debug/diagnose` to verify environment variables and DB connection.
