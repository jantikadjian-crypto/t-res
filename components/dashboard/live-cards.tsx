"use client";

import Link from "next/link";
import { ArrowRight, FileCheck, ListChecks, PenLine, Upload, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useCase } from "@/components/case-provider";
import { LinkButton } from "@/components/link-button";
import { MetricTile } from "@/components/metric-tile";
import { StatusBadge } from "@/components/status";
import { daysRemainingLabel, deadlineTone, formatDate } from "@/lib/format";
import type { ActionItemType } from "@/lib/mockData";

// Dashboard pieces that change as the taxpayer signs, uploads and approves things.

const actionIcons: Record<ActionItemType, LucideIcon> = {
  sign: PenLine,
  upload: Upload,
  "approve-letter": FileCheck,
};

const actionVerb: Record<ActionItemType, string> = {
  sign: "Sign",
  upload: "Upload",
  "approve-letter": "Review",
};

export function ActionItemsTile() {
  const { openActions } = useCase();
  const next = openActions[0];
  return (
    <MetricTile
      icon={ListChecks}
      iconClass="text-purple-600"
      label="Action items"
      value={String(openActions.length)}
      caption={next ? `Waiting on you · next due ${formatDate(next.dueBy)}` : "All done"}
      href="/action-items"
    />
  );
}

export function NextStepsCard() {
  const { actions, openActions, docs } = useCase();
  const doneCount = actions.length - openActions.length;
  const donePct = Math.round((doneCount / actions.length) * 100);

  return (
    <Card className="self-start">
      <CardHeader className="border-b">
        <CardTitle>Your next steps</CardTitle>
        <CardDescription>Your case moves forward when these are done</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Link href="/action-items" className="block rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
            <span>
              {doneCount} of {actions.length} done
            </span>
            <span className="tabular-nums">{donePct}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-secondary">
            <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${donePct}%` }} />
          </div>
        </Link>
        {openActions.length === 0 ? (
          <p className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            Nothing waiting on you right now.
          </p>
        ) : (
          <ul className="space-y-3">
            {openActions.map((a) => {
              const Icon = actionIcons[a.type];
              const signDoc = docs.find((d) => d.relatedActionId === a.id && d.status === "needs-signature");
              const href = signDoc ? `/sign/${signDoc.id}` : "/action-items";
              return (
                <li key={a.id} className="flex gap-3 rounded-lg border p-3 transition-colors hover:border-foreground/20">
                  <span className="grid size-8 shrink-0 place-items-center rounded-md bg-accent">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <Link href={href} className="block text-sm font-medium hover:text-primary hover:underline">
                      {a.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">{a.why}</p>
                    <div className="flex items-center justify-between gap-2">
                      <StatusBadge tone={deadlineTone(a.dueBy)}>{daysRemainingLabel(a.dueBy)}</StatusBadge>
                      <LinkButton href={href} variant="outline" size="xs">
                        {actionVerb[a.type]}
                      </LinkButton>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
      <CardFooter>
        <LinkButton href="/action-items" className="w-full">
          Go to action items
          <ArrowRight aria-hidden />
        </LinkButton>
      </CardFooter>
    </Card>
  );
}
