"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, Clock, FolderOpen, ShieldCheck, Users, Wallet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCase } from "@/components/case-provider";
import { MetricTile } from "@/components/metric-tile";
import { PageHeader } from "@/components/page-header";
import { StatusDot } from "@/components/status";
import { useProWorkspace } from "@/components/pro/use-pro-workspace";
import { daysUntil, formatDate, formatMoney, minutesLabel } from "@/lib/format";
import { caseStages, MOCK_TODAY, proWeek } from "@/lib/mockData";
import { allProDocuments, isWaiting } from "@/lib/proDocuments";
import { cn } from "@/lib/utils";

// A horizontal bar with a label, a count and a link — used for stages, lanes and balances.
function BarRow({
  label,
  value,
  max,
  caption,
  href,
  barClass = "bg-primary",
}: {
  label: string;
  value: number;
  max: number;
  caption: string;
  href?: string;
  barClass?: string;
}) {
  const row = (
    <>
      <div className="flex items-baseline justify-between gap-3">
        <span className="truncate text-sm font-medium">{label}</span>
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{caption}</span>
      </div>
      <div className="mt-1.5 h-2 w-full rounded-full bg-secondary">
        <div className={cn("h-2 rounded-full transition-all", barClass)} style={{ width: `${max ? Math.max(2, Math.round((value / max) * 100)) : 0}%` }} />
      </div>
    </>
  );
  return (
    <li>
      {href ? (
        <Link href={href} className="block rounded-md p-1 outline-none hover:bg-accent/40 focus-visible:bg-accent/40">
          {row}
        </Link>
      ) : (
        <div className="p-1">{row}</div>
      )}
    </li>
  );
}

// The practice at a glance. Today is where the work is done; this is how the practice is doing.
export function ProDashboard() {
  const { docs } = useCase();
  const { clients, counts, today, todayMinutes, approvals, done, deadlines, escalations, needsAttention } = useProWorkspace();

  const documents = allProDocuments(docs);
  const waitingDocs = documents.filter(isWaiting);
  const underManagement = clients.reduce((sum, c) => sum + c.balance, 0);
  const handledPct = Math.round((proWeek.handledByPolicy / proWeek.aiActions) * 100);
  const needingAttention = clients.filter(needsAttention);

  const stages = caseStages
    .map((stage) => ({ ...stage, clients: clients.filter((c) => c.stage === stage.label) }))
    .filter((s) => s.clients.length > 0);
  const biggestStage = Math.max(1, ...stages.map((s) => s.clients.length));

  const lanes = [
    { label: "You represent them", value: counts.represented, href: "/pro/clients", barClass: "bg-primary" },
    { label: "Doing it themselves", value: counts.selfServe, href: "/pro/clients", barClass: "bg-green-500" },
    { label: "New this month", value: counts.new, href: "/pro/clients", barClass: "bg-yellow-400" },
  ];

  const work = [
    { label: "Needs you today", value: today.length, caption: today.length ? `about ${minutesLabel(todayMinutes)}` : "all clear", href: "/pro", tone: today.length ? "bad" : "good" },
    { label: "Approvals waiting", value: approvals.length, caption: approvals.length ? "under your name" : "caught up", href: "/pro/approvals", tone: approvals.length ? "warn" : "good" },
    { label: "Waiting on clients", value: waitingDocs.length, caption: "documents and signatures", href: "/pro/documents", tone: waitingDocs.length ? "warn" : "good" },
    { label: "Cleared today", value: done.length, caption: "by you and by policy", href: "/pro", tone: "good" },
  ] as const;

  const soon = deadlines.filter((d) => daysUntil(d.date) >= 0 && daysUntil(d.date) <= 30);
  const topBalances = [...clients].sort((a, b) => b.balance - a.balance).slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`How the practice is doing, as of ${formatDate(MOCK_TODAY)}. Today is where the work is.`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile
          icon={Users}
          iconClass="text-blue-600"
          label="Clients"
          value={String(clients.length)}
          caption={`${counts.represented} represented · ${counts.selfServe} self-serve · ${counts.new} new`}
          href="/pro/clients"
        />
        <MetricTile
          icon={Wallet}
          iconClass="text-purple-600"
          label="Under management"
          value={formatMoney(underManagement)}
          caption={`Across ${clients.length} open cases`}
          href="/pro/clients"
        />
        <MetricTile
          icon={ShieldCheck}
          iconClass="text-green-600"
          label="Handled by policy"
          value={`${handledPct}%`}
          caption={`${proWeek.handledByPolicy} of ${proWeek.aiActions} AI actions this week`}
          href="/plcy"
        />
        <MetricTile
          icon={Clock}
          iconClass="text-orange-600"
          label="Your time this week"
          value={minutesLabel(proWeek.eaMinutes)}
          caption={`About ${Math.max(1, Math.round(proWeek.eaMinutes / Math.max(1, clients.length)))} minutes per client`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Where the work sits</CardTitle>
            <CardDescription>Four numbers that tell you whether the practice is ahead or behind.</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <ul className="divide-y">
              {work.map((w) => (
                <li key={w.label}>
                  <Link
                    href={w.href}
                    className="group/next flex items-center gap-3 px-6 py-3 outline-none hover:bg-accent/40 focus-visible:bg-accent/40"
                  >
                    <StatusDot tone={w.tone} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium group-hover/next:underline">{w.label}</span>
                      <span className="block text-xs text-muted-foreground">{w.caption}</span>
                    </span>
                    <span className="text-2xl font-bold tabular-nums">{w.value}</span>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle>AI work this week</CardTitle>
            <CardDescription>What T-Res did on its own, and what it brought to you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                <span>{proWeek.handledByPolicy} handled by policy</span>
                <span>{proWeek.aiActions - proWeek.handledByPolicy} came to you</span>
              </div>
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-secondary">
                <div className="bg-green-500 transition-all" style={{ width: `${handledPct}%` }} />
                <div className="bg-yellow-400 transition-all" style={{ width: `${100 - handledPct}%` }} />
              </div>
            </div>
            <p className="text-sm text-foreground/80">
              T-Res ran <span className="font-medium">{proWeek.aiActions}</span> actions for your clients and needed you
              for <span className="font-medium">{proWeek.aiActions - proWeek.handledByPolicy}</span> of them —{" "}
              {minutesLabel(proWeek.eaMinutes)} of your time in all.
            </p>
            <p className="text-sm text-muted-foreground">
              The rules that decide what T-Res may do on its own are yours, and every action is logged.
            </p>
            <Link href="/plcy" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
              Open the governance console
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle>Caseload by stage</CardTitle>
            <CardDescription>Where your clients are in the resolution.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {stages.map((s) => (
                <BarRow
                  key={s.key}
                  label={s.label}
                  value={s.clients.length}
                  max={biggestStage}
                  caption={`${s.clients.length} ${s.clients.length === 1 ? "client" : "clients"}`}
                  href="/pro/clients"
                />
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle>How they work with you</CardTitle>
            <CardDescription>Self-serve clients still get everything prepared — they just deal with the IRS themselves.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              {lanes.map((l) => (
                <BarRow
                  key={l.label}
                  label={l.label}
                  value={l.value}
                  max={clients.length}
                  caption={`${l.value} of ${clients.length}`}
                  href={l.href}
                  barClass={l.barClass}
                />
              ))}
            </ul>
            {escalations.length > 0 && (
              <div className="flex gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-yellow-600" aria-hidden />
                <p>
                  <span className="font-medium text-yellow-900">
                    {escalations.length} moved to you {escalations.length === 1 ? "recently" : "this month"}.
                  </span>{" "}
                  {escalations[0].client}: {escalations[0].text.replace("Moved to you: ", "")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle>Biggest balances</CardTitle>
            <CardDescription>What each client owes the IRS today.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {topBalances.map((c) => (
                <BarRow
                  key={c.id}
                  label={c.name}
                  value={c.balance}
                  max={topBalances[0].balance}
                  caption={formatMoney(c.balance)}
                  href={`/pro/clients/${c.id}`}
                  barClass={c.tone === "bad" ? "bg-red-500" : c.tone === "warn" ? "bg-yellow-400" : "bg-primary"}
                />
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle>Needs attention</CardTitle>
            <CardDescription>
              {needingAttention.length
                ? `${needingAttention.length} of ${clients.length} clients have something wrong or something due.`
                : "Nothing is off track."}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <ul className="divide-y">
              {needingAttention.slice(0, 5).map((c) => {
                const deadline = soon.find((d) => d.clientId === c.id);
                return (
                  <li key={c.id}>
                    <Link
                      href={`/pro/clients/${c.id}`}
                      className="group/next flex items-center gap-3 px-6 py-3 outline-none hover:bg-accent/40 focus-visible:bg-accent/40"
                    >
                      <StatusDot tone={c.tone} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium group-hover/next:underline">{c.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">{c.situation}</span>
                      </span>
                      {deadline && (
                        <span className="hidden w-32 text-right text-xs text-muted-foreground sm:block">
                          {deadline.label}
                          <span className="block">{formatDate(deadline.date)}</span>
                        </span>
                      )}
                      <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="px-6 pt-3">
              <Link href="/pro/documents" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                <FolderOpen className="size-3.5" aria-hidden />
                {waitingDocs.length} documents waiting on clients
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
