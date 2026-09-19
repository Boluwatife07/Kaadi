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

## What's on `main` right now (Hour 0 contract pack + Sections A & B)

- Frozen: `prisma/schema.prisma`, `prisma/seed.ts`, `lib/contracts.ts`,
  `lib/db.ts`, `app/globals.css`, `components/ui/*`
- Section A (Identity, Onboarding & Contract Pack): `lib/auth.ts`,
  `lib/services/worker.ts`, `middleware.ts`, `/api/auth/*`, `/api/me`,
  `GET /api/workers/:id`, `/login`, `/register`, the `(me)` dashboard shell,
  and `/profile` (intake capture — voice + typed, equally required paths).
- Section B (AI Structuring & Profile Review): `lib/ai.ts` (single `callAI`
  wrapper, 12s timeout, deterministic fallback per Section 10), the
  `ProfileDraft`/`Guarantor` tables, `POST /api/workers/:id/intake`,
  `GET /api/workers/:id/drafts/latest`, `PATCH /api/drafts/:id`,
  `POST /api/drafts/:id/approve`, `/api/workers/:id/guarantor`, and the
  `/profile/review` field-by-field Accept/Edit/Reject screen.

`/work-history` and `/my-code` are linked from the dashboard nav but not
yet built — those pages belong to SD and SC respectively.

### Stubs still waiting on their real owners

- `lib/services/workHistory.ts` (`OWNER: SD`) — frozen signature per
  Section 13.2, stub returns a fixed id and does **not** write a row yet.
  Draft approval calls it, so worker-declared history entries won't
  actually persist until SD replaces the body.
- Nothing on SC yet — QR generation, the public `/p/:token` page, and the
  demo's "scan cold on a second phone" moment all need SC's hour.

### Known gaps / things to revisit

- **`plain_summary` has nowhere to live.** `ProfileDraft` (frozen, Section
  6) has no summary column, so the AI's own 1–2 sentence summary is only
  ever shown transiently (stashed in `sessionStorage` between intake submit
  and the review screen) — it's never persisted. What *is* persisted to
  `Worker.structuredSummary` at approval is a deterministic sentence built
  from the reviewed name/skills/location, not the AI's original wording.
  If this matters for the demo, it needs a schema change, which is a
  broadcast-to-everyone decision (Section 2.1).
- **Editing "Work history" or "Guarantor" in the review screen is free
  text**, not a structured per-entry editor — `FieldReview` wasn't built
  for nested data. Harmless right now since `createWorkerDeclaredEntry` is
  still a stub, but SD should know before wiring the real write.

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
