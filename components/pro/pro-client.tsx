"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarClock, CheckCircle2, DollarSign, FileText, Repeat, Scale, Sparkles, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCase } from "@/components/case-provider";
import { LinkButton } from "@/components/link-button";
import { MetricTile } from "@/components/metric-tile";
import { PageHeader } from "@/components/page-header";
import { LaneChip } from "@/components/pro/caseload-table";
import { useProSession } from "@/components/pro/pro-session";
import { QueueRowItem } from "@/components/pro/queue-row";
import { JORDAN_ID, useProWorkspace } from "@/components/pro/use-pro-workspace";
import { StatusBadge, StatusDot } from "@/components/status";
import { daysRemainingLabel, formatDate, formatMoney } from "@/lib/format";
import {
  caseStages,
  proClientDetails,
  proLaneSuggestions,
  resolutionPlans,
  taxpayer,
  type GovernanceStatus,
  type ProAiOutcome,
  type ProClientDetail,
  type Tone,
} from "@/lib/mockData";

const outcomeTone: Record<ProAiOutcome, Tone> = {
  "Auto-approved": "neutral",
  "Approved by you": "good",
  "Resolved by you": "good",
  "Waiting for you": "warn",
  Flagged: "bad",
  "Routed to you": "bad",
};

const fromGovernance: Record<GovernanceStatus, ProAiOutcome> = {
  pending: "Waiting for you",
  "auto-approved": "Auto-approved",
  approved: "Approved by you",
  "changes-requested": "Flagged",
};

// One client's case from the professional's side: what needs you, the timeline, documents, authorizations,
// every AI action on the record, and the lane. Jordan's is live; the others are fictional.
export function ProClientView({ id }: { id: string }) {
  const { clients, rows, done } = useProWorkspace();
  const { governance, docs, actions, notices, lane, escalatedOn, plan } = useCase();
  const { doneIds, markDone } = useProSession();
  const [openId, setOpenId] = useState<string | null>(null);
  const client = clients.find((c) => c.id === id);

  if (!client) {
    return (
      <PageHeader
        title="Client not found"
        description="They may not be in your caseload."
        actions={
          <LinkButton href="/pro/clients" variant="outline">
            <ArrowLeft aria-hidden />
            All clients
          </LinkButton>
        }
      />
    );
  }

  const isJordan = id === JORDAN_ID;
  const form2848 = docs.find((d) => d.id === "doc_2848");

  // Jordan's case, live from CaseProvider.
  const jordanDetail: ProClientDetail = {
    since: "2026-09-03",
    plan: resolutionPlans.find((p) => p.id === plan.planId)?.name ?? "Full Resolution",
    years: "2021–2023",
    authorizations: [
      { form: "Form 8821", what: "Lets T-Res see the IRS records (read-only)", status: "Signed", date: "2026-09-03", tone: "good" },
      lane === "self-serve"
        ? { form: "Form 2848", what: "Lets you represent the client before the IRS", status: "Not needed: doing it themselves", tone: "neutral" }
        : form2848?.status === "on-file"
          ? { form: "Form 2848", what: "Lets you represent the client before the IRS", status: "Signed", date: form2848.addedOn, tone: "good" }
          : { form: "Form 2848", what: "Lets you represent the client before the IRS", status: `Waiting for ${taxpayer.firstName} to sign`, tone: "bad" },
    ],
    timeline: [
      ...notices.map((n) => ({ date: n.receivedOn, text: `${n.code} received: ${n.plainTitle}`, tone: n.tone })),
      ...actions
        .filter((a) => a.done && a.completedOn)
        .map((a) => ({ date: a.completedOn!, text: `${taxpayer.firstName} finished: ${a.title}`, tone: "good" as Tone })),
      ...(escalatedOn ? [{ date: escalatedOn, text: "Moved to you by PLCY: final levy notice", tone: "bad" as Tone }] : []),
    ],
    documents: docs.slice(0, 8).map((d) => ({ name: d.name, date: d.addedOn, source: d.source === "You" ? "Client" : d.source })),
    aiActions: governance.map((g) => ({ date: g.decidedOn ?? g.createdOn, title: g.title, outcome: fromGovernance[g.status] })),
  };
  const detail = isJordan ? jordanDetail : proClientDetails[id];
  const clientRows = rows.filter((r) => r.clientId === id);
  const clientDone = done.filter((d) => d.clientId === id);
  const timeline = [...(detail?.timeline ?? [])].sort((a, b) => b.date.localeCompare(a.date));
  const aiActions = (detail?.aiActions ?? []).map((a) => ({
    ...a,
    outcome: a.queueId && doneIds.includes(a.queueId) && a.doneOutcome ? a.doneOutcome : a.outcome,
  }));
  const autoCount = aiActions.filter((a) => a.outcome === "Auto-approved").length;
  const stageIndex = caseStages.findIndex((s) => s.label === client.stage);
  const suggestion = proLaneSuggestions.find((s) => s.clientId === id);
  const firstName = client.name.split(/\s+/)[0];

  const laneText = isJordan && escalatedOn
    ? `Moved to you on ${formatDate(escalatedOn)}: an LT11 arrived while ${firstName} was doing it themselves.`
    : client.lane === "represented"
      ? `You represent ${firstName} before the IRS under Form 2848.`
      : client.lane === "self-serve"
        ? `${firstName} deals with the IRS directly and T-Res prepares everything. You're on standby, and PLCY moves the case to you if anything serious happens.`
        : "Lane not chosen yet. Approve the assessment and the client picks.";

  return (
    <div className="space-y-6">
      <PageHeader
        title={client.name}
        description={client.situation}
        actions={
          <>
            <LinkButton href="/pro/clients" variant="outline">
              <ArrowLeft aria-hidden />
              All clients
            </LinkButton>
            {isJordan && (
              <LinkButton href="/" variant="outline">
                <UserRound aria-hidden />
                Open {taxpayer.firstName}&apos;s app (demo)
              </LinkButton>
            )}
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <LaneChip lane={client.lane} />
        {detail && (
          <>
            <span>{detail.plan}</span>
            <span aria-hidden>·</span>
            <span>Tax years {detail.years}</span>
            <span aria-hidden>·</span>
            <span>Client since {formatDate(detail.since)}</span>
          </>
        )}
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Needs you</CardTitle>
          <CardDescription>From your queue, for {firstName} only</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          {clientRows.length === 0 ? (
            <p className="mx-6 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
              <CheckCircle2 className="size-4 text-green-600" aria-hidden />
              Nothing needs you for {firstName} right now.
            </p>
          ) : (
            <ul className="divide-y">
              {clientRows.map((r) => (
                <QueueRowItem
                  key={r.id}
                  row={r}
                  showClient={false}
                  open={openId === r.id}
                  onToggle={() => setOpenId(openId === r.id ? null : r.id)}
                  onDone={() => {
                    markDone(r.id);
                    setOpenId(null);
                  }}
                />
              ))}
            </ul>
          )}
          {clientDone.length > 0 && (
            <ul className="mx-6 mt-4 space-y-1.5">
              {clientDone.map((d) => (
                <li key={d.id} className="flex gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" aria-hidden />
                  <span>
                    <span className="font-medium">Done today</span> · {d.note}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile
          icon={DollarSign}
          iconClass="text-red-600"
          label="Balance"
          value={client.balance ? formatMoney(client.balance) : "Paid"}
          caption={detail ? `Tax years ${detail.years}` : "Owed to the IRS"}
        />
        <MetricTile
          icon={CalendarClock}
          iconClass="text-orange-600"
          label="Next deadline"
          value={client.deadline ? daysRemainingLabel(client.deadline.date) : "None"}
          caption={client.deadline ? `${client.deadline.label} · ${formatDate(client.deadline.date)}` : "Nothing due"}
        />
        <MetricTile
          icon={Scale}
          iconClass="text-blue-600"
          label="Stage"
          value={stageIndex >= 0 ? `Step ${stageIndex + 1} of ${caseStages.length}` : client.stage}
          caption={client.stage}
        />
        <MetricTile
          icon={Sparkles}
          iconClass="text-purple-600"
          label="AI actions"
          value={String(aiActions.length)}
          caption={`${autoCount} handled by policy`}
          href={isJordan ? "/plcy" : undefined}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Timeline</CardTitle>
              <CardDescription>What has happened, newest first</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="relative space-y-4 border-l pl-5">
                {timeline.map((e) => (
                  <li key={`${e.date}-${e.text}`} className="relative">
                    <StatusDot tone={e.tone} className="absolute top-1.5 -left-[25px] size-2.5 ring-4 ring-card" />
                    <p className="text-sm">{e.text}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(e.date)}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                {isJordan ? `The newest in ${taxpayer.firstName}'s case file` : "In the case file"}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <ul className="divide-y">
                {(detail?.documents ?? []).map((d) => (
                  <li key={d.name} className="flex items-center gap-3 px-6 py-2.5 text-sm first:pt-0">
                    <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                    <span className="min-w-0 flex-1 break-words">{d.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {d.source} · {formatDate(d.date)}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Authorizations</CardTitle>
              <CardDescription>What lets T-Res and you act on this case</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <ul className="divide-y">
                {(detail?.authorizations ?? []).map((a) => (
                  <li key={a.form} className="space-y-1 px-6 py-3 first:pt-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-medium">{a.form}</span>
                      <StatusBadge tone={a.tone}>
                        {a.status}
                        {a.date && ` ${formatDate(a.date)}`}
                      </StatusBadge>
                    </div>
                    <p className="text-xs text-muted-foreground">{a.what}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>AI actions</CardTitle>
              <CardDescription>On the PLCY record, and who approved each</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <ul className="divide-y">
                {aiActions.map((a, i) => {
                  const governed = isJordan ? governance[i] : undefined;
                  return (
                    <li key={`${a.date}-${a.title}`} className="space-y-1 px-6 py-3 first:pt-0">
                      <p className="text-sm">
                        {governed ? (
                          <Link href={`/plcy/${governed.id}`} className="hover:text-primary hover:underline">
                            {a.title}
                          </Link>
                        ) : (
                          a.title
                        )}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge tone={outcomeTone[a.outcome]}>{a.outcome}</StatusBadge>
                        <span className="text-xs text-muted-foreground">{formatDate(a.date)}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
              {isJordan && (
                <Link href="/plcy" className="mx-6 mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline">
                  Open in PLCY
                  <ArrowRight className="size-3" aria-hidden />
                </Link>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Repeat className="size-4 text-primary" aria-hidden />
                Lane
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <LaneChip lane={client.lane} />
              <p className="text-muted-foreground">{laneText}</p>
              {suggestion && (
                <div className="space-y-2 rounded-lg bg-accent/50 p-3">
                  <p>{suggestion.text}</p>
                  {doneIds.includes(suggestion.id) ? (
                    <p className="flex items-center gap-1.5 text-xs text-green-700">
                      <CheckCircle2 className="size-3.5" aria-hidden />
                      {suggestion.doneNote}
                    </p>
                  ) : (
                    <Button size="sm" variant="outline" className="bg-white" onClick={() => markDone(suggestion.id)}>
                      {suggestion.cta}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
