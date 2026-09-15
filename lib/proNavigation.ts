// One map of T-Res Pro: the sidebar and the breadcrumbs both read from here.
// The taxpayer side's equivalent is lib/navigation.ts.
import { Inbox, LayoutDashboard, ShieldCheck, Users, type LucideIcon } from "lucide-react";
import { governanceItems, laterGovernanceItems, proClients, proQueue } from "@/lib/mockData";
import type { Crumb } from "@/lib/navigation";

export type ProNavItem = { href: string; label: string; icon: LucideIcon; note?: string };

export const proNav: ProNavItem[] = [
  { href: "/pro", label: "Today", icon: LayoutDashboard },
  { href: "/pro/clients", label: "Clients", icon: Users },
  { href: "/pro/approvals", label: "Approvals", icon: Inbox },
  // PLCY has its own frame, so this one leaves T-Res Pro.
  { href: "/plcy", label: "Governance", icon: ShieldCheck, note: "PLCY" },
];

export const isProActive = (pathname: string, href: string) =>
  href === "/pro" ? pathname === "/pro" : pathname === href || pathname.startsWith(`${href}/`);

/** The section a path belongs to: the longest matching href, so /pro/clients wins over /pro. */
function matchProNav(pathname: string) {
  return proNav
    .filter((item) => isProActive(pathname, item.href))
    .sort((a, b) => b.href.length - a.href.length)[0];
}

const reviewTitle = (id: string) =>
  [...governanceItems, ...laterGovernanceItems, ...proQueue].find((r) => r.id === id)?.title;

/** Trail after the home icon, e.g. Clients › Dana Whitfield. The last crumb is the current page. */
export function proBreadcrumbsFor(pathname: string): Crumb[] {
  const section = matchProNav(pathname);
  if (!section) return [];

  const crumbs: Crumb[] = [{ label: section.label, href: section.href }];
  const detail = pathname.slice(section.href.length).split("/").filter(Boolean)[0];
  if (!detail) return crumbs;

  const label =
    section.href === "/pro/clients"
      ? (proClients.find((c) => c.id === detail)?.name ?? "Client")
      : section.href === "/pro/approvals"
        ? (reviewTitle(detail) ?? "Review")
        : detail;
  crumbs.push({ label, href: `${section.href}/${detail}` });
  return crumbs;
}
