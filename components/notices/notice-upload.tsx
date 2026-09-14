"use client";

import { useRef, useState } from "react";
import { CheckCircle2, FileUp, Loader2, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EAReviewedBadge } from "@/components/ea-reviewed-badge";
import { StatusBadge } from "@/components/status";
import { daysRemainingLabel, deadlineTone, formatDate, formatMoney } from "@/lib/format";

// What the fake processor "finds" in any uploaded letter.
const decodedSample = {
  code: "CP501",
  plainTitle: "A reminder about your 2022 balance",
  taxYear: 2022,
  respondBy: "2026-10-05",
  amount: 6870,
  whatItMeans:
    "Nothing new: this is the IRS's second reminder in its normal letter sequence. Your balance grew $70 from interest.",
  whatWeAreDoing:
    "Added to your case. It's covered by the same plan as your CP14, so there's nothing for you to do.",
};

export function NoticeUpload() {
  const [state, setState] = useState<"idle" | "processing" | "done">("idle");
  const [fileName, setFileName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const process = (name: string) => {
    setFileName(name);
    setState("processing");
    window.setTimeout(() => setState("done"), 2000);
  };

  if (state === "done") {
    return (
      <div className="space-y-3 rounded-xl border border-green-200 bg-green-50 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <CheckCircle2 className="size-4 text-green-600" aria-hidden />
          <span className="text-sm font-medium text-green-900">New notice added from {fileName}</span>
          <Badge variant="outline" className="bg-white font-mono">
            {decodedSample.code}
          </Badge>
          <StatusBadge tone={deadlineTone(decodedSample.respondBy)} className="bg-white">
            Respond by {formatDate(decodedSample.respondBy)} · {daysRemainingLabel(decodedSample.respondBy)}
          </StatusBadge>
        </div>
        <div className="space-y-1 pl-6">
          <p className="text-sm font-medium">
            {decodedSample.plainTitle} · {formatMoney(decodedSample.amount)}
          </p>
          <p className="text-sm text-muted-foreground">{decodedSample.whatItMeans}</p>
          <p className="text-sm text-muted-foreground">{decodedSample.whatWeAreDoing}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 pl-6">
          <EAReviewedBadge pending />
          <Button variant="outline" size="sm" className="bg-white" onClick={() => setState("idle")}>
            Upload another
          </Button>
        </div>
      </div>
    );
  }

  const processing = state === "processing";

  return (
    <div
      className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed bg-card p-5 text-center sm:flex-row sm:text-left"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && !processing) process(file.name);
      }}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
        {processing ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <Upload className="size-5" aria-hidden />}
      </span>
      <div className="flex-1" aria-live="polite">
        <p className="font-medium">{processing ? `Reading ${fileName}…` : "Got a new letter from the IRS?"}</p>
        <p className="text-sm text-muted-foreground">
          {processing
            ? "Translating it into plain English. This takes a few seconds."
            : "Drop it here, upload a PDF, or snap a photo. We'll translate it and add it to your case."}
        </p>
      </div>
      {!processing && (
        <div className="flex flex-wrap justify-center gap-2">
          <input
            ref={inputRef}
            id="notice-upload"
            type="file"
            accept="application/pdf,image/*"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) process(file.name);
              e.target.value = "";
            }}
          />
          <Button variant="outline" onClick={() => process("sample-letter.pdf")}>
            Try a sample letter
          </Button>
          <Button onClick={() => inputRef.current?.click()}>
            <FileUp aria-hidden />
            Upload notice
          </Button>
        </div>
      )}
    </div>
  );
}
