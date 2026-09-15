"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowDownCircle, ArrowUpCircle, CheckCircle2, CreditCard, Download, Repeat } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useProSession } from "@/components/pro/pro-session";
import { useProWorkspace } from "@/components/pro/use-pro-workspace";
import { StatusBadge } from "@/components/status";
import { daysRemainingLabel, formatDate, formatMoney } from "@/lib/format";
import { proInvoices, proPlans, proSubscription } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const planIndex = (id: string) => proPlans.findIndex((p) => p.id === id);

export function ProBilling() {
  const { proPlan, switchProPlan, cancelProPlan, resumeProPlan, team } = useProSession();
  const { clients } = useProWorkspace();
  const [confirmCancel, setConfirmCancel] = useState(false);

  const current = proPlans.find((p) => p.id === proPlan.planId) ?? proPlans[0];
  const canceled = proPlan.status === "canceled";
  const switchedFrom = proPlan.switchedFrom ? proPlans.find((p) => p.id === proPlan.switchedFrom) : undefined;
  const seatsUsed = team.length;
  const clientsUsed = clients.length;
  const overSeats = seatsUsed > current.seats;
  const overClients = clientsUsed > current.clients;

  const meters = [
    { label: "Seats", used: seatsUsed, limit: current.seats, href: "/pro/settings/firm", over: overSeats },
    { label: "Active clients", used: clientsUsed, limit: current.clients, href: "/pro/clients", over: overClients },
  ];

  return (
    <div className="space-y-6">
      {canceled && (
        <div role="alert" className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center">
          <AlertTriangle className="size-5 shrink-0 text-red-600" aria-hidden />
          <p className="flex-1 text-sm text-red-800">
            <span className="font-medium text-red-900">
              Your plan ends on {formatDate(proSubscription.renewsOn)}.
            </span>{" "}
            Until then nothing changes. After that, T-Res stops drafting and checking, and your clients stay yours.
          </p>
          <Button onClick={resumeProPlan}>Keep my plan</Button>
        </div>
      )}
      {switchedFrom && !canceled && (
        <div role="status" className="flex flex-col gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 sm:flex-row sm:items-center">
          <Repeat className="size-5 shrink-0 text-blue-600" aria-hidden />
          <p className="flex-1 text-sm text-blue-800">
            <span className="font-medium text-blue-900">
              You moved from {switchedFrom.name} to {current.name} on {formatDate(proPlan.changedOn ?? proSubscription.startedOn)}.
            </span>{" "}
            The change applies now; the difference shows on your next invoice.
          </p>
          <Button variant="outline" className="border-blue-300 bg-white" onClick={() => switchProPlan(switchedFrom.id)}>
            Undo
          </Button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="border-b">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-lg">{current.name}</CardTitle>
              <StatusBadge tone={canceled ? "neutral" : "good"}>{canceled ? "Ends soon" : "Active"}</StatusBadge>
            </div>
            <CardDescription>{current.blurb}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-2xl font-bold tabular-nums">{formatMoney(current.price)}</span>
              <span className="text-sm text-muted-foreground">per month · demo pricing</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {meters.map((m) => (
                <div key={m.label}>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <Link href={m.href} className="text-muted-foreground hover:text-foreground">
                      {m.label}
                    </Link>
                    <span className={cn("tabular-nums", m.over ? "font-medium text-red-600" : "text-muted-foreground")}>
                      {m.used} of {m.limit}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary">
                    <div
                      className={cn("h-2 rounded-full transition-all", m.over ? "bg-red-500" : "bg-primary")}
                      style={{ width: `${Math.min(100, Math.round((m.used / m.limit) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
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
              {canceled ? (
                <>
                  Ends {formatDate(proSubscription.renewsOn)} · {daysRemainingLabel(proSubscription.renewsOn)}
                </>
              ) : (
                <>
                  Renews {formatDate(proSubscription.renewsOn)} · {daysRemainingLabel(proSubscription.renewsOn)}
                </>
              )}
            </p>
            {!canceled && (
              <Button variant="ghost" onClick={() => setConfirmCancel((c) => !c)} aria-expanded={confirmCancel}>
                Cancel plan
              </Button>
            )}
          </CardFooter>
        </Card>

        <Card className="self-start">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="size-4 text-muted-foreground" aria-hidden />
              Payment method
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="font-medium">
              {proSubscription.paymentMethod.brand} ending {proSubscription.paymentMethod.last4}
            </p>
            <p className="text-muted-foreground">Expires {proSubscription.paymentMethod.expires}</p>
            <p className="text-muted-foreground">
              Invoices go to{" "}
              <span className="break-all text-foreground">{proSubscription.billingEmail}</span>
            </p>
            <Badge variant="outline" className="gap-1">
              Demo only — no card entry
            </Badge>
          </CardContent>
        </Card>
      </div>

      {confirmCancel && !canceled && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Cancel your plan</CardTitle>
            <CardDescription>No phone call, no retention script. Two things worth knowing first.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <ul className="space-y-2">
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" aria-hidden />
                You keep every client, document and audit record. Exporting stays available for 90 days.
              </li>
              <li className="flex gap-2">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-yellow-600" aria-hidden />
                T-Res stops drafting, checking and watching deadlines on {formatDate(proSubscription.renewsOn)}. Anything
                waiting for your approval is dropped, not sent.
              </li>
            </ul>
            <p className="text-muted-foreground">
              Too much plan? Moving down a tier keeps everything running.
            </p>
          </CardContent>
          <CardFooter className="flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                cancelProPlan();
                setConfirmCancel(false);
              }}
            >
              Cancel at the end of the month
            </Button>
            <Button variant="ghost" onClick={() => setConfirmCancel(false)}>
              Keep my plan
            </Button>
          </CardFooter>
        </Card>
      )}

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Plans</CardTitle>
          <CardDescription>Change whenever you like. Prices here are placeholders for the demo.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {proPlans.map((p) => {
            const isCurrent = p.id === current.id;
            const up = planIndex(p.id) > planIndex(current.id);
            const tooSmall = seatsUsed > p.seats || clientsUsed > p.clients;
            return (
              <div
                key={p.id}
                className={cn(
                  "flex h-full flex-col gap-3 rounded-xl border p-4",
                  isCurrent ? "border-primary bg-accent/40" : "hover:border-foreground/20"
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{p.name}</p>
                  {isCurrent && <StatusBadge tone="good">Your plan</StatusBadge>}
                </div>
                <p className="text-xl font-bold tabular-nums">
                  {formatMoney(p.price)}
                  <span className="text-sm font-normal text-muted-foreground"> /mo</span>
                </p>
                <p className="text-sm text-muted-foreground">{p.blurb}</p>
                <p className="text-xs text-muted-foreground">
                  {p.clients} clients · {p.seats} {p.seats === 1 ? "seat" : "seats"}
                </p>
                <div className="mt-auto pt-2">
                  {isCurrent ? (
                    <Button variant="outline" disabled className="w-full">
                      Current plan
                    </Button>
                  ) : tooSmall ? (
                    <div className="space-y-1.5">
                      <Button variant="outline" disabled className="w-full">
                        Too small for you
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        You have {seatsUsed} on the team and {clientsUsed} active clients.
                      </p>
                    </div>
                  ) : (
                    <Button variant="outline" className="w-full" onClick={() => switchProPlan(p.id)}>
                      {up ? <ArrowUpCircle className="size-4" aria-hidden /> : <ArrowDownCircle className="size-4" aria-hidden />}
                      Move to {p.name}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Paid automatically on the 18th.</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <ul className="divide-y">
            {proInvoices.map((inv) => (
              <li key={inv.id} className="flex flex-wrap items-center gap-3 px-6 py-3 first:pt-0">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{inv.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {inv.id} · {formatDate(inv.date)}
                  </p>
                </div>
                <span className="text-sm font-medium tabular-nums">{formatMoney(inv.amount)}</span>
                <StatusBadge tone="good">Paid</StatusBadge>
                <Button variant="ghost" size="sm" aria-label={`Download invoice ${inv.id}`} disabled>
                  <Download className="size-4" aria-hidden />
                  PDF
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
