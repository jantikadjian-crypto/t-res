import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { LinkButton } from "@/components/link-button";
import { enrolledAgent, taxpayer } from "@/lib/mockData";

const initials = enrolledAgent.name
  .split(/\s+/)
  .map((w) => w[0])
  .join("")
  .slice(0, 2);

// Mock of PLCY, T-Res's AI governance layer, as Chris sees it. Full-screen, outside the T-Res shell.
export function PlcyFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas">
      <p className="bg-foreground px-4 py-1.5 text-center text-xs text-background">
        Demo: this is what {enrolledAgent.name} sees in PLCY. {taxpayer.firstName} never sees this screen.
      </p>
      <header className="sticky top-0 z-20 border-b bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/plcy" className="text-xl leading-none font-extrabold tracking-tight">
              PLCY
            </Link>
            <span className="hidden text-sm text-muted-foreground sm:inline">AI Governance</span>
            <span className="hidden h-5 w-px bg-border md:block" aria-hidden />
            <span className="hidden items-center gap-1.5 rounded-md border bg-accent px-2 py-0.5 text-xs font-medium md:inline-flex">
              <ShieldCheck className="size-3.5 text-primary" aria-hidden />
              Workspace: T-Res
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden items-center gap-2 text-sm font-medium lg:flex">
              <span className="grid size-7 place-items-center rounded bg-primary/10 text-[11px] font-semibold text-primary">
                {initials}
              </span>
              {enrolledAgent.name} · EA
            </span>
            <LinkButton href="/" variant="outline" size="sm">
              <ArrowLeft aria-hidden />
              Back to {taxpayer.firstName}&apos;s view
            </LinkButton>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6">{children}</main>
    </div>
  );
}
