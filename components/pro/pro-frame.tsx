"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BellRing, ChevronDown, CreditCard, LogOut, Search, Settings, ShieldCheck, UserRound, Users, type LucideIcon } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { useCase } from "@/components/case-provider";
import { useProSession } from "@/components/pro/pro-session";
import { useProWorkspace } from "@/components/pro/use-pro-workspace";
import { ProCommandPalette } from "@/components/search/pro-command-palette";
import { practitioner, proClients, proPlans, taxpayer } from "@/lib/mockData";
import { allProDocuments, isWaiting } from "@/lib/proDocuments";
import { isProActive, proBreadcrumbsFor, proSidebarNav } from "@/lib/proNavigation";
import { cn } from "@/lib/utils";

export function ProWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className="text-xl leading-none font-extrabold tracking-tight text-primary">T-Res</span>
      <span className="rounded-md bg-foreground px-1.5 py-0.5 text-[11px] font-semibold tracking-wide text-background uppercase">
        Pro
      </span>
    </span>
  );
}

// One row of the account menu (name, top right): icon, label and an optional hint on the right.
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

const initials = practitioner.name
  .split(/\s+/)
  .map((w) => w[0])
  .join("")
  .slice(0, 2);

// The labels, hrefs and icons come from lib/proNavigation.ts; only the live counts are added here.
// `alert`: the count means something is waiting (yellow); otherwise it's just a total.
type NavItem = (typeof proSidebarNav)[number] & { count?: number; alert?: boolean };

const itemClass =
  "flex h-9 items-center gap-2 rounded-md pr-2 pl-4 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

// T-Res Pro: the professional's side. Its own sidebar and top bar; every page except sign-in needs a session.
export function ProFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, signOut, proPlan } = useProSession();
  const { approvals } = useProWorkspace();
  const { docs } = useCase();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const isLogin = pathname === "/pro/login";

  // Ctrl+K / Cmd+K toggles search anywhere in Pro; "/" opens it when you're not typing.
  useEffect(() => {
    if (isLogin) return;
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
  }, [isLogin]);

  // A mock session: without one, go to sign-in (v1 has no real accounts).
  useEffect(() => {
    if (!isLogin && !session) router.replace("/pro/login");
  }, [isLogin, session, router]);

  if (isLogin) return <div className="min-h-screen bg-canvas">{children}</div>;
  if (!session) {
    return (
      <p role="status" className="p-8 text-sm text-muted-foreground">
        Taking you to sign in…
      </p>
    );
  }

  const counts: Record<string, { count: number; alert?: boolean }> = {
    "/pro/clients": { count: proClients.length },
    // The documents count means "waiting on a client", not the size of the library.
    "/pro/documents": { count: allProDocuments(docs).filter(isWaiting).length, alert: true },
    "/pro/approvals": { count: approvals.length, alert: true },
  };
  const nav: NavItem[] = proSidebarNav.map((item) => ({ ...item, ...counts[item.href] }));

  const planName = proPlans.find((p) => p.id === proPlan.planId)?.name;
  const planHint = proPlan.status === "active" ? planName : "Canceled";

  const signOutNow = () => {
    setMenuOpen(false);
    signOut();
    router.push("/pro/login");
  };

  return (
    <div className="min-h-screen bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col overflow-y-auto border-r bg-card p-4 md:flex">
        <Link href="/pro" className="mb-4 block rounded-md px-2 py-1.5 hover:bg-accent/50">
          <ProWordmark />
          <div className="mt-1 text-[9px] font-medium tracking-[0.18em] text-muted-foreground uppercase">For tax professionals</div>
        </Link>

        <div className="mb-6 rounded-lg bg-accent p-3">
          <p className="flex items-center gap-2 text-xs font-medium">
            <UserRound className="size-3" aria-hidden />
            {practitioner.name}
          </p>
          <p className="mt-1 pl-5 text-xs text-muted-foreground">{practitioner.credential}</p>
          <p className="pl-5 text-xs whitespace-nowrap text-muted-foreground">CAF {practitioner.cafNumber}</p>
        </div>

        <nav aria-label="T-Res Pro" className="space-y-1">
          {nav.map(({ href, label, icon: Icon, count, note, alert }) => {
            const active = isProActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(itemClass, active ? "bg-secondary text-foreground" : "text-foreground/80 hover:bg-accent hover:text-foreground")}
              >
                <Icon className="size-4" aria-hidden />
                <span className="flex-1">
                  {label}
                  {note && <span className="ml-1.5 text-xs font-normal text-muted-foreground">{note}</span>}
                </span>
                {count !== undefined && (
                  <span
                    className={cn(
                      "min-w-5 rounded-md border px-1.5 text-center text-xs font-semibold tabular-nums",
                      alert && count > 0 ? "border-yellow-200 bg-yellow-50 text-yellow-700" : "border-transparent bg-muted text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 space-y-1">
          <p className="px-2 text-xs font-medium text-muted-foreground">Demo</p>
          <Link href="/" className={cn(itemClass, "text-foreground/80 hover:bg-accent hover:text-foreground")}>
            <UserRound className="size-4" aria-hidden />
            Open {taxpayer.firstName}&apos;s app
          </Link>
        </div>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-20 border-b bg-background px-4 py-3 md:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Link href="/pro" className="shrink-0 md:hidden" aria-label="T-Res Pro, Today">
                <ProWordmark />
              </Link>
              <Breadcrumbs crumbs={proBreadcrumbsFor(pathname)} homeHref="/pro" homeLabel="T-Res Pro home" />
            </div>

            <div className="flex shrink-0 items-center gap-2 md:gap-3">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search your practice"
                aria-keyshortcuts="Control+K Meta+K /"
                className="flex h-9 items-center gap-2 rounded-md border bg-input-background px-2.5 text-sm text-muted-foreground transition-colors outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 md:w-52 xl:w-72"
              >
                <Search className="size-4 shrink-0" aria-hidden />
                <span className="hidden truncate md:inline">Search clients, approvals…</span>
                <kbd className="ml-auto hidden rounded border bg-background px-1.5 text-[10px] font-medium md:inline">Ctrl K</kbd>
              </button>

              <div className="relative">
              <button
                type="button"
                aria-label="Account menu"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((o) => !o)}
                className="flex h-9 items-center gap-2 rounded-md border px-1.5 transition-colors outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span className="grid size-6 place-items-center rounded bg-primary/10 text-[11px] font-semibold text-primary">
                  {initials}
                </span>
                <span className="hidden text-sm font-medium sm:inline">{practitioner.name}</span>
                <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden />
              </button>
              {menuOpen && (
                <>
                  <button
                    className="fixed inset-0 z-10 cursor-default"
                    aria-label="Close account menu"
                    tabIndex={-1}
                    onClick={() => setMenuOpen(false)}
                  />
                  <div
                    id="pro-account-menu"
                    role="menu"
                    aria-label="Account"
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setMenuOpen(false);
                    }}
                    className="absolute right-0 z-20 mt-2 w-64 rounded-xl border bg-card p-1.5 shadow-lg"
                  >
                    <Link
                      href="/pro/settings"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-lg px-3 py-2 outline-none hover:bg-accent focus-visible:bg-accent"
                    >
                      <p className="text-sm font-medium">{practitioner.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{session.email}</p>
                    </Link>
                    <div className="my-1 h-px bg-border" />
                    {/* On phones the sidebar is hidden, so its links live here too. */}
                    {nav.map(({ href, label, icon: Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm outline-none hover:bg-accent focus-visible:bg-accent md:hidden"
                      >
                        <Icon className="size-4 text-muted-foreground" aria-hidden />
                        {label}
                      </Link>
                    ))}
                    {/* Settings, billing and the team live behind the name, as people expect. */}
                    <MenuLink href="/pro/settings" icon={Settings} label="Settings" onSelect={() => setMenuOpen(false)} />
                    <MenuLink
                      href="/pro/settings/billing"
                      icon={CreditCard}
                      label="Billing & plan"
                      hint={planHint}
                      onSelect={() => setMenuOpen(false)}
                    />
                    <MenuLink href="/pro/settings/firm" icon={Users} label="Firm & team" onSelect={() => setMenuOpen(false)} />
                    <MenuLink
                      href="/pro/settings/notifications"
                      icon={BellRing}
                      label="Notification settings"
                      onSelect={() => setMenuOpen(false)}
                    />
                    <div className="my-1 h-px bg-border" />
                    <MenuLink href="/plcy" icon={ShieldCheck} label="PLCY governance console" onSelect={() => setMenuOpen(false)} />
                    <Link
                      href="/"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm outline-none hover:bg-accent focus-visible:bg-accent"
                    >
                      <UserRound className="size-4 text-muted-foreground" aria-hidden />
                      <span className="flex-1">Open {taxpayer.firstName}&apos;s app</span>
                      <span className="text-xs text-muted-foreground">Demo</span>
                    </Link>
                    <div className="my-1 h-px bg-border" />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={signOutNow}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm outline-none hover:bg-accent focus-visible:bg-accent"
                    >
                      <LogOut className="size-4 text-muted-foreground" aria-hidden />
                      Sign out
                    </button>
                  </div>
                </>
              )}
              </div>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6">{children}</main>
      </div>

      {searchOpen && <ProCommandPalette onClose={() => setSearchOpen(false)} />}
    </div>
  );
}
