"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { inputClass } from "@/components/form";
import { libraryEntries, type LibraryKind } from "@/lib/library";
import { cn } from "@/lib/utils";

const KINDS: ("All" | LibraryKind)[] = ["All", "Form", "Notice", "Term"];
const KIND_LABEL: Record<"All" | LibraryKind, string> = { All: "Everything", Form: "Forms", Notice: "Notices", Term: "Terms" };

export const kindStyle: Record<LibraryKind, string> = {
  Form: "border-blue-200 bg-blue-50 text-blue-700",
  Notice: "border-orange-200 bg-orange-50 text-orange-700",
  Term: "border-purple-200 bg-purple-50 text-purple-700",
};

// Forms and notices sort by number, terms by name.
const sorted = [...libraryEntries].sort((a, b) => a.name.localeCompare(b.name, "en", { numeric: true }));

export function LibraryBrowser() {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"All" | LibraryKind>("All");
  const [onlyMine, setOnlyMine] = useState(false);
  const q = query.trim().toLowerCase();

  const visible = sorted
    .filter((e) => kind === "All" || e.kind === kind)
    .filter((e) => !onlyMine || (e.inYourCase?.length ?? 0) > 0)
    .filter((e) => !q || [e.name, e.short, e.definition, e.forYou ?? "", ...e.aliases].some((s) => s.toLowerCase().includes(q)));

  const clear = () => {
    setQuery("");
    setKind("All");
    setOnlyMine(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <label htmlFor="library-search" className="sr-only">
            Search the Library
          </label>
          <input
            id="library-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a form number, notice or word, e.g. 2848, CP504, lien…"
            className={cn(inputClass, "pl-9")}
          />
        </div>
        <div role="group" aria-label="Show" className="grid grid-cols-4 gap-1 rounded-xl bg-muted p-1">
          {KINDS.map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={kind === k}
              onClick={() => setKind(k)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                kind === k ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {KIND_LABEL[k]}{" "}
              <span className="text-xs tabular-nums opacity-70">
                {k === "All" ? libraryEntries.length : libraryEntries.filter((e) => e.kind === k).length}
              </span>
            </button>
          ))}
        </div>
        <label htmlFor="library-mine" className="flex items-center gap-2 text-sm whitespace-nowrap">
          <input
            id="library-mine"
            type="checkbox"
            checked={onlyMine}
            onChange={(e) => setOnlyMine(e.target.checked)}
            className="size-4 accent-primary"
          />
          Only what&apos;s in my case
        </label>
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {visible.length} {visible.length === 1 ? "entry" : "entries"}
      </p>

      {visible.length === 0 ? (
        <div className="space-y-3 rounded-xl border border-dashed bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">Nothing in the Library matches &ldquo;{query}&rdquo;.</p>
          <Button variant="outline" onClick={clear}>
            Clear search
          </Button>
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((e) => (
            <li key={e.slug}>
              <Link
                href={`/library/${e.slug}`}
                className="flex h-full flex-col gap-2 rounded-xl border bg-card p-4 transition-[box-shadow,border-color] outline-none hover:border-foreground/20 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span className="flex items-center gap-2">
                  <span className={cn("rounded-md border px-1.5 py-0.5 text-xs font-medium", kindStyle[e.kind])}>{e.kind}</span>
                  {(e.inYourCase?.length ?? 0) > 0 && (
                    <span className="rounded-md border border-green-200 bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700">
                      In your case
                    </span>
                  )}
                </span>
                <span className="font-semibold">{e.name}</span>
                <span className="text-sm text-muted-foreground">{e.short}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
