"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, ExternalLink, FileDown, Info, Search, Sparkles, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { inputClass } from "@/components/form";
import { useCase } from "@/components/case-provider";
import { kindStyle } from "@/components/library/library-browser";
import { MetricTile } from "@/components/metric-tile";
import { PageHeader } from "@/components/page-header";
import { useProWorkspace } from "@/components/pro/use-pro-workspace";
import { libraryFiles, type LibraryEntry, type LibraryKind } from "@/lib/library";
import { allProDocuments } from "@/lib/proDocuments";
import { caseloadMatches, hasProNote, isProOnly, proLibraryEntries, proNoteFor } from "@/lib/proLibrary";
import { cn } from "@/lib/utils";

const KINDS: ("All" | LibraryKind)[] = ["All", "Form", "Notice", "Term", "Publication"];

const sorted = [...proLibraryEntries].sort((a, b) => a.name.localeCompare(b.name));

/** One line of case text per client, so an entry can say who it touches right now. */
export function useCaseloadIndex() {
  const { docs } = useCase();
  const { clients, rows } = useProWorkspace();
  return useMemo(() => {
    const documents = allProDocuments(docs);
    return clients.map((c) => ({
      id: c.id,
      name: c.name,
      text: [
        c.situation,
        c.stage,
        c.deadline?.label ?? "",
        ...documents.filter((d) => d.clientId === c.id).map((d) => `${d.name} ${d.category ?? ""}`),
        ...rows.filter((r) => r.clientId === c.id).map((r) => `${r.title} ${r.why}`),
      ].join(" "),
    }));
  }, [clients, docs, rows]);
}

export function ProLibrary() {
  const caseload = useCaseloadIndex();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"All" | LibraryKind>("All");
  const [onlyCaseload, setOnlyCaseload] = useState(false);
  const [onlyNotes, setOnlyNotes] = useState(false);
  const [onlyFiles, setOnlyFiles] = useState(false);

  const q = query.trim().toLowerCase();
  const matchCount = useMemo(
    () => new Map(sorted.map((e) => [e.slug, caseloadMatches(e, caseload).length])),
    [caseload]
  );

  const visible = sorted
    .filter((e) => kind === "All" || e.kind === kind)
    .filter((e) => !onlyCaseload || (matchCount.get(e.slug) ?? 0) > 0)
    .filter((e) => !onlyNotes || hasProNote(e.slug))
    .filter((e) => !onlyFiles || (libraryFiles[e.slug] ?? []).length > 0)
    .filter(
      (e) =>
        !q ||
        [e.name, e.short, e.definition, proNoteFor(e.slug)?.practice ?? "", ...e.aliases].some((s) =>
          s.toLowerCase().includes(q)
        )
    );

  const withNotes = sorted.filter((e) => hasProNote(e.slug)).length;
  const inCaseload = sorted.filter((e) => (matchCount.get(e.slug) ?? 0) > 0).length;
  const printable = sorted.filter((e) => (libraryFiles[e.slug] ?? []).length > 0).length;

  const toggles: { label: string; on: boolean; set: (v: boolean) => void; count: number }[] = [
    { label: "In your caseload", on: onlyCaseload, set: setOnlyCaseload, count: inCaseload },
    { label: "Has practice notes", on: onlyNotes, set: setOnlyNotes, count: withNotes },
    { label: "Printable IRS file", on: onlyFiles, set: setOnlyFiles, count: printable },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Library"
        description="IRS forms, notices and terms with the practice layer: the clock that starts, where it's filed, what trips people up, and what T-Res does on its own."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile icon={BookOpen} iconClass="text-blue-600" label="Entries" value={String(sorted.length)} caption="Forms, notices, terms and publications" />
        <MetricTile icon={Sparkles} iconClass="text-purple-600" label="Practice notes" value={String(withNotes)} caption="Written for the professional, not the taxpayer" />
        <MetricTile icon={Users} iconClass="text-orange-600" label="In your caseload" value={String(inCaseload)} caption="Entries that touch a live client" />
        <MetricTile icon={FileDown} iconClass="text-green-600" label="Printable" value={String(printable)} caption="Blank IRS forms and sample notices" />
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Look something up</CardTitle>
          <CardDescription>
            Reference for your own work, not advice to a client. Every entry links to the IRS source — check figures and
            deadlines against it before you rely on them.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-0">
          <div className="space-y-3 px-6">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <label htmlFor="pro-library-search" className="sr-only">
                Search the Library
              </label>
              <input
                id="pro-library-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Form number, notice code, or a word like levy, statute, offer"
                className={cn(inputClass, "pl-9")}
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {KINDS.map((k) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={kind === k}
                  onClick={() => setKind(k)}
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    kind === k ? "border-primary bg-secondary text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {k}
                </button>
              ))}
              <span className="mx-1 w-px self-stretch bg-border" aria-hidden />
              {toggles.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  aria-pressed={t.on}
                  onClick={() => t.set(!t.on)}
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    t.on ? "border-primary bg-secondary text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {t.label}
                  <span className="ml-1.5 text-xs tabular-nums opacity-70">{t.count}</span>
                </button>
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-muted-foreground">
              Nothing matches. Try a form number like 2848, a notice like CP504, or a word like statute.
            </p>
          ) : (
            <ul className="divide-y border-t" aria-label="Library entries">
              {visible.map((e) => {
                const clients = matchCount.get(e.slug) ?? 0;
                return (
                  <li key={e.slug}>
                    <Link
                      href={`/pro/library/${e.slug}`}
                      className="group/next flex flex-wrap items-center gap-x-4 gap-y-1.5 px-6 py-3 outline-none hover:bg-accent/40 focus-visible:bg-accent/40"
                    >
                      <span className={cn("shrink-0 rounded-md border px-1.5 py-0.5 text-xs font-medium", kindStyle[e.kind])}>{e.kind}</span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium group-hover/next:underline">{e.name}</span>
                          {isProOnly(e.slug) && (
                            <span className="rounded-md border border-purple-200 bg-purple-50 px-1.5 py-0.5 text-[10px] font-medium text-purple-700">
                              Pro only
                            </span>
                          )}
                          {hasProNote(e.slug) && !isProOnly(e.slug) && (
                            <span className="rounded-md border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                              Practice notes
                            </span>
                          )}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {proNoteFor(e.slug)?.practice ?? e.short}
                        </span>
                      </span>
                      {clients > 0 && (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {clients} {clients === 1 ? "client" : "clients"}
                        </span>
                      )}
                      <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        <span>
          The taxpayer sees the same entries written in plain English, without the practice layer.{" "}
          <a
            href="https://www.irs.gov/tax-professionals"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            IRS Tax Professionals
            <ExternalLink className="size-3" aria-hidden />
          </a>
        </span>
      </p>
    </div>
  );
}

export type { LibraryEntry };
