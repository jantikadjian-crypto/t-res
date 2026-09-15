import Link from "next/link";
import { StatusDot } from "@/components/status";
import { daysRemainingLabel, formatDate, formatMoney } from "@/lib/format";
import type { Lane, ProClient } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const laneChips: Record<Lane | "new", { label: string; className: string }> = {
  represented: { label: "Represented", className: "border-blue-200 bg-blue-50 text-blue-700" },
  "self-serve": { label: "Doing it themselves", className: "border-purple-200 bg-purple-50 text-purple-700" },
  new: { label: "New", className: "border-gray-200 bg-gray-50 text-gray-600" },
};

export function LaneChip({ lane }: { lane: Lane | "new" }) {
  return (
    <span className={cn("inline-flex rounded-md border px-1.5 py-0.5 text-xs font-medium whitespace-nowrap", laneChips[lane].className)}>
      {laneChips[lane].label}
    </span>
  );
}

// The caseload: every client, where each case stands. `compact` (Today) keeps client, lane and next deadline.
export function CaseloadTable({ clients, compact = false }: { clients: ProClient[]; compact?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-y bg-accent/40 text-left text-xs text-muted-foreground">
          <tr>
            <th className="px-6 py-3 font-medium">Client</th>
            <th className="px-3 py-3 font-medium">Lane</th>
            {!compact && <th className="hidden px-3 py-3 font-medium md:table-cell">Stage</th>}
            {!compact && <th className="px-3 py-3 text-right font-medium">Balance</th>}
            <th className="hidden px-3 py-3 font-medium sm:table-cell">Next deadline</th>
            {!compact && <th className="hidden px-6 py-3 font-medium xl:table-cell">Last activity</th>}
          </tr>
        </thead>
        <tbody className="divide-y">
          {clients.map((c) => (
            <tr key={c.id} data-client-row={c.id} className="hover:bg-accent/30">
              <td className="px-6 py-3">
                <div className="flex min-w-56 items-start gap-2">
                  <StatusDot tone={c.tone} className="mt-1.5" />
                  <div className="min-w-0">
                    <Link href={`/pro/clients/${c.id}`} className="font-medium hover:text-primary hover:underline">
                      {c.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{c.situation}</p>
                  </div>
                </div>
              </td>
              <td className="px-3 py-3">
                <LaneChip lane={c.lane} />
              </td>
              {!compact && <td className="hidden px-3 py-3 whitespace-nowrap text-muted-foreground md:table-cell">{c.stage}</td>}
              {!compact && (
                <td className="px-3 py-3 text-right whitespace-nowrap tabular-nums">{c.balance ? formatMoney(c.balance) : "Paid"}</td>
              )}
              <td className="hidden px-3 py-3 sm:table-cell">
                {c.deadline ? (
                  <span className="block min-w-40 text-xs">
                    <span className="block">{c.deadline.label}</span>
                    <span className="whitespace-nowrap text-muted-foreground">
                      {formatDate(c.deadline.date)} · {daysRemainingLabel(c.deadline.date)}
                    </span>
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">None</span>
                )}
              </td>
              {!compact && (
                <td className="hidden px-6 py-3 whitespace-nowrap text-muted-foreground xl:table-cell">{formatDate(c.lastActivity)}</td>
              )}
            </tr>
          ))}
          {clients.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-sm text-muted-foreground">
                No clients match.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
