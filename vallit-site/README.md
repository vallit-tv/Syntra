# Vallit Marketing Website

Premium marketing site for Vallit built with Next.js 14, TypeScript, and Tailwind CSS.

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit [http://localhost:3000](http://localhost:3000) to view the site.

---

## Configuration Guide

### Changing Pricing

Edit the `plans` array in `src/app/pricing/page.tsx`:

```typescript
const plans = [
  {
    name: "Starter",
    price: "€149",        // Change price here
    period: "/mo",
    description: "...",
    features: [...],      // Update feature list
    popular: false,       // Set true for highlighted plan
  },
  // ... more plans
];
```

### Changing Accent Color

Edit CSS variables in `src/app/globals.css`:

```css
:root {
  /* Current: Muted Teal */
  --accent: #00D4AA;
  --accent-dim: rgba(0, 212, 170, 0.15);
  --accent-glow: rgba(0, 212, 170, 0.4);
  --accent-muted: rgba(0, 212, 170, 0.6);
  
  /* Alternative: Muted Electric Blue */
  /* --accent: #3B82F6;
     --accent-dim: rgba(59, 130, 246, 0.15);
     --accent-glow: rgba(59, 130, 246, 0.4);
     --accent-muted: rgba(59, 130, 246, 0.6); */
  
  /* Alternative: Muted Violet */
  /* --accent: #8B5CF6;
     --accent-dim: rgba(139, 92, 246, 0.15);
     --accent-glow: rgba(139, 92, 246, 0.4);
     --accent-muted: rgba(139, 92, 246, 0.6); */
}
```

### Updating Contact Form Email Target

The contact form in `src/components/pricing/contact-form.tsx` currently logs submissions to console. To send emails:

1. Create an API route at `src/app/api/contact/route.ts`
2. Integrate with your email service (Resend, SendGrid, etc.)
3. Update the form's `handleSubmit` to POST to `/api/contact`

Example API route:

```typescript
// src/app/api/contact/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const data = await request.json();
  
  // Send email via your service
  // await resend.emails.send({ ... });
  
  return NextResponse.json({ success: true });
}
```

### Updating Copy

Key content locations:

| Content | File |
|---------|------|
| Hero text | `src/components/home/hero.tsx` |
| Benefits | `src/components/home/benefits.tsx` |
| Features | `src/app/features/page.tsx` |
| Solutions | `src/app/solutions/page.tsx` |
| Pricing | `src/app/pricing/page.tsx` |
| About | `src/app/about/page.tsx` |
| Legal | `src/app/impressum/page.tsx`, `src/app/datenschutz/page.tsx` |
| Footer | `src/components/layout/footer.tsx` |
| Chatbot responses | `src/components/kian-widget/kian-widget.tsx` |

### Adding Social Proof Logos

Replace the placeholder logos in `src/app/page.tsx`:

```typescript
const logos = [
  { name: "Company A", src: "/images/logos/company-a.svg" },
  // ... add real logos
];
```

Then update the JSX to use `<Image>` components.

---

## Project Structure

```
src/
├── app/                    # Pages (App Router)
│   ├── page.tsx           # Home
│   ├── features/          # Features page
│   ├── solutions/         # Solutions page
│   ├── pricing/           # Pricing page
│   ├── about/             # About page
│   ├── impressum/         # Legal: Impressum
│   ├── datenschutz/       # Legal: Privacy
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # Reusable UI components
│   │   ├── button.tsx
│   │   ├── badge.tsx
│   │   ├── glow-card.tsx  # Mouse-tracking glow cards
│   │   └── section.tsx    # Scroll-reveal sections
│   ├── layout/
│   │   ├── navbar.tsx
│   │   └── footer.tsx
│   ├── home/              # Home-specific components
│   │   ├── hero.tsx
│   │   ├── benefits.tsx
│   │   ├── sticky-stepper.tsx
│   │   └── use-cases.tsx
│   ├── pricing/
│   │   └── contact-form.tsx
│   └── kian-widget/       # Chatbot widget
│       └── kian-widget.tsx
└── lib/                   # Utilities (if needed)
```

---

## Design System

### Colors

- **Background**: `#050505` (near-black)
- **Text Primary**: `#ffffff`
- **Text Secondary**: `#a1a1a1`
- **Accent**: `#00D4AA` (muted teal)

### Typography

- **Font**: Inter (Google Fonts)
- **Headings**: 600-700 weight, tight tracking

### Components

- **GlowCard**: Cards with mouse-tracking glow effect
- **Button**: Primary (white), Secondary (border), Ghost (text-only)
- **Section**: Container with scroll-reveal animation

---

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Static Export

```bash
# Add to next.config.ts:
# output: 'export',

npm run build
# Output in /out folder
```

---

## Legal Pages

The Impressum and Privacy Policy pages contain placeholder content. **Replace with your actual legal information** before going live.

---

## License

Proprietary - Vallit
