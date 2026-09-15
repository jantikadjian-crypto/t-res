"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// Each settings tab is its own page, so it also works in the shared progress link.
const tabs = [
  { href: "/pro/settings", label: "Profile" },
  { href: "/pro/settings/firm", label: "Firm & team" },
  { href: "/pro/settings/notifications", label: "Notifications" },
  { href: "/pro/settings/security", label: "Security" },
  { href: "/pro/settings/billing", label: "Billing & plan" },
];

export function ProSettingsTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Settings" className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1 sm:grid-cols-5">
      {tabs.map((t) => {
        const active = t.href === "/pro/settings" ? pathname === "/pro/settings" : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-lg px-2 py-1.5 text-center text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              active ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
