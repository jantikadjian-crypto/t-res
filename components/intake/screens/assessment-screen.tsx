"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Sparkles, XCircle } from "lucide-react";
import { EAReviewedBadge } from "@/components/ea-reviewed-badge";
import { useIntake } from "@/components/intake/intake-provider";
import { sumAmounts } from "@/components/intake/money-fields";
import { StatusDot } from "@/components/status";
import { formatMoney } from "@/lib/format";
import { enrolledAgent, intakeAnswers, taxYears, totalOwed, yearBalance } from "@/lib/mockData";

// The streamlined payment plan needs no full financial review below this balance.
const STREAMLINED_LIMIT = 50000;

export function AssessmentScreen() {
  const { state } = useIntake();
  const assessment = intakeAnswers.assessment;
  const estimated = taxYears.reduce((s, y) => s + (y.estimatedBalance ?? 0), 0);
  const allIn = totalOwed + estimated;
  const leftOver = sumAmounts(state.monthlyIncome) - sumAmounts(state.monthlyExpenses);
  const fits = leftOver >= assessment.estimatedMonthly;

  return (
    <div className="space-y-6">
      <EAReviewedBadge />

      <section className="space-y-3 rounded-xl border bg-card p-5" aria-labelledby="assess-stand">
        <h2 id="assess-stand" className="font-semibold">
          Where you stand
        </h2>
        <ul className="divide-y">
          {taxYears.map((y) => (
            <li key={y.year}>
              <Link
                href={`/tax-years/${y.year}`}
                className="flex items-center gap-3 rounded-md py-2.5 outline-none hover:bg-accent/50 focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <StatusDot tone={y.tone} />
                <span className="font-medium">{y.year}</span>
                <span className="flex-1 text-sm text-muted-foreground">{y.statusLabel}</span>
                <span className="text-sm font-medium tabular-nums">
                  {y.balance ? formatMoney(yearBalance(y)) : `≈ ${formatMoney(y.estimatedBalance ?? 0)}`}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="flex items-baseline justify-between border-t pt-3 text-sm">
          <span>About {formatMoney(totalOwed)} owed now, plus about {formatMoney(estimated)} once 2023 is filed</span>
          <span className="font-semibold tabular-nums">≈ {formatMoney(allIn)}</span>
        </p>
      </section>

      <section className="space-y-4 rounded-xl border-2 border-primary bg-card p-5" aria-labelledby="assess-recommend">
        <p className="text-xs font-semibold tracking-wide text-primary uppercase">Our recommendation</p>
        <div>
          <h2 id="assess-recommend" className="text-lg font-semibold">
            {assessment.recommendedPath}
          </h2>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums">about {formatMoney(assessment.estimatedMonthly)}</span>
            <span className="text-muted-foreground">a month</span>
          </p>
        </div>
        <ul className="space-y-2 text-sm">
          <li className="flex gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" aria-hidden />
            It stops IRS collection, including the levy the CP504 warns about.
          </li>
          {fits && (
            <li className="flex gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" aria-hidden />
              It fits inside the {formatMoney(leftOver)} you have left over each month.
            </li>
          )}
          {allIn < STREAMLINED_LIMIT && (
            <li className="flex gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" aria-hidden />
              You owe less than {formatMoney(STREAMLINED_LIMIT)}, so the IRS doesn&apos;t need a full financial review.
            </li>
          )}
        </ul>
        {!fits && (
          <div role="alert" className="flex gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-yellow-600" aria-hidden />
            <p>
              Your money snapshot shows {formatMoney(Math.max(0, leftOver))} left over, less than this payment.{" "}
              {enrolledAgent.name} will look at a lower payment, or at pausing collection.{" "}
              <Link href="/intake/money-out" className="font-medium underline">
                Check your numbers
              </Link>
            </p>
          </div>
        )}
        <p className="text-sm text-muted-foreground">{assessment.summary}</p>
      </section>

      <section className="space-y-3 rounded-xl border bg-card p-5" aria-labelledby="assess-also">
        <h2 id="assess-also" className="font-semibold">
          What else we&apos;ll do
        </h2>
        <ul className="space-y-3">
          {assessment.alsoDoing.map((item) => (
            <li key={item.text} className="flex gap-3 text-sm">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <span className="flex-1">{item.text}</span>
              <Link href={item.href} className="inline-flex shrink-0 items-center gap-1 text-primary hover:underline">
                Details
                <ArrowRight className="size-3" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3 rounded-xl border bg-card p-5" aria-labelledby="assess-ruled-out">
        <h2 id="assess-ruled-out" className="font-semibold">
          What we ruled out, and why
        </h2>
        <ul className="space-y-3">
          {assessment.ruledOut.map((r) => (
            <li key={r.option} className="flex gap-3 text-sm">
              <XCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
              <span>
                <span className="font-medium">{r.option}.</span> <span className="text-muted-foreground">{r.why}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
