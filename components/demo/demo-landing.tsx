import { ArrowRight, Briefcase, ClipboardCheck, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/link-button";
import { formatMoney } from "@/lib/format";
import { practitioner, taxpayer, totalOwed } from "@/lib/mockData";

// Front door for a shared demo link: three ways into the same case. Jordan's app stays at /.
const views = [
  {
    href: "/assessment",
    icon: ClipboardCheck,
    iconClass: "text-purple-600",
    eyebrow: "Start here",
    title: "The public assessment",
    who: "What someone with an IRS letter sees first",
    blurb:
      "Five quick questions give a plain-English read on the problem and the best way to resolve it, then it continues into Get Started as a brand-new client.",
    cta: "Take the assessment",
  },
  {
    href: "/",
    icon: UserRound,
    iconClass: "text-blue-600",
    eyebrow: "The client's side",
    title: "The taxpayer's app",
    who: `${taxpayer.firstName} ${taxpayer.lastName}, who owes ${formatMoney(totalOwed)} for 2021–2023`,
    blurb:
      "Every IRS letter translated, what to do next, the case file, and our own e-signature flow. Sign Form 2848 and watch the case move.",
    cta: `Open ${taxpayer.firstName}'s app`,
  },
  {
    href: "/pro/login",
    icon: Briefcase,
    iconClass: "text-green-600",
    eyebrow: "The professional's side",
    title: "T-Res Pro",
    who: "The Enrolled Agent or CPA who supervises the AI",
    blurb:
      "One queue of what needs a human today, with minutes per item. Everything else is approved automatically under policies the professional set.",
    cta: "Sign in to T-Res Pro",
  },
];

export function DemoLanding() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 md:px-6 md:py-16">
      <header className="mb-10 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-2xl leading-none font-extrabold tracking-tight text-primary">T-Res</span>
          <span className="inline-flex items-center gap-1 rounded-md border border-yellow-200 bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-800">
            Prototype · fictional data
          </span>
        </div>
        <h1 className="max-w-2xl text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          AI resolves the tax debt. A licensed professional approves what the law says only a human can.
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          T-Res turns IRS letters into plain English and does nearly all of the work, so an Enrolled Agent or CPA
          reviews by exception instead of handling every case. Pick a view below.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {views.map((v) => (
          <Card key={v.href} className="flex flex-col">
            <CardContent className="flex flex-1 flex-col gap-3">
              <span className="grid size-10 place-items-center rounded-lg bg-accent">
                <v.icon className={`size-5 ${v.iconClass}`} aria-hidden />
              </span>
              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{v.eyebrow}</p>
                <h2 className="text-lg font-medium">{v.title}</h2>
                <p className="text-sm text-muted-foreground">{v.who}</p>
              </div>
              <p className="flex-1 text-sm">{v.blurb}</p>
              <LinkButton href={v.href} className="w-full">
                {v.cta}
                <ArrowRight aria-hidden />
              </LinkButton>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex gap-3">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            <div className="space-y-1 text-sm">
              <p className="font-medium">Both sides are the same case</p>
              <p className="text-muted-foreground">
                Sign Form 2848 as {taxpayer.firstName}, then open T-Res Pro: the signature clears the check that was
                holding up the professional&apos;s approval. Use the account menu in either app to switch.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex gap-3">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            <div className="space-y-1 text-sm">
              <p className="font-medium">Signing in to T-Res Pro</p>
              <p className="text-muted-foreground">
                Any email and password work. The two-step code is <span className="font-mono">{practitioner.demoCode}</span>,
                and it&apos;s shown on screen.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        Everyone in here is invented, including the taxpayer, the clients and the Enrolled Agent. No real taxpayer
        information, no IRS connection, and nothing is saved: refresh the page and the demo starts over.
      </p>
    </main>
  );
}
