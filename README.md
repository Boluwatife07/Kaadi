# Kaadi

A trust layer for domestic workers hired almost entirely by word of mouth.
Build spec: `Kaadi — Master Build Specification for AI-Assisted Parallel
Development`, v1.0. This document overrides ad-hoc decisions — see Section
15 before touching anything outside your own section.

## Setup (run once per laptop)

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed          # loads the fixed-ID demo fixtures — Section 7
npm run dev
```

`.env` is already in the repo for the hackathon (Section 3.2 — identical on
all four laptops, not meant to ship). If `ANTHROPIC_API_KEY` isn't filled in,
`npm run seed` and everything except the AI structuring call will still work.

Seeded demo workers (PIN `1234` for all of them): `w-amaka` (published,
happy path), `w-tunde` (needs_structuring), `w-bisi` (mid-review draft),
`w-chidinma` (published, one pending + one declined entry, one deactivated
QR token).

## What's on `main` right now (Hour 0 contract pack + Section A)

- Frozen: `prisma/schema.prisma`, `prisma/seed.ts`, `lib/contracts.ts`,
  `lib/db.ts`, `app/globals.css`, `components/ui/*`
- Section A (Identity, Onboarding & Contract Pack): `lib/auth.ts`,
  `lib/services/worker.ts`, `middleware.ts`, `/api/auth/*`, `/api/me`,
  `GET /api/workers/:id`, `/login`, `/register`, the `(me)` dashboard shell,
  and `/profile` (intake capture — voice + typed, equally required paths).

`/profile` calls `POST /api/workers/:id/intake` on submit — that route is
SB's to implement (Section 8.2). Until SB builds it, intake submission will
error with a 404, which is expected mid-build.

`/work-history` and `/my-code` are linked from the dashboard nav but not
yet built — those pages belong to SD and SC respectively.

## Branches (Section 14)

`main` is always runnable. Feature branches: `sa-identity`, `sb-briefs`,
`sc-public-qr`, `sd-history`. Merge to main on the hour. Commit format:
`SA: <what changed>` — always the section prefix.

## One deviation from the spec worth knowing about

Section 5.1's `globals.css` literally hardcodes `--font-sans: "Inter", ...`
and `--font-display: "Manrope", ...`. Section 3.4 says load both fonts via
`next/font/google` in `app/layout.tsx`. next/font doesn't register fonts
under their literal family name — it injects CSS variables instead — so
those two tokens reference `var(--font-inter)` / `var(--font-manrope)`
rather than the literal strings. Functionally identical once fonts load;
flagging it because Section 13.3 calls `globals.css` frozen-verbatim.
