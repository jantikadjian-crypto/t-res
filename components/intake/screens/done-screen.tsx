"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, ListChecks, ShieldCheck, UserCheck, type LucideIcon } from "lucide-react";
import { useCase } from "@/components/case-provider";
import { useIntake } from "@/components/intake/intake-provider";
import { LinkButton } from "@/components/link-button";
import { sumAmounts } from "@/components/intake/money-fields";
import { daysRemainingLabel, formatDate, formatMoney } from "@/lib/format";
import { FIRST_SCREEN, isUrgent, selfServeCheck } from "@/lib/intakeScreens";
import { enrolledAgent, nextNotice, resolutionPlans } from "@/lib/mockData";
import { cn } from "@/lib/utils";

type NextStep = { icon: LucideIcon; tone: string; title: string; detail: string; href: string; cta: string };

export function DoneScreen() {
  const { state } = useIntake();
  const { openActions } = useCase();
  const chosen = resolutionPlans.find((p) => p.id === state.chosenPlanId);
  const urgent = isUrgent(state);
  const leftOver = sumAmounts(state.monthlyIncome) - sumAmounts(state.monthlyExpenses);
  // The lane picked on the assessment: doing it yourself (Guided), or Chris representing you.
  const selfServe = selfServeCheck(state).eligible && state.chosenPlanId === "guided";

  const nextSteps: NextStep[] = [
    selfServe
      ? {
          icon: ShieldCheck,
          tone: "bg-blue-50 text-blue-600",
          title: "T-Res prepares everything for you",
          detail: `Your 2023 return, your payment plan answers and the letters to mail. ${enrolledAgent.name} spot-checks the rules and steps in if anything changes.`,
          href: "/action-items",
          cta: "See your steps",
        }
      : {
          icon: UserCheck,
          tone: "bg-blue-50 text-blue-600",
          title: `${enrolledAgent.name} reviews your case`,
          detail: urgent ? "Today, because the IRS has already taken money." : "Within one business day.",
          href: "/settings/security",
          cta: "Who can act for you",
        },
    {
      icon: ListChecks,
      tone: "bg-purple-50 text-purple-600",
      title: `You have ${openActions.length} ${openActions.length === 1 ? "thing" : "things"} to do`,
      detail: openActions[0] ? `First up: ${openActions[0].title}.` : "Nothing yet. We'll add anything the IRS asks for.",
      href: "/action-items",
      cta: "See your to-dos",
    },
    {
      icon: AlertTriangle,
      tone: "bg-red-50 text-red-600",
      title: `Your most urgent deadline: ${nextNotice.code}`,
      detail: `Respond by ${formatDate(nextNotice.respondBy)} · ${daysRemainingLabel(nextNotice.respondBy)}. We've already drafted the response.`,
      href: `/notices/${nextNotice.id}`,
      cta: "See the notice",
    },
  ];

  const unfiled =
    state.unfiledAnswer === "some"
      ? state.unfiledYears.join(", ") || "Not answered"
      : state.unfiledAnswer === "none"
        ? "All filed"
        : state.unfiledAnswer === "not-sure"
          ? "Not sure (we'll check)"
          : "Not answered";

  const recap = [
    { label: "Your situation", value: state.situation ?? "Not answered", href: "/intake/situation" },
    { label: "Years not filed", value: unfiled, href: "/intake/unfiled" },
    { label: "Left over each month", value: formatMoney(leftOver), href: "/intake/money-out" },
    {
      label: "Form 2848",
      value: selfServe
        ? "Not needed: you're dealing with the IRS yourself"
        : state.authorization.form2848 === "signed"
          ? "Signed"
          : "On your to-do list",
      href: "/intake/authorization",
    },
    {
      label: "Your plan",
      value: chosen ? `${chosen.name} · ${formatMoney(chosen.price)}` : "Not chosen",
      href: "/intake/path",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600" aria-hidden />
        <p>
          <span className="font-medium text-green-900">Your case is set up.</span> Nothing is charged today, and you can change
          any answer below.
        </p>
      </div>

      <ol className="space-y-3" aria-label="What happens next">
        {nextSteps.map((s) => (
          <li key={s.title}>
            <Link
              href={s.href}
              className="group/next flex items-start gap-4 rounded-xl border bg-card p-4 transition-colors outline-none hover:border-foreground/25 focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg", s.tone)}>
                <s.icon className="size-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{s.title}</span>
                <span className="block text-sm text-muted-foreground">{s.detail}</span>
              </span>
              <span className="hidden shrink-0 items-center gap-1 self-center text-sm text-primary group-hover/next:underline sm:inline-flex">
                {s.cta}
                <ArrowRight className="size-3.5" aria-hidden />
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <section className="rounded-xl border bg-card" aria-labelledby="done-recap">
        <h2 id="done-recap" className="border-b px-5 py-3 font-semibold">
          Your answers
        </h2>
        <dl className="divide-y">
          {recap.map((r) => (
            <div key={r.label} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 text-sm">
              <dt className="w-44 text-muted-foreground">{r.label}</dt>
              <dd className="min-w-0 flex-1 font-medium">{r.value}</dd>
              <dd>
                <Link href={r.href} className="text-primary hover:underline">
                  Edit<span className="sr-only"> {r.label.toLowerCase()}</span>
                </Link>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="flex flex-wrap gap-2">
        <LinkButton href="/">
          Go to your dashboard
          <ArrowRight aria-hidden />
        </LinkButton>
        <LinkButton href={`/intake/${FIRST_SCREEN}`} variant="outline">
          Review your answers from the start
        </LinkButton>
      </div>
    </div>
  );
}
