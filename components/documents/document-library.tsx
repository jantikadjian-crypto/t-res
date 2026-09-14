"use client";

import { useRef, useState } from "react";
import { FileClock, FileText, FileUp, FolderOpen, Landmark, Search, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/link-button";
import { MetricTile } from "@/components/metric-tile";
import { StatusBadge } from "@/components/status";
import { formatDate, formatFileSize } from "@/lib/format";
import {
  documents,
  MOCK_TODAY,
  type CaseDocument,
  type DocumentCategory,
  type DocumentStatus,
  type Tone,
} from "@/lib/mockData";
import { cn } from "@/lib/utils";

const statusMeta: Record<DocumentStatus, { tone: Tone; label: string }> = {
  "on-file": { tone: "good", label: "On file" },
  "needs-signature": { tone: "bad", label: "Needs your signature" },
  draft: { tone: "warn", label: "Draft for your approval" },
  requested: { tone: "warn", label: "Waiting on you" },
  "in-review": { tone: "neutral", label: "Uploaded · we're reviewing" },
};

const sourceLabel: Record<CaseDocument["source"], string> = {
  You: "You",
  IRS: "IRS (pulled by us)",
  "T-Res": "T-Res",
};

const categories: ("All" | DocumentCategory)[] = [
  "All",
  "IRS notice",
  "Transcript",
  "Tax return",
  "Authorization",
  "Prepared by us",
  "Financial",
];

export function DocumentLibrary() {
  const [docs, setDocs] = useState<CaseDocument[]>(documents);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const inputRef = useRef<HTMLInputElement>(null);

  const waiting = docs.filter((d) => d.status === "needs-signature" || d.status === "requested" || d.status === "draft");
  const fromIrs = docs.filter((d) => d.category === "IRS notice" || d.category === "Transcript");
  const byUs = docs.filter((d) => d.source === "T-Res");

  const q = query.trim().toLowerCase();
  const visible = docs
    .filter((d) => category === "All" || d.category === category)
    .filter((d) => !q || d.name.toLowerCase().includes(q) || String(d.taxYear ?? "").includes(q))
    .sort((a, b) => b.addedOn.localeCompare(a.addedOn));

  const addUploads = (files: FileList) => {
    const added: CaseDocument[] = Array.from(files).map((f, i) => ({
      id: `upload-${Date.now()}-${i}`,
      name: f.name,
      category: "Financial",
      source: "You",
      addedOn: MOCK_TODAY,
      sizeKb: Math.max(1, Math.round(f.size / 1024)),
      status: "in-review",
    }));
    setDocs((prev) => [...added, ...prev]);
    setCategory("All");
    setQuery("");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile icon={FolderOpen} iconClass="text-blue-600" label="Documents" value={String(docs.length)} caption="In your case file" />
        <MetricTile icon={FileClock} iconClass="text-red-600" label="Waiting on you" value={String(waiting.length)} caption="To sign, approve, or upload" />
        <MetricTile icon={Landmark} iconClass="text-orange-600" label="From the IRS" value={String(fromIrs.length)} caption="Notices and transcripts" />
        <MetricTile icon={ShieldCheck} iconClass="text-green-600" label="Prepared by us" value={String(byUs.length)} caption="Forms, letters, summaries" />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <label htmlFor="document-search" className="sr-only">
            Search documents
          </label>
          <input
            id="document-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or tax year…"
            className="h-9 w-full rounded-md bg-input-background pr-3 pl-9 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <input
          ref={inputRef}
          id="document-upload"
          type="file"
          multiple
          accept="application/pdf,image/*"
          className="sr-only"
          onChange={(e) => {
            if (e.target.files?.length) addUploads(e.target.files);
            e.target.value = "";
          }}
        />
        <Button onClick={() => inputRef.current?.click()}>
          <FileUp aria-hidden />
          Upload documents
        </Button>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {categories.map((c) => {
          const count = c === "All" ? docs.length : docs.filter((d) => d.category === c).length;
          return (
            <button
              key={c}
              type="button"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                category === c ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-accent"
              )}
            >
              {c} <span className="tabular-nums opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      <Card className="py-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b bg-accent/40 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">Document</th>
                <th className="px-3 py-3 font-medium">Category</th>
                <th className="px-3 py-3 font-medium">From</th>
                <th className="px-3 py-3 font-medium">Added</th>
                <th className="px-3 py-3 text-right font-medium">Size</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visible.map((d) => {
                const meta = statusMeta[d.status];
                const actionHref = d.status === "requested" || d.status === "needs-signature" || d.status === "draft";
                return (
                  <tr key={d.id} className="hover:bg-accent/30">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                        <div className="min-w-0">
                          <p className="font-medium">{d.name}</p>
                          {d.taxYear && <p className="text-xs text-muted-foreground">{d.taxYear} tax year</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant="outline">{d.category}</Badge>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{sourceLabel[d.source]}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-muted-foreground">
                      {d.status === "requested" ? `Requested ${formatDate(d.addedOn)}` : formatDate(d.addedOn)}
                    </td>
                    <td className="px-3 py-3 text-right text-muted-foreground tabular-nums">
                      {d.sizeKb ? formatFileSize(d.sizeKb) : "—"}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
                        {actionHref && (
                          <LinkButton href="/action-items" variant="outline" size="xs">
                            {d.status === "requested" ? "Upload" : d.status === "draft" ? "Review" : "Sign"}
                          </LinkButton>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-muted-foreground">
                    No documents match &ldquo;{query}&rdquo;{category !== "All" && ` in ${category}`}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
