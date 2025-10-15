# Vallit Web

Eine moderne Next.js Marketing-Site für vallit.net mit Notion-Webhook-Integration und Supabase-Audit.

## Features

- **Next.js 14** mit App Router und TypeScript
- **Tailwind CSS** mit shadcn/ui Komponenten
- **Responsive Design** mit moderner, minimalistischer Optik
- **SEO-optimiert** mit Metadaten, Sitemap und Open Graph
- **Notion-Webhook-API** für automatische Seitenerstellung
- **Supabase-Integration** für Idempotenz und Audit-Trail

## Technologie-Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide React (Icons)
- Supabase
- Notion API

## Setup

### 1. Dependencies installieren

```bash
cd web
pnpm install
```

### 2. Umgebungsvariablen konfigurieren

Kopiere die Beispiel-Umgebungsdatei und fülle sie aus:

```bash
cp env.example .env.local
```

Fülle die folgenden Variablen aus:

```env
# Notion Integration
NOTION_TOKEN=secret_your_notion_integration_token
NOTION_SIGNING_SECRET=your_webhook_signing_secret
SOURCE_DB_ID=your_source_database_id
TARGET_DB_ID=your_target_database_id_optional
SELECT_PROP_NAME=Category

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Next.js
NEXT_PUBLIC_SITE_URL=https://vallit.net
```

### 3. Supabase-Datenbank einrichten

Führe das SQL-Script in deiner Supabase-Instanz aus:

```bash
# In Supabase SQL Editor
psql -f supabase.sql
```

### 4. Notion-Integration einrichten

#### Schritt 1: Notion Integration erstellen
1. Gehe zu [notion.so/my-integrations](https://notion.so/my-integrations)
2. Erstelle eine neue Integration
3. Kopiere den **Internal Integration Token** → `NOTION_TOKEN`

#### Schritt 2: Webhook konfigurieren
1. In deiner Integration: **Webhooks** → **New webhook**
2. URL: `https://vallit.net/api/notion-webhook`
3. Events: `page.created`
4. Kopiere den **Signing Secret** → `NOTION_SIGNING_SECRET`

#### Schritt 3: Datenbanken teilen
1. Gehe zu deiner **Source Database**
2. **Share** → Füge deine Integration hinzu
3. Wiederhole für **Target Database** (falls verwendet)

#### Schritt 4: Select-Property erstellen
1. In beiden Datenbanken: Erstelle eine Select-Property namens "Category" (oder nach `SELECT_PROP_NAME`)
2. Diese Property wird automatisch mit Seitentiteln gefüllt

### 5. Entwicklungsserver starten

```bash
pnpm dev
```

Die Site ist dann unter [http://localhost:3000](http://localhost:3000) verfügbar.

## Deployment auf Vercel

### 1. Repository zu Vercel verbinden
1. Gehe zu [vercel.com](https://vercel.com)
2. **Import Project** → Verbinde dein GitHub Repository
3. Wähle das `web/` Verzeichnis als Root Directory

### 2. Umgebungsvariablen in Vercel setzen
In den Vercel Project Settings → Environment Variables:

```env
NOTION_TOKEN=secret_your_notion_integration_token
NOTION_SIGNING_SECRET=your_webhook_signing_secret
SOURCE_DB_ID=your_source_database_id
TARGET_DB_ID=your_target_database_id_optional
SELECT_PROP_NAME=Category
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SITE_URL=https://vallit.net
```

### 3. Deployen
```bash
git push origin main
```

Vercel deployt automatisch bei jedem Push.

## Notion-Webhook Testen

### Testfall 1: Neue Seite in Source-DB erstellen
1. Erstelle eine neue Seite in deiner Source Database
2. Setze einen aussagekräftigen Titel
3. Überprüfe:
   - Die "Category"-Property wird automatisch auf den Seitentitel gesetzt
   - Die Option wird in der Source-DB erstellt
   - Die Option wird in der Target-DB (falls konfiguriert) hinzugefügt

### Testfall 2: Webhook-Logs überprüfen
```bash
# In Vercel Dashboard → Functions → notion-webhook
# Überprüfe die Logs auf Fehler
```

## Troubleshooting

### 401 Unauthorized (Signature)
- **Problem**: Ungültige HMAC-Signatur
- **Lösung**: 
  - Überprüfe `NOTION_SIGNING_SECRET`
  - Stelle sicher, dass der Webhook die korrekte URL verwendet
  - Überprüfe, dass der Raw Body korrekt übertragen wird

### 403 Forbidden (Notion API)
- **Problem**: Integration hat keinen Zugriff auf Datenbank
- **Lösung**:
  - Teile die Datenbanken mit deiner Integration
  - Überprüfe `NOTION_TOKEN`
  - Stelle sicher, dass die Integration aktiviert ist

### 500 Internal Server Error
- **Problem**: Fehlende Umgebungsvariablen oder API-Fehler
- **Lösung**:
  - Überprüfe alle `NOTION_*` und `SUPABASE_*` Variablen
  - Überprüfe Supabase-Verbindung
  - Schaue in die Vercel Function Logs

### Doppelte Events
- **Problem**: Webhook wird mehrfach ausgelöst
- **Lösung**:
  - Supabase Idempotenz funktioniert korrekt
  - Überprüfe `notion_events` Tabelle auf Duplikate
  - Event-ID wird korrekt generiert

### Select-Property wird nicht gesetzt
- **Problem**: Property existiert nicht oder hat falschen Namen
- **Lösung**:
  - Erstelle die Property manuell in beiden Datenbanken
  - Überprüfe `SELECT_PROP_NAME` (Standard: "Category")
  - Stelle sicher, dass es eine Select-Property ist

## Scripts

```bash
# Entwicklung
pnpm dev              # Startet Entwicklungsserver
pnpm build            # Erstellt Production Build
pnpm start            # Startet Production Server
pnpm lint             # Führt ESLint aus
pnpm typecheck        # TypeScript-Typen prüfen
pnpm format           # Prettier Formatierung
```

## Projektstruktur

```
web/
├── app/                    # Next.js App Router
│   ├── (marketing)/       # Marketing-Seiten
│   ├── (legal)/          # Rechtliche Seiten
│   ├── api/              # API Routes
│   └── globals.css       # Globale Styles
├── components/           # React Komponenten
│   ├── ui/              # shadcn/ui Komponenten
│   └── site/            # Site-spezifische Komponenten
├── lib/                 # Utilities und Hooks
└── supabase.sql         # Datenbankschema
```

## Lizenz

© 2024 Vallit. Alle Rechte vorbehalten.
