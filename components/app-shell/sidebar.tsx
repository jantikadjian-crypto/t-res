"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarRange,
  FileWarning,
  FolderOpen,
  LayoutDashboard,
  ListChecks,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { enrolledAgent, notices, openActionItems } from "@/lib/mockData";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  count?: number;
  urgent?: boolean;
};

const noticesNeedingAction = notices.filter((n) => n.status === "action-needed").length;

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/notices", label: "Notices", icon: FileWarning, count: notices.length, urgent: noticesNeedingAction > 0 },
  { href: "/tax-years", label: "Tax Years", icon: CalendarRange },
  { href: "/action-items", label: "Action Items", icon: ListChecks, count: openActionItems.length },
  { href: "/documents", label: "Documents", icon: FolderOpen },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="flex h-14 items-center gap-2.5 border-b px-5">
        <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
          <ShieldCheck className="size-4.5" aria-hidden />
        </span>
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-tight">T-Res</div>
          <div className="text-xs text-muted-foreground">Tax resolution</div>
        </div>
      </div>

      <nav aria-label="Main" className="flex-1 space-y-0.5 p-3">
        {navItems.map(({ href, label, icon: Icon, count, urgent }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/8 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4" aria-hidden />
              <span className="flex-1">{label}</span>
              {count !== undefined && (
                <span
                  className={cn(
                    "min-w-5 rounded-full px-1.5 text-center text-xs font-semibold tabular-nums",
                    urgent ? "bg-bad-soft text-bad" : "bg-muted text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <div className="flex items-center gap-3 rounded-lg bg-muted/60 p-3">
          <span className="grid size-8 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            CG
          </span>
          <div className="min-w-0 leading-tight">
            <div className="text-xs text-muted-foreground">Your {enrolledAgent.credential}</div>
            <div className="truncate text-sm font-medium">{enrolledAgent.name}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
