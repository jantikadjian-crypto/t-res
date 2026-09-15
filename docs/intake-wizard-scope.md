# Get Started wizard — scope

The first thing a new taxpayer sees. It turns "I got a scary letter" into a case with a plan,
a price, and a to-do list. Target: about 10 minutes, on a phone.

Status: **built 2026-09-14, all 13 screens** (pricing still placeholder). Jordan Reyes' answers live in `lib/mockData.ts` →
`intakeAnswers`; every example below uses them.

## Decisions (agreed with Jack, 2026-09-14)

| Question | Decision |
|---|---|
| Where it lives | **Full-screen**, outside the app shell: no sidebar, just the wordmark, step counter, progress bar, and "Save and exit". |
| Returning users | **Replayable wizard**: Jordan sees the full wizard prefilled with the Sep 3 answers, with a banner explaining that. |
| Length | **13 screens**: strict one question per screen. Steps 2 (Situation) and 4 (Money) split into sub-screens. |
| Emergency ("the IRS took money") | Flag the case urgent, skip straight to Authorization, and promise **"Chris will review your case today."** No phone number or messaging in v1. |
| Pricing | *Still open*: $395 / $1,650 / $2,150 used as placeholders. |

## Principles

- **One question per screen.** Short plain-English heading, one line of "why we ask", big tap targets.
- **Calm, never alarming.** Every warning is paired with what happens next.
- **Translate IRS jargon** the first time it appears: "payment plan (installment agreement)", then just "payment plan".
- **No real PII in v1.** Identity fields show masked fake values (`•••-••-4417`); nothing sensitive is collected.
- **Trust.** AI output (the notice decode on screen 1, the assessment on screen 11) carries the EA-Reviewed badge,
  or "Awaiting review by Chris G." when it was generated moments ago.
- **State.** React state only (CLAUDE.md). A refresh resets to Jordan's answers. Real save/resume is v2 (needs accounts).

## Frame (every screen)

```
┌──────────────────────────────────────────────┐
│ T-Res                Step 3 of 7   Save & exit│  ← header; Save & exit → Dashboard
│ ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  ← bar = screen N of 12
├───────────┬──────────────────────────────────┤
│ ✓ Notice  │  Question 2 of 4                 │  ← only for multi-screen steps
│ ● Situat. │  Heading in plain English        │
│ ○ Auth.   │  One line of why we ask.         │
│ ○ Money   │                                  │
│ ○ Docs    │  [ answer cards / fields ]       │
│ ○ Assess  │                                  │
│ ○ Path    │  ← Back                Continue →│
└───────────┴──────────────────────────────────┘
```

- **Left rail** (desktop only): the 7 steps with ✓ done / ● current / ○ upcoming. Done steps are links.
- **Replay banner** (Jordan only, under the header): "You finished this on Sep 3, 2026. We're showing your answers, and
  changes here aren't saved." Blue, dismissible.
- **Buttons:** Continue (primary, right) is disabled until the screen's required answer is given. Back (left) always works.
- **Phone:** rail hidden; header shows "Step 3 of 7"; buttons stick to the bottom of the screen.
- **Colours/components:** same PLCY tokens as the app: answer options are bordered cards that turn
  `border-primary ring-1 ring-primary` when chosen.

## The 13 screens

URL pattern `/intake/<screen>`, so each screen is a real page (and clicks through in the snapshot).

### Step 1 · Notice

**1. `/intake/notice` — "Let's start with the letter the IRS sent you."**
- Why: "We'll read it and tell you what it means in plain English."
- Inputs: upload PDF · take a photo · "Try a sample letter" · link "I don't have a letter" (continues without one).
- After upload: about 2 seconds of "Reading your letter…", then a decode card: code, plain title, amount, deadline + days
  left, "What it means", and an "Awaiting review" badge.
- Branch: a levy-type notice (CP504, LT11, Letter 1058) adds a calm red line to the decode card:
  "This one has a deadline. We'll put it first."
- Required: a letter, or "I don't have a letter".
- Jordan: CP504 · "Final warning before the IRS can take property" · $14,200 · respond by Sep 26, 2026.
- Writes: `noticeDocumentId` → also a new `notices` + `documents` entry.

### Step 2 · Your situation (4 screens)

**2. `/intake/situation` — "What best describes you right now?"** (pick one)
- I owe and can't pay it all at once · I owe and can pay · I haven't filed some years ·
  I got a letter I don't understand · **The IRS took money from my pay or bank account**
- Branch: the last option → **emergency path** (see below).
- Jordan: "I owe and can't pay it all at once". Writes: `situation`.

**3. `/intake/unfiled` — "Are there any years you haven't filed a tax return?"** (pick any)
- 2019 … 2025 as chips, plus "All filed" and "Not sure". "Not sure is fine, because we'll check your IRS records."
- Jordan: 2023. Writes: `unfiledYears`.

**4. `/intake/income-types` — "How do you earn money?"** (pick any)
- A job with a W-2 · Gig, delivery or self-employed · Retirement or benefits · Not working right now.
- Jordan: W-2 job + gig/delivery. Writes: `incomeTypes`. Drives the document checklist (screen 10).

**5. `/intake/levy` — "Has the IRS taken money or contacted your employer?"** Yes / No
- Branch: Yes → emergency path.
- Jordan: No. Writes: `moneyTakenOrEmployerContacted`.

**Emergency path.** From screen 2 or 5: mark the case urgent and go straight to screen 6. Screen 6 then shows a red
banner above the heading: "Chris will review your case today. Signing Form 2848 below lets him contact the IRS
to get the money released." The Dashboard later shows the case as urgent. Skipped situation screens stay unanswered,
and the wizard continues normally from screen 6.

### Step 3 · Authorization

**6. `/intake/authorization` — "Let us see your IRS records and speak for you."**
- Two cards:
  - **Form 8821 · "Lets us *see* your IRS records."** Required. Signing it lets us pull transcripts today.
  - **Form 2848 · "Lets Chris *speak* to the IRS for you."** Sign now or "I'll sign later" (later → action item).
    Required now on the emergency path.
- Fields: legal name (prefilled), SSN `•••-••-4417` (fake, read-only), address (prefilled), typed signature +
  "I agree to sign electronically" checkbox.
- Jordan: 8821 signed Sep 3 · 2848 "later". Writes: `authorization`.

### Step 4 · Money snapshot (3 screens)

A plain-English version of the IRS's Collection Information Statement (Form 433-F).

**7. `/intake/money-in` — "What comes in each month?"**
- Rows: take-home pay, other income (gig/benefits, after costs); "How often are you paid?"; household size.
- Rows show according to screen 4 answers (a gig row only if gig was picked).
- Jordan: $3,920 job + $930 delivery = **$4,850**; every two weeks; household of 1. Writes: `monthlyIncome`, `household`.

**8. `/intake/money-out` — "What goes out each month?"**
- Rows: rent/mortgage · car payment · gas and car insurance · utilities and phone · groceries and household ·
  health insurance · other.
- Live footer: **"Left over each month: $910"**, green if positive, amber if under $100, red if negative.
- Note: "The IRS has limits on what it counts for some costs. We'll handle that part."
- Jordan: $1,850 · $465 · $390 · $335 · $590 · $310 = **$3,940** → $910 left over. Writes: `monthlyExpenses`.

**9. `/intake/assets` — "What do you own?"**
- Rows: bank accounts (balance) · vehicles (value, amount owed) · retirement accounts · home (value, mortgage).
- Shows equity per item ("You own about $4,200 of the car").
- Jordan: checking $2,300 · 2019 Honda Civic worth $14,000 with $9,800 owed. Writes: `assets`.

### Step 5 · Documents

**10. `/intake/documents` — "Here's what we'll need from you."**
- A list generated from earlier answers, never generic. Each row: what it is, why the IRS wants it,
  "Upload now" / "Later". Rows already uploaded show ✓.
- Rules: an unfiled year → W-2s/1099s for that year; any balance → 3 months of bank statements;
  a W-2 job → 2 recent pay stubs; a vehicle loan → the loan statement.
- Jordan: CP504 ✓ · 2023 W-2 and 1099s · Jun–Aug bank statements · 2 pay stubs · car loan statement.
- Writes: "Later" rows become `actionItems` (upload type).

### Step 6 · Assessment

**11. `/intake/assessment` — "Here's what we think you should do."**
- AI-generated, **EA-Reviewed** badge at the top. Four blocks:
  1. **Where you stand:** about $21,000 owed for 2021–2022, plus about $4,900 estimated for 2023.
  2. **Our recommendation:** a payment plan (installment agreement) of **about $440 a month**. It stops collection and
     doesn't need a full financial review because the balance is under $50,000.
  3. **What else we'll do:** file 2023 first · First-Time Penalty Abatement on 2021 (saves up to $2,310) · pay about $900
     up front to get under $25,000 so we can ask for the lien to be withdrawn.
  4. **What we ruled out:** Offer in Compromise (the IRS would expect about $28,000, more than you owe) · Currently Not
     Collectible (you have about $910 left over each month).
- Nothing to answer; Continue is always enabled. Writes: nothing (reads `intakeAnswers.assessment`).

### Step 7 · Your path

**12. `/intake/path` — "Choose how much help you want."**
- Three cards from `resolutionPlans` (stacked on a phone), middle one marked **Recommended**:
  - Guided · $395 one-time
  - **Full Resolution · $1,650 or 6 × $275**
  - Resolution + Protection · $2,160 or 6 × $360
- Each card: price, one-line pitch, 3–4 inclusions, "Choose this". The selected card gets the primary ring.
- **No payment** (no billing in v1): "You won't be charged today. Chris confirms your plan before anything is billed."
- Jordan: Full Resolution. Writes: `chosenPlanId`.

### Finish

**13. `/intake/done` — "You're all set, Jordan."**
- A three-item "what happens next" list, built from the answers: "Chris reviews your case (within 1 business day, or today
  if urgent)" · "You have N things to do" (the action items just created) · "Your most urgent deadline: CP504, Sep 26".
- Button: "Go to your dashboard".

## Build notes

- **Full-screen routing:** move the app shell out of the root layout into a route group, `app/(app)/layout.tsx`, and put
  the wizard in `app/(onboarding)/intake/` with its own frame layout. URLs don't change.
- **State across screens:** a client `IntakeProvider` in the wizard layout holds answers (seeded from `intakeAnswers`).
  Layouts don't remount between screens, so answers survive Back/Continue.
- **Screens are static pages** (`generateStaticParams` over the 13 slugs), so the progress snapshot can click through them.
  Typing and uploads only work in the running app.
- **Screen config in one place:** `lib/intakeScreens.ts` holds slug, step, title, and next/back rules (including the emergency
  branch), so the rail, progress bar, and routing all read the same list.
- **Suggested order:** (1) route groups + frame + provider + rail, (2) screens 1–6, (3) screens 7–10 with the live calc,
  (4) screens 11–13, snapshot, commit.

## Still open

- **Pricing:** confirm $395 / $1,650 / $2,150 or give the real numbers.
