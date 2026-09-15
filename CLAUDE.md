@AGENTS.md

# T-Res Taxpayer App (v1 prototype)
- Consumer-facing IRS tax resolution app. Users are anxious — tone: calm, plain English, every warning paired with an action button.
- Design system: mirror a governance console aesthetic — light bg, card-based metrics, status dots (green/yellow/red), badge pills, alert banners with CTA buttons, left sidebar nav.
- Stack: Next.js App Router, Tailwind, shadcn/ui, lucide-react icons. Mock data only in /lib/mockData.ts — no APIs.
- Every AI-generated output in the UI shows an "EA-Reviewed" badge (trust is the product).
- Money always formatted, deadlines always show days remaining, IRS jargon always translated.

## Scope (v1)
- Core screens: Dashboard, Notice Center, Tax Years, Action Queue, Documents, Intake Wizard, plus Settings (profile, notifications, security, billing & plan). No messaging, no auth.
- Billing is display-only mock data (plan, payment schedule, pause/switch/cancel in React state). No payment processing and no card-entry forms. Cancelling must stay as easy as signing up: no forced steps, reasons optional.
- No real IRS / transcript / e-Services integration — that is v2. Do not add API calls or credentials.
- State: React state only. No localStorage (breaks in some preview environments).

## Conventions
- Formatting helpers live in /lib/format.ts (`formatMoney`, `daysUntil`, `formatDate`). Use them — never format money or dates inline.
- Status colours come from the `StatusDot` / `StatusBadge` components in /components/status.tsx. Tones: `good` (green), `warn` (amber), `bad` (red), `neutral` (grey).
- Visual language is the PLCY Governance Console (`Desktop\PLCY\Claude Code_Anthropic\plcy_customer_admin_portal`, e.g. `HITLGuardrails.tsx`): tokens in app/globals.css `:root` are copied from its theme.css. When unsure how something should look, copy the PLCY pattern.
- Metric tiles: Card → CardTitle `text-sm` with a coloured lucide icon, value `text-2xl font-bold`, caption `text-xs text-muted-foreground`. Alerts: `border-{red|yellow}-200 bg-{red|yellow}-50` with a CTA button beside the text.
- Routing: app pages with the sidebar live in `app/(app)/`; the full-screen Get Started wizard lives in `app/(onboarding)/intake/[screen]`. Wizard steps, screens, copy and Back/Continue rules come only from /lib/intakeScreens.ts; answers are held by `IntakeProvider` (React state). Spec: /docs/intake-wizard-scope.md.
- Anything the taxpayer changes during a session (uploads, notes, finished to-dos, signatures) lives in `CaseProvider` (/components/case-provider.tsx, mounted in the root layout) and is read with `useCase()`. Don't keep separate per-page copies of that state.
- Signing is our own proprietary flow at `app/(focus)/sign/[id]` (review → consent → verify → sign → certificate). Signable documents and their plain-English terms live in `signingTerms` in mockData. Every "Sign" button links there; don't integrate DocuSign or PandaDoc.
- Progress artifact: `npm run build:artifact` (or `node scripts/build-artifact.mjs <out.html>` after `next build`) bundles the real app for the browser via /artifact/entry.tsx with hash routing, so every feature works in the shared link. When you add a route in app/, add the same route to `route()` in artifact/entry.tsx. Page files may only export what Next allows, so shared page bodies live in components/ (e.g. components/intake/screen-bodies.tsx).
- Library (IRS forms, notices, terms + IRS.gov links) lives in /lib/library.ts, kept import-free. Link any page that mentions a form or notice to its entry (`libraryMatches(text)`). After changing IRS links, verify they load.
- Printable IRS files: list in /scripts/irs-forms.json (irs.gov/pub/irs-pdf and irs.gov/pub/notices only, public domain). `node scripts/irs-forms.mjs` downloads missing PDFs to public/forms, renders page-1 PNG previews (Python + pypdfium2) and regenerates /lib/irsFiles.ts. Map files to Library entries in `libraryFiles`. Never hand-edit irsFiles.ts.
- Search everything: /lib/search.ts builds the index for the Ctrl+K palette (components/search). New pages or data kinds must be added to the index.
- Sidebar and breadcrumbs both read /lib/navigation.ts. Settings and Billing & plan are reached from the account menu (name, top right) only: their group has `sidebar: false` so breadcrumbs still name them.
- Notice status is live: read `notices` / `openNotices` from `useCase()`, not mockData. A notice needing action moves to "We're handling it" once every to-do tied to it (`relatedNoticeId`) is done.
- Selection state that should survive the progress snapshot goes in the URL (e.g. /notices/[id], /tax-years/[year]), not React state.
- Links that look like buttons use `<LinkButton />` from /components/link-button.tsx.
- AI-generated content gets `<EAReviewedBadge />` from /components/ea-reviewed-badge.tsx.
- Mock "today" is fixed in mockData (`MOCK_TODAY`) so day counts stay stable in demos.

## Working rules
- One feature per session. Plan first, then build. Commit after every working screen.
