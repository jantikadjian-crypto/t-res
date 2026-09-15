"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, Gauge, Inbox, Repeat, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkButton } from "@/components/link-button";
import { MetricTile } from "@/components/metric-tile";
import { PageHeader } from "@/components/page-header";
import { CaseloadTable } from "@/components/pro/caseload-table";
import { useProSession } from "@/components/pro/pro-session";
import { QueueRowItem } from "@/components/pro/queue-row";
import { clientName, useProWorkspace } from "@/components/pro/use-pro-workspace";
import { StatusBadge } from "@/components/status";
import { daysRemainingLabel, deadlineTone, formatDate, minutesLabel } from "@/lib/format";
import { practitioner, proLaneSuggestions, proWeek } from "@/lib/mockData";

// Today: what needs the professional, and how long it will take. Most urgent first; everything else is handled by
// PLCY policies. Blueprint: docs/pro-portal-blueprint.md.
export function ProToday() {
  const { rows, today, todayMinutes, emergencies, approvals, done, clients, counts, needsAttention, deadlines, escalations } =
    useProWorkspace();
  const { doneIds, markDone } = useProSession();
  const [openId, setOpenId] = useState<string | null>(null);
  const firstName = practitioner.name.split(/\s+/)[0];

  const spotChecksDue = doneIds.includes("q_spot") ? 0 : 4;
  const flaggedOpen = rows.filter((r) => r.kind === "flagged").length;
  const handledPct = Math.round((proWeek.handledByPolicy / proWeek.aiActions) * 100);
  // Compact caseload: whoever needs attention first, then the soonest deadline.
  const caseload = [...clients].sort(
    (a, b) =>
      Number(needsAttention(b)) - Number(needsAttention(a)) ||
      (a.deadline?.date ?? "9999").localeCompare(b.deadline?.date ?? "9999")
  );

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
          href="/pro/clients"
        />
        <MetricTile
          icon={ShieldCheck}
          iconClass="text-green-600"
          label="Handled by policy"
          value={`${handledPct}%`}
          caption={`This week: ${proWeek.handledByPolicy} of ${proWeek.aiActions} AI actions · your time ${minutesLabel(proWeek.eaMinutes)}`}
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
                  {rows.map((r) => (
                    <QueueRowItem
                      key={r.id}
                      row={r}
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
              <CardDescription>Who needs attention first, then the soonest deadline</CardDescription>
              <CardAction>
                <LinkButton href="/pro/clients" variant="ghost" size="sm">
                  See all {clients.length} clients
                  <ArrowRight aria-hidden />
                </LinkButton>
              </CardAction>
            </CardHeader>
            <CaseloadTable clients={caseload} compact />
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
                        <Link href={`/pro/clients/${d.clientId}`} className="font-medium hover:text-primary hover:underline">
                          {d.client}
                        </Link>{" "}
                        · {d.label}
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
                      <Link href={`/pro/clients/${e.clientId}`} className="font-medium hover:text-primary hover:underline">
                        {e.client}
                      </Link>{" "}
                      · {e.text} · {formatDate(e.date)}
                    </span>
                  </li>
                ))}
              </ul>
              {proLaneSuggestions.map((s) => (
                <div key={s.id} className="space-y-2 rounded-lg bg-accent/50 p-3">
                  <p>
                    <Link href={`/pro/clients/${s.clientId}`} className="font-medium hover:text-primary hover:underline">
                      {clientName(s.clientId)}
                    </Link>{" "}
                    · {s.text}
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
