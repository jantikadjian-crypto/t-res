import type { CaseDocument, DocumentStatus, Tone } from "@/lib/mockData";

export const statusMeta: Record<DocumentStatus, { tone: Tone; label: string }> = {
  "on-file": { tone: "good", label: "On file" },
  "needs-signature": { tone: "bad", label: "Needs your signature" },
  draft: { tone: "warn", label: "Draft for your approval" },
  requested: { tone: "warn", label: "Waiting on you" },
  "in-review": { tone: "neutral", label: "Uploaded · we're reviewing" },
};

// Statuses where the case is waiting on the taxpayer.
export const WAITING_STATUSES: DocumentStatus[] = ["needs-signature", "draft", "requested"];

export const sourceLabel: Record<CaseDocument["source"], string> = {
  You: "You",
  IRS: "IRS (pulled by us)",
  "T-Res": "T-Res",
};

export function fileKind(doc: CaseDocument): string {
  if (!doc.sizeKb) return "Not uploaded yet";
  const ext = (doc.fileName ?? doc.name).split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "PDF";
  if (["jpg", "jpeg", "png", "heic", "webp"].includes(ext)) return "Photo";
  if (["doc", "docx"].includes(ext)) return "Word document";
  return "File";
}

export type DocumentAction = { kind: "upload" } | { kind: "link"; href: string; label: "Sign" | "Review" };

/** What the taxpayer can do next with this document, if anything. */
export function documentAction(doc: CaseDocument): DocumentAction | null {
  if (doc.status === "requested") return { kind: "upload" };
  if (doc.status === "needs-signature") return { kind: "link", href: `/sign/${doc.id}`, label: "Sign" };
  if (doc.status === "draft") return { kind: "link", href: "/action-items", label: "Review" };
  return null;
}
