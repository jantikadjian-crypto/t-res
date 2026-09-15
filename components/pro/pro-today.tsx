"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  Gauge,
  Inbox,
  Repeat,
  ShieldCheck,
  Timer,
  Users,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCase } from "@/components/case-provider";
import { LinkButton } from "@/components/link-button";
import { MetricTile } from "@/components/metric-tile";
import { PageHeader } from "@/components/page-header";
import { policyFor } from "@/components/plcy/governance-meta";
import { useProSession } from "@/components/pro/pro-session";
import { StatusBadge, StatusDot } from "@/components/status";
import { daysRemainingLabel, daysUntil, deadlineTone, formatDate, formatMoney, minutesLabel } from "@/lib/format";
import {
  caseStages,
  currentStageIndex,
  documents,
  MOCK_TODAY,
  practitioner,
  proClients,
  proEscalations,
  proLaneSuggestions,
  proQueue,
  proWeek,
  taxpayer,
  totalOwed,
  type Lane,
  type ProClient,
  type ProQueueItem,
  type ProQueueKind,
  type Tone,
} from "@/lib/mockData";
import { cn } from "@/lib/utils";

// Today: what needs the professional, and how long it will take. Most urgent first; everything else is handled by
// PLCY policies. Blueprint: docs/pro-portal-blueprint.md.

type Row = {
  id: string;
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

const kindLabel: Record<ProQueueKind, string> = {
  emergency: "Same day",
  call: "IRS call",
  approval: "Approval",
  recommendation: "Money advice",
  flagged: "Flagged check",
  "spot-check": "Spot check",
};

// 0 same day · 1 IRS deadline within 3 days · 2 flagged check · 3 approvals, advice and calls · 4 spot checks.
function tierOf(r: Row): number {
  if (r.kind === "emergency") return 0;
  if (r.deadline && daysUntil(r.deadline) <= 3) return 1;
  if (r.kind === "flagged") return 2;
  if (r.kind === "spot-check") return 4;
  return 3;
}
const needsToday = (r: Row) => tierOf(r) <= 2;
const tierTone = (t: number): Tone => (t === 0 ? "bad" : t <= 2 ? "warn" : "neutral");

const laneChip: Record<Lane | "new", { label: string; className: string }> = {
  represented: { label: "Represented", className: "border-blue-200 bg-blue-50 text-blue-700" },
  "self-serve": { label: "Doing it themselves", className: "border-purple-200 bg-purple-50 text-purple-700" },
  new: { label: "New", className: "border-gray-200 bg-gray-50 text-gray-600" },
};

const clientName = (id?: string) => proClients.find((c) => c.id === id)?.name;

type Filter = "all" | "represented" | "self-serve" | "attention";
const filters: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "represented", label: "Represented" },
  { key: "self-serve", label: "Doing it themselves" },
  { key: "attention", label: "Needs attention" },
];

export function ProToday() {
  const { governance, lane, escalatedOn, openNotices, actions } = useCase();
  const { doneIds, markDone } = useProSession();
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const firstName = practitioner.name.split(/\s+/)[0];
  const jordanName = `${taxpayer.firstName} ${taxpayer.lastName}`;

  // Jordan, live: anything PLCY routed to Chris becomes a queue item that opens its real review.
  const jordanRows: Row[] = governance
    .filter((g) => g.status === "pending")
    .map((g) => {
      const policy = policyFor(g.policyId);
      const waiting = g.checks.find((c) => !c.passed && c.signedDocId);
      const waitingDoc = waiting ? documents.find((d) => d.id === waiting.signedDocId)?.name.split(" – ")[0] : undefined;
      const quality = g.checks.filter((c) => !c.signedDocId);
      return {
        id: g.id,
        client: jordanName,
        kind: policy?.outcome === "Same-day EA" ? "emergency" : g.kind === "Money recommendation" ? "recommendation" : "approval",
        title: g.title,
        why: waitingDoc
          ? `Waiting on ${taxpayer.firstName} to sign ${waitingDoc}. You can approve now.`
          : `${g.kind}. Checked by T-Res: ${quality.filter((c) => c.passed).length} of ${quality.length} checks passed.`,
        minutes: g.eaMinutes ?? 2,
        deadline: openNotices.find((n) => n.id === g.noticeId)?.respondBy,
        cta: g.approveLabel ?? "Review",
        href: `/plcy/${g.id}`,
      } satisfies Row;
    });

  const staticRows: Row[] = proQueue
    .filter((q) => !doneIds.includes(q.id))
    .map((q) => ({ ...q, client: clientName(q.clientId) }));

  const rows = [...staticRows, ...jordanRows].sort(
    (a, b) =>
      tierOf(a) - tierOf(b) ||
      (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999") ||
      a.minutes - b.minutes
  );
  const today = rows.filter(needsToday);
  const todayMinutes = today.reduce((s, r) => s + r.minutes, 0);
  const emergencies = rows.filter((r) => r.kind === "emergency");
  const approvals = rows.filter((r) => r.kind === "approval" || r.kind === "recommendation");

  const done = [
    ...proQueue.filter((q) => doneIds.includes(q.id)).map((q) => ({ id: q.id, client: clientName(q.clientId), note: q.preview.doneNote })),
    ...governance
      .filter((g) => g.status === "approved" && g.decidedOn === MOCK_TODAY)
      .map((g) => ({ id: g.id, client: jordanName, note: `${g.title} · approved` })),
  ];

  // Jordan's caseload row and deadlines follow the case: lane, open notices, what's waiting on Jordan.
  const jordanNotices = openNotices.filter((n) => daysUntil(n.respondBy) <= 30);
  const jordanWaiting = (noticeId: string) => actions.find((a) => !a.done && a.relatedNoticeId === noticeId);
  const clients: ProClient[] = proClients.map((c) =>
    c.id === "jordan"
      ? {
          ...c,
          lane,
          stage: caseStages[currentStageIndex].label,
          balance: totalOwed,
          situation: escalatedOn ? "LT11 arrived; moved to you" : lane === "self-serve" ? "Doing it themselves: payment plan and 2023 return" : c.situation,
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
  const attentionIds = new Set(rows.filter(needsToday).map((r) => proQueue.find((q) => q.id === r.id)?.clientId ?? (r.client === jordanName ? "jordan" : "")));
  const shownClients = clients.filter((c) =>
    filter === "all" ? true : filter === "attention" ? attentionIds.has(c.id) || c.tone === "bad" : c.lane === filter
  );

  const deadlines = [
    ...clients
      .filter((c) => c.id !== "jordan" && c.deadline && daysUntil(c.deadline.date) >= 0 && daysUntil(c.deadline.date) <= 30)
      .map((c) => ({ key: c.id, client: c.name, label: c.deadline!.label, date: c.deadline!.date, waitingOn: c.deadline!.waitingOn })),
    ...jordanNotices.map((n) => {
      const waiting = jordanWaiting(n.id);
      return {
        key: `jordan-${n.id}`,
        client: jordanName,
        label: `${n.code} response`,
        date: n.respondBy,
        waitingOn: waiting ? `Waiting on ${taxpayer.firstName}: ${waiting.title}` : undefined,
      };
    }),
  ].sort((a, b) => a.date.localeCompare(b.date));

  const escalations = [
    ...(escalatedOn ? [{ key: "jordan", client: jordanName, date: escalatedOn, text: "Moved to you: an LT11 arrived while doing it themselves" }] : []),
    ...proEscalations.map((e) => ({ key: e.clientId, client: clientName(e.clientId), date: e.date, text: e.text })),
  ];
  const spotChecksDue = doneIds.includes("q_spot") ? 0 : 4;
  const flaggedOpen = rows.filter((r) => r.kind === "flagged").length;
  const handledPct = Math.round((proWeek.handledByPolicy / proWeek.aiActions) * 100);

  const openItem = (id: string) => {
    setOpenId(id);
    requestAnimationFrame(() => document.getElementById(`queue-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Today"
        description={
          today.length
            ? `Good morning, ${firstName}. ${today.length} ${today.length === 1 ? "thing needs" : "things need"} you today · about ${minutesLabel(todayMinutes)}.`
            : `Good morning, ${firstName}. Nothing needs you today. Everything else is handled by your policies.`
        }
      />

      {emergencies.length > 0 && (
        <div role="alert" className="flex flex-col gap-4 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center">
          <div className="flex flex-1 gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-600" aria-hidden />
            <div>
              <p className="font-medium text-red-900">
                {emergencies.length === 1
                  ? `Same day: ${emergencies[0].client} has an LT11.`
                  : `${emergencies.length} same-day items: ${emergencies.map((e) => e.client).join(" and ")}.`}
              </p>
              <p className="mt-1 text-sm text-red-800">
                {emergencies[0].client}: {emergencies[0].why}
              </p>
            </div>
          </div>
          {emergencies[0].href ? (
            <LinkButton href={emergencies[0].href} className="bg-red-600 text-white hover:bg-red-700">
              {emergencies[0].cta}
              <ArrowRight aria-hidden />
            </LinkButton>
          ) : (
            <Button className="bg-red-600 text-white hover:bg-red-700" onClick={() => openItem(emergencies[0].id)}>
              {emergencies[0].cta}
              <ArrowRight aria-hidden />
            </Button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile
          icon={Clock}
          iconClass="text-red-600"
          label="Needs you today"
          value={String(today.length)}
          caption={today.length ? `${emergencies.length} same day · about ${minutesLabel(todayMinutes)}` : "All clear"}
        />
        <MetricTile
          icon={Inbox}
          iconClass="text-yellow-600"
          label="Approvals waiting"
          value={String(approvals.length)}
          caption={approvals.length ? `About ${minutesLabel(approvals.reduce((s, r) => s + r.minutes, 0))} in all` : "All caught up"}
        />
        <MetricTile
          icon={Users}
          iconClass="text-blue-600"
          label="Clients"
          value={String(clients.length)}
          caption={`${counts.represented} represented · ${counts.selfServe} doing it themselves · ${counts.new} new`}
        />
        <MetricTile
          icon={ShieldCheck}
          iconClass="text-green-600"
          label="Handled by policy this week"
          value={`${handledPct}%`}
          caption={`${proWeek.handledByPolicy} of ${proWeek.aiActions} AI actions · your time ${minutesLabel(proWeek.eaMinutes)}`}
          href="/plcy"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Your queue</CardTitle>
              <CardDescription>Most urgent first. Everything else is handled by your PLCY policies.</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              {rows.length === 0 ? (
                <p className="mx-6 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                  <CheckCircle2 className="size-4 text-green-600" aria-hidden />
                  Your queue is empty. Nice work.
                </p>
              ) : (
                <ul className="divide-y">
                  {rows.map((r) => {
                    const tier = tierOf(r);
                    const open = openId === r.id;
                    return (
                      <li key={r.id} id={`queue-${r.id}`} data-queue-row={r.id} className="scroll-mt-24 px-6 py-4 first:pt-0">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                          <StatusDot tone={tierTone(tier)} className="mt-2 hidden sm:inline-block" />
                          <div className="min-w-0 flex-1 space-y-1.5">
                            <p className="text-sm">
                              <span className="font-medium">{r.client ?? "Across clients"}</span> · {r.title}
                            </p>
                            <p className="text-xs text-muted-foreground">{r.why}</p>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className={cn(tier === 0 && "border-red-200 bg-red-50 text-red-600")}>
                                {kindLabel[r.kind]}
                              </Badge>
                              {r.deadline && (
                                <StatusBadge tone={deadlineTone(r.deadline)}>
                                  Due {formatDate(r.deadline)} · {daysRemainingLabel(r.deadline)}
                                </StatusBadge>
                              )}
                              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <Timer className="size-3" aria-hidden />
                                {minutesLabel(r.minutes)}
                              </span>
                            </div>
                          </div>
                          {r.href ? (
                            <LinkButton href={r.href} size="sm" className="w-fit">
                              {r.cta}
                            </LinkButton>
                          ) : (
                            <Button
                              size="sm"
                              variant={open ? "secondary" : "default"}
                              className="w-fit"
                              aria-expanded={open}
                              aria-controls={`queue-${r.id}-preview`}
                              onClick={() => setOpenId(open ? null : r.id)}
                            >
                              {r.cta}
                            </Button>
                          )}
                        </div>
                        {open && r.preview && (
                          <div id={`queue-${r.id}-preview`} className="mt-3 space-y-3 rounded-lg bg-accent/50 p-4 text-sm sm:ml-5">
                            <p>{r.preview.summary}</p>
                            <ul className="space-y-1.5">
                              {r.preview.points.map((p) => (
                                <li key={p.label} className="flex gap-2">
                                  {p.ok === true ? (
                                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" aria-hidden />
                                  ) : p.ok === false ? (
                                    <XCircle className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden />
                                  ) : (
                                    <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                                  )}
                                  <span className={cn(p.ok === false && "font-medium text-red-700")}>{p.label}</span>
                                </li>
                              ))}
                            </ul>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  markDone(r.id);
                                  setOpenId(null);
                                }}
                              >
                                <CheckCircle2 aria-hidden />
                                {r.preview.doneLabel}
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setOpenId(null)}>
                                Not now
                              </Button>
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          {done.length > 0 && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Done today · {done.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {done.map((d) => (
                    <li key={d.id} className="flex gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" aria-hidden />
                      <span>
                        <span className="font-medium">{d.client ?? "Across clients"}</span> · {d.note}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card className="py-0">
            <CardHeader className="border-b pt-6">
              <CardTitle>Caseload</CardTitle>
              <CardDescription>Every client, with where each case stands</CardDescription>
            </CardHeader>
            <div className="flex flex-wrap gap-1 px-6">
              <div role="group" aria-label="Show clients" className="flex flex-wrap gap-1 rounded-xl bg-muted p-1">
                {filters.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    aria-pressed={filter === f.key}
                    onClick={() => setFilter(f.key)}
                    className={cn(
                      "rounded-lg px-3 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                      filter === f.key ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-y bg-accent/40 text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3 font-medium">Client</th>
                    <th className="px-3 py-3 font-medium">Lane</th>
                    <th className="hidden px-3 py-3 font-medium md:table-cell">Stage</th>
                    <th className="px-3 py-3 text-right font-medium">Balance</th>
                    <th className="hidden px-3 py-3 font-medium sm:table-cell">Next deadline</th>
                    <th className="hidden px-6 py-3 font-medium lg:table-cell">Last activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {shownClients.map((c) => (
                      <tr key={c.id} data-client-row={c.id}>
                        <td className="px-6 py-3">
                          <div className="flex items-start gap-2">
                            <StatusDot tone={c.tone} className="mt-1.5" />
                            <div className="min-w-0">
                              <p className="font-medium">{c.name}</p>
                              <p className="text-xs text-muted-foreground">{c.situation}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span className={cn("inline-flex rounded-md border px-1.5 py-0.5 text-xs font-medium whitespace-nowrap", laneChip[c.lane].className)}>
                            {laneChip[c.lane].label}
                          </span>
                        </td>
                        <td className="hidden px-3 py-3 whitespace-nowrap text-muted-foreground md:table-cell">{c.stage}</td>
                        <td className="px-3 py-3 text-right whitespace-nowrap tabular-nums">{c.balance ? formatMoney(c.balance) : "Paid"}</td>
                        <td className="hidden px-3 py-3 sm:table-cell">
                          {c.deadline ? (
                            <span className="text-xs">
                              <span className="block">{c.deadline.label}</span>
                              <span className="text-muted-foreground">
                                {formatDate(c.deadline.date)} · {daysRemainingLabel(c.deadline.date)}
                              </span>
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">None</span>
                          )}
                        </td>
                        <td className="hidden px-6 py-3 whitespace-nowrap text-muted-foreground lg:table-cell">{formatDate(c.lastActivity)}</td>
                      </tr>
                    ))}
                  {shownClients.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-sm text-muted-foreground">
                        No clients here right now.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="px-6 pb-4 text-xs text-muted-foreground">Client pages arrive in the next chunk.</p>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Deadlines, next 30 days</CardTitle>
              <CardDescription>Every client&apos;s IRS dates, soonest first</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <ul className="divide-y">
                {deadlines.map((d) => (
                  <li key={d.key} className="flex gap-3 px-6 py-3 first:pt-0">
                    <span className="w-14 shrink-0 text-xs font-medium tabular-nums">{formatDate(d.date).replace(/, \d{4}$/, "")}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{d.client}</span> · {d.label}
                      </p>
                      {d.waitingOn && <p className="text-xs text-red-600">{d.waitingOn}</p>}
                    </div>
                    <StatusBadge tone={d.waitingOn ? "bad" : deadlineTone(d.date)} className="h-fit shrink-0">
                      {daysRemainingLabel(d.date)}
                    </StatusBadge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Repeat className="size-4 text-primary" aria-hidden />
                Lane changes
              </CardTitle>
              <CardDescription>Who moved to you, and who could do it themselves</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <ul className="space-y-2">
                {escalations.map((e) => (
                  <li key={e.key} className="flex gap-2">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden />
                    <span>
                      <span className="font-medium">{e.client}</span> · {e.text} · {formatDate(e.date)}
                    </span>
                  </li>
                ))}
              </ul>
              {proLaneSuggestions.map((s) => (
                <div key={s.id} className="space-y-2 rounded-lg bg-accent/50 p-3">
                  <p>
                    <span className="font-medium">{clientName(s.clientId)}</span> · {s.text}
                  </p>
                  {doneIds.includes(s.id) ? (
                    <p className="flex items-center gap-1.5 text-xs text-green-700">
                      <CheckCircle2 className="size-3.5" aria-hidden />
                      {s.doneNote}
                    </p>
                  ) : (
                    <Button size="sm" variant="outline" className="bg-white" onClick={() => markDone(s.id)}>
                      {s.cta}
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Gauge className="size-4 text-primary" aria-hidden />
                Governance health
              </CardTitle>
              <CardDescription>Your supervision record, from PLCY</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <dl className="space-y-2">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Spot checks due</dt>
                  <dd className="font-medium tabular-nums">{spotChecksDue}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Checks flagged, still open</dt>
                  <dd className="font-medium tabular-nums">{flaggedOpen}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Policy changes waiting</dt>
                  <dd className="font-medium tabular-nums">0</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Handled by policy this week</dt>
                  <dd className="font-medium tabular-nums">{handledPct}%</dd>
                </div>
              </dl>
              <Link href="/plcy" className="inline-flex items-center gap-1 text-primary hover:underline">
                Open PLCY
                <ArrowRight className="size-3" aria-hidden />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
