"use client";

import { AlertTriangle, CheckCircle2, CreditCard, PauseCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useCase } from "@/components/case-provider";
import { LinkButton } from "@/components/link-button";
import { StatusBadge } from "@/components/status";
import { daysRemainingLabel, formatDate, formatMoney } from "@/lib/format";
import { enrolledAgent, nextNotice, paidInvoices, resolutionPlans, subscription, type Tone } from "@/lib/mockData";

function addMonths(iso: string, n: number) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + n, d)).toISOString().slice(0, 10);
}

/** "or 6 × $275" → 275. One-time plans have no installment. */
export function installmentOf(priceNote: string): number | null {
  const match = priceNote.match(/×\s*\$([\d,]+)/);
  return match ? Number(match[1].replace(/,/g, "")) : null;
}

export function billingSummary(planId: string) {
  const current = resolutionPlans.find((p) => p.id === planId) ?? resolutionPlans[1];
  const paid = subscription.installmentsPaid * subscription.installmentAmount;
  const remaining = Math.max(0, current.price - paid);
  const installment = installmentOf(current.priceNote) ?? remaining;
  return { current, paid, remaining, installment };
}

const statusMeta: Record<string, { tone: Tone; label: string }> = {
  active: { tone: "good", label: "Active" },
  paused: { tone: "warn", label: "Payments paused" },
  canceled: { tone: "neutral", label: "Canceled" },
};

export function BillingOverview() {
  const { plan, resumePlan, switchPlan } = useCase();
  const { current, paid, remaining, installment } = billingSummary(plan.planId);
  const pct = Math.min(100, Math.round((paid / current.price) * 100));
  const firstDue = plan.status === "paused" ? subscription.pauseResumesOn : subscription.nextChargeOn;
  const count = plan.status === "canceled" || !installment ? 0 : Math.ceil(remaining / installment);
  const upcoming = Array.from({ length: count }, (_, i) => ({
    date: addMonths(firstDue, i),
    amount: Math.min(installment, remaining - i * installment),
  }));
  const status = statusMeta[plan.status];
  const others = resolutionPlans.filter((p) => p.id !== plan.planId);

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
            {plan.switchedFrom && plan.status === "active" && (
              <p className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                You switched from {resolutionPlans.find((p) => p.id === plan.switchedFrom)?.name} on{" "}
                {formatDate(plan.changedOn ?? subscription.startedOn)}. {enrolledAgent.name} will confirm the change within one
                business day.
              </p>
            )}
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-2xl font-bold tabular-nums">{formatMoney(current.price)}</span>
              <span className="text-sm text-muted-foreground">
                {installmentOf(current.priceNote) ? `total, paid as ${current.priceNote.replace(/^or\s*/, "")}` : "one-time"}
              </span>
            </div>
            <div>
              <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                <span>{formatMoney(paid)} paid</span>
                <span>{plan.status === "canceled" ? "No more payments" : `${formatMoney(remaining)} left`}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {current.includes.map((item) => (
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
                    {current.name} · {installmentOf(current.priceNote) ? `payment ${subscription.installmentsPaid + i + 1}` : "balance"}
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

      {plan.status !== "canceled" && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Other plans</CardTitle>
            <CardDescription>Switch any time. What you&apos;ve already paid counts toward the new plan.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {others.map((p) => {
              const left = Math.max(0, p.price - paid);
              return (
                <div key={p.id} className="flex flex-col gap-3 rounded-xl border p-4">
                  <div>
                    <p className="font-medium">
                      {p.name}
                      {p.recommended && <span className="ml-2 text-xs font-normal text-primary">Recommended</span>}
                    </p>
                    <p className="text-sm text-muted-foreground">{p.blurb}</p>
                  </div>
                  <p className="text-sm">
                    <span className="font-semibold tabular-nums">{formatMoney(p.price)}</span>{" "}
                    <span className="text-muted-foreground">· {formatMoney(left)} left after what you&apos;ve paid</span>
                  </p>
                  <Button variant="outline" className="mt-auto w-fit" onClick={() => switchPlan(p.id)}>
                    Switch to {p.name}
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
