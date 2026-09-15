"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Bell, BellRing, ChevronDown, Clock, CreditCard, PanelLeft, Settings, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { useCase } from "@/components/case-provider";
import { StatusDot } from "@/components/status";
import { daysAgoLabel, formatDate } from "@/lib/format";
import { account, caseNumber, notifications, resolutionPlans, taxpayer, transcriptsLastChecked } from "@/lib/mockData";

function MenuLink({
  href,
  icon: Icon,
  label,
  hint,
  onSelect,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  hint?: string;
  onSelect: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onSelect}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm outline-none hover:bg-accent focus-visible:bg-accent"
    >
      <Icon className="size-4 text-muted-foreground" aria-hidden />
      <span className="flex-1">{label}</span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </Link>
  );
}

export function Topbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const [bellOpen, setBellOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const { plan } = useCase();
  const unread = notifications.filter((n) => !n.read).length;
  const planName = resolutionPlans.find((p) => p.id === plan.planId)?.name;
  const planHint = plan.status === "active" ? planName : plan.status === "paused" ? "Paused" : "Canceled";

  const closeMenu = (refocus = false) => {
    setMenuOpen(false);
    if (refocus) menuButton.current?.focus();
  };

  return (
    <header className="sticky top-0 z-20 border-b bg-background px-4 py-3 md:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onToggleSidebar} aria-label="Toggle sidebar">
            <PanelLeft />
          </Button>
          <Breadcrumbs />
        </div>

        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          <Badge
            variant="outline"
            className="hidden gap-1 border-border bg-background text-foreground lg:inline-flex"
            title={`IRS transcripts last checked ${formatDate(transcriptsLastChecked)}`}
          >
            <Clock className="size-3" aria-hidden />
            Transcripts checked: {daysAgoLabel(transcriptsLastChecked)}
          </Badge>

          <div className="relative">
            <Button
              variant="outline"
              onClick={() => {
                setBellOpen((o) => !o);
                setMenuOpen(false);
              }}
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

          {/* Account menu: settings and billing live behind the taxpayer's name, as people expect. */}
          <div className="relative">
            <button
              ref={menuButton}
              type="button"
              aria-label="Account menu"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-controls="account-menu"
              onClick={() => {
                setMenuOpen((o) => !o);
                setBellOpen(false);
              }}
              className="flex h-9 items-center gap-2 rounded-md border px-1.5 transition-colors outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span className="grid size-6 place-items-center rounded bg-primary/10 text-[11px] font-semibold text-primary">
                {taxpayer.firstName[0]}
                {taxpayer.lastName[0]}
              </span>
              <span className="hidden text-sm font-medium md:inline">{account.preferredName}</span>
              <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden />
            </button>
            {menuOpen && (
              <button
                className="fixed inset-0 z-10 cursor-default"
                aria-label="Close account menu"
                tabIndex={-1}
                onClick={() => closeMenu()}
              />
            )}
            <div
              id="account-menu"
              role="menu"
              aria-label="Account"
              hidden={!menuOpen}
              onKeyDown={(e) => {
                if (e.key === "Escape") closeMenu(true);
              }}
              className="absolute right-0 z-20 mt-2 w-64 rounded-xl border bg-card p-1.5 shadow-lg"
            >
              <div className="px-3 py-2">
                <p className="text-sm font-medium">
                  {taxpayer.firstName} {taxpayer.lastName}
                </p>
                <p className="truncate text-xs text-muted-foreground">{account.email}</p>
              </div>
              <div className="my-1 h-px bg-border" />
              <MenuLink href="/settings" icon={Settings} label="Settings" onSelect={() => closeMenu()} />
              <MenuLink href="/settings/billing" icon={CreditCard} label="Billing & plan" hint={planHint} onSelect={() => closeMenu()} />
              <MenuLink href="/settings/notifications" icon={BellRing} label="Notification settings" onSelect={() => closeMenu()} />
              <div className="my-1 h-px bg-border" />
              <p className="px-3 py-1.5 text-xs text-muted-foreground">Case {caseNumber}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
