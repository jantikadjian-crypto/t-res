"use client";

import Link from "next/link";
import { CheckCircle2, Circle, Timer, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/link-button";
import { kindLabel, tierOf, tierTone, type QueueRow } from "@/components/pro/use-pro-workspace";
import { StatusBadge, StatusDot } from "@/components/status";
import { daysRemainingLabel, deadlineTone, formatDate, minutesLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

// One item in the professional's queue: what it is, why it's here, how long it takes, and one button.
// Fictional clients' items open in place with their preview and action; Jordan's open the real PLCY review.
export function QueueRowItem({
  row,
  open,
  onToggle,
  onDone,
  showClient = true,
}: {
  row: QueueRow;
  open: boolean;
  onToggle: () => void;
  onDone: () => void;
  showClient?: boolean;
}) {
  const tier = tierOf(row);
  return (
    <li id={`queue-${row.id}`} data-queue-row={row.id} className="scroll-mt-24 px-6 py-4 first:pt-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <StatusDot tone={tierTone(tier)} className="mt-2 hidden sm:inline-block" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="text-sm">
            {showClient && (
              <>
                {row.clientId ? (
                  <Link href={`/pro/clients/${row.clientId}`} className="font-medium hover:text-primary hover:underline">
                    {row.client}
                  </Link>
                ) : (
                  <span className="font-medium">Across clients</span>
                )}
                {" · "}
              </>
            )}
            {row.title}
          </p>
          <p className="text-xs text-muted-foreground">{row.why}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={cn(tier === 0 && "border-red-200 bg-red-50 text-red-600")}>
              {kindLabel[row.kind]}
            </Badge>
            {row.deadline && (
              <StatusBadge tone={deadlineTone(row.deadline)}>
                Due {formatDate(row.deadline)} · {daysRemainingLabel(row.deadline)}
              </StatusBadge>
            )}
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Timer className="size-3" aria-hidden />
              {minutesLabel(row.minutes)}
            </span>
          </div>
        </div>
        {row.href ? (
          <LinkButton href={row.href} size="sm" className="w-fit">
            {row.cta}
          </LinkButton>
        ) : (
          <Button
            size="sm"
            variant={open ? "secondary" : "default"}
            className="w-fit"
            aria-expanded={open}
            aria-controls={`queue-${row.id}-preview`}
            onClick={onToggle}
          >
            {row.cta}
          </Button>
        )}
      </div>
      {open && row.preview && (
        <div id={`queue-${row.id}-preview`} className="mt-3 space-y-3 rounded-lg bg-accent/50 p-4 text-sm sm:ml-5">
          <p>{row.preview.summary}</p>
          <ul className="space-y-1.5">
            {row.preview.points.map((p) => (
              <li key={p.label} className="flex gap-2">
                {p.ok === true ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" aria-hidden />
                ) : p.ok === false ? (
                  <XCircle className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden />
                ) : (
                  <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                )}
                <span className={cn(p.ok === false && "font-medium text-red-700")}>{p.label}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={onDone}>
              <CheckCircle2 aria-hidden />
              {row.preview.doneLabel}
            </Button>
            <Button size="sm" variant="ghost" onClick={onToggle}>
              Not now
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}
