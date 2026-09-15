"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BadgeCheck, CheckCircle, ChevronDown, Scale, UserRound } from "lucide-react";
import { useCase } from "@/components/case-provider";
import { daysRemainingLabel } from "@/lib/format";
import { caseNumber, caseStages, currentStageIndex, enrolledAgent, taxpayer } from "@/lib/mockData";
import { activeNavHref, navGroups } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const stage = caseStages[currentStageIndex];
const stagePct = Math.round(((currentStageIndex + 1) / caseStages.length) * 100);

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const activeHref = activeNavHref(pathname);
  const { openActions } = useCase();
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);
  const nextAction = openActions[0];

  const toggleGroup = (id: string) =>
    setCollapsedGroups((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-card p-4">
      <Link href="/" onClick={onNavigate} className="mb-4 block rounded-md px-2 py-1.5 hover:bg-accent/50">
        <div className="text-2xl leading-none font-extrabold tracking-tight text-primary">T-Res</div>
        <div className="mt-1 text-[9px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
          IRS tax resolution
        </div>
      </Link>

      <div className="mb-6 rounded-lg bg-accent p-3">
        <div className="flex items-center gap-2">
          <UserRound className="size-3" aria-hidden />
          <span className="text-xs font-medium">
            {taxpayer.firstName} {taxpayer.lastName}
          </span>
        </div>
        <p className="mt-1 pl-5 text-xs text-muted-foreground">Case {caseNumber}</p>
      </div>

      <nav aria-label="Main" className="space-y-1">
        {navGroups.map((group) => {
          const open = !collapsedGroups.includes(group.id);
          return (
            <div key={group.id}>
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                aria-expanded={open}
                aria-controls={`nav-${group.id}`}
                className="group flex h-8 w-full items-center justify-between rounded-md px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                {group.label}
                <ChevronDown
                  className="size-3 transition-transform group-aria-[expanded=false]:-rotate-90"
                  aria-hidden
                />
              </button>
              <div id={`nav-${group.id}`} hidden={!open} className="mt-1 space-y-1">
                {group.items.map(({ href, label, icon: Icon, count, urgent }) => {
                  const active = href === activeHref;
                  // Action items change as things get done this session.
                  const shown = href === "/action-items" ? openActions.length : count;
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex h-9 items-center gap-2 rounded-md pr-2 pl-4 text-sm font-medium transition-colors",
                        active ? "bg-secondary text-foreground" : "text-foreground/80 hover:bg-accent hover:text-foreground"
                      )}
                    >
                      <Icon className="size-4" aria-hidden />
                      <span className="flex-1">{label}</span>
                      {shown !== undefined && (
                        <span
                          className={cn(
                            "min-w-5 rounded-md border px-1.5 text-center text-xs font-semibold tabular-nums",
                            urgent ? "border-red-200 bg-red-50 text-red-600" : "border-transparent bg-muted text-muted-foreground"
                          )}
                        >
                          {shown}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="mt-8 space-y-3">
        <Link
          href="/"
          onClick={onNavigate}
          className="block rounded-lg bg-accent p-3 transition-colors hover:bg-accent/80"
        >
          <div className="mb-2 flex items-center gap-2">
            <Scale className="size-4 text-primary" aria-hidden />
            <span className="text-sm font-medium">Case progress</span>
          </div>
          <p className="mb-2 text-xs text-muted-foreground">
            Step {currentStageIndex + 1} of {caseStages.length}: {stage.label}
          </p>
          <div className="h-2 w-full rounded-full bg-secondary">
            <div className="h-2 rounded-full bg-primary" style={{ width: `${stagePct}%` }} />
          </div>
        </Link>

        {nextAction && (
          <Link
            href="/action-items"
            onClick={onNavigate}
            className="block rounded-lg border border-green-200 bg-green-50 p-3 transition-colors hover:bg-green-100"
          >
            <div className="mb-1 flex items-center gap-2">
              <CheckCircle className="size-3 text-green-600" aria-hidden />
              <span className="text-xs font-medium text-green-800">Next milestone</span>
            </div>
            <p className="text-xs text-green-700">
              {nextAction.title} · {daysRemainingLabel(nextAction.dueBy)}
            </p>
          </Link>
        )}

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <div className="mb-1 flex items-center gap-2">
            <BadgeCheck className="size-3 text-blue-600" aria-hidden />
            <span className="text-xs font-medium text-blue-800">Your {enrolledAgent.credential}</span>
          </div>
          <p className="text-xs text-blue-700">{enrolledAgent.name} · licensed to represent you before the IRS</p>
        </div>
      </div>
    </div>
  );
}
