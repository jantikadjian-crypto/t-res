"use client";

import { Field, inputClass, selectClass } from "@/components/form";
import { useIntake } from "@/components/intake/intake-provider";
import { MoneyRows, MoneyTotal, sumAmounts } from "@/components/intake/money-fields";
import { INCOME_ROW_LABELS, NOT_WORKING, PAY_FREQUENCIES } from "@/lib/intakeScreens";
import { cn } from "@/lib/utils";

export function MoneyInScreen() {
  const { state, update } = useIntake();
  const total = sumAmounts(state.monthlyIncome);
  const notWorking = state.incomeTypes.includes(NOT_WORKING);
  const addOptions = [
    ...state.incomeTypes.filter((t) => INCOME_ROW_LABELS[t]).map((t) => INCOME_ROW_LABELS[t]),
    "Other income",
  ];

  return (
    <div className="space-y-6">
      <MoneyRows
        idPrefix="income"
        rows={state.monthlyIncome}
        onChange={(rows) => update({ monthlyIncome: rows })}
        addOptions={addOptions}
      />

      {notWorking && total === 0 && (
        <p className="rounded-xl bg-accent/60 p-4 text-sm">
          No income right now is OK. It can qualify you for a pause in IRS collection, and we&apos;ll look at that with you.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="pay-frequency" label="How often are you paid?">
          <select
            id="pay-frequency"
            value={state.household.payFrequency}
            onChange={(e) => update({ household: { ...state.household, payFrequency: e.target.value } })}
            className={cn(selectClass, "w-full")}
          >
            {PAY_FREQUENCIES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </Field>
        <Field
          id="household-size"
          label="How many people live in your home?"
          hint="Including you. The IRS allows more for living costs in bigger households."
        >
          <input
            id="household-size"
            type="number"
            inputMode="numeric"
            min={1}
            max={12}
            value={state.household.size}
            onChange={(e) =>
              update({ household: { ...state.household, size: Math.min(12, Math.max(1, Math.round(Number(e.target.value)) || 1)) } })
            }
            className={inputClass}
          />
        </Field>
      </div>

      <MoneyTotal label="Coming in each month" amount={total} />
    </div>
  );
}
