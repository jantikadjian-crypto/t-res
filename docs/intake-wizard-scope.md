# Get Started wizard — scope (draft for review)

The first thing a new taxpayer sees. It turns "I got a scary letter" into a case with a plan,
a price, and a to-do list. Target: done in about 10 minutes, on a phone.

Status: **scoping, not built.** Jordan Reyes' answers live in `lib/mockData.ts` → `intakeAnswers`,
so every example below is real prototype data.

## Principles

- **One question per screen.** Big tap targets, a short heading in plain English, one line of "why we ask".
- **Calm, never alarming.** Every warning comes with the next step ("This is fixable. Here's what happens next.").
- **Translate IRS jargon.** Say "payment plan (installment agreement)" once, then just "payment plan".
- **Always show progress.** "Step 3 of 7" plus a bar. Back always works; answers are kept.
- **Save and resume.** v1 keeps answers in React state only (no localStorage, per CLAUDE.md), so a refresh
  resets. Real save/resume needs accounts, which is v2.
- **No real PII in v1.** Fields show masked fake values (`•••-••-4417`). No SSN or bank numbers are collected.
- **Trust.** Anything AI-generated (the notice decode in step 1, the assessment in step 6) carries the
  EA-Reviewed badge, or "Awaiting review by Chris G." when it was generated moments ago.

## Layout

Full-screen and focused: no sidebar, just the T-Res wordmark, "Step N of 7", a progress bar, and
"Save and exit". Left rail on desktop lists the 7 steps with check marks; hidden on phones.
Primary button bottom-right ("Continue"), secondary bottom-left ("Back").

## The steps

### 1. Upload your notice
- **Question:** "Let's start with the letter the IRS sent you."
- **Inputs:** upload a PDF, take a photo, or "I don't have a letter" (skips to step 2 with a question
  about what happened).
- **What happens:** fake processing for about 2 seconds, then a decode card: notice code, plain-English title,
  amount, deadline with days left, and "What it means". Shows the "Awaiting review" badge.
- **Branch:** if the decoded notice is a levy or final notice (CP504, LT11, Letter 1058), show a calm red
  banner: "This one has a deadline. We'll prioritise it."
- **Jordan:** uploaded the CP504 → "Final warning before the IRS can take property · $14,200 · 23 days left" (as of Sep 3).

### 2. Your situation (4 short screens)
- **2a. "What best describes you?"** (pick one): I owe and can't pay it all · I owe and can pay ·
  I haven't filed some years · I got a letter I don't understand · The IRS took money from my pay or bank.
  - The last option is the **emergency path**: skip ahead, flag the case urgent, and show
    "Chris will review your case today."
- **2b. "Any years you haven't filed?"** Multi-select 2019–2025, plus "Not sure". Not sure is fine; we check transcripts.
- **2c. "How do you earn money?"** Multi-select: job with a W-2 · gig/delivery/self-employed ·
  retirement or benefits · not working right now.
- **2d. "Has the IRS taken money or contacted your employer?"** Yes / No.
- **Jordan:** can't pay it all · 2023 unfiled · W-2 job + gig/delivery · no.

### 3. Authorization
- **Question:** "Let us see your IRS records and speak for you."
- **Content:** two plain-English cards.
  - Form 8821: "Lets us *see* your IRS records." Signed now, so we can pull transcripts.
  - Form 2848: "Lets Chris *speak* to the IRS for you." Can be signed now or later; later creates an action item.
- **Inputs:** legal name (prefilled), last 4 of SSN (masked, fake), address (prefilled), a
  "Sign with my name" checkbox + typed name (fake e-sign).
- **Jordan:** 8821 signed Sep 3 · 2848 left for later → it's the "Sign Form 2848" action item today.

### 4. Money snapshot (3 short screens)
A light version of the IRS's Collection Information Statement (Form 433-F), in normal words.
- **4a. Income:** take-home pay per month, how often you're paid, other income (gig, benefits). Household size.
- **4b. Monthly costs:** rent/mortgage, car payment, gas + insurance, utilities + phone, groceries, health
  insurance, other. Live total and **"Left over each month"** at the bottom.
  Note: "The IRS has limits on what it counts for some costs. We'll handle that part."
- **4c. What you own:** bank balances, vehicles (value and what's owed), retirement accounts, home.
- **Jordan:** $4,850/month in ($3,920 job + $930 delivery) · $3,940 out · **$910 left over** ·
  checking $2,300 · 2019 Honda Civic worth $14,000 with $9,800 owed.

### 5. Your document checklist
- Generated from the answers so far, never a generic list. Each row: what it is, why the IRS wants it,
  "Upload now" or "I'll do it later". Later items become action items.
- **Jordan:** 2023 W-2 and 1099s (needed to file 2023) · last 3 months of bank statements (payment amount) ·
  2 recent pay stubs · car loan statement · CP504 ✓ already uploaded.

### 6. Your assessment
- AI-generated, **EA-Reviewed**. Four parts:
  1. **Where you stand:** total owed, including an estimate for unfiled years.
  2. **Our recommendation:** the path, an estimated monthly payment, and why.
  3. **What else we'll do:** penalty relief, lien withdrawal, filing missing years.
  4. **What we ruled out and why:** so the taxpayer trusts we looked at everything.
- **Jordan:**
  1. About $21,000 owed plus about $4,900 estimated for 2023.
  2. Payment plan of about $440 a month.
  3. File 2023 first; First-Time Penalty Abatement on 2021 could save $2,310; pay about $900 up front to get
     under $25,000 so the lien can be withdrawn.
  4. Ruled out: an Offer in Compromise (the IRS would expect about $28,000, more than owed) and Currently
     Not Collectible (there's money left over each month).

### 7. Choose your path (three doors)
- Three cards side by side (stacked on a phone), middle one marked **Recommended**:
  - **Guided** · $395 one-time · we prepare it, you submit it.
  - **Full Resolution** · $1,650 or 6 × $275 · Chris represents you start to finish. *(Recommended)*
  - **Resolution + Protection** · $2,150 or 6 × $359 · plus 3 years of transcript monitoring.
- **v1:** choosing saves the selection only. No payment is taken (no billing in v1).
- **Jordan:** chose Full Resolution.

### Finish: "You're all set"
Summary of what happens next, created automatically from the answers:
case stage moves to Authorization/Document Collection, action items are created, and the Dashboard
opens with the most urgent deadline on top.

## Data it produces

Everything maps onto `intakeAnswers` in `lib/mockData.ts`, and from there onto existing data:
- notice upload → `notices` and `documents`
- authorization → the Form 2848 action item and document
- the document checklist → `actionItems` (upload type)
- the chosen path → `intakeAnswers.chosenPlanId`, from `resolutionPlans`

## Open questions for Jack

1. **Pricing:** are $395 / $1,650 / $2,150 the right demo numbers, and should monthly options show?
2. **Emergency path:** for "the IRS took money", is "Chris reviews today" the right promise, or a phone number?
3. **Where the wizard lives:** full-screen outside the app shell (recommended) or inside it like PLCY's Onboarding page?
4. **Returning users:** Jordan already finished intake. Should Get Started show the answers as a read-only
   summary, or replay the wizard for demos?
5. **Step count:** steps 2 and 4 have sub-screens (about 13 screens in total). Is that OK, or should we trim it?
