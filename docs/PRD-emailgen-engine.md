# PRD: EmailGen Engine

**Feature:** AI-Powered Email Generation Engine
**Status:** Draft → Revised
**Date:** 2026-03-14 (revised from 2026-03-12)
**Author:** Auto-generated

---

## 1. Problem Statement

JourneyLauncher currently generates lifecycle **flow structures** (triggers, waits, conditions) with draft email **copy** (subject lines, preview text, body HTML, CTAs). However, these emails are plain-text-styled placeholders — they lack branded visual design, production-ready HTML templates, and downloadable assets. Users must still manually build the actual emails in their ESP.

**Gap:** There is no way to go from "lifecycle strategy" to "ready-to-send branded emails" without significant manual design and development work.

---

## 2. Objective

Build an **emailGen engine** that:

1. Gathers brand guidelines, visual assets, and content inputs via the existing canvas experience
2. Generates **one fully designed, responsive HTML email per requested lifecycle stage** (the most representative email node — typically the first/key email in each stage)
3. Renders inline previews within the canvas and flow summary page
4. Includes generated email HTML files in the "Download Now" export

**Success metric:** Users see a branded email preview for each lifecycle stage and can download production-ready HTML templates matching their brand, ready to import into any ESP.

**Scoping decision:** One email per stage (max 4) keeps generation fast (<15s), reduces AI cost, and gives users the highest-impact preview. Users needing all emails designed can regenerate individual nodes in Phase 2.

---

## 3. User Stories

| # | As a... | I want to... | So that... |
|---|---------|-------------|-----------|
| 1 | Lifecycle marketer | provide my brand guidelines once and get fully designed emails | I don't have to brief a designer for each email |
| 2 | Startup founder | preview how each email will actually look in an inbox | I can validate the flow before committing to implementation |
| 3 | CRM consultant | download all email HTML files for a client | I can hand off a complete, implementation-ready package |
| 4 | Marketing ops lead | tweak brand inputs and regenerate emails | I can iterate quickly without starting from scratch |

---

## 4. Scope

### 4.1 In Scope

- Brand guidelines input panel (within canvas screen)
- Visual asset collection (logo, hero images, social icons)
- AI-powered HTML email generation — **one email per requested stage** (most important node)
- Responsive email HTML output (compatible with major ESPs)
- Inline email previews in the canvas (replacing current plain previews)
- Bundled email HTML files in "Download Now" export
- Regeneration of individual emails after input changes

### 4.2 Out of Scope (v1)

- Drag-and-drop email editor / visual builder
- Direct ESP integration (Braze, Klaviyo, Iterable push)
- A/B variant generation
- Image generation or AI-created visual assets
- Dark mode email variants
- AMP email support

---

## 5. Feature Design

### 5.1 New Screen: Brand & Email Setup (injected into canvas flow)

After the existing flow is generated (Screen 9 — Canvas), a new **side panel** appears on the canvas allowing users to configure the emailGen engine. This avoids adding another wizard screen and keeps the experience contextual.

**Panel name:** "Email Studio"

**Inputs collected:**

| Input | Type | Required | Source / Default |
|-------|------|----------|-----------------|
| Brand logo | Image URL | Yes | Pre-filled from scrape (`scrapedData.logo_url`) |
| Primary color | Hex | Yes | Pre-filled from scrape (`scrapedData.colors[0]`) |
| Secondary color | Hex | No | Pre-filled from scrape (`scrapedData.colors[1]`) if available |
| Accent color | Hex | No | Auto-derived from primary |
| Font family | Select | Yes | Default: system font stack; options: Inter, Roboto, Georgia, Arial, brand-detected |
| Header style | Select | Yes | Options: Logo-only, Logo + tagline, Logo + nav bar |
| Footer content | Textarea | Yes | Default: pre-filled with company name, unsubscribe placeholder, address placeholder |
| Social links | URL fields | No | Instagram, Twitter/X, LinkedIn, Facebook |
| CTA button style | Select | Yes | Options: Rounded, Pill, Square — with live preview |
| Hero image | Image URL | No | Optional fallback banner per stage |
| Tone override | Select | No | Pre-filled from analysis; options: Professional, Friendly, Bold, Minimal |
| Sender name | Text | Yes | Default: brand name from scrape |
| Sender address | Email | No | Placeholder: `hello@yourdomain.com` |

### 5.2 Email Generation Pipeline

```
┌─────────────────────────────────────────────────────┐
│                   emailGen Engine                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. GATHER         Brand panel inputs               │
│     ───────►       + existing flow email nodes      │
│                    + scrapedData + analysis          │
│                                                     │
│  1b. SELECT        Pick most important email node   │
│      ───────►      per requested stage (first email │
│                    node with subject + body_html)    │
│                                                     │
│  2. COMPILE        Per-email context:                │
│     ───────►       - stage (Early Eng, Retention…)  │
│                    - node copy (subject, body, CTA)  │
│                    - brand guidelines object         │
│                    - business type + tone            │
│                                                     │
│  3. GENERATE       AI prompt per email:              │
│     ───────►       "Generate responsive HTML email   │
│                    using these brand guidelines and   │
│                    this copy. Output valid email HTML │
│                    with inline styles."              │
│                                                     │
│  4. VALIDATE       - HTML email linting              │
│     ───────►       - Inline style verification       │
│                    - Responsive table check          │
│                    - Image alt-text presence          │
│                                                     │
│  5. RENDER         - Store HTML per email node       │
│     ───────►       - Update canvas previews          │
│                    - Enable download bundle           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 5.3 Generated Email HTML Specification

Each email must be:

- **Table-based layout** (for ESP compatibility)
- **Inline CSS only** (no `<style>` blocks in `<head>` — maximum compatibility)
- **Max width:** 600px centered
- **Responsive:** fluid tables with `max-width` and media query fallback
- **Structure:**
  ```
  ┌──────────────────────────┐
  │  Pre-header (hidden)     │  ← preview_text
  ├──────────────────────────┤
  │  Header                  │  ← logo + optional tagline
  ├──────────────────────────┤
  │  Hero (optional)         │  ← hero image if provided
  ├──────────────────────────┤
  │  Body                    │  ← AI-generated copy from node
  ├──────────────────────────┤
  │  CTA Button              │  ← styled per brand config
  ├──────────────────────────┤
  │  Footer                  │  ← social links + unsubscribe
  │                          │    + address + sender info
  └──────────────────────────┘
  ```
- **Personalization tokens:** Include `{{first_name}}`, `{{company_name}}` where contextually appropriate
- **Unsubscribe link:** Always included as `{{unsubscribe_url}}` placeholder

### 5.4 Canvas Preview Updates

The existing `EmailPreview` component will be enhanced:

| Current State | New State |
|--------------|-----------|
| Plain HTML body rendered in modal | Full branded email rendered in iframe |
| Basic brand color on header bar | Complete branded header with logo, colors, fonts |
| Single "Close Preview" button | Tabs: "Preview" / "HTML Source" / "Copy HTML" |
| No responsive preview | Desktop + Mobile toggle (600px / 375px width) |

**New preview features:**
- **Desktop/Mobile toggle:** Switch iframe width between 600px and 375px
- **HTML Source tab:** Syntax-highlighted raw HTML view
- **Copy HTML button:** One-click copy to clipboard
- **Regenerate button:** Re-run emailGen for this single node with current brand settings
- **Status indicator:** Shows generation state (pending / generating / ready / error)

### 5.5 Download Enhancement

The existing `handleDownload()` in `ScreenSummary` will be extended:

**Current download:** Single `lifecycle-flow-summary.html` file

**New download:** ZIP archive containing:

```
lifecycle-flow-export/
├── flow-summary.html                    # Existing summary report (enhanced)
├── emails/
│   ├── 01-early-engagement.html         # One branded email per requested stage
│   ├── 02-engagement.html
│   ├── 03-monetisation.html
│   └── 04-retention.html
├── assets/
│   └── brand-guidelines.json            # Exported brand config for reference
└── README.txt                           # Quick-start guide for importing into ESPs
```

**File naming convention:** `{##}-{stage-slug}.html` (one file per requested stage)

**ZIP generation:** Client-side using JSZip (no server roundtrip needed for packaging).

---

## 6. Technical Architecture

### 6.1 New API Route

**`POST /api/generate-emails`**

```typescript
// Request
{
  brand_config: BrandConfig;        // All brand panel inputs
  stages: {                         // One entry per requested stage
    stage_name: string;
    stage_description: string;
    email_node: EmailNode;          // Most important email node from this stage
  }[];
  scraped_data: ScrapedData;        // Existing scraped brand data
  analysis: Analysis;               // Business type, tone, USP
}

// Response
{
  emails: GeneratedEmail[];         // Array of { node_id, html, status }
}
```

**Rate limit:** 3 requests/min (generation is expensive)

**AI prompt strategy:**
- Single Gemini call generates all stage emails (max 4) in one batch
- System prompt: email HTML specialist with ESP compatibility expertise
- User prompt: brand config + one email node per stage + stage context
- Output: JSON array of `{ stage_name, html }` objects (no markdown wrapping)

### 6.2 New Types

```typescript
interface BrandConfig {
  logo_url: string;
  primary_color: string;
  secondary_color?: string;
  accent_color?: string;
  font_family: string;
  header_style: 'logo-only' | 'logo-tagline' | 'logo-nav';
  footer_content: string;
  social_links?: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    facebook?: string;
  };
  cta_style: 'rounded' | 'pill' | 'square';
  hero_image_url?: string;
  tone_override?: string;
  sender_name: string;
  sender_address?: string;
}

interface GeneratedEmail {
  node_id: string;
  stage_name: string;
  subject: string;
  html: string;
  status: 'pending' | 'generating' | 'ready' | 'error';
  error_message?: string;
}

interface EmailGenState {
  brand_config: BrandConfig | null;
  generated_emails: GeneratedEmail[];
  generation_status: 'idle' | 'generating' | 'complete' | 'error';
  panel_open: boolean;
}
```

### 6.3 New Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `EmailStudioPanel` | `src/components/canvas/EmailStudioPanel.tsx` | Side panel with brand config form |
| `BrandColorPicker` | `src/components/canvas/BrandColorPicker.tsx` | Color input with swatch preview |
| `EmailPreviewEnhanced` | `src/components/canvas/EmailPreviewEnhanced.tsx` | Upgraded preview with iframe, tabs, responsive toggle |
| `EmailGenerationStatus` | `src/components/canvas/EmailGenerationStatus.tsx` | Progress indicator during batch generation |
| `DownloadBundle` | `src/components/wizard/DownloadBundle.tsx` | ZIP generation and download logic |

### 6.4 State Management

Extend `WizardState` in `src/types/index.ts`:

```typescript
interface WizardState {
  // ... existing fields ...
  emailGenState?: EmailGenState;
}
```

Persisted to `sessionStorage` alongside existing wizard state.

### 6.5 Dependencies

| Package | Purpose | Size |
|---------|---------|------|
| `jszip` | Client-side ZIP generation | ~45KB gzipped |
| `file-saver` | Cross-browser file download | ~3KB gzipped |

No additional server dependencies required. Gemini 2.0 Flash handles generation via existing API pattern.

---

## 7. UX Flow

```
Screen 9 (Canvas) — existing flow loads
        │
        ▼
   ┌─────────────────┐
   │ "Generate Emails"│  ← New CTA button on canvas header
   │  button appears  │
   └────────┬────────┘
            │ click
            ▼
   ┌─────────────────┐
   │ Email Studio     │  ← Side panel slides in from right
   │ Panel opens      │     Brand inputs pre-filled from scrape
   │                  │     User reviews/adjusts
   └────────┬────────┘
            │ "Generate All Emails" click
            ▼
   ┌─────────────────┐
   │ Generation       │  ← Progress: "Generating emails for 4 stages..."
   │ in progress      │     One email per stage, single API call
   └────────┬────────┘
            │ complete
            ▼
   ┌─────────────────┐
   │ Canvas updated   │  ← Email nodes now show "Preview Ready" badge
   │ Click any email  │     Click opens enhanced preview (iframe)
   │ to preview       │     Desktop/Mobile toggle, HTML source, copy
   └────────┬────────┘
            │ proceed to Screen 10
            ▼
   ┌─────────────────┐
   │ Summary Screen   │  ← "Download Now" generates ZIP
   │ Download = ZIP   │     includes all email HTMLs + summary
   └─────────────────┘
```

---

## 8. Edge Cases & Error Handling

| Scenario | Handling |
|----------|---------|
| AI generation fails for 1 stage | Mark that stage email as `error`, show retry button; other stages unaffected |
| AI generation fails for all | Show error toast with "Retry" option; fall back to current plain previews |
| No logo URL available | Use text-only header with brand name styled in primary color |
| No colors extracted | Default to neutral palette (#1a1a1a primary, #6366f1 accent) |
| User closes panel mid-generation | Generation continues in background; results available when panel reopens |
| Session storage full | Max 4 emails (~400KB total) — unlikely to hit limits; compress if needed |
| Invalid HTML returned by AI | Run through DOMPurify sanitization; if structure is broken, retry once with stricter prompt |

---

## 9. Validation & Quality

**Email HTML quality checks (post-generation):**

1. Contains `<!DOCTYPE html>` declaration
2. Has `<html>`, `<head>`, `<body>` structure
3. Uses table-based layout (no `<div>` for structure)
4. All styles are inline (no `<style>` blocks)
5. All images have `alt` attributes
6. Contains unsubscribe placeholder `{{unsubscribe_url}}`
7. Total HTML size < 100KB per email
8. No JavaScript (ESPs strip it)
9. No external CSS references
10. Proper `charset=UTF-8` meta tag

**Validation runs client-side** after each email is generated. Failed checks surface as warnings (not blockers) in the preview UI.

---

## 10. Data & Analytics

**New events to track:**

| Event | Payload |
|-------|---------|
| `emailgen_panel_opened` | `{ business_type, email_count }` |
| `emailgen_brand_config_saved` | `{ fields_modified: string[] }` |
| `emailgen_generation_started` | `{ email_count, business_type }` |
| `emailgen_generation_completed` | `{ email_count, duration_ms, errors }` |
| `emailgen_preview_opened` | `{ node_id, stage }` |
| `emailgen_html_copied` | `{ node_id }` |
| `emailgen_single_regenerated` | `{ node_id }` |
| `emailgen_download_zip` | `{ email_count, total_size_kb }` |

**Database:** Extend `Submission` model with optional `email_gen_config` (JSON) and `generated_emails_count` (Int) fields.

---

## 11. Implementation Phases

### Phase 1: Foundation (MVP)
- `BrandConfig` type and `EmailStudioPanel` component
- Pre-fill brand config from existing scraped data
- `/api/generate-emails` route with Gemini integration
- Basic email HTML template generation (single template style)
- Store generated HTML in wizard state
- Enhanced `EmailPreview` with iframe rendering
- ZIP download with email HTML files

### Phase 2: Polish
- Desktop/Mobile responsive preview toggle
- HTML Source tab and Copy HTML button
- Single-email regeneration
- Generation progress indicators on canvas nodes
- Brand color picker with swatch preview
- CTA button style previews

### Phase 3: Advanced
- Multiple email template styles (minimal, editorial, promotional)
- Validation warnings in preview UI
- README.txt generation in download bundle
- `brand-guidelines.json` export
- Persisted brand configs across sessions (DB-backed)

---

## 12. Open Questions

| # | Question | Impact | Suggested Resolution |
|---|----------|--------|---------------------|
| 1 | Should we support custom HTML template uploads as a starting point? | Scope | Defer to v2 — start with AI-only generation |
| 2 | Max number of emails to generate in one batch? | Cost/UX | **Resolved:** One per requested stage (max 4), single Gemini call |
| 3 | Should generated emails be saved to the database? | Storage | Store in Submission JSON field; consider separate table if needed for querying |
| 4 | Do we need email rendering previews via a service like Litmus? | Quality | Defer — iframe preview sufficient for v1 |
| 5 | Should the Email Studio panel be accessible before the flow is generated? | UX | No — require flow generation first so email nodes exist to populate |

---

## 13. Success Criteria

| Metric | Target |
|--------|--------|
| Email generation completion rate | > 90% of started generations complete without error |
| Average generation time (full flow) | < 15 seconds for up to 4 stage emails (single Gemini call) |
| Download adoption | > 60% of users who generate emails also download the ZIP |
| HTML email ESP compatibility | Renders correctly in Gmail, Outlook, Apple Mail (manual QA) |
| User satisfaction | Positive qualitative feedback in first 50 user sessions |
