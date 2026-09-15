"use client";

import { BadgeCheck, Clock, ShieldCheck } from "lucide-react";
import { useCase } from "@/components/case-provider";
import { formatDate } from "@/lib/format";
import { enrolledAgent } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const chip = "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium [&>svg]:size-3.5";

// Every AI output shows who checked it (trust is the product). Two tiers:
// "Checked by T-Res": automated checks under rules Chris approved, governed by PLCY.
// "Approved by Chris": he signed off himself (anything under his name, money recommendations).
// Pass `itemId`, or the `href` of the page the output appears on, to follow its PLCY record live;
// otherwise `tier` sets a static badge (e.g. Library reference content Chris approved once).
export function GovernanceBadge({
  itemId,
  href,
  tier = "checked",
  className,
}: {
  itemId?: string;
  href?: string;
  tier?: "checked" | "approved";
  className?: string;
}) {
  const { governance } = useCase();
  const item = governance.find((g) => (itemId ? g.id === itemId : href !== undefined && g.resultHref === href));
  const status = item?.status ?? (tier === "approved" ? "approved" : "auto-approved");
  // Count only checks on the AI's work. Waiting for a signature isn't a failed check, so the taxpayer doesn't see one.
  const quality = item?.checks.filter((c) => !c.signedDocId) ?? [];
  const passed = quality.filter((c) => c.passed).length;

  return (
    <span className={cn("inline-flex flex-wrap items-center gap-1.5", className)}>
      {status === "approved" ? (
        <span className={cn(chip, "border-blue-200 bg-blue-50 text-blue-700")} title={`${enrolledAgent.name} reviewed and approved this.`}>
          <BadgeCheck aria-hidden />
          Approved by {enrolledAgent.name}, {enrolledAgent.credential}
          {item?.decidedOn && ` · ${formatDate(item.decidedOn)}`}
        </span>
      ) : (
        <span
          className={cn(chip, "border-slate-200 bg-slate-50 text-slate-700")}
          title={`Automated checks run under rules ${enrolledAgent.name} approved. Governed by PLCY.`}
        >
          <ShieldCheck aria-hidden />
          Checked by T-Res
          {quality.length > 0 && ` · ${passed} of ${quality.length} checks passed`}
        </span>
      )}
      {status === "pending" && (
        <span className={cn(chip, "border-yellow-200 bg-yellow-50 text-yellow-700")}>
          <Clock aria-hidden />
          Waiting for {enrolledAgent.name}&apos;s approval
        </span>
      )}
      {status === "changes-requested" && (
        <span className={cn(chip, "border-yellow-200 bg-yellow-50 text-yellow-700")}>
          <Clock aria-hidden />
          {enrolledAgent.name} asked for a change. We&apos;re updating it.
        </span>
      )}
    </span>
  );
}
