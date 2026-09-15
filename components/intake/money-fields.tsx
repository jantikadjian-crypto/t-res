"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { inputClass } from "@/components/form";
import { formatMoney } from "@/lib/format";
import type { MoneyRow } from "@/lib/mockData";
import { cn } from "@/lib/utils";

export const sumAmounts = (rows: { amount: number }[]) => rows.reduce((s, r) => s + (r.amount || 0), 0);

// Whole-dollar amount with a $ prefix and an optional "/mo" suffix. Empty shows as blank, not 0.
export function MoneyInput({
  id,
  label,
  value,
  onChange,
  suffix = "/mo",
  className,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (amount: number) => void;
  suffix?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground" aria-hidden>
        $
      </span>
      <input
        id={id}
        aria-label={label}
        type="number"
        inputMode="decimal"
        min={0}
        step={1}
        placeholder="0"
        value={value || ""}
        onChange={(e) => {
          const n = Number(e.target.value);
          onChange(Number.isFinite(n) && n > 0 ? Math.round(n) : 0);
        }}
        className={cn(inputClass, "pl-7 text-right tabular-nums", suffix && "pr-11")}
      />
      {suffix && (
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground" aria-hidden>
          {suffix}
        </span>
      )}
    </div>
  );
}

// Editable list of monthly amounts (income or costs), with quick-add buttons.
export function MoneyRows({
  idPrefix,
  rows,
  onChange,
  addOptions,
}: {
  idPrefix: string;
  rows: MoneyRow[];
  onChange: (rows: MoneyRow[]) => void;
  addOptions: string[];
}) {
  const set = (i: number, patch: Partial<MoneyRow>) => onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  return (
    <div className="space-y-3">
      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed bg-card p-4 text-sm text-muted-foreground">Nothing added yet.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r, i) => (
            <li key={i} className="flex items-center gap-2 rounded-xl border bg-card p-2 pl-3">
              <label htmlFor={`${idPrefix}-label-${i}`} className="sr-only">
                What it is
              </label>
              <input
                id={`${idPrefix}-label-${i}`}
                value={r.label}
                onChange={(e) => set(i, { label: e.target.value })}
                placeholder="What is it?"
                className={cn(inputClass, "min-w-0 flex-1 bg-transparent px-1 font-medium")}
              />
              <MoneyInput
                id={`${idPrefix}-amount-${i}`}
                label={`${r.label || "Amount"}, per month`}
                value={r.amount}
                onChange={(amount) => set(i, { amount })}
                className="w-32 shrink-0 sm:w-40"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onChange(rows.filter((_, j) => j !== i))}
                aria-label={`Remove ${r.label || "this row"}`}
              >
                <Trash2 aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap gap-2">
        {addOptions.map((o) => (
          <Button key={o} variant="outline" size="sm" onClick={() => onChange([...rows, { label: o, amount: 0 }])}>
            <Plus aria-hidden />
            {o}
          </Button>
        ))}
      </div>
    </div>
  );
}

export function MoneyTotal({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3" aria-live="polite">
      <span className="text-sm font-medium">{label}</span>
      <span className="text-lg font-semibold tabular-nums">{formatMoney(amount)}</span>
    </div>
  );
}
