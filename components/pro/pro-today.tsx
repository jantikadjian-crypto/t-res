"use client";

import { Inbox, LayoutDashboard, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useCase } from "@/components/case-provider";
import { MetricTile } from "@/components/metric-tile";
import { PageHeader } from "@/components/page-header";
import { practitioner, taxpayer } from "@/lib/mockData";

// Today, for now: what's live from PLCY. The full dashboard (queue, deadlines, caseload) is chunk 2 of
// docs/pro-portal-blueprint.md.
export function ProToday() {
  const { governance } = useCase();
  const pending = governance.filter((g) => g.status === "pending");
  const auto = governance.filter((g) => g.status === "auto-approved").length;
  const firstName = practitioner.name.split(/\s+/)[0];

  return (
    <div className="space-y-6">
      <PageHeader title="Today" description={`Good morning, ${firstName}. Here's what needs you.`} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MetricTile
          icon={Inbox}
          iconClass="text-yellow-600"
          label="Approvals waiting"
          value={String(pending.length)}
          caption={pending[0] ? `Next: ${pending[0].title} · ${taxpayer.firstName} ${taxpayer.lastName}` : "All caught up"}
          href="/plcy"
        />
        <MetricTile
          icon={ShieldCheck}
          iconClass="text-green-600"
          label="Handled by policy"
          value={`${auto} of ${governance.length}`}
          caption={`AI actions on ${taxpayer.firstName}'s case, approved under your rules`}
          href="/plcy"
        />
      </div>

      <Card>
        <CardContent className="flex gap-3 text-sm">
          <LayoutDashboard className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <p className="text-muted-foreground">
            Your full Today dashboard is being built next: one queue sorted by urgency with minutes per item, deadlines
            across clients for the next 14 days, lane changes, and your caseload of 12 clients.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
