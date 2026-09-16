"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BellRing, CheckCircle2, FileText, MessageSquare, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { textareaClass } from "@/components/form";
import { useCase } from "@/components/case-provider";
import { LinkButton } from "@/components/link-button";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status";
import { daysAgoLabel, formatDate } from "@/lib/format";
import { enrolledAgent, taxpayer } from "@/lib/mockData";
import { allProDocuments, isWaiting, proDocStatusMeta } from "@/lib/proDocuments";
import { cn } from "@/lib/utils";

const MAX_NOTE = 1000;

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </>
  );
}

// The notes thread on a document, from the professional's side: the client's notes are theirs,
// and anything added here is posted as Chris. The taxpayer sees the same thread on their own page.
function ProDocumentNotes({ caseDocId }: { caseDocId: string }) {
  const { notesFor, addNote } = useCase();
  const notes = [...notesFor(caseDocId)].sort((a, b) => a.date.localeCompare(b.date));
  const [draft, setDraft] = useState("");

  const submit = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    addNote(caseDocId, trimmed.slice(0, MAX_NOTE), "ea");
    setDraft("");
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="size-4 text-primary" aria-hidden />
          Notes
          <span className="rounded-md bg-muted px-1.5 text-xs font-semibold text-muted-foreground tabular-nums">{notes.length}</span>
        </CardTitle>
        <CardDescription>
          Shared with {taxpayer.firstName}. Anything you add here shows on their document page under your name.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {notes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notes yet.</p>
        ) : (
          <ol className="space-y-5" aria-label="Notes">
            {notes.map((note) => {
              const mine = note.author === "ea";
              return (
                <li key={note.id} className="flex gap-3">
                  <span
                    aria-hidden
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold",
                      mine ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200" : "bg-muted text-foreground"
                    )}
                  >
                    {mine
                      ? enrolledAgent.name
                          .split(/\s+/)
                          .map((p) => p[0])
                          .join("")
                          .replace(/[^A-Z]/gi, "")
                          .slice(0, 2)
                      : `${taxpayer.firstName[0]}${taxpayer.lastName[0]}`}
                  </span>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="flex flex-wrap items-baseline gap-x-2 text-sm font-medium">
                      {mine ? `${enrolledAgent.name} (you)` : `${taxpayer.firstName} ${taxpayer.lastName}`}
                      <span className="text-xs font-normal text-muted-foreground">{formatDate(note.date)}</span>
                    </p>
                    <p className="text-sm whitespace-pre-line text-foreground/80">{note.text}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-2">
        <label htmlFor={`pro-note-${caseDocId}`} className="text-sm font-medium">
          Add a note
        </label>
        <textarea
          id={`pro-note-${caseDocId}`}
          rows={3}
          maxLength={MAX_NOTE}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={`e.g. ${taxpayer.firstName}, the DoorDash 1099 is the one we still need. Everything else is in.`}
          className={cn(textareaClass, "bg-background")}
        />
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground tabular-nums">
            {draft.length}/{MAX_NOTE} · Ctrl + Enter to add
          </span>
          <Button onClick={submit} disabled={!draft.trim()}>
            Add note
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export function ProDocumentView({ id }: { id: string }) {
  const { docs } = useCase();
  const [reminded, setReminded] = useState(false);
  const doc = useMemo(() => allProDocuments(docs).find((d) => d.id === id), [docs, id]);

  if (!doc) {
    return (
      <div className="space-y-4">
        <PageHeader title="Document not found" description="It may belong to a client who is no longer on your caseload." />
        <LinkButton href="/pro/documents" variant="outline">
          <ArrowLeft aria-hidden />
          Back to documents
        </LinkButton>
      </div>
    );
  }

  const meta = proDocStatusMeta[doc.status];
  const waiting = isWaiting(doc);

  return (
    <div className="space-y-6">
      <PageHeader
        title={doc.name}
        description={`${doc.client} · ${doc.source === "Client" ? "Sent by the client" : doc.source === "IRS" ? "Pulled from the IRS" : "Prepared by T-Res"} · ${daysAgoLabel(doc.addedOn)}`}
        actions={
          <>
            <LinkButton href={`/pro/clients/${doc.clientId}`} variant="outline">
              <UserRound aria-hidden />
              Open {doc.client.split(" ")[0]}
            </LinkButton>
            <LinkButton href="/pro/documents" variant="ghost">
              <ArrowLeft aria-hidden />
              All documents
            </LinkButton>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {waiting && (
            <div className={cn("flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center", doc.status === "waiting-signature" ? "border-red-200 bg-red-50" : "border-yellow-200 bg-yellow-50")}>
              <BellRing
                className={cn("size-5 shrink-0", doc.status === "waiting-signature" ? "text-red-600" : "text-yellow-600")}
                aria-hidden
              />
              <p className={cn("flex-1 text-sm", doc.status === "waiting-signature" ? "text-red-800" : "text-yellow-800")}>
                <span className="font-medium">
                  {doc.status === "waiting-signature"
                    ? `Waiting on ${doc.client.split(" ")[0]} to sign.`
                    : doc.status === "draft"
                      ? `${doc.client.split(" ")[0]} is reviewing this draft.`
                      : `Asked ${doc.client.split(" ")[0]} for this on ${formatDate(doc.addedOn)}.`}
                </span>{" "}
                {doc.why ?? "Nothing files until it's in."}
              </p>
              {reminded ? (
                <p role="status" className="flex items-center gap-2 text-sm font-medium text-green-700">
                  <CheckCircle2 className="size-4" aria-hidden />
                  Reminder sent
                </p>
              ) : (
                <Button variant="outline" className="bg-white" onClick={() => setReminded(true)}>
                  Send a reminder
                </Button>
              )}
            </div>
          )}

          <Card>
            <CardHeader className="border-b">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="size-4 text-muted-foreground" aria-hidden />
                  About this document
                </CardTitle>
                <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
              </div>
              {doc.summary && <CardDescription>{doc.summary}</CardDescription>}
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)] gap-x-4 gap-y-3 text-sm">
                <DetailRow label="Client">
                  <Link href={`/pro/clients/${doc.clientId}`} className="text-primary hover:underline">
                    {doc.client}
                  </Link>
                </DetailRow>
                <DetailRow label="Source">
                  {doc.source === "Client" ? "The client" : doc.source === "IRS" ? "IRS records" : "T-Res"}
                </DetailRow>
                <DetailRow label={waiting ? "Requested" : "Added"}>
                  {formatDate(doc.addedOn)} · {daysAgoLabel(doc.addedOn)}
                </DetailRow>
                {doc.category && <DetailRow label="Category">{doc.category}</DetailRow>}
                {doc.taxYear && <DetailRow label="Tax year">{doc.taxYear}</DetailRow>}
              </dl>
            </CardContent>
          </Card>

          {doc.caseDocId ? (
            <ProDocumentNotes caseDocId={doc.caseDocId} />
          ) : (
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="size-4 text-muted-foreground" aria-hidden />
                  Notes
                </CardTitle>
                <CardDescription>
                  Notes are shared with the client on their own document page. In this demo only {taxpayer.firstName}
                  &apos;s case is live, so their documents are the ones you can write on.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>

        <Card className="self-start">
          <CardHeader className="border-b">
            <CardTitle>What happens next</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              {doc.status === "waiting-signature"
                ? "T-Res chases the signature and tells you when it lands. Nothing goes to the IRS until it does."
                : doc.status === "waiting-upload"
                  ? "T-Res reminds the client, checks what arrives, and only brings it to you if something looks wrong."
                  : doc.status === "draft"
                    ? "The client is reading the draft. Their answer comes back to your queue."
                    : doc.status === "in-review"
                      ? "T-Res is checking this against the case before it files anything."
                      : "Nothing to do. It's filed with the case and the IRS record."}
            </p>
            <p>Every check T-Res runs on this document is written to the governance log.</p>
            <LinkButton href="/plcy" variant="outline" className="w-full">
              Open the governance log
            </LinkButton>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
