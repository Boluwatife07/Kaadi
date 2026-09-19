# Kaadi

A trust layer for domestic workers hired almost entirely by word of mouth.
Build spec: `Kaadi — Master Build Specification for AI-Assisted Parallel
Development`, v1.0. This document overrides ad-hoc decisions — see Section
15 before touching anything outside your own section.

## Setup (run once per laptop)

```bash
cp .env.example .env   # then fill in ANTHROPIC_API_KEY (lead distributes)
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed          # loads the fixed-ID demo fixtures — Section 7
npm run dev
```

`.env.example` lists every var Section 3.2 expects, `NEXT_PUBLIC_BASE_URL`
included — see the QR section below before the live demo. If
`ANTHROPIC_API_KEY` isn't filled in, `npm run seed` and everything except
the AI structuring call will still work.

Seeded demo workers (PIN `1234` for all of them): `w-amaka` (published,
happy path), `w-tunde` (needs_structuring), `w-bisi` (mid-review draft),
`w-chidinma` (published, one pending + one declined entry, one deactivated
QR token).

## What's on `main` right now (Hour 0 contract pack + Sections A, B & C)

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
- Section C (Public Profile & QR): `lib/qr.ts` (nanoid(21) opaque tokens,
  regenerate deactivates every prior token, deterministic — no LLM
  anywhere per Section 11.1), `POST /api/workers/:id/qr/regenerate`,
  `GET /api/qr/:token/image` (410 if inactive), `GET /api/p/:token`
  (public profile JSON — confirmed history only, per Section 18's QA
  checklist), the public `/p/[token]` page (no dashboard shell, Section
  5.4), and `/my-code`.

`/work-history` is linked from the dashboard nav but not yet built —
belongs to SD. The public page's "Add myself as an employer" form is a
stub (`components/AddEmployerForm.tsx`, `OWNER: SD`) — real version needs
SD's `POST /api/employers` and `POST /api/p/:token/add-employer`.

### ⚠️ Set this before the live demo

`lib/qr.ts` defaults `NEXT_PUBLIC_BASE_URL` to the spec's literal
`https://kaadi.app` (Section 11.1) — a domain this build isn't deployed to.
**Before the "scan cold on a second phone" demo beat, set
`NEXT_PUBLIC_BASE_URL` in `.env` to wherever the app is actually reachable**
(your LAN IP, e.g. `http://192.168.1.23:3000`, or a tunnel/deploy URL) —
otherwise every QR code encodes an address nobody's phone can reach.

### Stubs still waiting on their real owners

- `lib/services/workHistory.ts` (`OWNER: SD`) — frozen signature per
  Section 13.2, stub returns a fixed id and does **not** write a row yet.
  Draft approval calls it, so worker-declared history entries won't
  actually persist until SD replaces the body.
- `components/AddEmployerForm.tsx` (`OWNER: SD`) — placeholder card on the
  public profile page; SD replaces the whole file, no edit to the page
  needed.

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
