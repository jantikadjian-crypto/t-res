// One map of the app: the sidebar and the breadcrumbs both read from here.
import {
  BookOpen,
  CalendarRange,
  CreditCard,
  FileWarning,
  FolderOpen,
  Home,
  ListChecks,
  Rocket,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { FIRST_SCREEN, getScreen, intakeSteps } from "@/lib/intakeScreens";
import { libraryEntry } from "@/lib/library";
import { documents, laterDocuments, laterNotices, notices, openActionItems, openNotices } from "@/lib/mockData";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  count?: number;
  urgent?: boolean;
};

// `sidebar: false` keeps a group out of the sidebar but still names its pages in breadcrumbs.
export type NavGroup = { id: string; label: string; items: NavItem[]; sidebar?: boolean };

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
  {
    id: "resources",
    label: "Resources",
    items: [{ href: "/library", label: "Library", icon: BookOpen }],
  },
  {
    // Reached from the account menu (name, top right), not the sidebar.
    id: "account",
    label: "Account",
    sidebar: false,
    items: [
      { href: "/settings", label: "Settings", icon: Settings },
      { href: "/settings/billing", label: "Billing & plan", icon: CreditCard },
    ],
  },
];

const allItems = navGroups.flatMap((group) => group.items.map((item) => ({ group, item })));

/** The nav item a path belongs to: the longest matching href, so /settings/billing is Billing, not Settings. */
function matchNav(pathname: string) {
  return allItems
    .filter(({ item }) =>
      item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`)
    )
    .sort((a, b) => b.item.href.length - a.item.href.length)[0];
}

export function activeNavHref(pathname: string): string | undefined {
  return matchNav(pathname)?.item.href;
}

export type Crumb = { label: string; href?: string };

// Names for sub-pages that aren't nav items themselves.
const segmentLabels: Record<string, string> = {
  mine: "My documents",
  "from-tres": "From T-Res",
  "from-irs": "From the IRS",
  waiting: "Waiting on you",
  notifications: "Notifications",
  security: "Security",
  cancel: "Cancel plan",
};

function segmentLabel(section: string, segment: string): string {
  if (segmentLabels[segment]) return segmentLabels[segment];
  if (section === "notices") return [...notices, ...laterNotices].find((n) => n.id === segment)?.code ?? segment;
  if (section === "documents") return [...documents, ...laterDocuments].find((d) => d.id === segment)?.name ?? "Document";
  if (section === "library") return libraryEntry(segment)?.name ?? segment;
  return segment;
}

/** Trail after the home icon, e.g. Your Case › Notices › CP504. The last crumb is the current page. */
export function breadcrumbsFor(pathname: string): Crumb[] {
  const [section, detail] = pathname.split("/").filter(Boolean);

  if (section === "sign") {
    const doc = documents.find((d) => d.id === detail);
    return [
      { label: "Documents", href: "/documents" },
      { label: doc?.name ?? "Document", href: `/documents/${detail}` },
      { label: "Sign" },
    ];
  }

  if (section === "intake") {
    const screen = getScreen(detail ?? FIRST_SCREEN);
    const step = intakeSteps.find((s) => s.key === screen?.step);
    return [{ label: "Get Started", href: `/intake/${FIRST_SCREEN}` }, { label: step?.label ?? "All done" }];
  }

  const match = matchNav(pathname);
  if (!match) return [];
  const crumbs: Crumb[] = [];
  if (match.group.id !== "home") crumbs.push({ label: match.group.label, href: match.group.items[0].href });
  crumbs.push({ label: match.item.label, href: match.item.href });

  let href = match.item.href === "/" ? "" : match.item.href;
  for (const segment of pathname.slice(href.length).split("/").filter(Boolean)) {
    href += `/${segment}`;
    crumbs.push({ label: segmentLabel(section ?? "", segment), href });
  }
  return crumbs;
}
