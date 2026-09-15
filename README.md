# T-Res

A consumer app for people with IRS tax problems. It turns IRS notices into plain English, shows what's owed year by year, and walks the taxpayer through the few things only they can do, while their Enrolled Agent handles the IRS.

This is the **v1 clickable prototype**: every screen works, and everything runs on mock data for one fictional taxpayer, Jordan Reyes. There are no APIs, no accounts and no real payments.

## What's in it

| Area | What it does |
| --- | --- |
| Dashboard | Case status, the next deadline, balances by year and next steps |
| Notices | Each IRS letter decoded: what it is, what it means, the deadline, what we're doing |
| Tax Years | Balance breakdown, income on record, the 10-year collection clock and a timeline |
| Action Items | Sign, upload and approve, each in a few minutes |
| Documents | The case file, with filters, uploads and a notes thread on every document |
| Sign now | Our own e-signature flow: review, consent, identity check, sign, certificate |
| Get Started | A 13-screen intake wizard, from the notice to choosing a plan |
| Library | Plain-English definitions of IRS forms, notices and terms, with printable IRS PDFs |
| Settings | Profile, notifications, security, and billing and plan (display only) |

Search everything with <kbd>Ctrl</kbd> <kbd>K</kbd> (or <kbd>/</kbd>).

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. Before committing, run `npm run lint` and `npm run build`.

## Share it as one page

`npm run build:artifact` builds the app and bundles it into a single HTML file at `.artifact/index.html` (hash routing, see `artifact/entry.tsx`). Every feature works in that file, so it can be shared as a link. Set `STAMP="…"` to add a small progress note in the corner.

## Printable IRS forms

The Library ships public-domain PDFs from IRS.gov (forms, publications and sample notices) with page previews. The list lives in `scripts/irs-forms.json`. To add a file, add it there and run:

```bash
node scripts/irs-forms.mjs
```

It downloads anything missing into `public/forms`, renders previews (needs Python with `pypdfium2`) and regenerates `lib/irsFiles.ts`.

## Where things live

- `lib/mockData.ts`: the taxpayer, notices, tax years, documents, plans. The demo date is fixed (`MOCK_TODAY`).
- `components/case-provider.tsx`: everything the taxpayer changes in a session (uploads, notes, signatures, plan).
- `lib/navigation.ts`: the sidebar and breadcrumbs.
- `CLAUDE.md`: product rules and conventions (tone, tiered review badges, formatting).

Stack: Next.js (App Router), Tailwind CSS, shadcn/ui, lucide-react.
