"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Inbox, ShieldCheck, Timer } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCase } from "@/components/case-provider";
import { LinkButton } from "@/components/link-button";
import { MetricTile } from "@/components/metric-tile";
import { PageHeader } from "@/components/page-header";
import { governanceStatus, outcomeTone } from "@/components/plcy/governance-meta";
import { ReviewView } from "@/components/plcy/governance-item";
import { useProSession } from "@/components/pro/pro-session";
import { QueueRowItem } from "@/components/pro/queue-row";
import { clientName, isApproval, JORDAN_ID, jordanName, reviewFromQueue, useProWorkspace } from "@/components/pro/use-pro-workspace";
import { StatusBadge } from "@/components/status";
import { minutesLabel } from "@/lib/format";
import { governancePolicies, MOCK_TODAY, proQueue } from "@/lib/mockData";

// Approvals: everything waiting for the professional's sign-off, across clients. Routine work is approved by
// PLCY policy and never lands here; PLCY stays the place for the policies and the audit record.
export function ProApprovals() {
  const { approvals, emergencies } = useProWorkspace();
  const { governance } = useCase();
  const { doneIds, sentBack } = useProSession();

  const decided = [
    ...proQueue
      .filter((q) => isApproval(q.kind) && (doneIds.includes(q.id) || q.id in sentBack))
      .map((q) => ({
        id: q.id,
        client: clientName(q.clientId),
        title: q.title,
        status: governanceStatus[q.id in sentBack ? "changes-requested" : "approved"],
      })),
    ...governance
      .filter((g) => (g.status === "approved" || g.status === "changes-requested") && g.decidedOn === MOCK_TODAY)
      .map((g) => ({ id: g.id, client: jordanName, title: g.title, status: governanceStatus[g.status] })),
  ];
  const routing = governancePolicies.filter((p) => p.outcome !== "Auto-approve");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Approvals"
        description="Everything waiting for your sign-off, across clients. Routine work is approved by your policies and never lands here."
        actions={
          <LinkButton href="/plcy" variant="outline">
            <ShieldCheck aria-hidden />
            Policies in PLCY
          </LinkButton>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile icon={Inbox} iconClass="text-yellow-600" label="Waiting for you" value={String(approvals.length)} caption="Across your clients" />
        <MetricTile
          icon={Clock}
          iconClass="text-red-600"
          label="Same day"
          value={String(emergencies.length)}
          caption={emergencies.length ? emergencies.map((e) => e.client).join(", ") : "None today"}
        />
        <MetricTile
          icon={Timer}
          iconClass="text-blue-600"
          label="Your time"
          value={minutesLabel(approvals.reduce((s, r) => s + r.minutes, 0))}
          caption="To clear everything waiting"
        />
        <MetricTile icon={CheckCircle2} iconClass="text-green-600" label="Decided today" value={String(decided.length)} caption="Approved or sent back" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Waiting for you</CardTitle>
              <CardDescription>Most urgent first. Each opens the full review: the draft, checks, evidence and audit trail.</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              {approvals.length === 0 ? (
                <p className="mx-6 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                  <CheckCircle2 className="size-4 text-green-600" aria-hidden />
                  All caught up. New items appear here when a policy routes them to you.
                </p>
              ) : (
                <ul className="divide-y">
                  {approvals.map((r) => (
                    <QueueRowItem key={r.id} row={r} open={false} onToggle={() => {}} onDone={() => {}} />
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Decided today</CardTitle>
              <CardDescription>On the record, with who decided</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              {decided.length === 0 ? (
                <p className="px-6 text-sm text-muted-foreground">Nothing decided yet today.</p>
              ) : (
                <ul className="divide-y">
                  {decided.map((d) => (
                    <li key={d.id}>
                      <Link
                        href={`/pro/approvals/${d.id}`}
                        className="flex flex-col gap-1 px-6 py-3 outline-none first:pt-0 hover:bg-accent/40 focus-visible:bg-accent sm:flex-row sm:items-center sm:gap-3"
                      >
                        <span className="min-w-0 flex-1 text-sm">
                          <span className="font-medium">{d.client}</span> · {d.title}
                        </span>
                        <StatusBadge tone={d.status.tone}>{d.status.label}</StatusBadge>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="self-start">
          <CardHeader className="border-b">
            <CardTitle>Why these reach you</CardTitle>
            <CardDescription>Your PLCY policies that route work to you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-3">
              {routing.map((p) => (
                <li key={p.id} className="space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium">{p.name}</span>
                    <StatusBadge tone={outcomeTone[p.outcome]}>{p.outcome}</StatusBadge>
                  </div>
                  <p className="text-xs text-muted-foreground">{p.rule}</p>
                </li>
              ))}
            </ul>
            <Link href="/plcy" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
              Manage policies in PLCY
              <ArrowRight className="size-3" aria-hidden />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// The full review of one approval, for any client. Jordan's decisions go to PLCY (and Jordan's app) live.
export function ProApprovalView({ id }: { id: string }) {
  const { governance, decideGovernance, undoGovernance } = useCase();
  const { doneIds, sentBack, markDone, sendBack, undoItem } = useProSession();
  const back = { href: "/pro/approvals", label: "Approvals" };

  const governed = governance.find((g) => g.id === id);
  if (governed) {
    return (
      <ReviewView
        item={governed}
        client={{ name: jordanName, href: `/pro/clients/${JORDAN_ID}` }}
        back={back}
        result={{ href: `/pro/clients/${JORDAN_ID}`, label: `Open ${jordanName.split(" ")[0]}'s case` }}
        onApprove={() => decideGovernance(governed.id, "approved")}
        onRequestChanges={(note) => decideGovernance(governed.id, "changes-requested", note)}
        onUndo={() => undoGovernance(governed.id)}
      />
    );
  }

  const queued = proQueue.find((q) => q.id === id && isApproval(q.kind));
  if (queued) {
    const name = clientName(queued.clientId) ?? "Client";
    return (
      <ReviewView
        item={reviewFromQueue(queued, doneIds, sentBack)}
        client={{ name, href: `/pro/clients/${queued.clientId}` }}
        back={back}
        result={{ href: `/pro/clients/${queued.clientId}`, label: `Open ${name.split(" ")[0]}'s case` }}
        onApprove={() => markDone(queued.id)}
        onRequestChanges={(note) => sendBack(queued.id, note)}
        onUndo={() => undoItem(queued.id)}
      />
    );
  }

  return (
    <PageHeader
      title="Nothing to review here"
      description="It may have moved, or it isn't waiting for you."
      actions={
        <LinkButton href="/pro/approvals" variant="outline">
          <ArrowLeft aria-hidden />
          Approvals
        </LinkButton>
      }
    />
  );
}
