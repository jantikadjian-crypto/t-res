"use client";

import { useCase } from "@/components/case-provider";
import { policyFor } from "@/components/plcy/governance-meta";
import { useProSession } from "@/components/pro/pro-session";
import { daysUntil } from "@/lib/format";
import {
  caseStages,
  currentStageIndex,
  documents,
  MOCK_TODAY,
  proClients,
  proEscalations,
  proQueue,
  taxpayer,
  totalOwed,
  type GovernanceItem,
  type GovernanceStatus,
  type ProClient,
  type ProQueueItem,
  type ProQueueKind,
  type Tone,
} from "@/lib/mockData";

// The professional's workspace in one place, so Today, Clients and each client page agree:
// the queue (fictional clients + Jordan live from PLCY), the caseload (Jordan live), deadlines and lane changes.

export const JORDAN_ID = "jordan";
export const jordanName = `${taxpayer.firstName} ${taxpayer.lastName}`;

export type QueueRow = {
  id: string;
  clientId?: string;
  client?: string;
  kind: ProQueueKind;
  title: string;
  why: string;
  minutes: number;
  deadline?: string;
  cta: string;
  // Jordan's items open their real PLCY review; fictional clients' items open in place.
  href?: string;
  preview?: ProQueueItem["preview"];
};

export const kindLabel: Record<ProQueueKind, string> = {
  emergency: "Same day",
  call: "IRS call",
  approval: "Approval",
  recommendation: "Money advice",
  flagged: "Flagged check",
  "spot-check": "Spot check",
};

// 0 same day · 1 IRS deadline within 3 days · 2 flagged check · 3 approvals, advice and calls · 4 spot checks.
export function tierOf(r: QueueRow): number {
  if (r.kind === "emergency") return 0;
  if (r.deadline && daysUntil(r.deadline) <= 3) return 1;
  if (r.kind === "flagged") return 2;
  if (r.kind === "spot-check") return 4;
  return 3;
}
export const needsToday = (r: QueueRow) => tierOf(r) <= 2;
export const tierTone = (t: number): Tone => (t === 0 ? "bad" : t <= 2 ? "warn" : "neutral");

export const clientName = (id?: string) => proClients.find((c) => c.id === id)?.name;

// Items that need the professional's sign-off: these open the full review at /pro/approvals/[id].
export const APPROVAL_KINDS: ProQueueKind[] = ["emergency", "approval", "recommendation"];
export const isApproval = (kind: ProQueueKind) => APPROVAL_KINDS.includes(kind);

/** A fictional client's approval as a reviewable AI action, in the same shape as a PLCY record. */
export function reviewFromQueue(q: ProQueueItem, doneIds: string[], sentBack: Record<string, string>): GovernanceItem {
  const status: GovernanceStatus = doneIds.includes(q.id) ? "approved" : q.id in sentBack ? "changes-requested" : "pending";
  return {
    id: q.id,
    title: q.title,
    kind: q.kind === "emergency" ? "Escalation" : q.kind === "recommendation" ? "Money recommendation" : "IRS submission",
    producedBy: q.review?.producedBy ?? "T-Res",
    createdOn: proClients.find((c) => c.id === q.clientId)?.lastActivity ?? MOCK_TODAY,
    confidence: q.review?.confidence ?? 0.9,
    policyId: q.kind === "emergency" ? "pol_emergency" : q.kind === "recommendation" ? "pol_advice" : "pol_submission",
    status,
    decidedOn: status === "pending" ? undefined : MOCK_TODAY,
    note: sentBack[q.id],
    eaMinutes: q.minutes,
    summary: q.preview.summary,
    output: q.review?.draft,
    checks: q.preview.points.map((p) => ({ label: p.label, passed: p.ok !== false })),
    evidence: (q.review?.evidence ?? []).map((label) => ({ label, href: `/pro/clients/${q.clientId}` })),
    resultHref: `/pro/clients/${q.clientId}`,
    approveLabel: q.preview.doneLabel,
  };
}

export function useProWorkspace() {
  const { governance, lane, escalatedOn, openNotices, actions } = useCase();
  const { doneIds, sentBack } = useProSession();

  // Jordan, live: anything PLCY routed to Chris becomes a queue item that opens its real review.
  const jordanRows: QueueRow[] = governance
    .filter((g) => g.status === "pending")
    .map((g) => {
      const policy = policyFor(g.policyId);
      const waiting = g.checks.find((c) => !c.passed && c.signedDocId);
      const waitingDoc = waiting ? documents.find((d) => d.id === waiting.signedDocId)?.name.split(" – ")[0] : undefined;
      const quality = g.checks.filter((c) => !c.signedDocId);
      const kind: ProQueueKind =
        policy?.outcome === "Same-day EA" ? "emergency" : g.kind === "Money recommendation" ? "recommendation" : "approval";
      return {
        id: g.id,
        clientId: JORDAN_ID,
        client: jordanName,
        kind,
        title: g.title,
        why: waitingDoc
          ? `Waiting on ${taxpayer.firstName} to sign ${waitingDoc}. You can approve now.`
          : `${g.kind}. Checked by T-Res: ${quality.filter((c) => c.passed).length} of ${quality.length} checks passed.`,
        minutes: g.eaMinutes ?? 2,
        deadline: openNotices.find((n) => n.id === g.noticeId)?.respondBy,
        cta: "Review",
        href: `/pro/approvals/${g.id}`,
      };
    });

  // Approvals open the full review; calls, flagged checks and spot checks open in place.
  const staticRows: QueueRow[] = proQueue
    .filter((q) => !doneIds.includes(q.id) && !(q.id in sentBack))
    .map((q) => ({ ...q, client: clientName(q.clientId), href: isApproval(q.kind) ? `/pro/approvals/${q.id}` : undefined }));

  const rows = [...staticRows, ...jordanRows].sort(
    (a, b) => tierOf(a) - tierOf(b) || (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999") || a.minutes - b.minutes
  );
  const today = rows.filter(needsToday);
  const todayMinutes = today.reduce((s, r) => s + r.minutes, 0);
  const emergencies = rows.filter((r) => r.kind === "emergency");
  const approvals = rows.filter((r) => isApproval(r.kind));

  const done = [
    ...proQueue
      .filter((q) => doneIds.includes(q.id) || q.id in sentBack)
      .map((q) => ({
        id: q.id,
        clientId: q.clientId,
        client: clientName(q.clientId),
        note: q.id in sentBack ? `${q.title} · sent back to T-Res: "${sentBack[q.id]}"` : q.preview.doneNote,
      })),
    ...governance
      .filter((g) => g.status === "approved" && g.decidedOn === MOCK_TODAY)
      .map((g) => ({ id: g.id, clientId: JORDAN_ID, client: jordanName, note: `${g.title} · approved` })),
  ];

  // Jordan's caseload row follows the case: lane, open notices, stage.
  const clients: ProClient[] = proClients.map((c) =>
    c.id === JORDAN_ID
      ? {
          ...c,
          lane,
          stage: caseStages[currentStageIndex].label,
          balance: totalOwed,
          situation: escalatedOn
            ? "LT11 arrived; moved to you"
            : lane === "self-serve"
              ? "Doing it themselves: payment plan and 2023 return"
              : c.situation,
          deadline: openNotices[0] ? { label: `${openNotices[0].code} response`, date: openNotices[0].respondBy } : undefined,
          tone: openNotices.some((n) => n.status === "action-needed") ? "bad" : "good",
        }
      : c
  );
  const counts = {
    represented: clients.filter((c) => c.lane === "represented").length,
    selfServe: clients.filter((c) => c.lane === "self-serve").length,
    new: clients.filter((c) => c.lane === "new").length,
  };
  const attention = new Set(today.map((r) => r.clientId).filter((id): id is string => !!id));
  const needsAttention = (c: ProClient) => attention.has(c.id) || c.tone === "bad";

  const jordanWaiting = (noticeId: string) => actions.find((a) => !a.done && a.relatedNoticeId === noticeId);
  const deadlines = [
    ...clients
      .filter((c) => c.id !== JORDAN_ID && c.deadline && daysUntil(c.deadline.date) >= 0 && daysUntil(c.deadline.date) <= 30)
      .map((c) => ({ key: c.id, clientId: c.id, client: c.name, label: c.deadline!.label, date: c.deadline!.date, waitingOn: c.deadline!.waitingOn })),
    ...openNotices
      .filter((n) => daysUntil(n.respondBy) <= 30)
      .map((n) => {
        const waiting = jordanWaiting(n.id);
        return {
          key: `jordan-${n.id}`,
          clientId: JORDAN_ID,
          client: jordanName,
          label: `${n.code} response`,
          date: n.respondBy,
          waitingOn: waiting ? `Waiting on ${taxpayer.firstName}: ${waiting.title}` : undefined,
        };
      }),
  ].sort((a, b) => a.date.localeCompare(b.date));

  const escalations = [
    ...(escalatedOn
      ? [{ key: JORDAN_ID, clientId: JORDAN_ID, client: jordanName, date: escalatedOn, text: "Moved to you: an LT11 arrived while doing it themselves" }]
      : []),
    ...proEscalations.map((e) => ({ key: e.clientId, clientId: e.clientId, client: clientName(e.clientId), date: e.date, text: e.text })),
  ];

  return { rows, today, todayMinutes, emergencies, approvals, done, clients, counts, needsAttention, deadlines, escalations };
}
