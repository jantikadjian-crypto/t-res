"use client";

import { useState } from "react";
import Link from "next/link";
import { Camera, CheckCircle2, FileCheck, FileUp, PenLine, Upload, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCase } from "@/components/case-provider";
import { EAReviewedBadge } from "@/components/ea-reviewed-badge";
import { LinkButton } from "@/components/link-button";
import { StatusBadge } from "@/components/status";
import { daysRemainingLabel, deadlineTone, formatDate } from "@/lib/format";
import {
  caseStages,
  currentStageIndex,
  MOCK_TODAY,
  notices,
  type ActionItem,
  type ActionItemType,
} from "@/lib/mockData";

const typeMeta: Record<ActionItemType, { icon: LucideIcon; label: string }> = {
  sign: { icon: PenLine, label: "Signature" },
  upload: { icon: Upload, label: "Upload" },
  "approve-letter": { icon: FileCheck, label: "Approval" },
};

const nextStage = caseStages[currentStageIndex + 1];

const sizeKb = (file: File) => Math.max(1, Math.round(file.size / 1024));

function RelatedLink({ item }: { item: ActionItem }) {
  const notice = item.relatedNoticeId ? notices.find((n) => n.id === item.relatedNoticeId) : undefined;
  if (notice) {
    return (
      <Link href={`/notices/${notice.id}`} className="text-xs text-primary hover:underline">
        About your {notice.code}
      </Link>
    );
  }
  if (item.relatedTaxYear) {
    return (
      <Link href={`/tax-years/${item.relatedTaxYear}`} className="text-xs text-primary hover:underline">
        {item.relatedTaxYear} tax year
      </Link>
    );
  }
  return null;
}

export function ActionQueue() {
  const { actions, docs, signatures, completeAction } = useCase();
  const [openLetter, setOpenLetter] = useState<string | null>(null);

  const todo = actions.filter((i) => !i.done).sort((a, b) => a.dueBy.localeCompare(b.dueBy));
  const done = actions
    .filter((i) => i.done)
    .sort((a, b) => (b.completedOn ?? "").localeCompare(a.completedOn ?? ""));
  const pct = Math.round((done.length / actions.length) * 100);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl space-y-1">
              <h2 className="text-base font-medium">Your case moves when these are done</h2>
              <p className="text-sm text-muted-foreground" aria-live="polite">
                {todo.length
                  ? `Finish the ${todo.length} below and Chris moves your case to ${nextStage.label}: ${nextStage.description.toLowerCase()}`
                  : `All done. Chris is moving your case to ${nextStage.label}.`}
              </p>
            </div>
            <div className="text-2xl font-bold tabular-nums">
              {done.length} <span className="text-base font-normal text-muted-foreground">of {actions.length} done</span>
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-secondary">
            <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">To do · {todo.length}</h2>
        {todo.length === 0 && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            Nothing waiting on you. We&apos;ll add new items here if the IRS asks for anything else.
          </div>
        )}
        <ul className="space-y-3">
          {todo.map((item) => {
            const { icon: Icon, label } = typeMeta[item.type];
            const letterOpen = openLetter === item.id;
            // Signing goes through the secure Sign flow when there's a document to sign.
            const signDoc = docs.find((d) => d.relatedActionId === item.id && d.status === "needs-signature");
            return (
              <li key={item.id} className="rounded-xl border bg-card p-4">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.why}</p>
                      {item.uploadHint && <p className="mt-1 text-xs text-muted-foreground">{item.uploadHint}</p>}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <StatusBadge tone={deadlineTone(item.dueBy)}>
                        Due {formatDate(item.dueBy)} · {daysRemainingLabel(item.dueBy)}
                      </StatusBadge>
                      <RelatedLink item={item} />
                    </div>

                    {item.type === "approve-letter" && letterOpen && item.letterPreview && (
                      <div className="space-y-3 pt-2">
                        <div className="rounded-lg border bg-background p-4 font-serif text-sm leading-relaxed whitespace-pre-line">
                          {item.letterPreview}
                        </div>
                        <EAReviewedBadge />
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-wrap items-start gap-2 sm:flex-col sm:items-stretch">
                    {item.type === "sign" &&
                      (signDoc ? (
                        <LinkButton href={`/sign/${signDoc.id}`}>
                          <PenLine aria-hidden />
                          Sign now
                        </LinkButton>
                      ) : (
                        <Button onClick={() => completeAction(item.id)}>
                          <PenLine aria-hidden />
                          Sign now
                        </Button>
                      ))}
                    {item.type === "upload" && (
                      <>
                        <input
                          id={`upload-${item.id}`}
                          type="file"
                          accept="application/pdf,image/*"
                          multiple
                          className="sr-only"
                          onChange={(e) => {
                            const files = e.target.files;
                            if (files?.length) {
                              const total = Array.from(files).reduce((s, f) => s + sizeKb(f), 0);
                              completeAction(item.id, {
                                name: files.length > 1 ? `${files.length} files` : files[0].name,
                                sizeKb: total,
                              });
                            }
                          }}
                        />
                        <input
                          id={`camera-${item.id}`}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="sr-only"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) completeAction(item.id, { name: file.name, sizeKb: sizeKb(file) });
                          }}
                        />
                        <Button onClick={() => document.getElementById(`upload-${item.id}`)?.click()}>
                          <FileUp aria-hidden />
                          Upload files
                        </Button>
                        {/* Only on phones and tablets, where it opens the camera. */}
                        <span className="hidden pointer-coarse:contents">
                          <Button variant="outline" onClick={() => document.getElementById(`camera-${item.id}`)?.click()}>
                            <Camera aria-hidden />
                            Take a photo
                          </Button>
                        </span>
                      </>
                    )}
                    {item.type === "approve-letter" &&
                      (letterOpen ? (
                        <Button onClick={() => completeAction(item.id)}>
                          <CheckCircle2 aria-hidden />
                          Approve letter
                        </Button>
                      ) : (
                        <Button variant="outline" onClick={() => setOpenLetter(item.id)}>
                          <FileCheck aria-hidden />
                          Read the letter
                        </Button>
                      ))}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Done · {done.length}</h2>
        <Card className="py-0">
          <ul className="divide-y">
            {done.map((item) => {
              const signedDoc = docs.find((d) => d.relatedActionId === item.id && signatures[d.id]);
              return (
                <li key={item.id} className="flex items-start gap-3 px-6 py-4">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-3">
                      <p className="text-sm font-medium">{item.title}</p>
                      <RelatedLink item={item} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Completed {formatDate(item.completedOn ?? MOCK_TODAY)}
                      {item.uploadedFile && ` · ${item.uploadedFile} · we're reviewing it`}
                      {signedDoc && (
                        <>
                          {" · signed electronically · "}
                          <Link href={`/documents/${signedDoc.id}`} className="text-primary hover:underline">
                            View certificate
                          </Link>
                        </>
                      )}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </section>
    </div>
  );
}
