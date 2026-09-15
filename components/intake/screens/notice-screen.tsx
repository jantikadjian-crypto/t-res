"use client";

import { useRef, useState } from "react";
import { AlertTriangle, Camera, FileQuestion, FileUp, Loader2, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GovernanceBadge } from "@/components/governance-badge";
import { useIntake } from "@/components/intake/intake-provider";
import { StatusBadge } from "@/components/status";
import { daysRemainingLabel, deadlineTone, formatDate, formatMoney } from "@/lib/format";
import { LEVY_NOTICE_CODES, SAMPLE_UPLOAD_DOCUMENT_ID } from "@/lib/intakeScreens";
import { notices, type Notice } from "@/lib/mockData";

function DecodeCard({ notice }: { notice: Notice }) {
  return (
    <div className="space-y-4 rounded-xl border bg-card p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="font-mono">
          {notice.code}
        </Badge>
        <span className="text-xs text-muted-foreground">{notice.title}</span>
      </div>
      <div>
        <p className="text-lg font-medium">{notice.plainTitle}</p>
        <p className="text-sm text-muted-foreground">
          {notice.taxYear} tax year · {formatMoney(notice.amount)} on the notice
        </p>
      </div>
      <StatusBadge tone={deadlineTone(notice.respondBy)}>
        Respond by {formatDate(notice.respondBy)} · {daysRemainingLabel(notice.respondBy)}
      </StatusBadge>
      {LEVY_NOTICE_CODES.includes(notice.code) && (
        <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden />
          This one has a deadline. We&apos;ll put it first.
        </div>
      )}
      <div>
        <p className="text-sm font-medium">What it means</p>
        <p className="text-sm text-muted-foreground">{notice.decode.whatItMeans}</p>
      </div>
      {/* Follows the decode's PLCY record: auto-approved once its checks pass. */}
      <GovernanceBadge href={`/notices/${notice.id}`} />
    </div>
  );
}

export function NoticeScreen() {
  const { state, update } = useIntake();
  const [processing, setProcessing] = useState<string | null>(null);
  const [replacing, setReplacing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const notice = notices.find((n) => n.documentId === state.noticeDocumentId);

  const receive = (name: string) => {
    setProcessing(name);
    window.setTimeout(() => {
      update({ noticeDocumentId: SAMPLE_UPLOAD_DOCUMENT_ID, noLetter: false, noticeFreshUpload: true });
      setProcessing(null);
      setReplacing(false);
    }, 2000);
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) receive(file.name);
    e.target.value = "";
  };

  if (processing) {
    return (
      <div className="flex items-center gap-4 rounded-xl border bg-card p-5" aria-live="polite">
        <Loader2 className="size-6 shrink-0 animate-spin text-primary" aria-hidden />
        <div>
          <p className="font-medium">Reading {processing}…</p>
          <p className="text-sm text-muted-foreground">Translating it into plain English. This takes a few seconds.</p>
        </div>
      </div>
    );
  }

  if (notice && !replacing) {
    return (
      <div className="space-y-4">
        <DecodeCard notice={notice} />
        <Button variant="outline" onClick={() => setReplacing(true)}>
          Use a different letter
        </Button>
      </div>
    );
  }

  if (state.noLetter && !replacing) {
    return (
      <div className="space-y-4">
        <div className="flex gap-3 rounded-xl border bg-card p-5">
          <FileQuestion className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          <div>
            <p className="font-medium">No letter? No problem.</p>
            <p className="text-sm text-muted-foreground">
              Once you authorize us in step 3, we&apos;ll pull your records straight from the IRS.
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => update({ noLetter: false })}>
          I have a letter after all
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed bg-card p-8 text-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) receive(file.name);
        }}
      >
        <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
          <Upload className="size-6" aria-hidden />
        </span>
        <div>
          <p className="font-medium">Drop your letter here</p>
          <p className="text-sm text-muted-foreground">A PDF, or a clear photo of every page</p>
        </div>
        <input
          ref={fileRef}
          id="intake-notice-file"
          type="file"
          accept="application/pdf,image/*"
          className="sr-only"
          onChange={onFile}
        />
        <input
          ref={cameraRef}
          id="intake-notice-camera"
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={onFile}
        />
        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={() => fileRef.current?.click()}>
            <FileUp aria-hidden />
            Upload a PDF
          </Button>
          {/* Only on phones and tablets, where it opens the camera. */}
          <span className="hidden pointer-coarse:contents">
            <Button variant="outline" onClick={() => cameraRef.current?.click()}>
              <Camera aria-hidden />
              Take a photo
            </Button>
          </span>
          <Button variant="ghost" onClick={() => receive("sample-letter.pdf")}>
            Try a sample letter
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="link"
          className="px-0"
          onClick={() => {
            update({ noLetter: true, noticeDocumentId: null, noticeFreshUpload: false });
            setReplacing(false);
          }}
        >
          I don&apos;t have a letter
        </Button>
        {replacing && (
          <Button variant="link" className="px-0 text-muted-foreground" onClick={() => setReplacing(false)}>
            Keep the letter I uploaded
          </Button>
        )}
      </div>
    </div>
  );
}
