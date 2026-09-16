// One map of T-Res Pro: the sidebar, the breadcrumbs and Pro search all read from here.
// The taxpayer side's equivalent is lib/navigation.ts.
import { ChartColumn, CreditCard, FolderOpen, Inbox, LayoutDashboard, Settings, ShieldCheck, Users, type LucideIcon } from "lucide-react";
import { governanceItems, laterGovernanceItems, proClients, proQueue } from "@/lib/mockData";
import { proDocumentName } from "@/lib/proDocuments";
import type { Crumb } from "@/lib/navigation";

// `sidebar: false` keeps an item out of the sidebar but still names its pages in breadcrumbs.
export type ProNavItem = { href: string; label: string; icon: LucideIcon; note?: string; sidebar?: boolean };

export const proNav: ProNavItem[] = [
  { href: "/pro", label: "Today", icon: LayoutDashboard },
  { href: "/pro/dashboard", label: "Dashboard", icon: ChartColumn },
  { href: "/pro/clients", label: "Clients", icon: Users },
  { href: "/pro/documents", label: "Documents", icon: FolderOpen },
  { href: "/pro/approvals", label: "Approvals", icon: Inbox },
  // PLCY has its own frame, so this one leaves T-Res Pro.
  { href: "/plcy", label: "Governance", icon: ShieldCheck, note: "PLCY" },
  // Reached from the account menu (name, top right), not the sidebar.
  { href: "/pro/settings", label: "Settings", icon: Settings, sidebar: false },
  { href: "/pro/settings/billing", label: "Billing & plan", icon: CreditCard, sidebar: false },
];

export const proSidebarNav = proNav.filter((item) => item.sidebar !== false);

export const isProActive = (pathname: string, href: string) =>
  href === "/pro" ? pathname === "/pro" : pathname === href || pathname.startsWith(`${href}/`);

/** The section a path belongs to: the longest matching href, so /pro/settings/billing is Billing, not Settings. */
function matchProNav(pathname: string) {
  return proNav.filter((item) => isProActive(pathname, item.href)).sort((a, b) => b.href.length - a.href.length)[0];
}

// Names for sub-pages that aren't nav items themselves.
const segmentLabels: Record<string, string> = {
  firm: "Firm & team",
  notifications: "Notifications",
  security: "Security",
};

const reviewTitle = (id: string) =>
  [...governanceItems, ...laterGovernanceItems, ...proQueue].find((r) => r.id === id)?.title;

function segmentLabel(sectionHref: string, segment: string): string {
  if (sectionHref === "/pro/documents") return proDocumentName(segment) ?? "Document";
  if (sectionHref === "/pro/clients") return proClients.find((c) => c.id === segment)?.name ?? "Client";
  if (sectionHref === "/pro/approvals") return reviewTitle(segment) ?? "Review";
  return segmentLabels[segment] ?? segment;
}

/** Trail after the home icon, e.g. Clients › Jordan Reyes. The last crumb is the current page. */
export function proBreadcrumbsFor(pathname: string): Crumb[] {
  const section = matchProNav(pathname);
  if (!section) return [];

  const crumbs: Crumb[] = [];
  // Settings pages sit under Settings even though each is its own nav entry.
  if (section.href.startsWith("/pro/settings/")) crumbs.push({ label: "Settings", href: "/pro/settings" });
  crumbs.push({ label: section.label, href: section.href });

  let href = section.href;
  for (const segment of pathname.slice(section.href.length).split("/").filter(Boolean)) {
    href += `/${segment}`;
    crumbs.push({ label: segmentLabel(section.href, segment), href });
  }
  return crumbs;
}
