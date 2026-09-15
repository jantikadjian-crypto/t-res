import { Check, X } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { planFeatures, resolutionPlans } from "@/lib/mockData";
import { cn } from "@/lib/utils";

type ResolutionPlan = (typeof resolutionPlans)[number];

// How a plan is paid, e.g. "or 6 × $275" or "one-time".
export function planPriceNote(p: ResolutionPlan): string {
  return p.installments > 1 ? `or ${p.installments} × ${formatMoney(p.price / p.installments)}` : "one-time";
}

// Every feature, ticked or crossed, so plans compare line by line. Used by Billing & plan and the wizard.
export function PlanFeatureList({
  plan,
  as: Tag = "ul",
  className,
}: {
  plan: ResolutionPlan;
  // "span" when the list sits inside a button (the wizard's plan picker).
  as?: "ul" | "span";
  className?: string;
}) {
  const Item = Tag === "ul" ? "li" : "span";
  return (
    <Tag className={cn("text-sm", className)}>
      {planFeatures.map((f) => {
        const has = plan.features.includes(f);
        return (
          <Item key={f} className={cn("flex gap-2", !has && "text-muted-foreground")}>
            {has ? (
              <Check className="mt-0.5 size-4 shrink-0 text-green-600" aria-hidden />
            ) : (
              <X className="mt-0.5 size-4 shrink-0 text-muted-foreground/50" aria-hidden />
            )}
            <span>
              {f}
              {!has && <span className="sr-only"> (not included)</span>}
            </span>
          </Item>
        );
      })}
    </Tag>
  );
}
