"use client";

import { useState } from "react";
import { AlertTriangle, ArrowDownCircle, ArrowUpCircle, CheckCircle2, CreditCard, PauseCircle, Repeat, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useCase } from "@/components/case-provider";
import { LinkButton } from "@/components/link-button";
import { PlanFeatureList, planPriceNote } from "@/components/plan-features";
import { StatusBadge } from "@/components/status";
import { daysRemainingLabel, formatDate, formatMoney } from "@/lib/format";
import {
  enrolledAgent,
  escalationPlan,
  nextNotice,
  paidInvoices,
  resolutionPlans,
  subscription,
  type Tone,
} from "@/lib/mockData";
import { cn } from "@/lib/utils";

function addMonths(iso: string, n: number) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + n, d)).toISOString().slice(0, 10);
}

/** What a plan costs this taxpayer from here: what's paid counts toward any plan. */
export function billingSummary(planId: string) {
  const current = resolutionPlans.find((p) => p.id === planId) ?? resolutionPlans[1];
  const paid = subscription.installmentsPaid * subscription.installmentAmount;
  const remaining = Math.max(0, current.price - paid);
  const credit = Math.max(0, paid - current.price);
  const oneTime = current.installments === 1;
  const count = remaining === 0 ? 0 : oneTime ? 1 : Math.max(1, current.installments - subscription.installmentsPaid);
  const each = count ? Math.round(remaining / count) : 0;
  // Remaining payments, with any rounding left on the last one.
  const amounts = Array.from({ length: count }, (_, i) => (i === count - 1 ? remaining - each * (count - 1) : each));
  return { current, paid, remaining, credit, oneTime, amounts };
}

const statusMeta: Record<string, { tone: Tone; label: string }> = {
  active: { tone: "good", label: "Active" },
  paused: { tone: "warn", label: "Payments paused" },
  canceled: { tone: "neutral", label: "Canceled" },
};

function PlanChangeSummary({
  fromId,
  toId,
  firstDue,
}: {
  fromId: string;
  toId: string;
  firstDue: string;
}) {
  const from = billingSummary(fromId).current;
  const target = billingSummary(toId);
  const gained = target.current.features.filter((f) => !from.features.includes(f));
  const lost = from.features.filter((f) => !target.current.features.includes(f));
  return (
    <div className="space-y-2 text-sm">
      {gained.length > 0 && (
        <p>
          <span className="font-medium text-green-700">You add:</span> {gained.join(", ")}.
        </p>
      )}
      {lost.length > 0 && (
        <p>
          <span className="font-medium text-red-600">You lose:</span> {lost.join(", ")}.
        </p>
      )}
      <p className="text-muted-foreground">
        {target.credit > 0
          ? `You've already paid more than this plan costs. We'll refund ${formatMoney(target.credit)}.`
          : target.remaining === 0
            ? "Nothing more to pay."
            : target.amounts.length === 1
              ? `You'll pay ${formatMoney(target.remaining)} once, on ${formatDate(firstDue)}.`
              : `Your remaining ${target.amounts.length} payments become ${formatMoney(target.amounts[0])} each, starting ${formatDate(firstDue)}.`}
      </p>
    </div>
  );
}

export function BillingOverview() {
  const { plan, resumePlan, switchPlan, escalatedOn } = useCase();
  const { current, paid, remaining, amounts } = billingSummary(plan.planId);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const pct = Math.min(100, Math.round((paid / current.price) * 100));
  const firstDue = plan.status === "paused" ? subscription.pauseResumesOn : subscription.nextChargeOn;
  const upcoming = plan.status === "canceled" ? [] : amounts.map((amount, i) => ({ date: addMonths(firstDue, i), amount }));
  const status = statusMeta[plan.status];
  const switchedFrom = plan.switchedFrom ? resolutionPlans.find((p) => p.id === plan.switchedFrom) : undefined;

  return (
    <div className="space-y-6">
      {plan.status === "paused" && (
        <div className="flex flex-col gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4 sm:flex-row sm:items-center">
          <PauseCircle className="size-5 shrink-0 text-yellow-600" aria-hidden />
          <p className="flex-1 text-sm text-yellow-800">
            <span className="font-medium text-yellow-900">Payments are paused until {formatDate(subscription.pauseResumesOn)}.</span>{" "}
            {enrolledAgent.name} is still working on your case.
          </p>
          <Button variant="outline" className="border-yellow-300 bg-white" onClick={resumePlan}>
            Resume payments now
          </Button>
        </div>
      )}
      {plan.status === "canceled" && (
        <div role="alert" className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center">
          <AlertTriangle className="size-5 shrink-0 text-red-600" aria-hidden />
          <p className="flex-1 text-sm text-red-800">
            <span className="font-medium text-red-900">Your plan was canceled on {formatDate(plan.changedOn ?? subscription.startedOn)}.</span>{" "}
            {enrolledAgent.name} has stopped work on your case. Your {nextNotice.code} response is still due{" "}
            {formatDate(nextNotice.respondBy)}.
          </p>
          <Button onClick={resumePlan}>Restart my plan</Button>
        </div>
      )}
      {escalatedOn && current.id === "guided" && (
        <div role="status" className="flex flex-col gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 sm:flex-row sm:items-center">
          <ShieldCheck className="size-5 shrink-0 text-blue-600" aria-hidden />
          <p className="flex-1 text-sm text-blue-800">
            <span className="font-medium text-blue-900">{enrolledAgent.name} is representing you for your final levy notice.</span>{" "}
            You&apos;re still on Guided. We won&apos;t change your plan or what you pay without asking you first.
          </p>
          <LinkButton href={`/notices/${escalationPlan.noticeId}`} variant="outline" className="border-blue-300 bg-white">
            See the notice
          </LinkButton>
        </div>
      )}
      {switchedFrom && plan.status === "active" && (
        <div role="status" className="flex flex-col gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 sm:flex-row sm:items-center">
          <Repeat className="size-5 shrink-0 text-blue-600" aria-hidden />
          <p className="flex-1 text-sm text-blue-800">
            <span className="font-medium text-blue-900">
              You changed from {switchedFrom.name} to {current.name} on {formatDate(plan.changedOn ?? subscription.startedOn)}.
            </span>{" "}
            {enrolledAgent.name} will confirm within one business day. Nothing is charged until then.
          </p>
          <Button variant="outline" className="border-blue-300 bg-white" onClick={() => switchPlan(switchedFrom.id)}>
            Undo
          </Button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="border-b">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-lg">{current.name}</CardTitle>
              <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
            </div>
            <CardDescription>{current.blurb}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-2xl font-bold tabular-nums">{formatMoney(current.price)}</span>
              <span className="text-sm text-muted-foreground">
                {current.installments > 1
                  ? `total, or ${current.installments} × ${formatMoney(current.price / current.installments)}`
                  : "one-time"}
              </span>
            </div>
            <div>
              <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                <span>{formatMoney(paid)} paid</span>
                <span>{plan.status === "canceled" ? "No more payments" : `${formatMoney(remaining)} left`}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary">
                <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {current.features.map((item) => (
                <li key={item} className="flex gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="flex-wrap justify-between gap-3">
            <p className="text-sm">
              {upcoming[0] ? (
                <>
                  Next payment: <span className="font-medium">{formatMoney(upcoming[0].amount)}</span> on{" "}
                  {formatDate(upcoming[0].date)} · {daysRemainingLabel(upcoming[0].date)}
                </>
              ) : plan.status === "canceled" ? (
                "You won't be charged again."
              ) : (
                "Paid in full."
              )}
            </p>
            {plan.status === "canceled" ? (
              <Button onClick={resumePlan}>Restart my plan</Button>
            ) : (
              <LinkButton href="/settings/billing/cancel" variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700">
                Cancel plan
              </LinkButton>
            )}
          </CardFooter>
        </Card>

        <Card className="self-start">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="size-4 text-primary" aria-hidden />
              Payment method
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <span className="rounded bg-blue-700 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white">
                {subscription.paymentMethod.brand.toUpperCase()}
              </span>
              <div>
                <p className="font-medium">•••• {subscription.paymentMethod.last4}</p>
                <p className="text-xs text-muted-foreground">Expires {subscription.paymentMethod.expires}</p>
              </div>
            </div>
            <p className="text-muted-foreground">Receipts go to {subscription.billingEmail}.</p>
            <p className="text-xs text-muted-foreground">
              Card changes happen on our payment provider&apos;s secure page. That comes with real billing in v2.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade or downgrade: every plan side by side */}
      <Card id="plans">
        <CardHeader className="border-b">
          <CardTitle>Change your plan</CardTitle>
          <CardDescription>
            Upgrade or downgrade any time. The {formatMoney(paid)} you&apos;ve paid counts toward any plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {resolutionPlans.map((p) => {
              const isCurrent = p.id === plan.planId;
              const upgrade = p.price > current.price;
              const label = plan.status === "canceled" ? `Restart on ${p.name}` : `${upgrade ? "Upgrade" : "Downgrade"} to ${p.name}`;
              return (
                <div
                  key={p.id}
                  className={cn("flex flex-col gap-4 rounded-xl border p-5", isCurrent && "border-primary ring-1 ring-primary")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">{p.name}</p>
                    {isCurrent ? (
                      <Badge>Your plan</Badge>
                    ) : (
                      p.recommended && <span className="text-xs font-medium text-primary">Recommended</span>
                    )}
                  </div>
                  <div>
                    <span className="text-2xl font-bold tabular-nums">{formatMoney(p.price)}</span>{" "}
                    <span className="text-sm text-muted-foreground">{planPriceNote(p)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{p.blurb}</p>
                  <PlanFeatureList plan={p} className="space-y-1.5" />
                  <div className="mt-auto space-y-3">
                    {isCurrent && plan.status !== "canceled" ? (
                      <Button variant="secondary" disabled className="w-full">
                        Current plan
                      </Button>
                    ) : pendingId === p.id ? (
                      <div className="space-y-3 rounded-lg bg-accent/60 p-3" role="group" aria-label={`Confirm: ${label}`}>
                        <PlanChangeSummary fromId={plan.planId} toId={p.id} firstDue={firstDue} />
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              switchPlan(p.id);
                              setPendingId(null);
                            }}
                          >
                            Confirm
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setPendingId(null)}>
                            Keep {current.name}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant={upgrade || plan.status === "canceled" ? "default" : "outline"}
                        className="w-full"
                        onClick={() => setPendingId(p.id)}
                      >
                        {plan.status === "canceled" ? null : upgrade ? <ArrowUpCircle aria-hidden /> : <ArrowDownCircle aria-hidden />}
                        {label}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="py-0">
        <CardHeader className="border-b pt-6">
          <CardTitle>Payments</CardTitle>
          <CardDescription>What you&apos;ve paid and what&apos;s coming up</CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-accent/40 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-3 py-3 font-medium">Description</th>
                <th className="px-3 py-3 text-right font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paidInvoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="px-6 py-3 whitespace-nowrap">{formatDate(inv.date)}</td>
                  <td className="px-3 py-3">
                    {inv.description}
                    <span className="block font-mono text-xs text-muted-foreground">{inv.id}</span>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">{formatMoney(inv.amount)}</td>
                  <td className="px-6 py-3">
                    <StatusBadge tone="good">Paid</StatusBadge>
                  </td>
                </tr>
              ))}
              {upcoming.map((u, i) => (
                <tr key={u.date}>
                  <td className="px-6 py-3 whitespace-nowrap">{formatDate(u.date)}</td>
                  <td className="px-3 py-3">
                    {current.name} · {current.installments > 1 ? `payment ${subscription.installmentsPaid + i + 1} of ${current.installments}` : "balance"}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">{formatMoney(u.amount)}</td>
                  <td className="px-6 py-3">
                    <StatusBadge tone={plan.status === "paused" && i === 0 ? "warn" : "neutral"}>
                      {plan.status === "paused" && i === 0 ? "After pause" : "Scheduled"}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
              {plan.status === "canceled" && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-sm text-muted-foreground">
                    Remaining payments ({formatMoney(remaining)}) were canceled. You won&apos;t be charged again.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
