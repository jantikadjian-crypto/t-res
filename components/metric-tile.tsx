import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// PLCY metric tile: coloured icon + label, big value, one-line caption.
// With `href`, the whole tile opens what it describes.
export function MetricTile({
  icon: Icon,
  iconClass,
  label,
  value,
  caption,
  href,
  children,
}: {
  icon: LucideIcon;
  iconClass: string;
  label: string;
  value: string;
  caption: string;
  href?: string;
  children?: React.ReactNode;
}) {
  const card = (
    <Card
      className={cn(
        "gap-3",
        href && "h-full transition-[box-shadow,border-color] group-hover/tile:border-foreground/20 group-hover/tile:shadow-md"
      )}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Icon className={cn("size-4", iconClass)} aria-hidden />
          {label}
          {href && (
            <ArrowRight
              className="ml-auto size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover/tile:opacity-100 group-focus-visible/tile:opacity-100"
              aria-hidden
            />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tabular-nums">{value}</div>
        <p className="mt-0.5 text-xs text-muted-foreground">{caption}</p>
        {children}
      </CardContent>
    </Card>
  );

  if (!href) return card;
  return (
    <Link href={href} className="group/tile block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
      {card}
    </Link>
  );
}
