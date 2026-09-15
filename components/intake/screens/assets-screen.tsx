"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/form";
import { useIntake } from "@/components/intake/intake-provider";
import { MoneyInput, MoneyTotal } from "@/components/intake/money-fields";
import { formatMoney } from "@/lib/format";
import type { AssetKind, AssetRow } from "@/lib/mockData";

const KINDS: { kind: AssetKind; add: string; defaultLabel: string; hasLoan: boolean; valueLabel: string }[] = [
  { kind: "bank", add: "Bank account", defaultLabel: "Bank account", hasLoan: false, valueLabel: "Balance today" },
  { kind: "vehicle", add: "Vehicle", defaultLabel: "Vehicle (year, make, model)", hasLoan: true, valueLabel: "What it's worth" },
  { kind: "retirement", add: "Retirement account", defaultLabel: "401(k) or IRA", hasLoan: false, valueLabel: "Balance today" },
  { kind: "home", add: "Home", defaultLabel: "Home", hasLoan: true, valueLabel: "What it's worth" },
  { kind: "other", add: "Something else", defaultLabel: "Other", hasLoan: true, valueLabel: "What it's worth" },
];

const kindMeta = (kind: AssetKind) => KINDS.find((k) => k.kind === kind) ?? KINDS[KINDS.length - 1];
const equity = (a: AssetRow) => Math.max(0, a.value - a.owed);

export function AssetsScreen() {
  const { state, update } = useIntake();
  const assets = state.assets;
  const set = (i: number, patch: Partial<AssetRow>) =>
    update({ assets: assets.map((a, j) => (j === i ? { ...a, ...patch } : a)) });
  const total = assets.reduce((s, a) => s + equity(a), 0);

  return (
    <div className="space-y-6">
      {assets.length === 0 ? (
        <p className="rounded-xl border border-dashed bg-card p-4 text-sm text-muted-foreground">
          Nothing to add? That&apos;s fine. Pick anything below that applies.
        </p>
      ) : (
        <ul className="space-y-3">
          {assets.map((a, i) => {
            const meta = kindMeta(a.kind);
            return (
              <li key={i} className="space-y-3 rounded-xl border bg-card p-4">
                <div className="flex items-center gap-2">
                  <span className="shrink-0 rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {meta.add}
                  </span>
                  <label htmlFor={`asset-${i}-label`} className="sr-only">
                    Describe it
                  </label>
                  <input
                    id={`asset-${i}-label`}
                    value={a.label}
                    onChange={(e) => set(i, { label: e.target.value })}
                    placeholder={meta.defaultLabel}
                    className={`${inputClass} min-w-0 flex-1 bg-transparent px-1 font-medium`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => update({ assets: assets.filter((_, j) => j !== i) })}
                    aria-label={`Remove ${a.label || meta.add}`}
                  >
                    <Trash2 aria-hidden />
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field id={`asset-${i}-value`} label={meta.valueLabel}>
                    <MoneyInput
                      id={`asset-${i}-value`}
                      label={`${a.label}: ${meta.valueLabel.toLowerCase()}`}
                      value={a.value}
                      onChange={(value) => set(i, { value })}
                      suffix=""
                    />
                  </Field>
                  {meta.hasLoan && (
                    <Field id={`asset-${i}-owed`} label="Still owed on it">
                      <MoneyInput
                        id={`asset-${i}-owed`}
                        label={`${a.label}: still owed`}
                        value={a.owed}
                        onChange={(owed) => set(i, { owed })}
                        suffix=""
                      />
                    </Field>
                  )}
                </div>
                {meta.hasLoan && a.value > 0 && (
                  <p className="text-sm text-muted-foreground">
                    You own about <span className="font-medium text-foreground">{formatMoney(equity(a))}</span> of it.
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <Button
            key={k.kind}
            variant="outline"
            size="sm"
            onClick={() => update({ assets: [...assets, { kind: k.kind, label: "", value: 0, owed: 0 }] })}
          >
            <Plus aria-hidden />
            {k.add}
          </Button>
        ))}
      </div>

      <p className="rounded-xl bg-accent/60 p-4 text-sm">
        Owning things is fine. This helps us pick the right option for you. It doesn&apos;t mean anything will be taken.
      </p>

      <MoneyTotal label="What you own outright" amount={total} />
    </div>
  );
}
