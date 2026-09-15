// One map of the app: the sidebar and the breadcrumbs both read from here.
import {
  CalendarRange,
  FileWarning,
  FolderOpen,
  Home,
  ListChecks,
  Rocket,
  type LucideIcon,
} from "lucide-react";
import { FIRST_SCREEN, getScreen, intakeSteps } from "@/lib/intakeScreens";
import { notices, openActionItems, openNotices } from "@/lib/mockData";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  count?: number;
  urgent?: boolean;
};

export type NavGroup = { id: string; label: string; items: NavItem[] };

const noticesNeedingAction = openNotices.filter((n) => n.status === "action-needed").length;

export const navGroups: NavGroup[] = [
  {
    id: "home",
    label: "Home",
    items: [
      { href: "/", label: "Dashboard", icon: Home },
      { href: `/intake/${FIRST_SCREEN}`, label: "Get Started", icon: Rocket },
    ],
  },
  {
    id: "case",
    label: "Your Case",
    items: [
      { href: "/notices", label: "Notices", icon: FileWarning, count: openNotices.length, urgent: noticesNeedingAction > 0 },
      { href: "/tax-years", label: "Tax Years", icon: CalendarRange },
      { href: "/action-items", label: "Action Items", icon: ListChecks, count: openActionItems.length },
      { href: "/documents", label: "Documents", icon: FolderOpen },
    ],
  },
];

export type Crumb = { label: string; href?: string };

/** Trail after the home icon, e.g. Your Case › Notices › CP504. The last crumb is the current page. */
export function breadcrumbsFor(pathname: string): Crumb[] {
  const [section, detail] = pathname.split("/").filter(Boolean);

  if (section === "intake") {
    const screen = getScreen(detail ?? FIRST_SCREEN);
    const step = intakeSteps.find((s) => s.key === screen?.step);
    return [{ label: "Get Started", href: `/intake/${FIRST_SCREEN}` }, { label: step?.label ?? "All done" }];
  }

  const base = section ? `/${section}` : "/";
  for (const group of navGroups) {
    const item = group.items.find((i) => i.href === base);
    if (!item) continue;
    const crumbs: Crumb[] = [];
    if (group.id !== "home") crumbs.push({ label: group.label, href: group.items[0].href });
    crumbs.push({ label: item.label, href: item.href });
    if (detail) {
      const label = section === "notices" ? (notices.find((n) => n.id === detail)?.code ?? detail) : detail;
      crumbs.push({ label });
    }
    return crumbs;
  }
  return [];
}
