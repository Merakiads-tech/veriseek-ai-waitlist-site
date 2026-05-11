# VeriSeek — Waitlist Landing Page

Single-page Next.js 14 landing page for the **VeriSeek** AI review verification platform waitlist campaign.

Built for `waitlist.veriseek.ai`. All survey responses and email submissions are stored in **Supabase** (Postgres).

## Stack
- Next.js 14 (App Router, JavaScript)
- Tailwind CSS + shadcn/ui
- Supabase (waitlist storage)
- DM Serif Display + DM Sans (Google Fonts)
- Vanilla `IntersectionObserver` for scroll animations (no GSAP / Framer)

## Sections
1. Sticky capsule navigation
2. Hero + email CTA (writes to `waitlist_emails`, source `hero_cta`)
3. Statistics strip with count-up animations
4. Problem list (5 cards)
5. **Survey** — 5-question MCQ + email capture (writes to `waitlist_responses`)
6. Why VeriSeek (Our Mission)
7. Why Shoppers Trust VeriSeek (4 trust cards)
8. Final CTA + email (writes to `waitlist_emails`, source `footer_cta`)
9. Footer

## Environment variables

Copy `.env.example` to `.env` and fill in:

```
NEXT_PUBLIC_BASE_URL=https://waitlist.veriseek.ai
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>   # server-side only — DO NOT expose
```

The two `NEXT_PUBLIC_*` values are safe to ship in the client. The
`SUPABASE_SERVICE_ROLE_KEY` is used **only** inside the API routes
(`/api/waitlist/email`, `/api/waitlist/survey`) to bypass RLS and write
submissions reliably.

## Supabase setup

Run `supabase-setup.sql` once in your Supabase project's SQL Editor. It
creates:

- `waitlist_emails`  (`id`, `email` UNIQUE, `source`, `created_at`)
- `waitlist_responses`  (`id`, `email`, `q1_answer` … `q5_answer`, `source`, `created_at`)

…and enables RLS with public-INSERT-only policies.

## API routes

| Method | Path                    | Body                                                  | Notes                                |
|--------|-------------------------|-------------------------------------------------------|--------------------------------------|
| POST   | `/api/waitlist/email`   | `{ email, source }`                                   | `source` ∈ `hero_cta` \| `footer_cta` |
| POST   | `/api/waitlist/survey`  | `{ email, q1, q2, q3, q4, q5 }`                       | Also inserts into `waitlist_emails`   |

Successful inserts return `{ ok: true, message }`. Duplicate emails on
`waitlist_emails` return `{ ok: true, duplicate: true, message: "You're already on the list!" }`.

## Local development

```bash
yarn install
yarn dev          # http://localhost:3000
```

## Production

```bash
yarn build
yarn start
```

## Downloading submissions
Supabase Dashboard → **Table Editor** → `waitlist_emails` / `waitlist_responses` → **Export** → CSV.
