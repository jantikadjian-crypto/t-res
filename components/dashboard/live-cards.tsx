"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, FileCheck, ListChecks, PenLine, Upload, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useCase } from "@/components/case-provider";
import { LinkButton } from "@/components/link-button";
import { MetricTile } from "@/components/metric-tile";
import { StatusBadge } from "@/components/status";
import { daysRemainingLabel, deadlineTone, formatDate } from "@/lib/format";
import { enrolledAgent, nextNotice, type ActionItemType } from "@/lib/mockData";

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

// The most urgent notice, and the one thing that moves it forward right now.
export function UrgencyBanner() {
  const { actions, docs } = useCase();
  const next = actions
    .filter((a) => a.relatedNoticeId === nextNotice.id && !a.done)
    .sort((a, b) => a.dueBy.localeCompare(b.dueBy))[0];
  const deadline = `${formatDate(nextNotice.respondBy)} · ${daysRemainingLabel(nextNotice.respondBy)}`;

  if (!next) {
    return (
      <div role="status" className="flex flex-col gap-4 rounded-xl border border-green-200 bg-green-50 p-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 gap-3">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600" aria-hidden />
          <div>
            <p className="font-medium text-green-900">Your {nextNotice.code} response is ready to send</p>
            <p className="mt-1 text-sm text-green-800">
              Nothing else is needed from you on this notice. {enrolledAgent.name} will send it before {deadline}.
            </p>
          </div>
        </div>
        <LinkButton href={`/notices/${nextNotice.id}`} variant="outline" className="ml-8 w-fit border-green-300 bg-white sm:ml-0">
          See the notice
        </LinkButton>
      </div>
    );
  }

  const signDoc = docs.find((d) => d.relatedActionId === next.id && d.status === "needs-signature");
  const cta =
    next.type === "sign"
      ? { href: signDoc ? `/sign/${signDoc.id}` : "/action-items", label: "Sign now" }
      : { href: "/action-items", label: "Review the letter" };

  return (
    <div role="alert" className="flex flex-col gap-4 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center">
      <div className="flex flex-1 gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-600" aria-hidden />
        <div>
          <p className="font-medium text-red-900">
            Respond to your {nextNotice.code} by {deadline}
          </p>
          <p className="mt-1 text-sm text-red-800">
            {nextNotice.plainTitle}. This is fixable:{" "}
            {next.type === "sign"
              ? "we've drafted your response and just need your signature to send it."
              : `your Form 2848 is signed. Approve the response letter we drafted so ${enrolledAgent.name} can send it.`}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2 pl-8 sm:pl-0">
        <LinkButton
          href={`/notices/${nextNotice.id}`}
          variant="outline"
          className="border-red-200 bg-white text-red-700 hover:bg-red-100 hover:text-red-800"
        >
          What this means
        </LinkButton>
        <LinkButton href={cta.href} className="bg-red-600 text-white hover:bg-red-700">
          {cta.label}
          <ArrowRight aria-hidden />
        </LinkButton>
      </div>
    </div>
  );
}

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
