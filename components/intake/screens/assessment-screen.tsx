"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, ShieldCheck, Sparkles, XCircle } from "lucide-react";
import { GovernanceBadge } from "@/components/governance-badge";
import { ChoiceGroup } from "@/components/intake/choice";
import { useIntake } from "@/components/intake/intake-provider";
import { sumAmounts } from "@/components/intake/money-fields";
import { planPriceNote } from "@/components/plan-features";
import { StatusDot } from "@/components/status";
import { formatDate, formatMoney } from "@/lib/format";
import { ONLINE_PLAN_LIMIT, selfServeCheck } from "@/lib/intakeScreens";
import { enrolledAgent, intakeAnswers, nextNotice, resolutionPlans, taxYears, totalOwed, yearBalance } from "@/lib/mockData";
import { cn } from "@/lib/utils";

type Plan = (typeof resolutionPlans)[number];
type Step = { title: string; text: string; href: string; link: string };

function LaneCard({
  checked,
  disabled = false,
  onClick,
  title,
  blurb,
  plan,
  recommended,
}: {
  checked: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  blurb: string;
  plan: Plan;
  recommended: boolean;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border bg-card p-4 text-left transition-colors outline-none hover:border-foreground/25 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-border",
        checked && "border-primary ring-1 ring-primary hover:border-primary"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border",
          checked ? "border-primary bg-primary" : "border-foreground/25 bg-background"
        )}
      >
        {checked && <span className="size-2 rounded-full bg-white" />}
      </span>
      <span className="min-w-0 space-y-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{title}</span>
          {recommended && (
            <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">Recommended for you</span>
          )}
        </span>
        <span className="block text-sm text-muted-foreground">{blurb}</span>
        <span className="block text-sm">
          <span className="font-semibold tabular-nums">{formatMoney(plan.price)}</span>{" "}
          <span className="text-muted-foreground">
            {planPriceNote(plan)} · {plan.name} plan
          </span>
        </span>
        {disabled && <span className="block text-xs text-muted-foreground">Not available for your situation</span>}
      </span>
    </button>
  );
}

export function AssessmentScreen() {
  const { state, update } = useIntake();
  const assessment = intakeAnswers.assessment;
  const estimated = taxYears.reduce((s, y) => s + (y.estimatedBalance ?? 0), 0);
  const allIn = totalOwed + estimated;
  const leftOver = sumAmounts(state.monthlyIncome) - sumAmounts(state.monthlyExpenses);
  const fits = leftOver >= assessment.estimatedMonthly;

  // Which lane: self-serve when the rules allow it and the taxpayer picked it; otherwise Chris represents them.
  const lane = selfServeCheck(state);
  const selfServe = lane.eligible && state.chosenPlanId === "guided";
  const guided = resolutionPlans.find((p) => p.id === "guided") ?? resolutionPlans[0];
  const represented = resolutionPlans.find((p) => p.id === "full") ?? resolutionPlans[1];
  const chooseLane = (self: boolean) =>
    update({
      chosenPlanId: self ? "guided" : state.chosenPlanId && state.chosenPlanId !== "guided" ? state.chosenPlanId : "full",
    });

  const unfiled = state.unfiledAnswer === "some" ? state.unfiledYears : [];
  const monthly = formatMoney(assessment.estimatedMonthly);
  const deadline = formatDate(nextNotice.respondBy);
  const selfServeSteps: Step[] = [
    ...(unfiled.length > 0
      ? [
          {
            title: `File your ${unfiled.join(" and ")} return${unfiled.length > 1 ? "s" : ""}`,
            text: "We prepare it from your W-2s and 1099s. You sign it and e-file it.",
            href: `/tax-years/${unfiled[0]}`,
            link: "Details",
          },
        ]
      : []),
    {
      title: "Set up your payment plan on IRS.gov",
      text: `In your IRS online account, apply for a long-term payment plan. We give you every answer, including about ${monthly} a month by direct debit.`,
      href: "/library/irs-online-account",
      link: "How it works",
    },
    {
      title: "Ask to remove your 2021 penalties",
      text: "We write the First-Time Abatement request. You mail it, or read it to the IRS when you call.",
      href: "/library/first-time-abatement",
      link: "What it is",
    },
    {
      title: `Answer your ${nextNotice.code}`,
      text: `We give you a one-page reply to mail before ${deadline}. While your payment plan is in place, the IRS can't levy.`,
      href: `/notices/${nextNotice.id}`,
      link: "The notice",
    },
  ];
  const representedSteps: Step[] = [
    {
      title: "Sign Form 2848",
      text: `So ${enrolledAgent.name} can speak to the IRS for you.`,
      href: "/sign/doc_2848",
      link: "Sign",
    },
    {
      title: `${enrolledAgent.name} answers your ${nextNotice.code}`,
      text: `Sent before ${deadline}, with a request to hold collection.`,
      href: `/notices/${nextNotice.id}`,
      link: "The notice",
    },
    {
      title: `${enrolledAgent.name} sets up your payment plan`,
      text: `About ${monthly} a month, plus a request to remove your 2021 penalties.`,
      href: "/library/installment-agreement",
      link: "How it works",
    },
    {
      title: `${enrolledAgent.name} asks for the lien to be withdrawn`,
      text: "Once the plan is running by direct debit.",
      href: "/library/lien-withdrawal",
      link: "What it is",
    },
  ];
  const steps = selfServe ? selfServeSteps : representedSteps;

  return (
    <div className="space-y-6">
      {/* A money recommendation: PLCY routes it to Chris, so it carries his approval. */}
      <GovernanceBadge itemId="gov_assessment" />

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
            <span className="text-3xl font-bold tabular-nums">about {monthly}</span>
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
          {allIn < ONLINE_PLAN_LIMIT && (
            <li className="flex gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" aria-hidden />
              You owe less than {formatMoney(ONLINE_PLAN_LIMIT)}, so the IRS doesn&apos;t need a full financial review.
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

      {/* Self-serve or represented: the rules decide what's possible, the taxpayer decides. */}
      <section className="space-y-4 rounded-xl border bg-card p-5" aria-labelledby="assess-lane">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="assess-lane" className="font-semibold">
              How you&apos;ll get there
            </h2>
            <p className="text-sm text-muted-foreground">
              {lane.eligible
                ? "You can do this yourself. We prepare everything, and you stay in charge with the IRS."
                : `${enrolledAgent.name} should handle this one. Here's why:`}
            </p>
          </div>
          <GovernanceBadge itemId="gov_lane" />
        </div>

        <ul className="space-y-2 text-sm">
          {lane.criteria.map((c) => (
            <li key={c.key} className="flex gap-2">
              {c.passed ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" aria-hidden />
              ) : (
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-yellow-600" aria-hidden />
              )}
              <span className={c.passed ? undefined : "text-yellow-900"}>{c.text}</span>
            </li>
          ))}
        </ul>

        <ChoiceGroup label="Choose how you want to do it" className="grid gap-3 space-y-0 sm:grid-cols-2">
          <LaneCard
            checked={selfServe}
            disabled={!lane.eligible}
            onClick={() => chooseLane(true)}
            title="Do it yourself with T-Res"
            blurb="We prepare every form and answer. You submit them in your IRS online account, step by step."
            plan={guided}
            recommended={lane.eligible}
          />
          <LaneCard
            checked={!selfServe}
            onClick={() => chooseLane(false)}
            title={`Have ${enrolledAgent.name} represent you`}
            blurb={`${enrolledAgent.name} signs on as your representative and deals with the IRS for you.`}
            plan={represented}
            recommended={!lane.eligible}
          />
        </ChoiceGroup>

        <div className="rounded-lg bg-accent/50 p-4">
          <p className="mb-3 text-sm font-medium">{selfServe ? "Your steps" : `What ${enrolledAgent.name} does for you`}</p>
          <ol className="space-y-3">
            {steps.map((s, i) => (
              <li key={s.title} className="flex gap-3 text-sm">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-card text-xs font-semibold tabular-nums ring-1 ring-border">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{s.title}</span>
                  <span className="block text-muted-foreground">{s.text}</span>
                </span>
                <Link href={s.href} className="inline-flex shrink-0 items-center gap-1 text-primary hover:underline">
                  {s.link}
                  <ArrowRight className="size-3" aria-hidden />
                </Link>
              </li>
            ))}
          </ol>
          <p className="mt-4 flex gap-2 border-t pt-3 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
            {selfServe
              ? `No Form 2848 needed. ${enrolledAgent.name} spot-checks the rules behind your plan, and if anything changes, like a new notice or a levy, we hand your case to ${enrolledAgent.name} right away.`
              : "You never have to call the IRS. You can switch to doing it yourself later if your situation allows."}
          </p>
        </div>
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
