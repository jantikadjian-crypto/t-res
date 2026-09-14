"use client";

import { useState } from "react";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/status";
import { daysAgoLabel, formatDate } from "@/lib/format";
import { notifications, taxpayer, transcriptsLastChecked } from "@/lib/mockData";

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const [bellOpen, setBellOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-card/90 px-4 backdrop-blur md:px-6">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onOpenMenu} aria-label="Open menu">
        <Menu />
      </Button>

      <div
        className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground"
        title={`Last checked ${formatDate(transcriptsLastChecked)}`}
      >
        <StatusDot tone="good" />
        <span className="truncate">
          <span className="hidden sm:inline">IRS transcripts last checked: </span>
          <span className="sm:hidden">Checked </span>
          {daysAgoLabel(transcriptsLastChecked)}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setBellOpen((o) => !o)}
            aria-label={`Notifications, ${unread} unread`}
            aria-expanded={bellOpen}
          >
            <Bell />
          </Button>
          {unread > 0 && (
            <span className="pointer-events-none absolute -top-0.5 -right-0.5 grid size-4 place-items-center rounded-full bg-bad text-[10px] font-semibold text-white">
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
              <div className="absolute right-0 z-20 mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-xl bg-card p-2 shadow-lg ring-1 ring-foreground/10">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Notifications</div>
                <ul>
                  {notifications.map((n) => (
                    <li key={n.id} className="flex gap-2.5 rounded-lg px-2 py-2 hover:bg-muted">
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
          className="grid size-8 place-items-center rounded-full bg-muted text-xs font-semibold"
          title={`${taxpayer.firstName} ${taxpayer.lastName}`}
        >
          {taxpayer.firstName[0]}
          {taxpayer.lastName[0]}
        </span>
      </div>
    </header>
  );
}
