# Vallit

A modern Next.js marketing website for vallit.net with Notion webhook integration.

## Project Structure

```
Vallit/
├── web/                    # Next.js web application
│   ├── app/               # Next.js App Router pages
│   ├── components/        # React components
│   ├── lib/              # Utility functions
│   ├── package.json      # Dependencies
│   ├── tailwind.config.ts # Tailwind CSS config
│   ├── supabase.sql      # Database schema
│   └── README.md         # Detailed setup instructions
├── vallit/               # Python backend (existing)
└── README.md             # This file
```

## Quick Start

1. **Navigate to the web app:**
   ```bash
   cd web
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment:**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your values
   ```

4. **Start development server:**
   ```bash
   pnpm dev
   ```

5. **Open in browser:**
   ```
   http://localhost:3000
   ```

## Features

- ✅ Modern Next.js 14 with App Router
- ✅ TypeScript & Tailwind CSS
- ✅ Responsive design with shadcn/ui components
- ✅ SEO optimized (metadata, sitemap, robots.txt)
- ✅ Notion webhook API integration
- ✅ Supabase audit system
- ✅ German legal pages (Impressum, Datenschutz)

## Deployment

The web app is ready to deploy to Vercel. See `web/README.md` for detailed setup instructions.

## Development

- **Web App:** `cd web && pnpm dev`
- **Python Backend:** `cd vallit && source .venv/bin/activate`