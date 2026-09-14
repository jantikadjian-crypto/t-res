import {
  AlertTriangle,
  ArrowRight,
  Clock,
  DollarSign,
  FileCheck,
  ListChecks,
  PenLine,
  Scale,
  Upload,
  type LucideIcon,
} from "lucide-react";
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
import { EAReviewedBadge } from "@/components/ea-reviewed-badge";
import { LinkButton } from "@/components/link-button";
import { MetricTile } from "@/components/metric-tile";
import { PageHeader } from "@/components/page-header";
import { StatusBadge, StatusDot } from "@/components/status";
import { daysRemainingLabel, daysUntil, deadlineTone, formatDate, formatMoney } from "@/lib/format";
import {
  actionItems,
  caseStages,
  currentStageIndex,
  nextActionItem,
  nextNotice,
  openActionItems,
  openNotices,
  taxpayer,
  taxYears,
  totalOwed,
  yearBalance,
  yearNextStep,
  type ActionItemType,
} from "@/lib/mockData";

const actionIcons: Record<ActionItemType, LucideIcon> = {
  sign: PenLine,
  upload: Upload,
  "approve-letter": FileCheck,
};

const actionVerb: Record<ActionItemType, string> = {
  sign: "Sign",
  upload: "Upload",
  "approve-letter": "Review",
};

export default function DashboardPage() {
  const stage = caseStages[currentStageIndex];
  const stagePct = Math.round(((currentStageIndex + 1) / caseStages.length) * 100);
  const yearsWithBalance = taxYears.filter((y) => y.balance).length;
  const unfiledYears = taxYears.filter((y) => y.status === "unfiled").length;
  const doneCount = actionItems.length - openActionItems.length;
  const donePct = Math.round((doneCount / actionItems.length) * 100);
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

      {/* Urgency banner */}
      <div
        role="alert"
        className="flex flex-col gap-4 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center"
      >
        <div className="flex flex-1 gap-3">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-600" aria-hidden />
          <div>
            <p className="font-medium text-red-900">
              Respond to your {nextNotice.code} by {formatDate(nextNotice.respondBy)} ·{" "}
              {daysRemainingLabel(nextNotice.respondBy)}
            </p>
            <p className="mt-1 text-sm text-red-800">
              {nextNotice.plainTitle}. This is fixable: we&apos;ve drafted your response and just need your
              signature to send it.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 pl-8 sm:pl-0">
          <LinkButton
            href={`/notices/${nextNotice.id}`}
            variant="outline"
            className="border-red-200 bg-white text-red-700 hover:bg-red-100 hover:text-red-800"
          >
            What this means
          </LinkButton>
          <LinkButton href="/action-items" className="bg-red-600 text-white hover:bg-red-700">
            Respond now
            <ArrowRight aria-hidden />
          </LinkButton>
        </div>
      </div>

      {/* Vitals */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile
          icon={DollarSign}
          iconClass="text-red-600"
          label="Total owed"
          value={formatMoney(totalOwed)}
          caption={`Across ${yearsWithBalance} tax years · ${unfiledYears} year not filed`}
        />
        <MetricTile
          icon={Clock}
          iconClass="text-orange-600"
          label="Next deadline"
          value={`${nextDays} ${nextDays === 1 ? "day" : "days"}`}
          caption={`${nextNotice.code} response · ${formatDate(nextNotice.respondBy)}`}
        />
        <MetricTile
          icon={Scale}
          iconClass="text-blue-600"
          label="Case stage"
          value={`Step ${currentStageIndex + 1} of ${caseStages.length}`}
          caption={stage.label}
        >
          <div className="mt-3 h-2 w-full rounded-full bg-secondary">
            <div className="h-2 rounded-full bg-primary" style={{ width: `${stagePct}%` }} />
          </div>
        </MetricTile>
        <MetricTile
          icon={ListChecks}
          iconClass="text-purple-600"
          label="Action items"
          value={String(openActionItems.length)}
          caption={
            nextActionItem ? `Waiting on you · next due ${formatDate(nextActionItem.dueBy)}` : "All done"
          }
        />
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
                      <div className="flex min-w-0 flex-1 gap-3">
                        <StatusDot tone={y.tone} className="mt-2" />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium">{y.year}</span>
                            <StatusBadge tone={y.tone}>{y.statusLabel}</StatusBadge>
                          </div>
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{y.plainEnglish}</p>
                        </div>
                      </div>
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
              <span className="font-semibold tabular-nums">{formatMoney(totalOwed)}</span>
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
                      <span className="text-sm font-medium">{n.plainTitle}</span>
                      <StatusBadge tone={deadlineTone(n.respondBy)} className="sm:ml-auto">
                        Respond by {formatDate(n.respondBy)} · {daysRemainingLabel(n.respondBy)}
                      </StatusBadge>
                    </div>
                    <p className="text-sm text-muted-foreground">{n.decode.whatItMeans}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        {n.taxYear} tax year · received {formatDate(n.receivedOn)}
                      </span>
                      {n.decode.eaReviewed && <EAReviewedBadge />}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Action queue */}
        <Card className="self-start">
          <CardHeader className="border-b">
            <CardTitle>Your next steps</CardTitle>
            <CardDescription>Your case moves forward when these are done</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                <span>
                  {doneCount} of {actionItems.length} done
                </span>
                <span className="tabular-nums">{donePct}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${donePct}%` }} />
              </div>
            </div>
            <ul className="space-y-3">
              {openActionItems.map((a) => {
                const Icon = actionIcons[a.type];
                return (
                  <li key={a.id} className="flex gap-3 rounded-lg border p-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-md bg-accent">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <p className="text-sm font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{a.why}</p>
                      <div className="flex items-center justify-between gap-2">
                        <StatusBadge tone={deadlineTone(a.dueBy)}>{daysRemainingLabel(a.dueBy)}</StatusBadge>
                        <LinkButton href="/action-items" variant="outline" size="xs">
                          {actionVerb[a.type]}
                        </LinkButton>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
          <CardFooter>
            <LinkButton href="/action-items" className="w-full">
              Go to action items
              <ArrowRight aria-hidden />
            </LinkButton>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
