# Reel PM

An internal project manager for video production: describe a new project, answer a
short intake questionnaire, and get a custom task list + folder structure generated
automatically — then track progress, generate draft emails, and export to Google Drive
as the project moves from kickoff to delivery.

This is **Phase 1** of a 3-phase roadmap:

1. **Phase 1 (this build)** — intake-driven project manager: rules engine generates
   tasks/folders per project, dashboard tracks everything, draft-only email generation,
   Google Drive export.
2. **Phase 2 (not built yet)** — film-specific compliance moat: conditional "special
   scenes" checklist logic (stunts, weapons, minors, nudity, vehicles, animals, water,
   heights, fire/pyro), COI/insurance request generation, vendor recommendations.
3. **Phase 3 (not built yet)** — deep film customization: script breakdown, call sheet
   generation, scheduling calendar, Granola integration.

Explicitly out of scope at every phase: agency-side tooling (email triage, generic
meeting notes, CRM) — those are already well served by existing tools.

## Getting started

```bash
npm install
npm run db:migrate   # applies the Prisma schema to a local SQLite db (dev.db)
npm run db:seed      # loads the starter task-template library
npm run dev
```

Open http://localhost:3000. The app works immediately with **zero configuration** —
auth, AI email drafting, and Drive export all have graceful fallbacks (see below) so you
can try the full task-generation flow before wiring up any external services.

## Configuration

Copy `.env.example` to `.env` and fill in what you need. Everything is optional except
`DATABASE_URL`, which already has a working local default:

| Feature | Env vars | Behavior when unset |
|---|---|---|
| Auth | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | App runs open with a "Dev mode — auth not configured" badge; no login required |
| AI email drafting | `ANTHROPIC_API_KEY` | Falls back to a static template (still fully functional, just not AI-personalized) |
| Google Drive export | `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`, `GOOGLE_DRIVE_PARENT_FOLDER_ID` | Export button reports it isn't configured instead of failing |
| Cron auth | `CRON_SECRET` | `/api/cron/nudges` runs unauthenticated (fine locally, set this before deploying) |

## How the task generation works

`prisma/seed.ts` defines a library of `TaskTemplate` rows — each has a `conditions` JSON
blob (e.g. `{"shootMode": "in-person"}` or `{"flagAnyOf": ["hasMinors", "hasStunts"]}`).
When a project is created via the intake wizard, `src/lib/rules-engine.ts` matches every
template against that project's attributes and materializes the matching ones as `Task`
rows, grouped into categories (Production Info / Crew / Locations / Legal & Insurance /
Equipment & Rentals) and due-dated relative to the shoot date. See the doc comment at the
top of `src/lib/rules-engine.ts` for the full condition mini-language.

This pattern is adapted from a real NYU Tisch UGFTV student-film task-list spreadsheet,
which uses the same "folder + checklist + conditional trigger" structure for its
Safety Plan's "Special Scenes" section — that's the template Phase 2 will build on for
real compliance logic (COIs, permits, insurance).

## Moving to production

- **Database**: swap `provider = "sqlite"` for `"postgresql"` in `prisma/schema.prisma`,
  swap the `@prisma/adapter-better-sqlite3` driver adapter in `src/lib/db.ts` for
  `@prisma/adapter-neon` (recommended — [Neon](https://neon.tech) is Postgres with
  built-in serverless-friendly connection pooling), and point `DATABASE_URL` at the Neon
  connection string.
- **Cron**: `vercel.json` already defines a daily cron hitting `/api/cron/nudges`. Set
  `CRON_SECRET` in your Vercel project so the route only accepts Vercel's own requests.
- **Auth**: create a Clerk project and set the two Clerk env vars — no code changes
  needed, `src/proxy.ts` and `src/app/layout.tsx` both key off their presence.
