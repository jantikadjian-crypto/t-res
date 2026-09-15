"use client";

import Link from "next/link";
import { CheckCircle2, Clock, Gauge, ShieldCheck, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCase } from "@/components/case-provider";
import { LinkButton } from "@/components/link-button";
import { MetricTile } from "@/components/metric-tile";
import { PageHeader } from "@/components/page-header";
import { governanceStatus, outcomeTone, policyFor } from "@/components/plcy/governance-meta";
import { StatusBadge } from "@/components/status";
import { formatDate } from "@/lib/format";
import { governancePolicies, taxpayer } from "@/lib/mockData";

// Chris's approvals inbox: only what policy routed to him. Everything else is on the record.
export function GovernanceInbox() {
  const { governance } = useCase();
  const pending = governance.filter((g) => g.status === "pending");
  const decided = governance
    .filter((g) => g.status !== "pending")
    .sort((a, b) => (b.decidedOn ?? "").localeCompare(a.decidedOn ?? ""));
  const auto = governance.filter((g) => g.status === "auto-approved").length;
  const minutes = decided.reduce((sum, g) => sum + (g.eaMinutes ?? 0), 0);
  const checks = governance.flatMap((g) => g.checks);
  const passed = checks.filter((c) => c.passed).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Approvals"
        description={`AI work on ${taxpayer.firstName} ${taxpayer.lastName}'s case. PLCY sends you only what your policies say needs you.`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile
          icon={Clock}
          iconClass="text-yellow-600"
          label="Waiting for you"
          value={String(pending.length)}
          caption={pending[0] ? `Oldest from ${formatDate(pending[0].createdOn)}` : "All caught up"}
          href={pending[0] ? `/plcy/${pending[0].id}` : undefined}
        />
        <MetricTile
          icon={ShieldCheck}
          iconClass="text-green-600"
          label="Handled by policy"
          value={`${auto} of ${governance.length}`}
          caption="AI actions auto-approved under your rules"
        />
        <MetricTile
          icon={Timer}
          iconClass="text-blue-600"
          label="Your time on this case"
          value={`${minutes} min`}
          caption="Reviews and spot checks so far"
        />
        <MetricTile
          icon={Gauge}
          iconClass="text-purple-600"
          label="Checks passed"
          value={`${passed} of ${checks.length}`}
          caption="Automated checks on every AI action"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Needs your approval</CardTitle>
              <CardDescription>Routed to you by policy. Nothing here reaches the IRS until you approve it.</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              {pending.length === 0 ? (
                <p className="mx-6 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                  <CheckCircle2 className="size-4 text-green-600" aria-hidden />
                  All caught up. New items appear here when a policy routes them to you.
                </p>
              ) : (
                <ul className="divide-y">
                  {pending.map((g) => (
                    <li key={g.id} className="flex flex-col gap-3 px-6 py-4 first:pt-0 sm:flex-row sm:items-center">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link href={`/plcy/${g.id}`} className="font-medium hover:text-primary hover:underline">
                            {g.title}
                          </Link>
                          <Badge variant="outline">{g.kind}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {policyFor(g.policyId)?.name} · confidence {Math.round(g.confidence * 100)}% · produced{" "}
                          {formatDate(g.createdOn)}
                          {g.eaMinutes && ` · about ${g.eaMinutes} min to review`}
                        </p>
                      </div>
                      <LinkButton href={`/plcy/${g.id}`} className="w-fit">
                        Review
                      </LinkButton>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>On the record</CardTitle>
              <CardDescription>Every AI action on this case, and who or what approved it</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <ul className="divide-y">
                {decided.map((g) => (
                  <li key={g.id}>
                    <Link
                      href={`/plcy/${g.id}`}
                      className="flex flex-col gap-1 px-6 py-3 outline-none first:pt-0 hover:bg-accent/40 focus-visible:bg-accent sm:flex-row sm:items-center sm:gap-3"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium">{g.title}</span>
                        <span className="block text-xs text-muted-foreground">
                          {policyFor(g.policyId)?.name} · {g.decidedOn ? formatDate(g.decidedOn) : ""}
                        </span>
                      </span>
                      <StatusBadge tone={governanceStatus[g.status].tone}>{governanceStatus[g.status].label}</StatusBadge>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="self-start">
          <CardHeader className="border-b">
            <CardTitle>Your policies for T-Res</CardTitle>
            <CardDescription>You approve a rule once. PLCY applies it to every case.</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <ul className="divide-y">
              {governancePolicies.map((p) => {
                const count = governance.filter((g) => g.policyId === p.id).length;
                return (
                  <li key={p.id} className="space-y-1.5 px-6 py-3 first:pt-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-medium">{p.name}</span>
                      <StatusBadge tone={outcomeTone[p.outcome]}>{p.outcome}</StatusBadge>
                    </div>
                    <p className="text-xs text-muted-foreground">{p.rule}</p>
                    <p className="text-xs text-muted-foreground">
                      {count} {count === 1 ? "action" : "actions"} on this case
                      {p.spotCheck && ` · ${p.spotCheck}`}
                    </p>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
