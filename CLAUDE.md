@AGENTS.md

# T-Res Taxpayer App (v1 prototype)
- Consumer-facing IRS tax resolution app. Users are anxious — tone: calm, plain English, every warning paired with an action button.
- Design system: mirror a governance console aesthetic — light bg, card-based metrics, status dots (green/yellow/red), badge pills, alert banners with CTA buttons, left sidebar nav.
- Stack: Next.js App Router, Tailwind, shadcn/ui, lucide-react icons. Mock data only in /lib/mockData.ts — no APIs.
- Every AI-generated output in the UI shows a tiered review badge (trust is the product): "Checked by T-Res" (automated checks under rules the EA approved, governed by PLCY) or "Approved by Chris" (he signed off himself: anything sent under his name, money recommendations). Goal: AI does ~99% of the work; the EA approves by exception.
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
- Two lanes: self-serve (the taxpayer deals with the IRS themselves, T-Res prepares everything, Guided plan, no Form 2848) and represented (Chris acts under Form 2848, Full Resolution). `selfServeCheck()` in /lib/intakeScreens.ts is the one eligibility rule; the assessment screen shows it and the lane picked preselects the plan. In the app the lane lives in CaseProvider (`lane`): the Guided plan means self-serve, unless the case was escalated. To-dos, documents and PLCY items for one lane only carry `lane` in mockData, and CaseProvider hides the other lane's. Copy that assumes Chris acts needs a self-serve version: notices take `selfServe` overrides of their decode, and components read `lane` from `useCase()`. Self-serve letters and returns are signed by the taxpayer and auto-approved under the "Letters and returns you send yourself" policy; nothing goes out under Chris's name. Uploads that confirm something the taxpayer did (e.g. the payment plan confirmation) get a PLCY check under "Checks on what you did yourself". Items that unlock later use `after` (to-dos, documents) or `showsAfter` (PLCY items) with the id of the to-do that must be done first. Escalation (`escalate()`; demo: account menu → "Simulate: an LT11 arrives") adds `laterNotices` / `laterDocuments` / `laterGovernanceItems`, sends a same-day item to Chris in PLCY and moves the case to represented. Pages for those later items must be prerendered too (see notices/[id] and plcy/[id]).
- PLCY is T-Res's AI governance layer. `app/(plcy)/plcy` is a demo mock of Chris's PLCY view (approvals inbox, item review), reached from the account menu. AI actions and routing policies live in `governanceItems` / `governancePolicies` in mockData; decisions live in CaseProvider (`governance`, `decideGovernance`). Log every AI output there so its badge follows its PLCY record live. PLCY pages are Chris's, so keep them out of the taxpayer's search index.
- Selection state that should survive the progress snapshot goes in the URL (e.g. /notices/[id], /tax-years/[year]), not React state.
- Links that look like buttons use `<LinkButton />` from /components/link-button.tsx.
- AI-generated content gets `<GovernanceBadge />` from /components/governance-badge.tsx: pass `itemId`, or the `href` of the page the output appears on, to follow its PLCY record; `tier="approved"` only for content Chris approved himself (e.g. Library entries).
- Mock "today" is fixed in mockData (`MOCK_TODAY`) so day counts stay stable in demos.

## Working rules
- One feature per session. Plan first, then build. Commit after every working screen.
