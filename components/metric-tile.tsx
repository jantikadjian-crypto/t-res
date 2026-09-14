import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// PLCY metric tile: coloured icon + label, big value, one-line caption.
export function MetricTile({
  icon: Icon,
  iconClass,
  label,
  value,
  caption,
  children,
}: {
  icon: LucideIcon;
  iconClass: string;
  label: string;
  value: string;
  caption: string;
  children?: React.ReactNode;
}) {
  return (
    <Card className="gap-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Icon className={cn("size-4", iconClass)} aria-hidden />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tabular-nums">{value}</div>
        <p className="mt-0.5 text-xs text-muted-foreground">{caption}</p>
        {children}
      </CardContent>
    </Card>
  );
}
