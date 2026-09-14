@AGENTS.md

# T-Res Taxpayer App (v1 prototype)
- Consumer-facing IRS tax resolution app. Users are anxious — tone: calm, plain English, every warning paired with an action button.
- Design system: mirror a governance console aesthetic — light bg, card-based metrics, status dots (green/yellow/red), badge pills, alert banners with CTA buttons, left sidebar nav.
- Stack: Next.js App Router, Tailwind, shadcn/ui, lucide-react icons. Mock data only in /lib/mockData.ts — no APIs.
- Every AI-generated output in the UI shows an "EA-Reviewed" badge (trust is the product).
- Money always formatted, deadlines always show days remaining, IRS jargon always translated.

## Scope (v1)
- 5 screens only: Dashboard, Notice Center, Tax Years, Action Queue, Intake Wizard. No billing, no messaging, no auth.
- No real IRS / transcript / e-Services integration — that is v2. Do not add API calls or credentials.
- State: React state only. No localStorage (breaks in some preview environments).

## Conventions
- Formatting helpers live in /lib/format.ts (`formatMoney`, `daysUntil`, `formatDate`). Use them — never format money or dates inline.
- Status colours come from the `StatusDot` / `StatusBadge` components in /components/status.tsx. Tones: `good` (green), `warn` (amber), `bad` (red), `neutral` (grey).
- AI-generated content gets `<EAReviewedBadge />` from /components/ea-reviewed-badge.tsx.
- Mock "today" is fixed in mockData (`MOCK_TODAY`) so day counts stay stable in demos.

## Working rules
- One feature per session. Plan first, then build. Commit after every working screen.
