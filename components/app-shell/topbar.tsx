"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell,
  BellRing,
  ChevronDown,
  Clock,
  CreditCard,
  FileWarning,
  PanelLeft,
  Route,
  Search,
  Settings,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { useCase } from "@/components/case-provider";
import { CommandPalette } from "@/components/search/command-palette";
import { StatusDot } from "@/components/status";
import { daysAgoLabel, formatDate } from "@/lib/format";
import { account, caseNumber, enrolledAgent, notifications as seedNotifications, resolutionPlans, taxpayer, transcriptsLastChecked } from "@/lib/mockData";

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>(() => seedNotifications.filter((n) => n.read).map((n) => n.id));
  const menuButton = useRef<HTMLButtonElement>(null);
  const searchButton = useRef<HTMLButtonElement>(null);
  // Notifications are live: a reminder sent from T-Res Pro lands here in the same visit.
  const { plan, lane, escalatedOn, switchPlan, escalate, notifications } = useCase();
  const unread = notifications.filter((n) => !readIds.includes(n.id)).length;
  const planName = resolutionPlans.find((p) => p.id === plan.planId)?.name;
  const planHint = plan.status === "active" ? planName : plan.status === "paused" ? "Paused" : "Canceled";

  // Ctrl+K / ⌘K toggles search anywhere; "/" opens it when you're not typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = !!target && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((o) => !o);
      } else if (e.key === "/" && !typing) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
          <button
            ref={searchButton}
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search everything"
            aria-keyshortcuts="Control+K Meta+K /"
            className="flex h-9 items-center gap-2 rounded-md border bg-input-background px-2.5 text-sm text-muted-foreground transition-colors outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 md:w-52 xl:w-72"
          >
            <Search className="size-4 shrink-0" aria-hidden />
            <span className="hidden truncate md:inline">Search everything…</span>
            <kbd className="ml-auto hidden rounded border bg-background px-1.5 text-[10px] font-medium md:inline">Ctrl K</kbd>
          </button>

          <Link
            href="/documents/from-irs"
            title={`IRS transcripts last checked ${formatDate(transcriptsLastChecked)}. Open your IRS records.`}
            className="hidden rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50 2xl:inline-flex"
          >
            <Badge variant="outline" className="gap-1 border-border bg-background text-foreground hover:bg-accent">
              <Clock className="size-3" aria-hidden />
              Transcripts checked: {daysAgoLabel(transcriptsLastChecked)}
            </Badge>
          </Link>

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
              <span className="hidden lg:inline">Notifications</span>
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
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <span className="text-xs font-medium text-muted-foreground">Notifications</span>
                    {unread > 0 && (
                      <button
                        type="button"
                        onClick={() => setReadIds(notifications.map((n) => n.id))}
                        className="rounded text-xs font-medium text-primary hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <ul>
                    {notifications.map((n) => {
                      const read = readIds.includes(n.id);
                      return (
                        <li key={n.id}>
                          <Link
                            href={n.href}
                            onClick={() => {
                              setReadIds((ids) => (ids.includes(n.id) ? ids : [...ids, n.id]));
                              setBellOpen(false);
                            }}
                            className="flex gap-2.5 rounded-lg px-2 py-2 outline-none hover:bg-accent focus-visible:bg-accent"
                          >
                            <StatusDot tone={read ? "neutral" : "warn"} className="mt-1.5" />
                            <div className="min-w-0">
                              <p className={read ? "text-sm text-muted-foreground" : "text-sm"}>{n.message}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(n.date)}</p>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                  <Link
                    href="/settings/notifications"
                    onClick={() => setBellOpen(false)}
                    className="mt-1 block rounded-lg px-2 py-1.5 text-xs text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:bg-accent"
                  >
                    Notification settings
                  </Link>
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
              <span className="hidden text-sm font-medium lg:inline">{account.preferredName}</span>
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
              <Link
                href="/settings"
                role="menuitem"
                onClick={() => closeMenu()}
                className="block rounded-lg px-3 py-2 outline-none hover:bg-accent focus-visible:bg-accent"
              >
                <p className="text-sm font-medium">
                  {taxpayer.firstName} {taxpayer.lastName}
                </p>
                <p className="truncate text-xs text-muted-foreground">{account.email}</p>
              </Link>
              <div className="my-1 h-px bg-border" />
              <MenuLink href="/settings" icon={Settings} label="Settings" onSelect={() => closeMenu()} />
              <MenuLink href="/settings/billing" icon={CreditCard} label="Billing & plan" hint={planHint} onSelect={() => closeMenu()} />
              <MenuLink href="/settings/notifications" icon={BellRing} label="Notification settings" onSelect={() => closeMenu()} />
              <div className="my-1 h-px bg-border" />
              {/* Demo only: switch to T-Res Pro, the professional's side (Chris's queue, and PLCY from there). */}
              <MenuLink href="/pro/login" icon={ShieldCheck} label={`Sign in as ${enrolledAgent.name}`} hint="Demo" onSelect={() => closeMenu()} />
              {lane === "represented" && !escalatedOn && (
                <MenuLink
                  href="/"
                  icon={Route}
                  label="Try the self-serve lane"
                  hint="Demo"
                  onSelect={() => {
                    switchPlan("guided");
                    closeMenu();
                  }}
                />
              )}
              {lane === "self-serve" && (
                <MenuLink
                  href="/"
                  icon={FileWarning}
                  label="Simulate: an LT11 arrives"
                  hint="Demo"
                  onSelect={() => {
                    escalate();
                    closeMenu();
                  }}
                />
              )}
              <div className="my-1 h-px bg-border" />
              <Link
                href="/"
                role="menuitem"
                onClick={() => closeMenu()}
                className="block rounded-lg px-3 py-1.5 text-xs text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:bg-accent"
              >
                Case {caseNumber} · go to dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {searchOpen && (
        <CommandPalette
          onClose={() => {
            setSearchOpen(false);
            searchButton.current?.focus();
          }}
        />
      )}
    </header>
  );
}
