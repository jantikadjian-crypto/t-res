"use client";

import { useRef } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, FileCheck, FileText, FileUp, PenLine, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCase } from "@/components/case-provider";
import { LinkButton } from "@/components/link-button";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status";
import { documentAction, fileKind, sourceLabel, statusMeta, WAITING_STATUSES } from "@/components/documents/document-meta";
import { DocumentNotes } from "@/components/documents/document-notes";
import { SignatureCertificate } from "@/components/signing/signature-certificate";
import { formatDate, formatFileSize, formatMoney } from "@/lib/format";
import { libraryMatches } from "@/lib/library";
import { actionItems, notices, type CaseDocument, type Notice } from "@/lib/mockData";
import { cn } from "@/lib/utils";

// Faux page: IRS notices get a letterhead with the real code, amount and deadline.
function DocumentPreview({ doc, notice, onUpload }: { doc: CaseDocument; notice?: Notice; onUpload: () => void }) {
  if (doc.status === "requested") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed bg-card p-10 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
          <Upload className="size-6" aria-hidden />
        </span>
        <div>
          <p className="font-medium">Not uploaded yet</p>
          <p className="text-sm text-muted-foreground">A PDF, or a clear photo of every page.</p>
        </div>
        <Button onClick={onUpload}>
          <FileUp aria-hidden />
          Upload file
        </Button>
      </div>
    );
  }

  return (
    <figure className="rounded-xl border bg-muted/40 p-4 sm:p-8">
      <div className="mx-auto w-full max-w-md rounded-sm bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
        {notice ? (
          <>
            <div className="flex items-start justify-between gap-4 border-b pb-3">
              <p className="text-[10px] leading-tight tracking-wide text-muted-foreground uppercase">
                Department of the Treasury
                <br />
                Internal Revenue Service
              </p>
              <p className="font-mono text-sm font-semibold">{notice.code}</p>
            </div>
            <p className="mt-4 text-sm font-semibold">{notice.title}</p>
            <dl className="mt-3 grid grid-cols-2 gap-y-1 text-xs">
              <dt className="text-muted-foreground">Tax year</dt>
              <dd className="text-right tabular-nums">{notice.taxYear}</dd>
              <dt className="text-muted-foreground">Amount on notice</dt>
              <dd className="text-right tabular-nums">{formatMoney(notice.amount)}</dd>
              <dt className="text-muted-foreground">Respond by</dt>
              <dd className="text-right">{formatDate(notice.respondBy)}</dd>
            </dl>
          </>
        ) : (
          <div className="flex items-center gap-3 border-b pb-3">
            <FileText className="size-6 text-muted-foreground" aria-hidden />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{doc.fileName ?? doc.name}</p>
              <p className="text-xs text-muted-foreground">{doc.category}</p>
            </div>
          </div>
        )}
        <div className="mt-5 space-y-2" aria-hidden>
          {[100, 92, 96, 70, 88, 60, 94, 45].map((w, i) => (
            <div key={i} className="h-1.5 rounded-full bg-muted" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
      <figcaption className="mt-3 text-center text-xs text-muted-foreground">
        {fileKind(doc)} · {formatFileSize(doc.sizeKb)}
        {doc.fileName && ` · ${doc.fileName}`}
      </figcaption>
    </figure>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </>
  );
}

export function DocumentDetail({ id }: { id: string }) {
  const { docs, attachFile, signatures } = useCase();
  const fileRef = useRef<HTMLInputElement>(null);
  const doc = docs.find((d) => d.id === id);

  if (!doc) {
    return (
      <PageHeader
        title="Document not found"
        description="It may have been removed, or the link is out of date."
        actions={
          <LinkButton href="/documents" variant="outline">
            <ArrowLeft aria-hidden />
            All documents
          </LinkButton>
        }
      />
    );
  }

  const notice = notices.find((n) => n.documentId === doc.id);
  const action = documentAction(doc);
  const actionItem = doc.relatedActionId ? actionItems.find((a) => a.id === doc.relatedActionId) : undefined;
  const meta = statusMeta[doc.status];
  const signature = signatures[doc.id];
  const canReplace = doc.source === "You" && doc.status !== "requested";
  const openPicker = () => fileRef.current?.click();

  return (
    <div className="space-y-6">
      <PageHeader
        title={doc.name}
        description={`${doc.category} · from ${sourceLabel[doc.source]} · ${
          doc.status === "requested" ? "requested" : "added"
        } ${formatDate(doc.addedOn)}`}
        actions={
          <>
            <LinkButton href="/documents" variant="outline">
              <ArrowLeft aria-hidden />
              All documents
            </LinkButton>
            {canReplace && (
              <Button variant="outline" onClick={openPicker}>
                <FileUp aria-hidden />
                Replace file
              </Button>
            )}
          </>
        }
      />
      <input
        ref={fileRef}
        id={`document-file-${doc.id}`}
        type="file"
        accept="application/pdf,image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) attachFile(doc.id, { name: file.name, sizeKb: Math.max(1, Math.round(file.size / 1024)) });
          e.target.value = "";
        }}
      />

      {WAITING_STATUSES.includes(doc.status) && (
        <div
          role="alert"
          className={cn(
            "flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center",
            doc.status === "needs-signature" ? "border-red-200 bg-red-50" : "border-yellow-200 bg-yellow-50"
          )}
        >
          <AlertTriangle
            className={cn("size-5 shrink-0", doc.status === "needs-signature" ? "text-red-600" : "text-yellow-600")}
            aria-hidden
          />
          <div className="flex-1 text-sm">
            <p className="font-medium">{meta.label}</p>
            <p className="text-muted-foreground">
              {doc.status === "requested" && `We asked for this on ${formatDate(doc.addedOn)}. `}
              {actionItem?.why ?? "Your case moves forward once this is done."}
              {actionItem && ` Due ${formatDate(actionItem.dueBy)}.`}
            </p>
          </div>
          {action?.kind === "upload" && (
            <Button onClick={openPicker}>
              <FileUp aria-hidden />
              Upload file
            </Button>
          )}
          {action?.kind === "link" && (
            <LinkButton href={action.href}>
              {action.label === "Sign" ? <PenLine aria-hidden /> : <FileCheck aria-hidden />}
              {action.label === "Sign" ? "Sign now" : "Review and approve"}
            </LinkButton>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <DocumentPreview doc={doc} notice={notice} onUpload={openPicker} />

          <Card>
            <CardHeader className="border-b">
              <CardTitle>What this is</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm">{doc.summary}</p>
              <dl className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)] gap-x-6 gap-y-3 text-sm">
                <DetailRow label="Status">
                  <StatusBadge tone={meta.tone}>{signature ? "Signed · on file" : meta.label}</StatusBadge>
                </DetailRow>
                <DetailRow label="Category">{doc.category}</DetailRow>
                <DetailRow label="From">{sourceLabel[doc.source]}</DetailRow>
                <DetailRow label={doc.status === "requested" ? "Requested" : "Added"}>{formatDate(doc.addedOn)}</DetailRow>
                <DetailRow label="File">
                  {fileKind(doc)}
                  {doc.sizeKb > 0 && ` · ${formatFileSize(doc.sizeKb)}`}
                </DetailRow>
                {doc.taxYear && (
                  <DetailRow label="Tax year">
                    <Link href={`/tax-years/${doc.taxYear}`} className="text-primary hover:underline">
                      {doc.taxYear}
                    </Link>
                  </DetailRow>
                )}
                {notice && (
                  <DetailRow label="Notice">
                    <Link href={`/notices/${notice.id}`} className="text-primary hover:underline">
                      {notice.code}: {notice.plainTitle}
                    </Link>
                  </DetailRow>
                )}
                {actionItem && (
                  <DetailRow label="To-do">
                    <Link href="/action-items" className="text-primary hover:underline">
                      {actionItem.title}
                    </Link>
                  </DetailRow>
                )}
                {libraryMatches(doc.name).length > 0 && (
                  <DetailRow label="Learn more">
                    <span className="flex flex-wrap gap-x-3 gap-y-1">
                      {libraryMatches(doc.name)
                        .slice(0, 3)
                        .map((entry) => (
                          <Link key={entry.slug} href={`/library/${entry.slug}`} className="text-primary hover:underline">
                            {entry.name} in the Library
                          </Link>
                        ))}
                    </span>
                  </DetailRow>
                )}
              </dl>
            </CardContent>
          </Card>

          {signature && <SignatureCertificate record={signature} />}
        </div>

        <div className="lg:col-span-2">
          <DocumentNotes docId={doc.id} />
        </div>
      </div>
    </div>
  );
}
