"use client";

import Link from "next/link";
import { Check, ShieldCheck, X } from "lucide-react";
import { useCase } from "@/components/case-provider";
import { ChoiceGroup } from "@/components/intake/choice";
import { useIntake } from "@/components/intake/intake-provider";
import { formatMoney } from "@/lib/format";
import { enrolledAgent, planFeatures, resolutionPlans } from "@/lib/mockData";
import { cn } from "@/lib/utils";

export function PathScreen() {
  const { state, update } = useIntake();
  const { plan } = useCase();
  const currentPlan = resolutionPlans.find((p) => p.id === plan.planId);

  return (
    <div className="space-y-6">
      <ChoiceGroup label="Choose how much help you want" className="space-y-4">
        {resolutionPlans.map((p) => {
          const selected = state.chosenPlanId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => update({ chosenPlanId: p.id })}
              className={cn(
                "flex w-full flex-col gap-4 rounded-xl border bg-card p-5 text-left transition-colors outline-none hover:border-foreground/25 focus-visible:ring-3 focus-visible:ring-ring/50",
                selected && "border-primary ring-1 ring-primary hover:border-primary"
              )}
            >
              <span className="flex flex-wrap items-start justify-between gap-3">
                <span className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className={cn(
                      "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border",
                      selected ? "border-primary bg-primary" : "border-foreground/25 bg-background"
                    )}
                  >
                    {selected && <span className="size-2 rounded-full bg-white" />}
                  </span>
                  <span>
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{p.name}</span>
                      {p.recommended && (
                        <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">Recommended for you</span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">{p.blurb}</span>
                  </span>
                </span>
                <span className="pl-8 text-right sm:pl-0">
                  <span className="block text-2xl font-bold tabular-nums">{formatMoney(p.price)}</span>
                  <span className="block text-xs text-muted-foreground">
                    {p.installments > 1 ? `or ${p.installments} × ${formatMoney(p.price / p.installments)}` : "one-time"}
                  </span>
                </span>
              </span>
              <span className="grid gap-x-6 gap-y-1.5 pl-8 text-sm sm:grid-cols-2">
                {planFeatures.map((f) => {
                  const has = p.features.includes(f);
                  return (
                    <span key={f} className={cn("flex gap-2", !has && "text-muted-foreground")}>
                      {has ? (
                        <Check className="mt-0.5 size-4 shrink-0 text-green-600" aria-hidden />
                      ) : (
                        <X className="mt-0.5 size-4 shrink-0 text-muted-foreground/50" aria-hidden />
                      )}
                      <span>
                        {f}
                        {!has && <span className="sr-only"> (not included)</span>}
                      </span>
                    </span>
                  );
                })}
              </span>
            </button>
          );
        })}
      </ChoiceGroup>

      <p className="flex gap-2 rounded-xl bg-accent/60 p-4 text-sm">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        You won&apos;t be charged today. {enrolledAgent.name} confirms your plan before anything is billed.
      </p>

      {currentPlan && state.chosenPlanId !== currentPlan.id && (
        <p className="text-sm text-muted-foreground">
          You&apos;re currently on {currentPlan.name}. This replay doesn&apos;t save changes. To switch plans, go to{" "}
          <Link href="/settings/billing" className="font-medium text-primary hover:underline">
            Billing &amp; plan
          </Link>
          .
        </p>
      )}
    </div>
  );
}
