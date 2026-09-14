import { BadgeCheck } from "lucide-react";
import { enrolledAgent } from "@/lib/mockData";
import { cn } from "@/lib/utils";

// Required on every AI-generated output. Trust is the product.
export function EAReviewedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary",
        className
      )}
    >
      <BadgeCheck className="size-3.5" aria-hidden />
      EA-Reviewed by {enrolledAgent.name}, {enrolledAgent.credential}
    </span>
  );
}
