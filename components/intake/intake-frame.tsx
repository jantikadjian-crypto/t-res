"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Circle, CircleDot, Info, LogOut, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { LinkButton } from "@/components/link-button";
import { useIntake } from "@/components/intake/intake-provider";
import { formatDate } from "@/lib/format";
import {
  firstScreenOfStep,
  FIRST_SCREEN,
  getScreen,
  intakeScreens,
  intakeSteps,
  isUrgent,
  nextSlug,
  prevSlug,
  questionPosition,
} from "@/lib/intakeScreens";
import { enrolledAgent, intakeAnswers } from "@/lib/mockData";
import { cn } from "@/lib/utils";

// Full-screen wizard frame: no app sidebar. Header, progress, step rail, question, Back/Continue.
export function IntakeFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const slug = pathname.split("/")[2] || FIRST_SCREEN;
  const screen = getScreen(slug) ?? intakeScreens[0];
  const { state, replayBannerOpen, dismissReplayBanner } = useIntake();

  const stepIndex = intakeSteps.findIndex((s) => s.key === screen.step); // -1 on the finish screen
  const screenIndex = intakeScreens.findIndex((s) => s.slug === screen.slug);
  const pct = Math.round(((screenIndex + 1) / intakeScreens.length) * 100);
  const next = nextSlug(screen.slug, state);
  const prev = prevSlug(screen.slug, state);
  const answered = screen.isAnswered(state);
  const question = questionPosition(screen.slug);
  const isDone = screen.step === "done";

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-20 border-b bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <Link href="/" className="text-xl leading-none font-extrabold tracking-tight text-primary">
              T-Res
            </Link>
            <span className="hidden h-5 w-px bg-border sm:block" aria-hidden />
            <Breadcrumbs className="hidden sm:block" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground tabular-nums">
              {isDone ? "All done" : `Step ${stepIndex + 1} of ${intakeSteps.length}`}
            </span>
            <LinkButton href="/" variant="outline" size="sm">
              <LogOut aria-hidden />
              Save &amp; exit
            </LinkButton>
          </div>
        </div>
        <div
          className="h-1 w-full bg-secondary"
          role="progressbar"
          aria-label="Get Started progress"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="h-1 bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
      </header>

      {replayBannerOpen && (
        <div className="border-b border-blue-200 bg-blue-50">
          <div className="mx-auto flex max-w-6xl items-start gap-3 px-4 py-3 text-sm text-blue-800 md:px-6">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p className="flex-1">
              You finished this on {formatDate(intakeAnswers.submittedOn)}. We&apos;re showing your answers, and changes
              here aren&apos;t saved.
            </p>
            <button
              type="button"
              onClick={dismissReplayBanner}
              aria-label="Dismiss"
              className="rounded-md p-0.5 hover:bg-blue-100"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:px-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:py-12">
        <nav aria-label="Get Started steps" className="hidden lg:block">
          <ol className="sticky top-24 space-y-1">
            {intakeSteps.map((step, i) => {
              const status = isDone || i < stepIndex ? "done" : i === stepIndex ? "current" : "upcoming";
              return (
                <li key={step.key}>
                  {status === "done" ? (
                    <Link
                      href={`/intake/${firstScreenOfStep(step.key)}`}
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent"
                    >
                      <CheckCircle2 className="size-4 text-green-600" aria-hidden />
                      {step.label}
                    </Link>
                  ) : (
                    <div
                      aria-current={status === "current" ? "step" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm",
                        status === "current" ? "bg-secondary font-medium" : "text-muted-foreground"
                      )}
                    >
                      {status === "current" ? (
                        <CircleDot className="size-4 text-primary" aria-hidden />
                      ) : (
                        <Circle className="size-4" aria-hidden />
                      )}
                      {step.label}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <main className="mx-auto w-full max-w-2xl pb-24 lg:mx-0 lg:pb-0">
          {screen.slug === "authorization" && isUrgent(state) && (
            <div role="alert" className="mb-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-600" aria-hidden />
              <p className="text-sm text-red-800">
                <span className="font-medium text-red-900">{enrolledAgent.name} will review your case today.</span>{" "}
                Signing Form 2848 below lets him contact the IRS to get the money released.
              </p>
            </div>
          )}

          {question.count > 1 && (
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Question {question.index + 1} of {question.count}
            </p>
          )}
          <h1 className="text-2xl font-semibold tracking-tight text-balance">{screen.title}</h1>
          <p className="mt-2 text-muted-foreground">{screen.why}</p>

          <div className="mt-8">{children}</div>

          {!isDone && (
            <div className="fixed inset-x-0 bottom-0 z-10 border-t bg-background px-4 py-3 lg:static lg:mt-10 lg:border-0 lg:bg-transparent lg:p-0">
              <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
                {prev ? (
                  <LinkButton href={`/intake/${prev}`} variant="ghost">
                    <ArrowLeft aria-hidden />
                    Back
                  </LinkButton>
                ) : (
                  <span />
                )}
                {next &&
                  (answered ? (
                    <LinkButton href={`/intake/${next}`}>
                      Continue
                      <ArrowRight aria-hidden />
                    </LinkButton>
                  ) : (
                    <Button disabled>
                      Continue
                      <ArrowRight aria-hidden />
                    </Button>
                  ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
