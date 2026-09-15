"use client";

import { CheckCircle2, Clock, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCase } from "@/components/case-provider";
import { useIntake } from "@/components/intake/intake-provider";
import { LinkButton } from "@/components/link-button";
import { StatusBadge } from "@/components/status";
import { buildDocumentChecklist, type ChecklistItem } from "@/lib/intakeChecklist";
import { MOCK_TODAY, type CaseDocument, type Tone } from "@/lib/mockData";
import { cn } from "@/lib/utils";

type ItemStatus = { tone: Tone; label: string; done: boolean; doc?: CaseDocument };

export function DocumentsScreen() {
  const { state, update } = useIntake();
  const { docs, attachFile, addDocuments } = useCase();
  const items = buildDocumentChecklist(state);

  const statusOf = (item: ChecklistItem): ItemStatus => {
    const matched = item.docIds.map((id) => docs.find((d) => d.id === id)).filter((d): d is CaseDocument => !!d);
    const inFile = matched.find((d) => d.status === "on-file" || d.status === "in-review");
    const uploadedHere = docs.find((d) => d.id === `upload-${item.key}-${state.checklistUploads[item.key]}`);
    if (inFile || uploadedHere) return { tone: "good", label: "Already in", done: true, doc: inFile ?? uploadedHere };
    if (state.laterDocs.includes(item.key)) return { tone: "neutral", label: "On your to-do list", done: false };
    const requested = matched.find((d) => d.status === "requested");
    if (requested) return { tone: "warn", label: "Waiting on you", done: false, doc: requested };
    return { tone: "warn", label: "Needed", done: false };
  };

  // Uploads land in Documents: they fill a requested document if there is one, or add a new one.
  const upload = (item: ChecklistItem, file: File) => {
    const sizeKb = Math.max(1, Math.round(file.size / 1024));
    const requested = item.docIds.map((id) => docs.find((d) => d.id === id)).find((d) => d?.status === "requested");
    if (requested) {
      attachFile(requested.id, { name: file.name, sizeKb });
    } else {
      addDocuments([
        {
          // Deterministic: a finished checklist item can't be uploaded again.
          id: `upload-${item.key}-${file.name}`,
          name: file.name,
          category: item.category,
          source: "You",
          taxYear: item.taxYear,
          addedOn: MOCK_TODAY,
          sizeKb,
          status: "in-review",
          summary: `${item.title}: ${item.why}`,
        },
      ]);
    }
    update({
      checklistUploads: { ...state.checklistUploads, [item.key]: file.name },
      laterDocs: state.laterDocs.filter((k) => k !== item.key),
    });
  };

  const toggleLater = (key: string) =>
    update({
      laterDocs: state.laterDocs.includes(key) ? state.laterDocs.filter((k) => k !== key) : [...state.laterDocs, key],
    });

  const statuses = items.map(statusOf);
  const doneCount = statuses.filter((s) => s.done).length;
  const pct = items.length ? Math.round((doneCount / items.length) * 100) : 100;

  return (
    <div className="space-y-6">
      <div className="space-y-2 rounded-xl border bg-card p-4" aria-live="polite">
        <div className="flex justify-between text-sm">
          <span className="font-medium">
            {doneCount} of {items.length} already in
          </span>
          <span className="text-muted-foreground">
            {items.length - doneCount === 0 ? "All set" : `${items.length - doneCount} to go`}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-secondary">
          <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <ul className="space-y-3">
        {items.map((item, i) => {
          const status = statuses[i];
          const later = state.laterDocs.includes(item.key);
          const inputId = `checklist-${item.key}`;
          return (
            <li key={item.key} className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center">
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-full",
                  status.done ? "bg-green-50 text-green-600" : later ? "bg-accent text-muted-foreground" : "bg-primary/10 text-primary"
                )}
                aria-hidden
              >
                {status.done ? <CheckCircle2 className="size-5" /> : later ? <Clock className="size-5" /> : <FileUp className="size-5" />}
              </span>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{item.title}</p>
                  <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                </div>
                <p className="text-sm text-muted-foreground">{item.why}</p>
                {state.checklistUploads[item.key] && (
                  <p className="text-xs text-muted-foreground">Uploaded {state.checklistUploads[item.key]} · added to Documents</p>
                )}
              </div>
              {status.done ? (
                status.doc && (
                  <LinkButton href={`/documents/${status.doc.id}`} variant="outline" size="sm" className="shrink-0">
                    View
                  </LinkButton>
                )
              ) : (
                <div className="flex shrink-0 gap-2">
                  <input
                    id={inputId}
                    type="file"
                    accept="application/pdf,image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) upload(item, file);
                      e.target.value = "";
                    }}
                  />
                  <Button size="sm" onClick={() => document.getElementById(inputId)?.click()}>
                    <FileUp aria-hidden />
                    Upload now
                  </Button>
                  <Button size="sm" variant={later ? "secondary" : "outline"} aria-pressed={later} onClick={() => toggleLater(item.key)}>
                    {later ? "Undo later" : "Later"}
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <p className="text-sm text-muted-foreground">
        Anything marked Later goes on your to-do list. You can upload it any time from Documents.
      </p>
    </div>
  );
}
