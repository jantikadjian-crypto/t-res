import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Clock, DollarSign, ListChecks, Scale, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ActionItemsTile, NextStepsCard, UrgencyBanner } from "@/components/dashboard/live-cards";
import { GovernanceBadge } from "@/components/governance-badge";
import { LinkButton } from "@/components/link-button";
import { MetricTile } from "@/components/metric-tile";
import { PageHeader } from "@/components/page-header";
import { StatusBadge, StatusDot } from "@/components/status";
import { daysRemainingLabel, daysUntil, deadlineTone, formatDate, formatMoney } from "@/lib/format";
import {
  caseStages,
  currentStageIndex,
  nextNotice,
  openNotices,
  taxpayer,
  taxYears,
  totalOwed,
  yearBalance,
  yearNextStep,
} from "@/lib/mockData";

export const metadata: Metadata = { title: "Dashboard · T-Res" };

export default function DashboardPage() {
  const stage = caseStages[currentStageIndex];
  const stagePct = Math.round(((currentStageIndex + 1) / caseStages.length) * 100);
  const yearsWithBalance = taxYears.filter((y) => y.balance).length;
  const unfiledYears = taxYears.filter((y) => y.status === "unfiled").length;
  const nextDays = daysUntil(nextNotice.respondBy);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${taxpayer.firstName}`}
        description="Here's where your IRS case stands today, in plain English."
        actions={
          <>
            <LinkButton href="/notices" variant="outline">
              <Upload aria-hidden />
              Upload a notice
            </LinkButton>
            <LinkButton href="/action-items">
              <ListChecks aria-hidden />
              View action items
            </LinkButton>
          </>
        }
      />

      {/* Urgency banner: follows the case as things get signed and approved */}
      <UrgencyBanner />

      {/* Vitals: each opens what it describes */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile
          icon={DollarSign}
          iconClass="text-red-600"
          label="Total owed"
          value={formatMoney(totalOwed)}
          caption={`Across ${yearsWithBalance} tax years · ${unfiledYears} year not filed`}
          href="/tax-years"
        />
        <MetricTile
          icon={Clock}
          iconClass="text-orange-600"
          label="Next deadline"
          value={`${nextDays} ${nextDays === 1 ? "day" : "days"}`}
          caption={`${nextNotice.code} response · ${formatDate(nextNotice.respondBy)}`}
          href={`/notices/${nextNotice.id}`}
        />
        <MetricTile
          icon={Scale}
          iconClass="text-blue-600"
          label="Case stage"
          value={`Step ${currentStageIndex + 1} of ${caseStages.length}`}
          caption={`${stage.label} · see what moves it forward`}
          href="/action-items"
        >
          <div className="mt-3 h-2 w-full rounded-full bg-secondary">
            <div className="h-2 rounded-full bg-primary" style={{ width: `${stagePct}%` }} />
          </div>
        </MetricTile>
        <ActionItemsTile />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Tax years */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Your tax years</CardTitle>
              <CardDescription>What the IRS says you owe, year by year</CardDescription>
              <CardAction>
                <LinkButton href="/tax-years" variant="ghost" size="sm">
                  View all
                  <ArrowRight aria-hidden />
                </LinkButton>
              </CardAction>
            </CardHeader>
            <CardContent className="px-0">
              <ul className="divide-y">
                {taxYears.map((y) => {
                  const step = yearNextStep(y);
                  return (
                    <li key={y.year} className="flex flex-col gap-3 px-6 py-4 first:pt-0 sm:flex-row sm:items-center">
                      <Link
                        href={`/tax-years/${y.year}`}
                        className="group/year -m-2 flex min-w-0 flex-1 gap-3 rounded-lg p-2 outline-none hover:bg-accent/50 focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        <StatusDot tone={y.tone} className="mt-2" />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium group-hover/year:text-primary group-hover/year:underline">{y.year}</span>
                            <StatusBadge tone={y.tone}>{y.statusLabel}</StatusBadge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{y.plainEnglish}</p>
                        </div>
                      </Link>
                      <div className="flex items-center justify-between gap-4 pl-5 sm:justify-end sm:pl-0">
                        <div className="text-right">
                          <div className="font-medium tabular-nums">
                            {y.balance
                              ? formatMoney(yearBalance(y))
                              : y.estimatedBalance !== undefined
                                ? `≈ ${formatMoney(y.estimatedBalance)}`
                                : "—"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {y.balance ? "owed" : "estimated, once filed"}
                          </div>
                        </div>
                        <LinkButton
                          href={step.href}
                          variant={step.primary ? "default" : "outline"}
                          size="sm"
                          className="w-28"
                        >
                          {step.label}
                        </LinkButton>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
            <CardFooter className="justify-between">
              <span className="text-sm text-muted-foreground">Total owed across all years</span>
              <Link href="/tax-years" className="font-semibold tabular-nums hover:text-primary hover:underline">
                {formatMoney(totalOwed)}
              </Link>
            </CardFooter>
          </Card>

          {/* Notices */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Open IRS notices</CardTitle>
              <CardDescription>Every letter, translated into plain English</CardDescription>
              <CardAction>
                <LinkButton href="/notices" variant="ghost" size="sm">
                  All notices
                  <ArrowRight aria-hidden />
                </LinkButton>
              </CardAction>
            </CardHeader>
            <CardContent className="px-0">
              <ul className="divide-y">
                {openNotices.map((n) => (
                  <li key={n.id} className="space-y-2 px-6 py-4 first:pt-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="font-mono">
                        {n.code}
                      </Badge>
                      <Link href={`/notices/${n.id}`} className="text-sm font-medium hover:text-primary hover:underline">
                        {n.plainTitle}
                      </Link>
                      <StatusBadge tone={deadlineTone(n.respondBy)} className="sm:ml-auto">
                        Respond by {formatDate(n.respondBy)} · {daysRemainingLabel(n.respondBy)}
                      </StatusBadge>
                    </div>
                    <p className="text-sm text-muted-foreground">{n.decode.whatItMeans}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Link href={`/tax-years/${n.taxYear}`} className="hover:text-foreground hover:underline">
                        {n.taxYear} tax year
                      </Link>
                      <span>· received {formatDate(n.receivedOn)}</span>
                      <GovernanceBadge href={`/notices/${n.id}`} />
                      <Link href={`/documents/${n.documentId}`} className="text-primary hover:underline sm:ml-auto">
                        View the letter
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Action queue: updates as things get signed, uploaded and approved */}
        <NextStepsCard />
      </div>
    </div>
  );
}
