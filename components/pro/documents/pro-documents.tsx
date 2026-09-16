"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, FileText, FolderOpen, PenLine, Search, Upload } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { inputClass, selectClass } from "@/components/form";
import { useCase } from "@/components/case-provider";
import { MetricTile } from "@/components/metric-tile";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status";
import { daysAgoLabel, formatDate } from "@/lib/format";
import { MOCK_TODAY, proClients } from "@/lib/mockData";
import { allProDocuments, isWaiting, proDocStatusMeta, type ProDocument } from "@/lib/proDocuments";
import { cn } from "@/lib/utils";

type Filter = "all" | "waiting" | "signature" | "irs" | "on-file";

const filters: { id: Filter; label: string; match: (d: ProDocument) => boolean }[] = [
  { id: "all", label: "All", match: () => true },
  { id: "waiting", label: "Waiting on clients", match: isWaiting },
  { id: "signature", label: "Needs a signature", match: (d) => d.status === "waiting-signature" },
  { id: "irs", label: "From the IRS", match: (d) => d.source === "IRS" },
  { id: "on-file", label: "On file", match: (d) => d.status === "on-file" },
];

const withinDays = (iso: string, days: number) => {
  const then = Date.parse(iso);
  const today = Date.parse(MOCK_TODAY);
  return Number.isFinite(then) && today - then <= days * 86_400_000 && then <= today;
};

export function ProDocuments() {
  const { docs } = useCase();
  const [filter, setFilter] = useState<Filter>("all");
  const [client, setClient] = useState("all");
  const [query, setQuery] = useState("");

  const documents = useMemo(() => allProDocuments(docs), [docs]);
  const waiting = documents.filter(isWaiting);
  const signatures = documents.filter((d) => d.status === "waiting-signature");
  const thisWeek = documents.filter((d) => withinDays(d.addedOn, 7));

  const q = query.trim().toLowerCase();
  const shown = documents.filter(
    (d) =>
      filters.find((f) => f.id === filter)!.match(d) &&
      (client === "all" || d.clientId === client) &&
      (!q || `${d.name} ${d.client} ${d.category ?? ""} ${d.summary ?? ""} ${d.why ?? ""}`.toLowerCase().includes(q))
  );

  const counts = Object.fromEntries(filters.map((f) => [f.id, documents.filter(f.match).length])) as Record<Filter, number>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description={
          waiting.length
            ? `Every client's paperwork in one place. ${waiting.length} ${waiting.length === 1 ? "file is" : "files are"} waiting on a client.`
            : "Every client's paperwork in one place. Nothing is waiting on a client."
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile
          icon={FolderOpen}
          iconClass="text-blue-600"
          label="In the library"
          value={String(documents.length)}
          caption={`Across ${proClients.length} clients`}
        />
        <MetricTile
          icon={Upload}
          iconClass="text-yellow-600"
          label="Waiting on clients"
          value={String(waiting.length)}
          caption={waiting.length ? "Chase these before they go stale" : "Nothing outstanding"}
        />
        <MetricTile
          icon={PenLine}
          iconClass="text-red-600"
          label="Needs a signature"
          value={String(signatures.length)}
          caption={signatures.length ? "Nothing files until these are signed" : "All signed"}
        />
        <MetricTile
          icon={FileText}
          iconClass="text-green-600"
          label="Added this week"
          value={String(thisWeek.length)}
          caption="Uploads, drafts and IRS pulls"
        />
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>The library</CardTitle>
          <CardDescription>
            Files the client sent, files T-Res prepared, and what the IRS has on record. Open one for its history and the
            notes you share with the client.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-0">
          <div className="flex flex-col gap-3 px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter documents">
              {filters.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={filter === f.id}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    filter === f.id ? "border-primary bg-secondary text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {f.label}
                  <span className="ml-1.5 text-xs tabular-nums opacity-70">{counts[f.id]}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <label htmlFor="doc-client" className="sr-only">
                Client
              </label>
              <select id="doc-client" value={client} onChange={(e) => setClient(e.target.value)} className={selectClass}>
                <option value="all">Every client</option>
                {proClients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <label htmlFor="doc-search" className="sr-only">
                  Search documents
                </label>
                <input
                  id="doc-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name or client"
                  className={cn(inputClass, "w-full pl-9 sm:w-64")}
                />
              </div>
            </div>
          </div>

          {shown.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-muted-foreground">
              Nothing matches. Try another filter, or clear the search.
            </p>
          ) : (
            <ul className="divide-y border-t">
              {shown.map((d) => {
                const meta = proDocStatusMeta[d.status];
                return (
                  <li key={d.id}>
                    <Link
                      href={`/pro/documents/${d.id}`}
                      className="group/next flex flex-wrap items-center gap-x-4 gap-y-2 px-6 py-3 outline-none hover:bg-accent/40 focus-visible:bg-accent/40"
                    >
                      <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium group-hover/next:underline">{d.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {d.client} · {d.source === "Client" ? "From the client" : d.source === "IRS" ? "From the IRS" : "Prepared by T-Res"}
                          {d.why ? ` · ${d.why}` : ""}
                        </span>
                      </span>
                      <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
                      <span className="w-28 text-right text-xs text-muted-foreground">
                        {formatDate(d.addedOn)}
                        <span className="block">{daysAgoLabel(d.addedOn)}</span>
                      </span>
                      <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
