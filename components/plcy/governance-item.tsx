"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Clock, FileText, Route, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCase } from "@/components/case-provider";
import { Field, textareaClass } from "@/components/form";
import { LinkButton } from "@/components/link-button";
import { PageHeader } from "@/components/page-header";
import { governanceStatus, outcomeTone, policyFor } from "@/components/plcy/governance-meta";
import { StatusBadge } from "@/components/status";
import { formatDate } from "@/lib/format";
import { enrolledAgent, type GovernanceItem } from "@/lib/mockData";

// One AI action to review: what the AI did, the checks, the evidence, the audit trail, and the decision.
// Shared by PLCY (/plcy/[id], Jordan's items) and T-Res Pro (/pro/approvals/[id], every client).
export function ReviewView({
  item,
  client,
  back,
  result,
  onApprove,
  onRequestChanges,
  onUndo,
}: {
  item: GovernanceItem;
  client?: { name: string; href: string };
  back: { href: string; label: string };
  result: { href: string; label: string };
  onApprove: () => void;
  onRequestChanges: (note: string) => void;
  onUndo: () => void;
}) {
  const [changing, setChanging] = useState(false);
  const [note, setNote] = useState("");

  const policy = policyFor(item.policyId);
  const passed = item.checks.filter((c) => c.passed).length;
  const waitingOn = item.checks.filter((c) => !c.passed);
  const pct = Math.round(item.confidence * 100);
  const status = governanceStatus[item.status];
  const sameDay = item.status === "pending" && policy?.outcome === "Same-day EA";

  const trail = [
    { date: item.createdOn, label: `Produced by ${item.producedBy} (confidence ${pct}%)` },
    { date: item.createdOn, label: `${passed} of ${item.checks.length} automated checks passed` },
    {
      date: item.createdOn,
      label:
        item.status === "auto-approved"
          ? `Auto-approved by the policy "${policy?.name}"`
          : `Routed to ${enrolledAgent.name} by the policy "${policy?.name}"`,
    },
    ...(item.status === "approved" && item.decidedOn ? [{ date: item.decidedOn, label: `Approved by ${enrolledAgent.name}` }] : []),
    ...(item.status === "changes-requested" && item.decidedOn
      ? [{ date: item.decidedOn, label: `${enrolledAgent.name} asked for changes: "${item.note}"` }]
      : []),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={item.title}
        description={`${client ? `${client.name} · ` : ""}${item.kind} · produced by ${item.producedBy} · ${formatDate(item.createdOn)}`}
        actions={
          <>
            <LinkButton href={back.href} variant="outline">
              <ArrowLeft aria-hidden />
              {back.label}
            </LinkButton>
            {client && (
              <LinkButton href={client.href} variant="outline">
                {client.name}
              </LinkButton>
            )}
          </>
        }
      />

      {policy &&
        (sameDay ? (
          <div role="alert" className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center">
            <div className="flex flex-1 gap-3">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden />
              <p>
                <span className="font-medium text-red-900">Same day: routed to you by your policy &ldquo;{policy.name}&rdquo;.</span>{" "}
                {policy.rule}
              </p>
            </div>
            <Button size="sm" className="w-fit" onClick={() => document.getElementById("decision")?.scrollIntoView({ behavior: "smooth" })}>
              Decide now
            </Button>
          </div>
        ) : (
          <div className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
            <Route className="mt-0.5 size-4 shrink-0 text-blue-600" aria-hidden />
            <p>
              <span className="font-medium text-blue-900">
                {item.status === "auto-approved" ? "Auto-approved" : "Routed to you"} by your policy &ldquo;{policy.name}&rdquo;.
              </span>{" "}
              {policy.rule}
            </p>
          </div>
        ))}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>What the AI did</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">{item.summary}</p>
              {item.output && (
                <div className="rounded-lg border bg-background p-4 font-serif text-sm leading-relaxed whitespace-pre-line">
                  {item.output}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Automated checks</CardTitle>
              <CardDescription>
                {passed} of {item.checks.length} passed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5">
                {item.checks.map((c) => (
                  <li key={c.label} className="flex gap-2 text-sm">
                    {c.passed ? (
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" aria-hidden />
                    ) : (
                      <Clock className="mt-0.5 size-4 shrink-0 text-yellow-600" aria-hidden />
                    )}
                    <span className={c.passed ? undefined : "text-yellow-800"}>
                      {c.label}
                      {!c.passed && " (not yet)"}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Audit trail</CardTitle>
              <CardDescription>Kept as evidence that every AI action was supervised</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {trail.map((t) => (
                  <li key={t.label} className="flex gap-3 text-sm">
                    <span className="w-24 shrink-0 text-xs text-muted-foreground">{formatDate(t.date)}</span>
                    <span>{t.label}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card id="decision">
            <CardHeader className="border-b">
              <CardTitle>Decision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                  <span>AI confidence</span>
                  <span className="tabular-nums">{pct}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
              </div>
              {policy && (
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">Policy outcome</span>
                  <StatusBadge tone={outcomeTone[policy.outcome]}>{policy.outcome}</StatusBadge>
                </div>
              )}

              {item.status === "pending" ? (
                <div className="space-y-3">
                  {item.eaMinutes && <p className="text-sm text-muted-foreground">About {item.eaMinutes} min to review.</p>}
                  {waitingOn.length > 0 && (
                    <p className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                      Still waiting on: {waitingOn.map((c) => c.label).join("; ")}. If you approve now, it goes out as soon as
                      that&apos;s done.
                    </p>
                  )}
                  {changing ? (
                    <div className="space-y-3">
                      <Field id="plcy-change-note" label="What should change?">
                        <textarea
                          id="plcy-change-note"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          rows={3}
                          className={textareaClass}
                        />
                      </Field>
                      <div className="flex flex-wrap gap-2">
                        <Button disabled={!note.trim()} onClick={() => onRequestChanges(note.trim())}>
                          Send back to T-Res
                        </Button>
                        <Button variant="ghost" onClick={() => setChanging(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      <Button onClick={onApprove}>
                        <CheckCircle2 aria-hidden />
                        {item.approveLabel ?? "Approve"}
                      </Button>
                      <Button variant="outline" onClick={() => setChanging(true)}>
                        Request changes
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                    {item.decidedOn && <span className="text-xs text-muted-foreground">{formatDate(item.decidedOn)}</span>}
                  </div>
                  {item.status === "changes-requested" && item.note && (
                    <p className="text-sm text-muted-foreground">&ldquo;{item.note}&rdquo;</p>
                  )}
                  {item.status === "auto-approved" && (
                    <p className="text-sm text-muted-foreground">No action needed. It&apos;s on the record if you want to check it.</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <LinkButton href={result.href} variant="outline" size="sm">
                      {result.label}
                      <ArrowRight aria-hidden />
                    </LinkButton>
                    {(item.status === "approved" || item.status === "changes-requested") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          onUndo();
                          setChanging(false);
                          setNote("");
                        }}
                      >
                        <Undo2 aria-hidden />
                        Undo (demo)
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Evidence</CardTitle>
              <CardDescription>What the AI worked from, in {client ? `${client.name.split(/\s+/)[0]}'s` : "the"} case file</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <ul className="divide-y">
                {item.evidence.map((e) => (
                  <li key={e.label}>
                    <Link
                      href={e.href}
                      className="flex items-center gap-2 px-6 py-2.5 text-sm outline-none first:pt-0 hover:text-primary focus-visible:bg-accent"
                    >
                      <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                      <span className="flex-1">{e.label}</span>
                      <ArrowRight className="size-4 shrink-0" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// PLCY's review of one of Jordan's AI actions (the governance console).
export function GovernanceItemView({ id }: { id: string }) {
  const { governance, decideGovernance, undoGovernance } = useCase();
  const item = governance.find((g) => g.id === id);

  if (!item) {
    return (
      <PageHeader
        title="Not in this workspace"
        description="We couldn't find that AI action."
        actions={
          <LinkButton href="/plcy" variant="outline">
            <ArrowLeft aria-hidden />
            Approvals
          </LinkButton>
        }
      />
    );
  }

  return (
    <ReviewView
      item={item}
      back={{ href: "/plcy", label: "Approvals" }}
      result={{ href: item.resultHref, label: "See it in T-Res" }}
      onApprove={() => decideGovernance(item.id, "approved")}
      onRequestChanges={(note) => decideGovernance(item.id, "changes-requested", note)}
      onUndo={() => undoGovernance(item.id)}
    />
  );
}
