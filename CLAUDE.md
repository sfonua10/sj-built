<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->

# S&J Built

Internal ops app for organizing pickup-truck outfitting work between customers, admins, and contractors. Mobile-friendly web app.

## Stack

- TanStack Start (React + file-based routing, Vite-based)
- Convex — database, backend functions, file storage, real-time sync
- Clerk — auth only (no Clerk Organizations; orgs modeled in Convex — see below)
- Shadcn + Tailwind — UI components and styling
- Biome — lint + format (no ESLint, no Prettier)
- Cloudflare Workers — deploy target (not wired yet)

## How the app works

Three user roles, one workflow:

- **Admin** (me + my brothers): assign work orders to contractors, review completed jobs, invite users, manage checklist templates.
- **Customer** (e.g., Summit Trucking): create work orders with a VIN + checklist template. See their org's orders.
- **Contractor** (field workers on phones): see only their assigned jobs. Tap item → take photo → item is done. Submit for review when all items have photos.

Work order lifecycle: `Unassigned → Assigned → In Progress → Awaiting Review → Complete`. Admin approves Complete after reviewing photos. Admin can kick items back to In Progress.

## Architectural rules (do not violate without asking)

- **No Clerk Organizations.** We're on Clerk's free tier and model orgs in Convex (`organizations` table). Users carry `organizationId` in Clerk `publicMetadata`. Don't reach for `clerkClient.organizations.*`.
- **Invite-only.** No self-signup. Admin creates users via `clerkClient.invitations.createInvitation()` with `publicMetadata: { role, organizationId }`. There is no signup page.
- **Copy-on-create for checklists.** When a work order is created from a template, copy the items into the work order. Editing a template later must NOT retroactively change existing work orders.
- **Authorization at the data layer, not just UI.** Every Convex query/mutation goes through auth helpers. Contractor querying a work order ID they're not assigned to → unauthorized, even if UI would hide it. Hidden UI is not security.
- **Billing is out of scope.** No invoicing, no QuickBooks integration, no payment tracking. The app hands off clean "Complete" data; QB does the money.
- **File storage is Convex.** Don't add S3, Cloudflare R2, or any other image host. Photos go through Convex storage with signed upload URLs.

## Data model (5 tables)

- `organizations` — customer companies (Summit Trucking)
- `users` — mirror of Clerk users + role + `organizationId`
- `checklistTemplates` — per-org named bundles (e.g., "Summit Standard Pickup Outfit")
- `workOrders` — VIN, orgId, assigned contractor, status, timestamps
- `checklistItems` — child rows of a work order with name, `photoStorageId`, `completedAt`

## Role authorization rules

- **Admin:** read/write everything.
- **Customer:** read/write scoped to `self.organizationId` only.
- **Contractor:** read work orders where `assignedContractorId === self.id`. Write only check-offs/photos on those same orders.

Enforce in Convex helpers. Every query that returns data must pass through `withAuth(ctx, role)` or equivalent.

## Code style

- TypeScript strict mode. No `any` unless explicitly justified in a comment.
- Convex schema in `convex/schema.ts`. One table = one section. Indexes declared inline.
- Convex queries/mutations named camelCase, grouped by domain (`convex/workOrders.ts`, `convex/contractors.ts`).
- Components in `src/components/`; route files in `src/routes/` using TanStack Router file conventions.
- Shadcn components installed via CLI, not hand-rolled. If a primitive isn't in Shadcn, check before writing from scratch.
- Mobile-first. Every screen must work on a 375px viewport before I care about desktop polish.
- Tailwind utilities over custom CSS. No CSS modules, no styled-components.
- Use `cn()` helper from `src/lib/utils.ts` for conditional classes.

## Workflow rules

- Run `npm run typecheck` after any schema or Convex function change. Type errors block PRs to my own brain.
- Run `npm run lint` (Biome) before claiming a task is done. Auto-fix what you can.
- When changing the Convex schema, note whether it's a breaking change and whether seed data needs updating.
- Don't run `npx convex deploy` (prod) without asking. `npx convex dev` (local/dev) is fine anytime.
- When adding a dependency, prefer an existing one. Always flag new deps in your response.
- Prefer small, reviewable diffs. If a task needs more than ~5 files changed, stop and propose a plan first.

## Commands

```bash
npm run dev          # starts Vite + Convex dev server (parallel)
npm run typecheck    # tsc --noEmit
npm run lint         # biome check .
npm run lint:fix     # biome check --write .
npm run build        # production build
npx convex dev       # Convex only (if dev script doesn't cover it)
npx convex dashboard # open Convex web dashboard
```

## Environment variables

Required in `.env.local`:

- `CONVEX_DEPLOYMENT` — set by `npx convex dev`
- `VITE_CONVEX_URL` — set by `npx convex dev`
- `VITE_CLERK_PUBLISHABLE_KEY` — from Clerk dashboard
- `CLERK_SECRET_KEY` — from Clerk dashboard (server only)

## Things to ask before doing

- Any change that touches the auth model or role checks
- Any schema migration that would invalidate existing data
- Anything that would add a new third-party service
- Billing, invoicing, or QuickBooks-related features (out of scope)
- Features that would force me off Clerk's free tier
- "Nice-to-have" polish on screens I haven't built yet

## Known constraints

- I'm the sole developer. No code reviewer other than me.
- I'm on Claude's $100/mo plan and share context across projects — be concise with explanations, long on the actual code.
- Contractors will use this on mid-range Android phones in variable cell signal. Optimize for that, not for my M-series Mac.

## Out of scope for v1

- Billing / invoicing / QuickBooks integration
- Customer-facing status portal with realtime updates (v1.5 at earliest)
- Offline-first photo upload with background sync (nice-to-have later)
- Native mobile app (web-first for now)
- Multi-language support
- Analytics, dashboards beyond basic status counts
