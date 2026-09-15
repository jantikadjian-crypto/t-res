"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, House } from "lucide-react";
import { breadcrumbsFor, type Crumb } from "@/lib/navigation";
import { cn } from "@/lib/utils";

// Home icon › Section › Page, as in the PLCY console header. On phones only the current page shows.
// Defaults to the taxpayer app's trail; T-Res Pro passes its own crumbs and its own home.
export function Breadcrumbs({
  className,
  crumbs,
  homeHref = "/",
  homeLabel = "Home",
}: {
  className?: string;
  crumbs?: Crumb[];
  homeHref?: string;
  homeLabel?: string;
}) {
  const pathname = usePathname();
  const trail = crumbs ?? breadcrumbsFor(pathname);

  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
      <ol className="flex min-w-0 items-center gap-1.5 text-sm">
        <li className="flex shrink-0 items-center">
          <Link href={homeHref} aria-label={homeLabel} className="rounded-sm p-0.5 text-muted-foreground hover:text-foreground">
            <House className="size-4" aria-hidden />
          </Link>
        </li>
        {trail.map((c, i) => {
          const last = i === trail.length - 1;
          return (
            <li key={`${c.label}-${i}`} className={cn("flex min-w-0 items-center gap-1.5", !last && "hidden sm:flex")}>
              <ChevronRight className="size-3.5 shrink-0 text-foreground/70" aria-hidden />
              {last ? (
                <span aria-current="page" className="truncate font-medium text-foreground">
                  {c.label}
                </span>
              ) : (
                <Link href={c.href ?? homeHref} className="truncate font-medium text-muted-foreground hover:text-foreground">
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
