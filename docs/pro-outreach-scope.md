# T-Res Pro: outreach to clients

How the professional reaches a client from inside T-Res — chasing a document, explaining a decision, answering a
question — without T-Res becoming a chat app.

Status: **phase 1 built, 2026-09-15.** Phases 2 and 3 are still scope. Open decisions are at the bottom.

## The job

Chasing clients is the most common thing a practice actually does. Nine documents across the caseload are waiting on
a client, and until phase 1 T-Res Pro couldn't chase any of them: the **Send a reminder** button on
`/pro/documents/[id]` set local state, said "Reminder sent", and nothing happened anywhere. Jordan never heard about it.

So the question isn't "should there be messaging". It's: **what is the smallest thing that closes the loop without
dragging the professional back into the work?**

> A general inbox would do the opposite of what T-Res is for. Every practice-management tool has one, and none of
> them are a reason to buy this. Outreach here has to work the way approvals work — by exception, drafted by T-Res,
> and on the record.

## Principles

- **Outreach by exception, not a messenger.** Routine chasing goes out under policy. Chris writes something himself
  only when it needs a human.
- **Always attached to something.** Every message is about a document, a notice, a to-do or a deadline. There is no
  "start a new conversation" button, because a message with no subject is a message nobody can act on.
- **Sent from where the work is.** The reminder button on a document, the client page, the approval screen. No
  Messages tab competing with Today.
- **T-Res drafts, Chris approves.** A routine nudge carries *Checked by T-Res*. Anything under Chris's name carries
  *Approved by Chris* and a PLCY record, exactly like every other output (CLAUDE.md's trust rule).
- **It has to land somewhere real.** The client sees it in their app: a notification, and the message on the thing it
  is about. If it doesn't appear on Jordan's side, it isn't built.
- **The existing copy rules still apply.** Plain English, no IRS jargon, never promise an outcome, always pair a
  warning with the action that fixes it.
- **One thread per client, not per topic.** The client should never wonder which conversation to look in. Each message
  in the thread shows what it is about and links there.

## What the client sees

1. A notification in the bell: *"Chris sent you a note about Form 2848."* — the existing `notifications` model, with
   an `href` to the item.
2. The message itself on that document / notice / to-do, in the notes thread that already exists and already shows
   both sides (`DocumentNote`, `author: "you" | "ea"`).
3. A badge on anything T-Res wrote, so the client always knows whether a person or the software sent it.

Nothing new to learn on the taxpayer side. That is the point: the channel already exists, it just has one end missing.

## Where it lives

```
/pro/documents/[id]        "Send a reminder" — becomes real (phase 1)
/pro/clients/[id]          "Message <first name>" — composer with templates (phase 2)
/pro/approvals/[id]        "Approve and tell the client" — one tick on the review screen (phase 2)
/pro/clients/[id]#messages The thread with that client, newest first (phase 2)
```

No new top-level nav item. Outreach is an action, not a place.

## The message model

New in `mockData`:

```ts
export type OutreachAbout = { kind: "document" | "notice" | "todo" | "deadline"; id: string; label: string };

export type ClientMessage = {
  id: string;
  clientId: string;
  author: "ea" | "t-res" | "client";
  date: string;
  body: string;
  about?: OutreachAbout;
  // "policy" = a routine nudge under the automatic rule; "chris" = he wrote or approved it.
  sentBy: "policy" | "chris";
  governanceItemId?: string;
};

// What T-Res offers to send, so nobody writes a chase from scratch.
export type OutreachTemplate = {
  id: string;
  label: string;          // "Chase a document", "Deadline is close", "Explain what happens next"
  about: OutreachAbout["kind"];
  body: string;           // "{firstName}, we still need {document} before we can file. {why}"
  needsApproval: boolean; // false = goes out under policy
};
```

State follows the split that already exists: **Jordan's messages live in `CaseProvider`** (so the taxpayer's app sees
them live in the same visit), **fictional clients' in `ProSessionProvider`** (this visit only), the same way `doneIds`
and `sentBack` work today.

A message about a document also appends to that document's notes thread, so the client reads it in context and the
practice sees one history rather than two.

## Governance

Two policies in `governancePolicies`, in the existing shape:

| Policy | Rule | Outcome |
|---|---|---|
| `pol_nudge` — Routine reminders | Restates a request, a deadline or a status the client has already been told. No opinion, no number, no new instruction. | `Auto-approve` |
| `pol_outreach` — Messages under Chris's name | Anything that gives an opinion, a figure, a next step, or answers a question the client asked. | `Route to EA` |

A message Chris sends is logged like any other output: a `GovernanceItem` with the draft as `output`, the checks T-Res
ran (does it promise an outcome? does it state a figure that matches the case? is it about something real?) and a
`resultHref` pointing at where the client reads it. That is what makes outreach a proof point rather than a feature.

## Build order

1. **Phase 1 — make the reminder honest.** One templated nudge from the document page under `pol_nudge`: it appends to
   the document's notes thread as T-Res, adds a notification on the taxpayer's side, shows in the client's timeline,
   and the button says what actually happened. No composer, no free text. *This is the 20% that fixes the hollow spot
   and demos the loop.*
2. **Phase 2 — the composer.** "Message {first name}" on the client page: pick a template or write it, see the
   governance badge it will carry, send. Anything under Chris's name creates a PLCY record. The thread lives on the
   client page. The approval screen gets "Approve and tell the client" as one tick.
3. **Phase 3 — replies.** The taxpayer can reply from their side (they already can, on documents). A reply T-Res can
   answer is answered under policy; one that needs a person becomes a queue item on Today with its minutes, like
   everything else.

Each phase: build, lint, jsdom click-through, shareable link, commit.

## Not in v1

Real email or SMS delivery, attachments, read receipts, typing indicators, group threads, a Messages page, message
search across clients (the Pro palette already indexes the items messages are about), scheduled or bulk sends, and
anything that looks like marketing to a client list.

## Open decisions for Jack

| Question | Recommendation |
|---|---|
| Can routine nudges go out without Chris at all? | **Yes**, under `pol_nudge`, badged *Checked by T-Res*. It is the 99%-AI story in one screen. If he wants everything approved, phase 1 becomes a queue item instead and the demo gets slower. |
| Can the client reply? | **Yes.** They can already write notes on a document; pretending otherwise is a step backwards. Replies are handled by T-Res and reach Chris by exception (phase 3). |
| Does anything leave the app? | **No in v1.** The demo shows the in-app notification. Say plainly in the copy that a real build would email "you have a message", never the content. |
| Does the taxpayer get a Messages page? | **No.** Bell plus the item it is about. A separate inbox on the client side is the same trap as one on the pro side. |
| Bulk chasing ("remind all nine") | **Not yet.** One click per client in v1; revisit once the single case feels right. |
| Does this override CLAUDE.md's "no messaging" scope? | **Yes, deliberately** — the way billing and settings did. Update the scope line in CLAUDE.md when phase 1 lands so the playbook stays honest. |

## Progress

- **Phase 1 (the honest reminder): built 2026-09-15.** The reminder on `/pro/documents/[id]` is real. T-Res composes
  it from `outreachTemplates` (one per waiting status: signature, upload, look-over), shows the professional exactly
  what will go out before they send it, and says plainly that it goes under policy rather than under Chris's name.
  Sending it does four things: posts the message into that document's notes thread as T-Res itself (a new
  `"t-res"` note author, badged *Checked by T-Res* on both sides), adds a notification to the taxpayer's bell
  (`notifications` now live in `CaseProvider`), writes an auto-approved `gov_nudge_<docId>` record under the new
  `pol_nudge` policy so it shows in PLCY and in the client's AI actions, and marks the document as chased in the
  library. Fictional clients' reminders live in `ProSessionProvider`; only Jordan's reach a real taxpayer app, and
  the UI says so rather than pretending.
- Verified end to end in the jsdom click-through: send from T-Res Pro, then find the message in the Pro thread, the
  library, the PLCY record, the taxpayer's bell and the taxpayer's own document page. 68 checks.
- **Phases 2 and 3 not started.** The composer, "Approve and tell the client", and replies are unchanged from the
  scope above.
