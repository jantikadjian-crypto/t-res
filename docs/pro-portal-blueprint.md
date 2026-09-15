# T-Res Pro: professional portal blueprint

The side of T-Res that Enrolled Agents, CPAs and tax attorneys use. First up: **sign-in** and the **dashboard**.

Status: **blueprint agreed with Jack, 2026-09-15.** Nothing is built yet; build in the order below.

## The job

T-Res is AI-first: AI does about 99% of the work, and the professional approves by exception. So the dashboard
isn't a practice-management screen full of cases to work. It answers one question in 30 seconds:

> **What needs me today, and how long will it take?**

Everything else (routine explanations, eligibility results, self-serve letters, confirmation checks) is handled by
PLCY policies, and it's visible on the record but not in the way.

## Principles

- **Minutes, not hours.** Every item in the queue shows its estimated time. The headline is "3 things need you today ·
  about 25 minutes", not a count of open cases.
- **Urgency first.** Same-day emergencies (money taken, final levy notices), then things with an IRS deadline, then
  approvals, then everything else.
- **One click from item to decision.** Every queue item opens the review screen with the evidence, the AI's checks
  and the approve / request changes buttons. No hunting through a case to find what to look at.
- **Show the safety net.** The professional can see how much PLCY handled by policy, what spot checks are due, and
  anything a check flagged. That's the supervision record Circular 230 expects.
- **Same design system.** PLCY governance console look (the tokens the taxpayer app already uses), a sidebar of its
  own, and the same components: metric tiles, status badges, alert banners with a button.
- **Fictional data only.** Every client is made up. No real names, SSNs, emails or CAF numbers.

## Who it's for

| Role | v1 | Later |
|---|---|---|
| Enrolled Agent (Chris V.) | Signs in, sees the queue and caseload, approves, opens a client case | — |
| More practitioners (a bench of EAs, CPAs, attorneys) | Designed for, not built: the data model has a `practitionerId` per client | Case assignment, handing off, coverage when someone's away |
| Firm admin | — | Practitioners, policies, billing |

## Where it lives

```
/pro/login                 Sign in (full-screen)
/pro                       Today: the dashboard
/pro/clients               Caseload (chunk 3)
/pro/clients/[id]          One client's case, from the professional's side (chunk 3)
/pro/approvals             Approvals across all clients (chunk 4, PLCY-powered)
/plcy                      Governance console: policies, audit record (exists today)
```

- A new route group `app/(pro)/pro` with its own shell: a sidebar (Today, Clients, Approvals, Deadlines, Governance,
  Settings) and a top bar with search, the practitioner's name and "Sign out".
- It reads the same `CaseProvider` state as the taxpayer app, so Jordan's case is live on both sides: sign Form 2848 as
  Jordan and the professional's queue updates.
- The demo link in the taxpayer app's account menu ("Chris V.'s view in PLCY") becomes **"Sign in as Chris V. (demo)"**
  and goes to `/pro/login`.

## 1 · Sign in

v1 has no real accounts (CLAUDE.md scope), so sign-in is a realistic mock: it looks and behaves like the real thing, and
any password works.

```
┌──────────────────────────────────────────────┐
│                  T-Res Pro                   │
│         For Enrolled Agents, CPAs and        │
│              tax attorneys                   │
│  ┌────────────────────────────────────────┐  │
│  │ Email      chris@tres-demo.example     │  │  ← prefilled demo account
│  │ Password   ••••••••••                  │  │  ← any password works (demo)
│  │ [ Sign in ]                            │  │
│  │ Forgot password?                       │  │
│  └────────────────────────────────────────┘  │
│  Demo: this is a sample practitioner account │
│  Taxpayer? Go to your T-Res account →        │
└──────────────────────────────────────────────┘
```

**Step 2: two-step verification.** "We texted a code to (512) •••-••47." Demo code shown on screen (like the signing
flow's 246810). Three wrong tries locks it with a calm message. Tax professionals are required to use multi-factor
authentication for systems holding client data (FTC Safeguards Rule), so this isn't optional in the real product.

**First sign-in (shown once, later):** confirm your credentials: PTIN, CAF number, license type and number, and accept
the supervision policy. v1 shows Chris's details as already verified.

**States:** wrong code (tries left), locked (call support), signed out (back to sign-in with "You've signed out").

## 2 · Today (the dashboard)

```
┌───────────┬────────────────────────────────────────────────────────────────────┐
│ T-Res Pro │ Today                                   [Search clients…] Chris V. │
│           │ Good morning, Chris. 4 things need you today · about 35 minutes    │
│ ● Today   ├────────────────────────────────────────────────────────────────────┤
│ Clients   │ ⚠ Same day: Marcus Bell has an LT11. Hearing request is ready.     │
│ Approvals │                                        [Review hearing request →]  │
│ Deadlines ├──────────┬──────────┬──────────┬──────────────────────────────────┤
│ Governance│ Needs you│ Approvals│ Clients  │ Handled by policy this week       │
│ Settings  │ today  4 │ waiting 5│ 12       │ 96% · your time 1h 50m            │
│           ├──────────┴──────────┴──────────┴──────────────────────────────────┤
│           │ Your queue                              │ Deadlines, next 14 days  │
│           │ ● Marcus Bell  LT11 hearing   15 min [→]│ Sep 26  Jordan  CP504    │
│           │ ● Priya Nair   Levy release   20 min [→]│ Sep 29  Grace   CP2000   │
│           │ ● Daniel Ortiz Plan mismatch   5 min [→]│ Oct 13  Marcus  Hearing  │
│           │ ● Jordan Reyes CP504 letter    2 min [→]│                          │
│           │ ○ Tom Walsh    Assessment      3 min [→]│ Lane changes             │
│           ├─────────────────────────────────────────┤ Robert Kim could move    │
│           │ Caseload: lane · stage · balance · next │ to self-serve  [Review]  │
│           │ deadline · status (12 rows)             │ Spot checks due: 4 [→]   │
└───────────┴─────────────────────────────────────────┴──────────────────────────┘
```

### Sections

1. **Greeting and headline.** "Good morning, Chris. 4 things need you today · about 35 minutes." The minutes are the sum
   of the queue's estimates.
2. **Same-day banner** (only when there's an emergency). Red, with the client, what happened and one button that opens
   the decision. More than one emergency: "2 same-day items" and a button to the first.
3. **Four tiles**, each a link:
   - *Needs you today:* same-day items + anything due in 3 days or less → the queue.
   - *Approvals waiting:* PLCY items routed to you, across clients → Approvals.
   - *Clients:* active clients, split "8 represented · 4 doing it themselves" → Clients.
   - *Handled by policy this week:* the share of AI actions PLCY approved without you, and your minutes → Governance.
4. **Your queue.** One list, sorted: same day → IRS deadline within 3 days → approvals → flagged checks → the rest.
   Each row: status dot, client, what it is in plain words, why it's here ("Final levy notice · hearing deadline Oct 13
   · 28 days left"), estimated minutes, and one button that opens the right screen. Kinds of item:
   | Kind | Example | Opens |
   |---|---|---|
   | Emergency | Marcus: LT11, request a hearing | PLCY review with the hearing request |
   | IRS call | Priya: wage levy, call the IRS for a release | Call sheet: script, facts, number, log the outcome |
   | Approval | Jordan: CP504 response letter | PLCY review (exists today) |
   | Flagged check | Daniel: payment plan confirmation says $350, we expected $410 | Side-by-side comparison, "Tell the client how to fix it" |
   | Money recommendation | Tom: new assessment | PLCY review |
   | Spot check | 1 in 20 auto-approved explanations | The item, with "Looks right / Flag it" |
5. **Deadlines, next 14 days.** Every client's IRS deadlines in date order, with days left and a status dot; red when
   the client's side isn't done (for example Jordan hasn't signed Form 2848).
6. **Lane changes.** Recent escalations ("Marcus moved to you: LT11, Sep 13") and clients who now qualify to do it
   themselves ("Robert Kim: owes $18,200, plan fits, could move to self-serve"). Moving someone is a suggestion to the
   client, never automatic.
7. **Caseload.** A compact table: client, lane (chip), stage, balance, next deadline with days left, status dot, last
   activity. Sortable; filter by lane and "needs attention". Rows open the client's case (chunk 3).
8. **Governance health** (small card): spot checks due, checks that failed this week, policy changes waiting for your
   approval → PLCY.

### Jordan stays live

Jordan's row, queue items and deadlines come from `CaseProvider`, so the demo tells one story across both sides:
- Before Jordan signs: queue shows "Jordan Reyes · CP504 letter · waiting on the client's Form 2848"; deadline red.
- After Jordan signs and approves: the letter moves to the top of Approvals ("2 min").
- After "Simulate: an LT11 arrives": Jordan appears in the same-day banner.
- Self-serve Jordan: no approval items; the caseload chip says "Doing it themselves".

## Mock data (new, in mockData)

`practitioner`: Chris V., Enrolled Agent, CAF 0312-45678R (already in `representativeDetails`), demo email
`chris@tres-demo.example`, phone ending 47.

`proClients`: 11 fictional clients plus Jordan (live).

| Client | Lane | Situation | In the queue |
|---|---|---|---|
| Jordan Reyes | Represented (live) | CP504, 2021–2023, $21,000 | CP504 letter / Form 2848 |
| Marcus Bell | Represented | LT11 received Sep 13, $31,600 | **Same day:** hearing request |
| Priya Nair | Represented | Wage levy in place, $38,900 | **Same day:** call for levy release |
| Daniel Ortiz | Doing it himself | Payment plan confirmation doesn't match | Flagged check |
| Grace Liu | Represented | CP2000 for 2022, due Sep 29 | Approval: response letter |
| Tom Walsh | New | Intake done Sep 14 | Approval: assessment |
| Aisha Thompson | Represented | Offer in Compromise being prepared | Approval: OIC package (next week) |
| Robert Kim | Represented | Owes $18,200, plan fits | Lane suggestion: could self-serve |
| Maya Chen | Doing it herself | Payment plan active | — |
| Samuel Okafor | Doing it himself | 2022 return e-filed | — |
| Elena Garcia | Represented | Collection pause requested, waiting on the IRS | — |
| Nina Patel | Represented | Resolved, lien withdrawn, monitoring | — |

(Pronouns in the table follow how each fictional client is written; UI copy uses names, not pronouns.)

## Build order

1. **Chunk 1: sign-in + pro shell.** `/pro/login` (email, password, two-step code, locked state), the pro sidebar and
   top bar, sign-out, the account-menu demo link. Session held in React state (no localStorage).
2. **Chunk 2: Today.** Tiles, same-day banner, queue, deadlines, lane changes, governance card, caseload table, with
   `proClients` data and Jordan live.
3. **Chunk 3: Clients.** Caseload page with filters, and a professional's view of one client (timeline, documents,
   authorizations, AI actions).
4. **Chunk 4: Approvals across clients.** Move the `/plcy` inbox into `/pro/approvals` for all clients; `/plcy`
   keeps policies and the audit record.

Each chunk: build, lint, click-through test, shareable link, commit.

## Not in v1

Real accounts and passwords, real PTIN/CAF verification, IRS e-Services or Tax Pro Account connections, messaging
with clients, calendar sync, practitioner billing and payouts, and more than one practitioner.

## Decisions (agreed with Jack, 2026-09-15)

| Question | Decision |
|---|---|
| One workspace or two? | **T-Res Pro + PLCY.** T-Res Pro is where the professional works (queue, clients, approvals); PLCY stays the governance console (policies, audit record). |
| Sign-in realism | **Email, password and two-step code.** Prefilled demo email; any email and password accepted (Jack, 2026-09-15); demo code shown on screen. |
| Demo caseload | **12 clients:** Jordan live, plus the 11 fictional clients above. |
| Scope rule | **Mock sign-in only.** No real accounts; CLAUDE.md says so. |
| Shareable links | **Two links, one codebase.** T-Res Pro gets its own link that opens on sign-in (`PRODUCT=pro` build). Each link holds both sides so the live demo works, with the other side behind a labelled demo switch. PLCY is reached from T-Res Pro. |

## Progress

- **Chunk 1 (sign-in + pro shell): built 2026-09-15.** `/pro/login` (email, password, two-step code, wrong-code,
  locked, signed-in and signed-out states), the T-Res Pro frame with its sign-in guard, a first Today page with live
  PLCY numbers, and the demo switches.
- **Chunk 2 (Today): built 2026-09-15.** Headline with minutes, same-day banner, four tiles, the queue (most urgent
  first; fictional clients' items open in place with one action, Jordan's open their real PLCY review), Done today,
  deadlines for the next 30 days (widened from 14 so hearing deadlines show), lane changes, governance health and the
  caseload table with filters. Jordan's row, queue items and deadlines are live.
- **Chunk 3 (Clients): built 2026-09-15.** `/pro/clients` (lane filters with counts, search, sort) and
  `/pro/clients/[id]`: what needs you for this client (same in-place previews), tiles, timeline, documents,
  authorizations, AI actions on the PLCY record, and the lane (with the self-serve suggestion where it applies).
  Jordan's page is live; fictional clients have short case histories (`proClientDetails`). Today's caseload is now
  compact and links through. Shared logic lives in `useProWorkspace()`.
- **Chunk 4 (Approvals across clients): built 2026-09-15.** `/pro/approvals` (everything waiting for sign-off across
  clients, decided today, and the PLCY policies that route work to you) and `/pro/approvals/[id]`, the full review for
  any client: what the AI did with its draft, automated checks, evidence, audit trail, and Approve / Request changes /
  Undo. PLCY's review is now the shared `ReviewView`; Jordan's decisions made in T-Res Pro land on PLCY's record and
  in Jordan's app. Approvals on Today and client pages open the review; calls, flagged checks and spot checks still
  open in place. PLCY stays the governance console (Governance in the sidebar).
