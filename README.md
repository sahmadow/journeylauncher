# JourneyLauncher

CRM lifecycle consultancy site with AI-powered flow generation.

**Live:** https://www.journeylauncher.com

## Tech Stack

- **Framework:** Next.js 16 + React 19 + TypeScript
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Animation:** Framer Motion
- **AI:** Google Gemini 2.0 Flash (flow generation, page analysis)
- **Database:** PostgreSQL (Railway) + Prisma 7
- **Hosting:** Vercel
- **Icons:** Lucide React

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page (8 sections)
│   ├── flow/page.tsx         # 10-screen CRM flow wizard
│   ├── api/
│   │   ├── scrape/           # Scrape + analyze landing pages
│   │   ├── analyze/          # Webhook/polling strategy generation
│   │   ├── generate-flow/    # AI lifecycle flow generation
│   │   └── submissions/      # Save submissions + email captures
│   └── layout.tsx            # Root layout, metadata, GA4, JSON-LD
├── components/
│   ├── layout/               # Navbar, Footer
│   ├── sections/             # Hero, WeAdvised, HowItWorks, WhatWeUse,
│   │                         # WhatYouGet, LeadMagnet, WhoItsFor, Contact
│   ├── wizard/               # 10 wizard screens + WizardShell
│   ├── canvas/               # LifecycleCanvas, FlowNode, StageSection,
│   │                         # FlowConnector, EmailPreview
│   └── ui/                   # shadcn/ui components
├── hooks/
│   └── useEnterKey.ts        # Keyboard navigation for wizard
├── lib/
│   ├── api.ts                # API client helpers
│   ├── prisma.ts             # Prisma client singleton
│   ├── rate-limit.ts         # In-memory rate limiting
│   ├── recommendations.ts    # Business-type-specific CRM recommendations
│   └── utils.ts              # cn() helper
├── types/
│   └── index.ts              # WizardState, FlowNode, GeneratedFlow, etc.
└── generated/prisma/         # Prisma generated client (gitignored)

prisma/
├── schema.prisma             # Submission + EmailCapture models
└── migrations/               # Database migrations

public/
├── fonts/                    # Self-hosted Inter
├── logos/                    # Client brand logos (SVG)
├── sitemap.xml
└── robots.txt
```

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start dev server
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google AI API key for Gemini 2.0 Flash |
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 measurement ID |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL |

## Flow Wizard

The 10-screen wizard at `/flow` generates personalized CRM lifecycle flows:

1. **Landing Page URL** — scrapes and analyzes the business
2. **Business Description** — additional context
3. **Lifecycle Segmentation** — CLM + personalization maturity
4. **Data Collection** — connected data sources
5. **Lifecycle Gaps** — which stages need help
6. **Webhook Summary** — detected signals and integrations
7. **Brand Brief** — review + business type override
8. **Email Capture** — gate before showing results
9. **Canvas** — visual lifecycle flow with email previews
10. **Summary** — stats, recommendations, downloadable report

Supports three business types: SaaS, E-commerce, Service — each with tailored flow templates and recommendations.

## API Routes

| Endpoint | Description | Rate Limit |
|---|---|---|
| `POST /api/scrape` | Scrape URL, extract brand data, AI analysis | 5/min |
| `POST /api/analyze` | Generate webhook/polling strategy | 10/min |
| `POST /api/generate-flow` | Generate lifecycle flow (AI + fallback stubs) | 5/min |
| `POST /api/submissions` | Save submission + email capture to DB | — |
| `POST /api/email-capture` | Save email-only capture to DB | — |

## Database

Prisma 7 with PostgreSQL adapter. Two models:

- **Submission** — full wizard state (scraped data, flow, recommendations)
- **EmailCapture** — email + source tracking

Both use soft deletes and indexed on email + created_at.

## Scripts

```bash
npm run dev          # Dev server
npm run build        # Production build (includes prisma generate)
npm run start        # Start production server
npm run lint         # ESLint
npm run db:migrate   # Run Prisma migrations
npm run db:push      # Push schema without migration
npm run db:studio    # Open Prisma Studio
```

## Deployment

Deployed on Vercel with:
- Framework: Next.js
- Build command: `prisma generate && next build`
- Database: Railway PostgreSQL
- Security headers via `vercel.json`
