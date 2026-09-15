"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckCircle2,
  FileClock,
  FileText,
  FileUp,
  Landmark,
  MessageSquare,
  Search,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { inputClass, selectClass } from "@/components/form";
import { LinkButton } from "@/components/link-button";
import { MetricTile } from "@/components/metric-tile";
import { StatusBadge } from "@/components/status";
import { documentAction, sourceLabel, statusMeta, WAITING_STATUSES } from "@/components/documents/document-meta";
import { useCase } from "@/components/case-provider";
import { formatDate, formatFileSize } from "@/lib/format";
import { enrolledAgent, MOCK_TODAY, taxYears, type CaseDocument, type DocumentCategory } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const CATEGORIES: DocumentCategory[] = [
  "IRS notice",
  "Transcript",
  "Tax return",
  "Authorization",
  "Prepared by us",
  "Financial",
];

const YEARS = taxYears.map((y) => String(y.year));

type Ownership = "all" | "mine" | "tres" | "irs";

// "My documents" means files the taxpayer actually uploaded, not ones we're still waiting for.
const isMyUpload = (d: CaseDocument) => d.source === "You" && d.status !== "requested";

// Split by who added the document, so the tabs never overlap.
const ownershipTabs: { key: Ownership; label: string; hint: string; match: (d: CaseDocument) => boolean }[] = [
  {
    key: "all",
    label: "All documents",
    hint: "Everything in your case file, including documents we've asked you for.",
    match: () => true,
  },
  {
    key: "mine",
    label: "My documents",
    hint: "Files you've uploaded. Documents we've asked for appear here once you upload them.",
    match: isMyUpload,
  },
  {
    key: "tres",
    label: "From T-Res",
    hint: "Forms, letters and summaries we've prepared for you.",
    match: (d) => d.source === "T-Res",
  },
  {
    key: "irs",
    label: "From the IRS",
    hint: "Records we pulled directly from the IRS for you.",
    match: (d) => d.source === "IRS",
  },
];

type StatusFilter = "any" | "waiting" | "on-file" | "in-review";
type SortKey = "addedOn" | "name" | "sizeKb";
type Sort = { key: SortKey; dir: 1 | -1 };

type PendingUpload = { key: string; name: string; sizeKb: number; category: DocumentCategory; taxYear: string };

function guessYear(name: string): string {
  return name.match(/20(19|2[0-6])/)?.[0] ?? "";
}

function guessCategory(name: string): DocumentCategory {
  const n = name.toLowerCase();
  if (/\b(cp\d+|lt\d+|letter|notice)\b/.test(n)) return "IRS notice";
  if (n.includes("transcript")) return "Transcript";
  if (/1040|return/.test(n)) return "Tax return";
  return "Financial";
}

function SortHeader({
  label,
  sortKey,
  sort,
  onSort,
  className,
}: {
  label: string;
  sortKey: SortKey;
  sort: Sort;
  onSort: (key: SortKey) => void;
  className?: string;
}) {
  const active = sort.key === sortKey;
  const Icon = !active ? ArrowUpDown : sort.dir === 1 ? ArrowUp : ArrowDown;
  return (
    <th
      aria-sort={active ? (sort.dir === 1 ? "ascending" : "descending") : "none"}
      className={cn("px-3 py-3 font-medium", className)}
    >
      <button type="button" onClick={() => onSort(sortKey)} className="inline-flex items-center gap-1 hover:text-foreground">
        {label}
        <Icon className="size-3" aria-hidden />
      </button>
    </th>
  );
}

function RowUpload({ doc, onFile }: { doc: CaseDocument; onFile: (file: File) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={ref}
        id={`fulfil-${doc.id}`}
        type="file"
        accept="application/pdf,image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
      <Button variant="outline" size="xs" onClick={() => ref.current?.click()} aria-label={`Upload ${doc.name}`}>
        <FileUp aria-hidden />
        Upload
      </Button>
    </>
  );
}

export function DocumentLibrary() {
  const { docs, notesFor, addDocuments, attachFile } = useCase();
  const [ownership, setOwnership] = useState<Ownership>("all");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | DocumentCategory>("all");
  const [year, setYear] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("any");
  const [sort, setSort] = useState<Sort>({ key: "addedOn", dir: -1 });
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  const tab = ownershipTabs.find((t) => t.key === ownership) ?? ownershipTabs[0];
  const waiting = docs.filter((d) => WAITING_STATUSES.includes(d.status));
  const q = query.trim().toLowerCase();

  // Search covers names, categories, tax years, the plain-English summary and every note.
  const matchesQuery = (d: CaseDocument) =>
    !q ||
    [d.name, d.fileName ?? "", d.category, sourceLabel[d.source], String(d.taxYear ?? ""), d.summary, ...notesFor(d.id).map((n) => n.text)].some(
      (s) => s.toLowerCase().includes(q)
    );

  const inTab = docs.filter(tab.match);
  const visible = inTab
    .filter((d) => category === "all" || d.category === category)
    .filter((d) => year === "all" || (year === "none" ? d.taxYear === undefined : String(d.taxYear) === year))
    .filter((d) => status === "any" || (status === "waiting" ? WAITING_STATUSES.includes(d.status) : d.status === status))
    .filter(matchesQuery)
    .sort((a, b) => {
      const cmp = sort.key === "sizeKb" ? a.sizeKb - b.sizeKb : a[sort.key].localeCompare(b[sort.key]);
      return cmp * sort.dir || b.addedOn.localeCompare(a.addedOn);
    });

  const filtersActive = q !== "" || category !== "all" || year !== "all" || status !== "any";
  const clearFilters = () => {
    setQuery("");
    setCategory("all");
    setYear("all");
    setStatus("any");
  };

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: key === "name" ? 1 : -1 }));

  const pickFiles = (files: FileList) =>
    setPending(
      Array.from(files).map((f, i) => ({
        key: `${f.name}-${i}`,
        name: f.name,
        sizeKb: Math.max(1, Math.round(f.size / 1024)),
        category: guessCategory(f.name),
        taxYear: guessYear(f.name),
      }))
    );

  const updatePending = (key: string, patch: Partial<PendingUpload>) =>
    setPending((prev) => prev.map((p) => (p.key === key ? { ...p, ...patch } : p)));

  const confirmUploads = () => {
    const stamp = Date.now();
    const added: CaseDocument[] = pending.map((p, i) => ({
      id: `upload-${stamp}-${i}`,
      name: p.name,
      category: p.category,
      source: "You",
      taxYear: p.taxYear ? Number(p.taxYear) : undefined,
      addedOn: MOCK_TODAY,
      sizeKb: p.sizeKb,
      status: "in-review",
      summary: `Uploaded by you. ${enrolledAgent.name} will review it within one business day.`,
    }));
    addDocuments(added);
    setPending([]);
    setOwnership("mine");
    clearFilters();
    setSort({ key: "addedOn", dir: -1 });
    setConfirmation(
      `Added ${added.length} ${added.length === 1 ? "document" : "documents"} to My documents. ${enrolledAgent.name} will review ${
        added.length === 1 ? "it" : "them"
      } within one business day.`
    );
  };

  const counts = {
    sign: waiting.filter((d) => d.status === "needs-signature").length,
    approve: waiting.filter((d) => d.status === "draft").length,
    upload: waiting.filter((d) => d.status === "requested").length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile
          icon={UserRound}
          iconClass="text-blue-600"
          label="My documents"
          value={String(docs.filter(isMyUpload).length)}
          caption="Files you've uploaded"
        />
        <MetricTile
          icon={FileClock}
          iconClass="text-red-600"
          label="Waiting on you"
          value={String(waiting.length)}
          caption="To sign, approve, or upload"
        />
        <MetricTile
          icon={Landmark}
          iconClass="text-orange-600"
          label="From the IRS"
          value={String(docs.filter((d) => d.source === "IRS").length)}
          caption="Transcripts and records we pulled"
        />
        <MetricTile
          icon={ShieldCheck}
          iconClass="text-green-600"
          label="From T-Res"
          value={String(docs.filter((d) => d.source === "T-Res").length)}
          caption="Forms, letters and summaries"
        />
      </div>

      {waiting.length > 0 && status !== "waiting" && (
        <div className="flex flex-col gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4 sm:flex-row sm:items-center">
          <AlertTriangle className="size-5 shrink-0 text-yellow-600" aria-hidden />
          <div className="flex-1 text-sm">
            <p className="font-medium text-yellow-900">
              {waiting.length} {waiting.length === 1 ? "document needs" : "documents need"} you
            </p>
            <p className="text-yellow-800">
              {[
                counts.sign && `${counts.sign} to sign`,
                counts.approve && `${counts.approve} to approve`,
                counts.upload && `${counts.upload} to upload`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <Button
            variant="outline"
            className="border-yellow-300 bg-white"
            onClick={() => {
              setOwnership("all");
              clearFilters();
              setStatus("waiting");
            }}
          >
            Show them
          </Button>
        </div>
      )}

      {confirmation && (
        <div role="status" className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" aria-hidden />
          <p className="flex-1">{confirmation}</p>
          <button type="button" onClick={() => setConfirmation(null)} aria-label="Dismiss" className="rounded-md p-0.5 hover:bg-green-100">
            <X className="size-4" aria-hidden />
          </button>
        </div>
      )}

      {/* Who added it */}
      <div className="space-y-2">
        <div role="group" aria-label="Show documents from" className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1 sm:grid-cols-4">
          {ownershipTabs.map((t) => {
            const active = t.key === ownership;
            return (
              <button
                key={t.key}
                type="button"
                aria-pressed={active}
                onClick={() => setOwnership(t.key)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  active ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t.label}
                <span className="text-xs tabular-nums opacity-70">{docs.filter(t.match).length}</span>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">{tab.hint}</p>
      </div>

      {/* Search, filters, upload */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <label htmlFor="document-search" className="sr-only">
            Search documents and notes
          </label>
          <input
            id="document-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search names, tax years, and notes…"
            className={cn(inputClass, "pl-9")}
          />
        </div>
        <div className="grid grid-cols-3 gap-2 lg:flex">
          <label htmlFor="document-category" className="sr-only">
            Category
          </label>
          <select
            id="document-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as "all" | DocumentCategory)}
            className={selectClass}
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <label htmlFor="document-year" className="sr-only">
            Tax year
          </label>
          <select id="document-year" value={year} onChange={(e) => setYear(e.target.value)} className={selectClass}>
            <option value="all">All years</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
            <option value="none">No tax year</option>
          </select>
          <label htmlFor="document-status" className="sr-only">
            Status
          </label>
          <select
            id="document-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            className={selectClass}
          >
            <option value="any">Any status</option>
            <option value="waiting">Waiting on you</option>
            <option value="in-review">Being reviewed</option>
            <option value="on-file">On file</option>
          </select>
        </div>
        <input
          ref={uploadRef}
          id="document-upload"
          type="file"
          multiple
          accept="application/pdf,image/*"
          className="sr-only"
          onChange={(e) => {
            if (e.target.files?.length) pickFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <Button onClick={() => uploadRef.current?.click()}>
          <FileUp aria-hidden />
          Upload documents
        </Button>
      </div>

      {/* Describe new uploads before adding them */}
      {pending.length > 0 && (
        <Card className="gap-4">
          <div className="px-6">
            <p className="font-medium">
              Add {pending.length} {pending.length === 1 ? "file" : "files"} to My documents
            </p>
            <p className="text-sm text-muted-foreground">Tell us what each one is so Chris can find it fast.</p>
          </div>
          <ul className="divide-y border-y">
            {pending.map((p) => (
              <li key={p.key} className="flex flex-col gap-3 px-6 py-3 md:flex-row md:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(p.sizeKb)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <label htmlFor={`pending-cat-${p.key}`} className="sr-only">
                    Category for {p.name}
                  </label>
                  <select
                    id={`pending-cat-${p.key}`}
                    value={p.category}
                    onChange={(e) => updatePending(p.key, { category: e.target.value as DocumentCategory })}
                    className={selectClass}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <label htmlFor={`pending-year-${p.key}`} className="sr-only">
                    Tax year for {p.name}
                  </label>
                  <select
                    id={`pending-year-${p.key}`}
                    value={p.taxYear}
                    onChange={(e) => updatePending(p.key, { taxYear: e.target.value })}
                    className={selectClass}
                  >
                    <option value="">No tax year</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setPending((prev) => prev.filter((x) => x.key !== p.key))}
                    aria-label={`Remove ${p.name}`}
                  >
                    <X aria-hidden />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex justify-end gap-2 px-6">
            <Button variant="ghost" onClick={() => setPending([])}>
              Cancel
            </Button>
            <Button onClick={confirmUploads}>
              Add {pending.length === 1 ? "document" : `${pending.length} documents`}
            </Button>
          </div>
        </Card>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground" aria-live="polite">
        <span>
          Showing {visible.length} of {inTab.length} in {tab.label}
        </span>
        {filtersActive && (
          <Button variant="link" size="sm" className="px-0" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>

      <Card className="py-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-accent/40 text-left text-xs text-muted-foreground">
              <tr>
                <SortHeader label="Document" sortKey="name" sort={sort} onSort={toggleSort} className="pl-4 sm:pl-6" />
                <th className="hidden px-3 py-3 font-medium lg:table-cell">Category</th>
                <th className="hidden px-3 py-3 font-medium md:table-cell">From</th>
                <SortHeader label="Added" sortKey="addedOn" sort={sort} onSort={toggleSort} className="hidden sm:table-cell" />
                <SortHeader label="Size" sortKey="sizeKb" sort={sort} onSort={toggleSort} className="hidden text-right lg:table-cell" />
                <th className="px-4 py-3 font-medium sm:px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visible.map((d) => {
                const meta = statusMeta[d.status];
                const action = documentAction(d);
                const noteCount = notesFor(d.id).length;
                return (
                  <tr key={d.id} className="align-top hover:bg-accent/30">
                    <td className="py-3 pr-3 pl-4 sm:pl-6">
                      <div className="flex gap-3">
                        <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                        <div className="min-w-0 space-y-1">
                          <Link href={`/documents/${d.id}`} className="font-medium break-words hover:text-primary hover:underline">
                            {d.name}
                          </Link>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                            <Badge variant="outline" className="lg:hidden">
                              {d.category}
                            </Badge>
                            {d.taxYear && <span>{d.taxYear} tax year</span>}
                            <span className="md:hidden">From {sourceLabel[d.source]}</span>
                            {noteCount > 0 && (
                              <Link
                                href={`/documents/${d.id}#notes`}
                                className="inline-flex items-center gap-1 hover:text-foreground"
                                aria-label={`${noteCount} ${noteCount === 1 ? "note" : "notes"} on ${d.name}`}
                              >
                                <MessageSquare className="size-3" aria-hidden />
                                {noteCount}
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-3 py-3 lg:table-cell">
                      <Badge variant="outline">{d.category}</Badge>
                    </td>
                    <td className="hidden px-3 py-3 text-muted-foreground md:table-cell">{sourceLabel[d.source]}</td>
                    <td className="hidden px-3 py-3 whitespace-nowrap text-muted-foreground sm:table-cell">
                      {d.status === "requested" ? `Requested ${formatDate(d.addedOn)}` : formatDate(d.addedOn)}
                    </td>
                    <td className="hidden px-3 py-3 text-right text-muted-foreground tabular-nums lg:table-cell">
                      {d.sizeKb ? formatFileSize(d.sizeKb) : "—"}
                    </td>
                    <td className="px-4 py-3 sm:px-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
                        {action?.kind === "upload" && (
                          <RowUpload
                            doc={d}
                            onFile={(file) => attachFile(d.id, { name: file.name, sizeKb: Math.max(1, Math.round(file.size / 1024)) })}
                          />
                        )}
                        {action?.kind === "link" && (
                          <LinkButton href={action.href} variant="outline" size="xs">
                            {action.label}
                          </LinkButton>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    {ownership === "mine" && !filtersActive ? (
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">You haven&apos;t uploaded anything yet.</p>
                        <Button onClick={() => uploadRef.current?.click()}>
                          <FileUp aria-hidden />
                          Upload your first document
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          No documents in {tab.label} match {q ? <>&ldquo;{query}&rdquo;</> : "these filters"}.
                        </p>
                        <Button variant="outline" onClick={clearFilters}>
                          Clear filters
                        </Button>
                      </div>
                    )}
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
