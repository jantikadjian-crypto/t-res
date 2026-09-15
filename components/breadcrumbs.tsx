"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, House } from "lucide-react";
import { breadcrumbsFor } from "@/lib/navigation";
import { cn } from "@/lib/utils";

// Home icon › Section › Page, as in the PLCY console header. On phones only the current page shows.
export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname();
  const crumbs = breadcrumbsFor(pathname);

  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
      <ol className="flex min-w-0 items-center gap-1.5 text-sm">
        <li className="flex shrink-0 items-center">
          <Link href="/" aria-label="Home" className="rounded-sm p-0.5 text-muted-foreground hover:text-foreground">
            <House className="size-4" aria-hidden />
          </Link>
        </li>
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={`${c.label}-${i}`} className={cn("flex min-w-0 items-center gap-1.5", !last && "hidden sm:flex")}>
              <ChevronRight className="size-3.5 shrink-0 text-foreground/70" aria-hidden />
              {last ? (
                <span aria-current="page" className="truncate font-medium text-foreground">
                  {c.label}
                </span>
              ) : (
                <Link href={c.href ?? "/"} className="truncate font-medium text-muted-foreground hover:text-foreground">
                  {c.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
