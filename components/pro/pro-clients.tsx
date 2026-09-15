"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { inputClass, selectClass } from "@/components/form";
import { PageHeader } from "@/components/page-header";
import { CaseloadTable } from "@/components/pro/caseload-table";
import { useProWorkspace } from "@/components/pro/use-pro-workspace";
import type { ProClient } from "@/lib/mockData";
import { cn } from "@/lib/utils";

type Filter = "all" | "represented" | "self-serve" | "new" | "attention";
type Sort = "deadline" | "balance" | "name" | "activity";

const sorts: Record<Sort, { label: string; compare: (a: ProClient, b: ProClient) => number }> = {
  deadline: {
    label: "Next deadline (soonest)",
    compare: (a, b) => (a.deadline?.date ?? "9999").localeCompare(b.deadline?.date ?? "9999"),
  },
  balance: { label: "Balance (highest)", compare: (a, b) => b.balance - a.balance },
  name: { label: "Name (A to Z)", compare: (a, b) => a.name.localeCompare(b.name) },
  activity: { label: "Last activity (newest)", compare: (a, b) => b.lastActivity.localeCompare(a.lastActivity) },
};

// Clients: the whole caseload with filters, search and sorting. Each name opens that client's case.
export function ProClients() {
  const { clients, counts, needsAttention } = useProWorkspace();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("deadline");

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: clients.length },
    { key: "represented", label: "Represented", count: counts.represented },
    { key: "self-serve", label: "Doing it themselves", count: counts.selfServe },
    { key: "new", label: "New", count: counts.new },
    { key: "attention", label: "Needs attention", count: clients.filter(needsAttention).length },
  ];

  const q = query.trim().toLowerCase();
  const shown = clients
    .filter((c) => (filter === "all" ? true : filter === "attention" ? needsAttention(c) : c.lane === filter))
    .filter((c) => !q || `${c.name} ${c.situation} ${c.stage}`.toLowerCase().includes(q))
    .sort(sorts[sort].compare);

  return (
    <div className="space-y-6">
      <PageHeader title="Clients" description="Everyone you work with, and where each case stands." />

      <div role="group" aria-label="Show clients" className="flex flex-wrap gap-1 rounded-xl bg-muted p-1">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            aria-pressed={filter === f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              filter === f.key ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {f.label}
            <span className="text-xs tabular-nums opacity-70">{f.count}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <label htmlFor="client-search" className="sr-only">
            Search clients
          </label>
          <input
            id="client-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search names and situations…"
            className={cn(inputClass, "pl-9")}
          />
        </div>
        <label htmlFor="client-sort" className="sr-only">
          Sort by
        </label>
        <select id="client-sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={cn(selectClass, "sm:w-60")}>
          {(Object.keys(sorts) as Sort[]).map((key) => (
            <option key={key} value={key}>
              {sorts[key].label}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        Showing {shown.length} of {clients.length}
      </p>

      <Card className="py-0">
        <CaseloadTable clients={shown} />
      </Card>
    </div>
  );
}
