"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Desktop: collapse the fixed sidebar. Phone: open it as a drawer.
  const toggleSidebar = () => {
    if (window.matchMedia("(min-width: 768px)").matches) setCollapsed((c) => !c);
    else setMenuOpen(true);
  };

  return (
    <div className="min-h-screen">
      <aside className={cn("fixed inset-y-0 left-0 z-30 hidden w-64 border-r", !collapsed && "md:block")}>
        <Sidebar />
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            className="absolute inset-0 bg-foreground/30"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="relative h-full w-72 max-w-[85vw] shadow-xl">
            <Sidebar onNavigate={() => setMenuOpen(false)} />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <X />
            </Button>
          </aside>
        </div>
      )}

      <div className={cn(!collapsed && "md:pl-64")}>
        <Topbar onToggleSidebar={toggleSidebar} />
        <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6">{children}</main>
      </div>
    </div>
  );
}
