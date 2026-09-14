import { BadgeCheck, Clock } from "lucide-react";
import { enrolledAgent } from "@/lib/mockData";
import { cn } from "@/lib/utils";

// Required on every AI-generated output. Trust is the product.
// `pending` is for output generated moments ago that the EA hasn't signed off yet.
export function EAReviewedBadge({ pending = false, className }: { pending?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
        pending ? "border-yellow-200 bg-yellow-50 text-yellow-700" : "border-blue-200 bg-blue-50 text-blue-700",
        className
      )}
    >
      {pending ? <Clock className="size-3.5" aria-hidden /> : <BadgeCheck className="size-3.5" aria-hidden />}
      {pending
        ? `Awaiting review by ${enrolledAgent.name}, usually within 1 business day`
        : `EA-Reviewed by ${enrolledAgent.name}, ${enrolledAgent.credential}`}
    </span>
  );
}
