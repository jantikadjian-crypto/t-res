"use client";

import { BadgeCheck, Clock, ShieldCheck } from "lucide-react";
import { useCase } from "@/components/case-provider";
import { formatDate } from "@/lib/format";
import { enrolledAgent } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const chip = "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium [&>svg]:size-3.5";

// Tiered review badge for AI work governed by PLCY:
// "Checked by T-Res" (automated checks under rules Chris approved), then "Approved by Chris" once he signs off.
export function GovernanceBadge({ itemId, className }: { itemId: string; className?: string }) {
  const { governance } = useCase();
  const item = governance.find((g) => g.id === itemId);
  if (!item) return null;
  // Count only checks on the AI's work. Waiting for a signature isn't a failed check, so the taxpayer doesn't see one.
  const quality = item.checks.filter((c) => !c.signedDocId);
  const passed = quality.filter((c) => c.passed).length;

  return (
    <span className={cn("inline-flex flex-wrap items-center gap-1.5", className)}>
      {item.status === "approved" ? (
        <span className={cn(chip, "border-blue-200 bg-blue-50 text-blue-700")}>
          <BadgeCheck aria-hidden />
          Approved by {enrolledAgent.name}, {enrolledAgent.credential}
          {item.decidedOn && ` · ${formatDate(item.decidedOn)}`}
        </span>
      ) : (
        <span
          className={cn(chip, "border-slate-200 bg-slate-50 text-slate-700")}
          title="Automated checks run under rules Chris approved. Governed by PLCY."
        >
          <ShieldCheck aria-hidden />
          Checked by T-Res · {passed} of {quality.length} checks passed
        </span>
      )}
      {item.status === "pending" && (
        <span className={cn(chip, "border-yellow-200 bg-yellow-50 text-yellow-700")}>
          <Clock aria-hidden />
          Waiting for {enrolledAgent.name}&apos;s approval
        </span>
      )}
      {item.status === "changes-requested" && (
        <span className={cn(chip, "border-yellow-200 bg-yellow-50 text-yellow-700")}>
          <Clock aria-hidden />
          {enrolledAgent.name} asked for a change. We&apos;re updating it.
        </span>
      )}
    </span>
  );
}
