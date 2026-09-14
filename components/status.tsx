import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/mockData";

// The one status system: every status in the app is a dot, a badge, or both.
// Colours follow the PLCY console's priority pills (text-*-600 on *-50 with a *-200 border).
const toneStyles: Record<Tone, { dot: string; badge: string }> = {
  good: { dot: "bg-green-500", badge: "border-green-200 bg-green-50 text-green-700" },
  warn: { dot: "bg-yellow-500", badge: "border-yellow-200 bg-yellow-50 text-yellow-700" },
  bad: { dot: "bg-red-500", badge: "border-red-200 bg-red-50 text-red-600" },
  neutral: { dot: "bg-gray-400", badge: "border-gray-200 bg-gray-50 text-gray-600" },
};

export function StatusDot({ tone, className }: { tone: Tone; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block size-2 shrink-0 rounded-full", toneStyles[tone].dot, className)}
    />
  );
}

export function StatusBadge({
  tone,
  children,
  className,
}: {
  tone: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn(toneStyles[tone].badge, className)}>
      <StatusDot tone={tone} className="size-1.5" />
      {children}
    </Badge>
  );
}
