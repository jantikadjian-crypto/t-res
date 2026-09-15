"use client";

import { BookOpen, Info } from "lucide-react";
import { useIntake } from "@/components/intake/intake-provider";
import { LinkButton } from "@/components/link-button";
import { MoneyRows, sumAmounts } from "@/components/intake/money-fields";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

const EXPENSE_OPTIONS = ["Childcare", "Child support", "Student loan", "Medical costs", "Other"];

// What "left over" means for the taxpayer's options, in plain English.
function leftOverMeta(left: number) {
  if (left >= 100)
    return {
      box: "border-green-200 bg-green-50",
      amount: "text-green-700",
      text: "text-green-800",
      message: "This is what the IRS looks at to set a monthly payment. We'll aim for a payment well inside it.",
    };
  if (left >= 0)
    return {
      box: "border-yellow-200 bg-yellow-50",
      amount: "text-yellow-700",
      text: "text-yellow-800",
      message: "Tight, but workable. We'll check which of your costs the IRS allows.",
    };
  return {
    box: "border-red-200 bg-red-50",
    amount: "text-red-600",
    text: "text-red-800",
    message: "You spend more than comes in. That can qualify you for a pause in IRS collection (Currently Not Collectible).",
  };
}

export function MoneyOutScreen() {
  const { state, update } = useIntake();
  const income = sumAmounts(state.monthlyIncome);
  const out = sumAmounts(state.monthlyExpenses);
  const left = income - out;
  const meta = leftOverMeta(left);

  return (
    <div className="space-y-6">
      <MoneyRows
        idPrefix="expense"
        rows={state.monthlyExpenses}
        onChange={(rows) => update({ monthlyExpenses: rows })}
        addOptions={EXPENSE_OPTIONS}
      />

      <p className="flex gap-2 text-sm text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        The IRS has limits on what it counts for some costs, like rent and cars. We&apos;ll handle that part.
      </p>

      <div className={cn("space-y-3 rounded-xl border p-5", meta.box)} aria-live="polite">
        <dl className="space-y-1.5 text-sm">
          <div className="flex justify-between gap-3">
            <dt>Coming in</dt>
            <dd className="tabular-nums">{formatMoney(income)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>Going out</dt>
            <dd className="tabular-nums">−{formatMoney(out)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-t border-current/15 pt-2">
            <dt className="font-medium">Left over each month</dt>
            <dd className={cn("text-2xl font-bold tabular-nums", meta.amount)}>
              {left < 0 ? `−${formatMoney(-left)}` : formatMoney(left)}
            </dd>
          </div>
        </dl>
        <p className={cn("text-sm", meta.text)}>{meta.message}</p>
        {left < 0 && (
          <LinkButton href="/library/currently-not-collectible" variant="outline" size="sm" className="border-red-200 bg-white">
            <BookOpen aria-hidden />
            How a collection pause works
          </LinkButton>
        )}
      </div>
    </div>
  );
}
