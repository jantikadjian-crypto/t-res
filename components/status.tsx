import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/mockData";

// The one status system: every status in the app is a dot, a badge, or both.
const toneStyles: Record<Tone, { dot: string; badge: string }> = {
  good: { dot: "bg-good", badge: "bg-good-soft text-good" },
  warn: { dot: "bg-warn", badge: "bg-warn-soft text-warn" },
  bad: { dot: "bg-bad", badge: "bg-bad-soft text-bad" },
  neutral: { dot: "bg-muted-foreground/50", badge: "bg-muted text-muted-foreground" },
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
    <Badge variant="outline" className={cn("border-transparent", toneStyles[tone].badge, className)}>
      <StatusDot tone={tone} className="size-1.5" />
      {children}
    </Badge>
  );
}
