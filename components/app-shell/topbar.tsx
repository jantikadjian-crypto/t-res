"use client";

import { useState } from "react";
import { Bell, Clock, PanelLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/status";
import { daysAgoLabel, formatDate } from "@/lib/format";
import { notifications, taxpayer, transcriptsLastChecked } from "@/lib/mockData";

export function Topbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const [bellOpen, setBellOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-20 border-b bg-background px-4 py-3 md:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onToggleSidebar} aria-label="Toggle sidebar">
            <PanelLeft />
          </Button>
          <div className="min-w-0">
            <div className="truncate font-medium">T-Res</div>
            <p className="hidden truncate text-sm text-muted-foreground sm:block">
              Understand • Respond • Resolve your IRS case
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          <Badge
            variant="outline"
            className="hidden gap-1 border-border bg-background text-foreground sm:inline-flex"
            title={`IRS transcripts last checked ${formatDate(transcriptsLastChecked)}`}
          >
            <Clock className="size-3" aria-hidden />
            Transcripts checked: {daysAgoLabel(transcriptsLastChecked)}
          </Badge>

          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setBellOpen((o) => !o)}
              aria-label={`Notifications, ${unread} unread`}
              aria-expanded={bellOpen}
            >
              <Bell />
              <span className="hidden sm:inline">Notifications</span>
            </Button>
            {unread > 0 && (
              <span className="pointer-events-none absolute -top-2 -right-2 grid size-5 place-items-center rounded-full bg-red-600 text-[10px] font-semibold text-white">
                {unread}
              </span>
            )}

            {bellOpen && (
              <>
                <button
                  className="fixed inset-0 z-10 cursor-default"
                  aria-label="Close notifications"
                  onClick={() => setBellOpen(false)}
                />
                <div className="absolute right-0 z-20 mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-xl border bg-card p-2 shadow-lg">
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Notifications</div>
                  <ul>
                    {notifications.map((n) => (
                      <li key={n.id} className="flex gap-2.5 rounded-lg px-2 py-2 hover:bg-accent">
                        <StatusDot tone={n.read ? "neutral" : "warn"} className="mt-1.5" />
                        <div className="min-w-0">
                          <p className="text-sm">{n.message}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(n.date)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>

          <span
            className="grid size-9 place-items-center rounded-md border text-xs font-semibold"
            title={`${taxpayer.firstName} ${taxpayer.lastName}`}
          >
            {taxpayer.firstName[0]}
            {taxpayer.lastName[0]}
          </span>
        </div>
      </div>
    </header>
  );
}
