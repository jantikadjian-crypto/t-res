"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  FileText,
  ListChecks,
  Lock,
  ScanSearch,
  ShieldCheck,
  Siren,
  TrendingDown,
  Zap,
} from "lucide-react";
import { useLead, type Lead } from "@/components/assessment/lead-provider";
import { Field, inputClass } from "@/components/form";
import { LinkButton } from "@/components/link-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EMERGENCY_SITUATION, SITUATION_OPTIONS } from "@/lib/intakeScreens";
import { cn } from "@/lib/utils";

// Public lead-capture page, step 1 of the T-Res funnel ("Acquire: Assessment"). Answers live in React state only.
// Nothing is sent anywhere in v1: a real lead store arrives with the backend in v2.

const OWED = [
  { value: "under-10k", label: "Under $10,000", max: 10000 },
  { value: "10-25k", label: "$10,000 to $25,000", max: 25000 },
  { value: "25-50k", label: "$25,000 to $50,000", max: 50000 },
  { value: "50-100k", label: "$50,000 to $100,000", max: 100000 },
  { value: "over-100k", label: "More than $100,000", max: Infinity },
  { value: "unsure", label: "I'm not sure", max: 50000 },
];
const UNFILED = [
  { value: "none", label: "No, everything is filed", count: 0 },
  { value: "1-2", label: "Yes, one or two years", count: 2 },
  { value: "3+", label: "Yes, three or more years", count: 3 },
  { value: "unsure", label: "I'm not sure", count: 0 },
];
const TAKEN = [
  { value: "no", label: "No, nothing yet" },
  { value: "yes", label: "Yes, they took money or contacted my employer" },
  { value: "unsure", label: "I'm not sure" },
];

type Answers = {
  situation: string;
  owed: string;
  unfiled: string;
  taken: string;
  name: string;
  email: string;
  phone: string;
  consent: boolean;
};
const blank: Answers = {
  situation: "",
  owed: "",
  unfiled: "",
  taken: "",
  name: "",
  email: "",
  phone: "",
  consent: false,
};

const QUESTION_COUNT = 5;

type Result = {
  path: "urgent" | "self-serve" | "full";
  title: string;
  summary: string;
  reasons: string[];
};

function assess(a: Answers): Result {
  const owed = OWED.find((o) => o.value === a.owed)!;
  const unfiled = UNFILED.find((u) => u.value === a.unfiled)!;
  const urgent = a.situation === EMERGENCY_SITUATION || a.taken === "yes";
  if (urgent) {
    return {
      path: "urgent",
      title: "This needs a person today.",
      summary: `Because the IRS has already taken money or contacted your employer, we move your case to the front of the line. A Tax Specialist (CPA or Enrolled Agent) reviews it the same day.`,
      reasons: [
        "Money taken or an employer contacted is the most time-sensitive situation.",
        "We'll start on the paperwork that can stop it as soon as you finish your full assessment.",
      ],
    };
  }
  const reasons: string[] = [];
  const bigBalance = owed.max > 50000;
  const manyUnfiled = unfiled.count > 2;
  if (bigBalance)
    reasons.push(
      "A balance over $50,000 needs a full financial review by the IRS.",
    );
  else
    reasons.push(
      "Your balance is in the range where many people set up a payment plan themselves, with our help.",
    );
  if (manyUnfiled)
    reasons.push(
      "Three or more unfiled years takes a Tax Specialist to catch up safely.",
    );
  else if (a.unfiled === "unsure")
    reasons.push("We'll check which years are filed from your IRS records.");
  else if (unfiled.count > 0)
    reasons.push(
      "We'll prepare your missing returns first. Filing often lowers what the IRS says you owe.",
    );
  else
    reasons.push("All your returns are filed, which keeps your options open.");
  if (bigBalance || manyUnfiled) {
    return {
      path: "full",
      title: "You'd likely do best with a Tax Specialist.",
      summary:
        "Your situation is bigger than a do-it-yourself fix. A Tax Specialist (CPA or Enrolled Agent) can deal with the IRS for you, and T-Res does the preparation.",
      reasons,
    };
  }
  return {
    path: "self-serve",
    title: "You can likely resolve this yourself, with our help.",
    summary:
      "T-Res reads your notices, prepares every form and letter, and tells you exactly what to do next. You stay in control and talk to the IRS yourself.",
    reasons,
  };
}

const PROMISES = [
  {
    icon: ShieldCheck,
    title: "Expert-Built",
    text: "Created by IRS Tax Professionals.",
  },
  {
    icon: TrendingDown,
    title: "Max Savings",
    text: "Designed to legally reduce your tax liability and remove penalties where the law allows.",
  },
  {
    icon: Zap,
    title: "Zero Hassle",
    text: "Complex IRS paperwork simplified into a fast, guided AI system.",
  },
];

const STEPS = [
  {
    icon: ClipboardCheck,
    title: "Answer five questions",
    text: "About two minutes. No documents needed yet.",
  },
  {
    icon: FileSearch,
    title: "Get your plain-English read",
    text: "We tell you what kind of problem this is and the best way to resolve it.",
  },
  {
    icon: ShieldCheck,
    title: "Start your case",
    text: "Upload your letter and T-Res builds your plan, step by step.",
  },
];

export function AssessmentLanding() {
  const [a, setA] = useState<Answers>(blank);
  const [q, setQ] = useState(0);
  const [done, setDone] = useState(false);
  const { setLead } = useLead();
  const set = <K extends keyof Answers>(k: K, v: Answers[K]) =>
    setA((p) => ({ ...p, [k]: v }));

  const emailOk = /^\S+@\S+\.\S+$/.test(a.email);
  const ready = [
    !!a.situation,
    !!a.owed,
    !!a.unfiled,
    !!a.taken,
    a.name.trim().length > 0 && emailOk && a.consent,
  ][q];
  const result = done ? assess(a) : null;

  function next() {
    if (q === QUESTION_COUNT - 1) {
      setLead({
        name: a.name.trim().split(" ")[0],
        situation: a.situation,
        owedLabel: OWED.find((o) => o.value === a.owed)!.label,
        unfiled: a.unfiled as Lead["unfiled"],
        unfiledLabel: UNFILED.find((u) => u.value === a.unfiled)!.label,
        taken: a.taken as Lead["taken"],
        takenLabel: TAKEN.find((t) => t.value === a.taken)!.label,
      });
      setDone(true);
    } else setQ(q + 1);
  }

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-20 border-b bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6">
          <Link
            href="/assessment"
            className="text-xl leading-none font-extrabold tracking-tight text-primary"
          >
            T-Res
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/questions"
              className="hidden text-muted-foreground hover:text-foreground sm:block"
            >
              Questions &amp; answers
            </Link>
            <LinkButton href="/" variant="outline" size="sm">
              Sign in
            </LinkButton>
          </nav>
        </div>
      </header>

      <main>
        <TopBanner />
        <section className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:px-6 md:py-16 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <div className="space-y-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <BadgeCheck className="size-3.5" aria-hidden /> Free · 2 minutes ·
              no credit card
            </span>
            <h1 className="text-4xl leading-tight font-extrabold tracking-tight md:text-5xl">
              Got a letter from the IRS? Find out your options in two minutes.
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              T-Res is an AI tax resolution assessment. Answer five questions
              and we&apos;ll tell you, in plain English, what your IRS problem
              is and the best way to resolve it.
            </p>
            <ul className="space-y-2 text-sm">
              {[
                "Created by IRS tax professionals.",
                "Calm, plain-English answers. No jargon.",
                "If the IRS is already taking money, we move you to the front of the line.",
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <CheckCircle2
                    className="mt-0.5 size-4 shrink-0 text-green-600"
                    aria-hidden
                  />
                  {t}
                </li>
              ))}
            </ul>
            <HeroGraphic />
          </div>

          <div className="space-y-4">
            <Card className="gap-0 p-6 shadow-sm" id="start">
              {result ? (
                <div className="space-y-4" aria-live="polite">
                  <div
                    className={cn(
                      "flex items-center gap-2 text-sm font-medium",
                      result.path === "urgent"
                        ? "text-red-700"
                        : "text-green-700",
                    )}
                  >
                    {result.path === "urgent" ? (
                      <Siren className="size-4" aria-hidden />
                    ) : (
                      <CheckCircle2 className="size-4" aria-hidden />
                    )}
                    Your first read, {a.name.trim().split(" ")[0]}
                  </div>
                  <h2 className="text-2xl font-bold">{result.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {result.summary}
                  </p>
                  <ul className="space-y-2 rounded-lg bg-canvas p-4 text-sm">
                    {result.reasons.map((r) => (
                      <li key={r} className="flex gap-2">
                        <ArrowRight
                          className="mt-0.5 size-4 shrink-0 text-primary"
                          aria-hidden
                        />
                        {r}
                      </li>
                    ))}
                  </ul>
                  <LinkButton
                    href="/intake/notice"
                    size="lg"
                    className="w-full"
                  >
                    Continue your full assessment <ArrowRight aria-hidden />
                  </LinkButton>
                  <p className="text-xs text-muted-foreground">
                    This is a first read from your answers, not tax advice. Your
                    full assessment uses your actual notice. In this prototype
                    nothing you typed here is sent or saved.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setDone(false);
                      setQ(0);
                    }}
                    className="text-xs text-primary underline-offset-2 hover:underline"
                  >
                    Change my answers
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground tabular-nums">
                      Question {q + 1} of {QUESTION_COUNT}
                    </p>
                    <div
                      className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
                      role="progressbar"
                      aria-valuenow={q + 1}
                      aria-valuemin={1}
                      aria-valuemax={QUESTION_COUNT}
                    >
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{
                          width: `${((q + 1) / QUESTION_COUNT) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {q === 0 && (
                    <Choices
                      legend="What best describes your situation?"
                      value={a.situation}
                      onChange={(v) => set("situation", v)}
                      options={SITUATION_OPTIONS.map((o) => ({
                        value: o.value,
                        label: o.value,
                        hint: o.description,
                      }))}
                    />
                  )}
                  {q === 1 && (
                    <Choices
                      legend="About how much do you owe the IRS?"
                      value={a.owed}
                      onChange={(v) => set("owed", v)}
                      options={OWED}
                    />
                  )}
                  {q === 2 && (
                    <Choices
                      legend="Are there tax years you haven't filed?"
                      value={a.unfiled}
                      onChange={(v) => set("unfiled", v)}
                      options={UNFILED}
                    />
                  )}
                  {q === 3 && (
                    <Choices
                      legend="Has the IRS taken money from your pay or bank, or contacted your employer?"
                      value={a.taken}
                      onChange={(v) => set("taken", v)}
                      options={TAKEN}
                    />
                  )}
                  {q === 4 && (
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold">
                        Where should we send your results?
                      </h2>
                      <Field id="lead-name" label="First name">
                        <input
                          id="lead-name"
                          className={inputClass}
                          autoComplete="given-name"
                          value={a.name}
                          onChange={(e) => set("name", e.target.value)}
                        />
                      </Field>
                      <Field id="lead-email" label="Email">
                        <input
                          id="lead-email"
                          type="email"
                          className={inputClass}
                          autoComplete="email"
                          value={a.email}
                          onChange={(e) => set("email", e.target.value)}
                        />
                      </Field>
                      <Field
                        id="lead-phone"
                        label="Phone (optional)"
                        hint="Only used if your case is urgent."
                      >
                        <input
                          id="lead-phone"
                          type="tel"
                          className={inputClass}
                          autoComplete="tel"
                          value={a.phone}
                          onChange={(e) => set("phone", e.target.value)}
                        />
                      </Field>
                      <label className="flex gap-2 text-xs text-muted-foreground">
                        <input
                          type="checkbox"
                          className="mt-0.5"
                          checked={a.consent}
                          onChange={(e) => set("consent", e.target.checked)}
                        />
                        <span>
                          I agree T-Res may contact me about my assessment. I
                          can stop at any time. We never ask for your SSN here.
                        </span>
                      </label>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQ(q - 1)}
                      disabled={q === 0}
                    >
                      <ArrowLeft aria-hidden /> Back
                    </Button>
                    <Button onClick={next} disabled={!ready}>
                      {q === QUESTION_COUNT - 1 ? "See my results" : "Continue"}{" "}
                      <ArrowRight aria-hidden />
                    </Button>
                  </div>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Lock className="size-3" aria-hidden /> Private. We
                    don&apos;t sell your information.
                  </p>
                </div>
              )}
            </Card>
            <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {PROMISES.map((p) => (
                <li key={p.title} className="flex gap-2.5 text-sm">
                  <p.icon
                    className="mt-0.5 size-4 shrink-0 text-primary"
                    aria-hidden
                  />
                  <span>
                    <span className="font-semibold">{p.title}</span>
                    <span className="block text-xs text-muted-foreground">
                      {p.text}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-y bg-background">
          <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
            <h2 className="text-2xl font-bold">How it works</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <div key={s.title} className="flex gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <s.icon className="size-5" aria-hidden />
                  </span>
                  <div>
                    <p className="font-semibold">
                      {i + 1}. {s.title}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {s.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="gap-2 p-6">
              <h2 className="text-lg font-bold">
                Why you can trust the answer
              </h2>
              <p className="text-sm text-muted-foreground">
                Every AI result in T-Res carries a badge. &quot;Checked by
                T-Res&quot; means automated checks ran under rules our Tax
                Specialists approved. &quot;Approved by a Tax Specialist&quot;
                means a licensed CPA or Enrolled Agent signed off personally.
                Anything sent to the IRS on your behalf always is.
              </p>
            </Card>
            <Card className="gap-2 p-6">
              <h2 className="text-lg font-bold">
                What this is, and isn&apos;t
              </h2>
              <p className="text-sm text-muted-foreground">
                This assessment gives you a first read, not a guarantee. We
                never promise a result with the IRS, and you can leave or cancel
                at any time. Read more in our{" "}
                <Link
                  href="/questions"
                  className="text-primary underline-offset-2 hover:underline"
                >
                  questions &amp; answers
                </Link>
                .
              </p>
            </Card>
          </div>
          <div className="mt-10 rounded-xl border bg-background p-6 text-center">
            <p className="mx-auto mb-4 max-w-xl text-sm text-muted-foreground">
              Built by a team of IRS Tax Professionals with over 20 years of
              combined tax relief experience.
            </p>
            <h2 className="text-xl font-bold">Ready to see where you stand?</h2>
            <a
              href="#start"
              className="mt-3 inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground"
            >
              Start my free assessment{" "}
              <ArrowRight className="size-4" aria-hidden />
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t bg-background py-6 text-center text-xs text-muted-foreground">
        © T-Res. Prototype for demonstration. Not legal or tax advice.
      </footer>
    </div>
  );
}

// Picture of the product: a letter goes in, a plan comes out. The figures are an example, and it says so.
function TopBanner() {
  const chips = [
    "IRS letter decoded",
    "Penalties reviewed",
    "Payment plan prepared",
    "Levy response prepared",
  ];
  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 md:px-6 md:pt-8">
      <div className="overflow-hidden rounded-2xl border bg-gradient-to-br from-blue-50 via-background to-green-50 px-4 pt-5 pb-4 md:px-8">
        <svg
          viewBox="0 0 1000 200"
          className="mx-auto h-auto w-full max-w-4xl"
          role="img"
          aria-label="An IRS letter is read by T-Res, checked by a Tax Specialist, and turned into a checklist of prepared steps"
        >
          {/* IRS letter */}
          <g transform="translate(40 24)">
            <rect
              x="0"
              y="0"
              width="150"
              height="152"
              rx="10"
              className="fill-white stroke-slate-300"
              strokeWidth="2"
            />
            <text
              x="18"
              y="36"
              fontSize="26"
              fontWeight="800"
              letterSpacing="2"
              fontFamily="ui-sans-serif, system-ui, Arial, sans-serif"
              className="fill-slate-700"
            >
              IRS
            </text>
            <rect
              x="18"
              y="42"
              width="114"
              height="7"
              rx="3.5"
              className="fill-slate-200"
            />
            <rect
              x="18"
              y="58"
              width="104"
              height="7"
              rx="3.5"
              className="fill-slate-200"
            />
            <rect
              x="18"
              y="74"
              width="114"
              height="7"
              rx="3.5"
              className="fill-slate-200"
            />
            <rect
              x="18"
              y="90"
              width="80"
              height="7"
              rx="3.5"
              className="fill-slate-200"
            />
            <rect
              x="18"
              y="112"
              width="84"
              height="26"
              rx="6"
              className="fill-red-50 stroke-red-400"
              strokeWidth="2"
            />
            <rect
              x="30"
              y="122"
              width="60"
              height="6"
              rx="3"
              className="fill-red-400"
            />
          </g>
          {/* arrow 1 */}
          <g
            className="stroke-primary"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          >
            <path d="M215 100 H300" strokeDasharray="2 12" />
            <path d="M292 88 L306 100 L292 112" />
          </g>
          {/* AI reads the letter, a Tax Specialist checks it */}
          <g transform="translate(330 14)">
            <rect
              x="0"
              y="0"
              width="170"
              height="172"
              rx="22"
              className="fill-primary"
            />
            <rect
              x="28"
              y="24"
              width="92"
              height="118"
              rx="8"
              className="fill-white"
            />
            <rect
              x="42"
              y="42"
              width="52"
              height="8"
              rx="4"
              className="fill-blue-200"
            />
            <rect
              x="42"
              y="60"
              width="64"
              height="6"
              rx="3"
              className="fill-slate-200"
            />
            <rect
              x="42"
              y="74"
              width="58"
              height="6"
              rx="3"
              className="fill-slate-200"
            />
            <rect
              x="42"
              y="88"
              width="64"
              height="6"
              rx="3"
              className="fill-slate-200"
            />
            <path
              d="M22 106 H126"
              className="stroke-green-500"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="3 7"
            />
            <path
              d="M138 22 L143 36 L157 41 L143 46 L138 60 L133 46 L119 41 L133 36 Z"
              fill="white"
            />
            <circle
              cx="132"
              cy="136"
              r="30"
              className="fill-white stroke-primary"
              strokeWidth="4"
            />
            <circle cx="132" cy="126" r="8" className="fill-primary" />
            <path
              d="M115 150 C115 138 149 138 149 150 Z"
              className="fill-primary"
            />
            <circle
              cx="154"
              cy="156"
              r="11"
              className="fill-green-500 stroke-white"
              strokeWidth="3"
            />
            <path
              d="M149 156 L153 160 L160 151"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          {/* arrow 2 */}
          <g
            className="stroke-primary"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          >
            <path d="M525 100 H610" strokeDasharray="2 12" />
            <path d="M602 88 L616 100 L602 112" />
          </g>
          {/* what gets prepared: a checklist, with the last step still yours */}
          <g transform="translate(650 24)">
            <rect
              x="0"
              y="0"
              width="310"
              height="152"
              rx="10"
              className="fill-white stroke-slate-300"
              strokeWidth="2"
            />
            <circle
              cx="40"
              cy="38"
              r="13"
              className="fill-green-100 stroke-green-500"
              strokeWidth="3"
            />
            <path
              d="M33 38 L38 43 L47 33"
              fill="none"
              className="stroke-green-600"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect
              x="70"
              y="30"
              width="150"
              height="9"
              rx="4.5"
              className="fill-slate-300"
            />
            <rect
              x="70"
              y="44"
              width="100"
              height="6"
              rx="3"
              className="fill-slate-200"
            />
            <circle
              cx="40"
              cy="76"
              r="13"
              className="fill-green-100 stroke-green-500"
              strokeWidth="3"
            />
            <path
              d="M33 76 L38 81 L47 71"
              fill="none"
              className="stroke-green-600"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect
              x="70"
              y="68"
              width="190"
              height="9"
              rx="4.5"
              className="fill-slate-300"
            />
            <rect
              x="70"
              y="82"
              width="120"
              height="6"
              rx="3"
              className="fill-slate-200"
            />
            <circle
              cx="40"
              cy="114"
              r="13"
              className="fill-white stroke-primary"
              strokeWidth="3"
              strokeDasharray="4 4"
            />
            <rect
              x="70"
              y="106"
              width="130"
              height="9"
              rx="4.5"
              className="fill-slate-300"
            />
            <rect
              x="70"
              y="120"
              width="170"
              height="6"
              rx="3"
              className="fill-slate-200"
            />
            <rect
              x="244"
              y="104"
              width="46"
              height="20"
              rx="10"
              className="fill-blue-50 stroke-primary"
              strokeWidth="2"
            />
            <rect
              x="254"
              y="111"
              width="26"
              height="6"
              rx="3"
              className="fill-primary"
            />
          </g>
        </svg>
        <ul className="mt-3 flex flex-wrap justify-center gap-2 text-xs font-medium">
          {chips.map((c) => (
            <li
              key={c}
              className="inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1"
            >
              <CheckCircle2 className="size-3.5 text-green-600" aria-hidden />
              {c}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Illustration. Results depend on your case.
        </p>
      </div>
    </div>
  );
}

function HeroGraphic() {
  const nodes = [
    {
      icon: FileText,
      tone: "bg-red-50 text-red-700",
      label: "The letter you got",
      title: "CP504 · Notice of Intent to Levy",
      detail: "Has a deadline to respond",
    },
    {
      icon: ScanSearch,
      tone: "bg-primary/10 text-primary",
      label: "T-Res reads it",
      title: "What it means, in plain English",
      detail: "Checked under rules our Tax Specialists approved",
    },
    {
      icon: ListChecks,
      tone: "bg-green-50 text-green-700",
      label: "Your plan",
      title: "Your options and next steps",
      detail: "Forms and letters ready for you to review and sign",
    },
  ];
  return (
    <figure
      className="max-w-xl rounded-xl border bg-background p-5 shadow-sm"
      aria-label="How T-Res turns an IRS letter into a plan"
    >
      <ol className="space-y-0">
        {nodes.map((n, i) => (
          <li key={n.label} className="relative flex gap-3 pb-5 last:pb-0">
            {i < nodes.length - 1 && (
              <span
                className="absolute top-10 bottom-0 left-5 w-px bg-border"
                aria-hidden
              />
            )}
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-full",
                n.tone,
              )}
            >
              <n.icon className="size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {n.label}
              </p>
              <p className="text-sm font-semibold">{n.title}</p>
              <p className="text-xs text-muted-foreground">{n.detail}</p>
            </div>
          </li>
        ))}
      </ol>
      <figcaption className="mt-4 flex items-center gap-1.5 border-t pt-3 text-xs text-muted-foreground">
        <BadgeCheck className="size-3.5 text-green-600" aria-hidden /> Example
        only. Your options depend on your own letter and numbers.
      </figcaption>
    </figure>
  );
}

function Choices({
  legend,
  value,
  onChange,
  options,
}: {
  legend: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; hint?: string }[];
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-1 text-lg font-semibold">{legend}</legend>
      {options.map((o) => (
        <label
          key={o.value}
          className={cn(
            "flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-canvas",
            value === o.value && "border-primary bg-primary/5",
          )}
        >
          <input
            type="radio"
            name={legend}
            className="mt-1"
            checked={value === o.value}
            onChange={() => onChange(o.value)}
          />
          <span>
            <span className="font-medium">{o.label}</span>
            {o.hint && (
              <span className="block text-xs text-muted-foreground">
                {o.hint}
              </span>
            )}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
