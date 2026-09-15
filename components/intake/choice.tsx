"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Big tap-target answer cards: one question per screen, answers as cards.
export function ChoiceGroup({
  label,
  multiple = false,
  className,
  children,
}: {
  label: string;
  multiple?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div role={multiple ? "group" : "radiogroup"} aria-label={label} className={cn("space-y-3", className)}>
      {children}
    </div>
  );
}

export function ChoiceCard({
  checked,
  onClick,
  title,
  description,
  multiple = false,
  danger = false,
}: {
  checked: boolean;
  onClick: () => void;
  title: string;
  description?: string;
  multiple?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role={multiple ? "checkbox" : "radio"}
      aria-checked={checked}
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border bg-card p-4 text-left transition-colors outline-none hover:border-foreground/25 focus-visible:ring-3 focus-visible:ring-ring/50",
        checked && !danger && "border-primary ring-1 ring-primary hover:border-primary",
        checked && danger && "border-red-500 bg-red-50/60 ring-1 ring-red-500 hover:border-red-500"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "mt-0.5 grid size-5 shrink-0 place-items-center border",
          multiple ? "rounded-md" : "rounded-full",
          checked
            ? danger
              ? "border-red-600 bg-red-600 text-white"
              : "border-primary bg-primary text-primary-foreground"
            : "border-foreground/25 bg-background"
        )}
      >
        {checked && (multiple ? <Check className="size-3.5" /> : <span className="size-2 rounded-full bg-white" />)}
      </span>
      <span className="min-w-0">
        <span className={cn("block font-medium", danger && "text-red-900")}>{title}</span>
        {description && <span className="mt-0.5 block text-sm text-muted-foreground">{description}</span>}
      </span>
    </button>
  );
}
