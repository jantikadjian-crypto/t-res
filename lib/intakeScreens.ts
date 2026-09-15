// Get Started wizard: the one list of steps and screens. The rail, progress bar,
// Back/Continue and routing all read from here. Spec: docs/intake-wizard-scope.md.
import { formatMoney } from "@/lib/format";
import { intakeAnswers, taxpayer, taxYears, totalOwed, type IntakeAnswers } from "@/lib/mockData";

export const EMERGENCY_SITUATION = "The IRS took money from my pay or bank account";

export const SITUATION_OPTIONS: { value: string; description: string }[] = [
  { value: "I owe and can't pay it all at once", description: "The most common situation, and there are good options for it." },
  { value: "I owe and can pay", description: "We'll check the amount is right and help you pay without extra penalties." },
  { value: "I haven't filed some years", description: "We'll get you caught up. Filing often lowers what the IRS says you owe." },
  { value: "I got a letter I don't understand", description: "We'll read it with you and explain what it means." },
  { value: EMERGENCY_SITUATION, description: "We'll move your case to the front of the line." },
];

export const NOT_WORKING = "Not working right now";

// Values match intakeAnswers.incomeTypes. "Not working" is exclusive.
export const INCOME_TYPE_OPTIONS: { value: string; title: string; description: string }[] = [
  { value: "W-2 job", title: "A job with a W-2", description: "Your employer takes tax out of each paycheck." },
  {
    value: "Gig or delivery work",
    title: "Gig, delivery or self-employed",
    description: "Uber, DoorDash, freelance work. Usually no tax is taken out.",
  },
  { value: "Retirement or benefits", title: "Retirement or benefits", description: "Social Security, a pension, or unemployment." },
  { value: NOT_WORKING, title: NOT_WORKING, description: "That's fine. It can make some options easier." },
];

// Notices that mean the IRS is close to taking money. They get a red "we'll put it first" line.
export const LEVY_NOTICE_CODES = ["CP504", "LT11", "Letter 1058", "CP90"];

// Stand-in for "the letter we just read" when a new file is uploaded in the demo.
export const SAMPLE_UPLOAD_DOCUMENT_ID = "doc_cp14";

// Screen 7 offers an income row for each way of earning money picked on screen 4.
export const INCOME_ROW_LABELS: Record<string, string> = {
  "W-2 job": "Take-home pay from your job",
  "Gig or delivery work": "Gig or delivery income, after costs",
  "Retirement or benefits": "Retirement or benefits",
};

export const PAY_FREQUENCIES = ["Every week", "Every two weeks", "Twice a month", "Once a month", "It varies"];

// Answers live in React state for the session only (no localStorage in v1).
export type IntakeState = IntakeAnswers & {
  noLetter: boolean;
  noticeFreshUpload: boolean;
  // Document checklist (screen 10): items put off until later, and files uploaded from it.
  laterDocs: string[];
  checklistUploads: Record<string, string>;
};

export function initialIntakeState(): IntakeState {
  return {
    ...structuredClone(intakeAnswers),
    noLetter: false,
    noticeFreshUpload: false,
    laterDocs: [],
    checklistUploads: {},
  };
}

export function isUrgent(s: IntakeState): boolean {
  return s.situation === EMERGENCY_SITUATION || s.moneyTakenOrEmployerContacted === true;
}

// Two lanes. Self-serve: the taxpayer deals with the IRS themselves and T-Res prepares everything
// (Guided plan, no Form 2848). Represented: Chris acts for them under Form 2848 (Full Resolution).
// The IRS lets people set up a long-term payment plan online themselves up to this combined balance.
export const ONLINE_PLAN_LIMIT = 50000;
// Unfiled years T-Res can prepare for the taxpayer to file. More than this, Chris should run the catch-up.
const MAX_SELF_SERVE_UNFILED = 2;

export type LaneCriterion = { key: string; passed: boolean; text: string };

export function selfServeCheck(s: IntakeState): { eligible: boolean; criteria: LaneCriterion[] } {
  const estimated = taxYears.reduce((t, y) => t + (y.estimatedBalance ?? 0), 0);
  const allIn = totalOwed + estimated;
  const leftOver = s.monthlyIncome.reduce((t, r) => t + r.amount, 0) - s.monthlyExpenses.reduce((t, r) => t + r.amount, 0);
  const monthly = intakeAnswers.assessment.estimatedMonthly;
  const unfiled = s.unfiledAnswer === "some" ? s.unfiledYears : [];
  const urgent = isUrgent(s);

  const criteria: LaneCriterion[] = [
    {
      key: "balance",
      passed: allIn <= ONLINE_PLAN_LIMIT,
      text:
        allIn <= ONLINE_PLAN_LIMIT
          ? `You owe about ${formatMoney(allIn)}, under the ${formatMoney(ONLINE_PLAN_LIMIT)} limit for setting up a payment plan online yourself.`
          : `You owe about ${formatMoney(allIn)}, over ${formatMoney(ONLINE_PLAN_LIMIT)}, so the IRS needs a full financial review.`,
    },
    {
      key: "returns",
      passed: s.unfiledAnswer !== "not-sure" && unfiled.length <= MAX_SELF_SERVE_UNFILED,
      text:
        s.unfiledAnswer === "not-sure"
          ? "We're not sure yet which years are filed, so we'll check your IRS records first."
          : unfiled.length === 0
            ? "All your returns are filed."
            : unfiled.length <= MAX_SELF_SERVE_UNFILED
              ? `Only ${unfiled.join(" and ")} ${unfiled.length === 1 ? "isn't" : "aren't"} filed, and we'll prepare ${unfiled.length === 1 ? "it" : "them"} for you to file first.`
              : `${unfiled.length} years aren't filed. Catching up on that many takes an Enrolled Agent.`,
    },
    {
      key: "money",
      passed: !urgent,
      text: urgent
        ? "The IRS has already taken money or contacted your employer, so this needs an Enrolled Agent today."
        : "The IRS hasn't taken any money or contacted your employer.",
    },
    {
      key: "budget",
      passed: leftOver >= monthly,
      text:
        leftOver >= monthly
          ? `About ${formatMoney(monthly)} a month fits inside the ${formatMoney(leftOver)} you have left over.`
          : `About ${formatMoney(monthly)} a month is more than the ${formatMoney(Math.max(0, leftOver))} you have left over, so you may need a lower payment or a pause.`,
    },
  ];
  return { eligible: criteria.every((c) => c.passed), criteria };
}

export type IntakeStepKey = "notice" | "situation" | "authorization" | "money" | "documents" | "assessment" | "path";

export const intakeSteps: { key: IntakeStepKey; label: string }[] = [
  { key: "notice", label: "Your notice" },
  { key: "situation", label: "Your situation" },
  { key: "authorization", label: "Authorization" },
  { key: "money", label: "Money snapshot" },
  { key: "documents", label: "Documents" },
  { key: "assessment", label: "Assessment" },
  { key: "path", label: "Your path" },
];

export type IntakeScreen = {
  slug: string;
  step: IntakeStepKey | "done";
  title: string;
  why: string;
  // Continue stays disabled until this is true.
  isAnswered: (s: IntakeState) => boolean;
};

export const intakeScreens: IntakeScreen[] = [
  {
    slug: "notice",
    step: "notice",
    title: "Let's start with the letter the IRS sent you.",
    why: "We'll read it and tell you what it means in plain English.",
    isAnswered: (s) => s.noticeDocumentId !== null || s.noLetter,
  },
  {
    slug: "situation",
    step: "situation",
    title: "What best describes you right now?",
    why: "So we know where to start.",
    isAnswered: (s) => s.situation !== null,
  },
  {
    slug: "unfiled",
    step: "situation",
    title: "Are there any years you haven't filed a tax return?",
    why: "Not sure is fine, because we'll check your IRS records.",
    isAnswered: (s) => s.unfiledAnswer !== null && (s.unfiledAnswer !== "some" || s.unfiledYears.length > 0),
  },
  {
    slug: "income-types",
    step: "situation",
    title: "How do you earn money?",
    why: "This tells us which forms the IRS will expect from you.",
    isAnswered: (s) => s.incomeTypes.length > 0,
  },
  {
    slug: "levy",
    step: "situation",
    title: "Has the IRS taken money or contacted your employer?",
    why: "If so, we move your case to the front of the line.",
    isAnswered: (s) => s.moneyTakenOrEmployerContacted !== null,
  },
  {
    slug: "authorization",
    step: "authorization",
    title: "Let us see your IRS records and speak for you.",
    why: "Two short forms. They're how we pull your records and talk to the IRS so you don't have to.",
    isAnswered: (s) =>
      s.authorization.form8821SignedOn !== null &&
      (isUrgent(s) ? s.authorization.form2848 === "signed" : s.authorization.form2848 !== null),
  },
  {
    slug: "money-in",
    step: "money",
    title: "What comes in each month?",
    why: "After taxes: the amount that actually lands in your account.",
    // No income is a valid answer for someone who isn't working.
    isAnswered: (s) => s.monthlyIncome.some((r) => r.amount > 0) || s.incomeTypes.includes(NOT_WORKING),
  },
  {
    slug: "money-out",
    step: "money",
    title: "What goes out each month?",
    why: "Rough numbers are fine. We'll check them against your bank statements.",
    isAnswered: () => true,
  },
  {
    slug: "assets",
    step: "money",
    title: "What do you own?",
    why: "The IRS asks about savings, vehicles and property. Owning things is fine.",
    isAnswered: () => true,
  },
  {
    slug: "documents",
    step: "documents",
    title: "Here's what we'll need from you.",
    why: "Only the paperwork your case actually needs.",
    isAnswered: () => true,
  },
  {
    slug: "assessment",
    step: "assessment",
    title: "Here's what we think you should do.",
    why: "Based on your answers and your IRS records, reviewed by an Enrolled Agent.",
    isAnswered: () => true,
  },
  {
    slug: "path",
    step: "path",
    title: "Choose how much help you want.",
    why: "You won't be charged today.",
    isAnswered: (s) => s.chosenPlanId !== null,
  },
  {
    slug: "done",
    step: "done",
    title: `You're all set, ${taxpayer.firstName}.`,
    why: "Here's what happens next.",
    isAnswered: () => true,
  },
];

export const FIRST_SCREEN = intakeScreens[0].slug;

export function getScreen(slug: string): IntakeScreen | undefined {
  return intakeScreens.find((s) => s.slug === slug);
}

// Emergency path: from "situation", skip straight to authorization (and back again).
export function nextSlug(slug: string, s: IntakeState): string | null {
  if (slug === "situation" && s.situation === EMERGENCY_SITUATION) return "authorization";
  const i = intakeScreens.findIndex((sc) => sc.slug === slug);
  return intakeScreens[i + 1]?.slug ?? null;
}

export function prevSlug(slug: string, s: IntakeState): string | null {
  if (slug === "authorization" && s.situation === EMERGENCY_SITUATION) return "situation";
  const i = intakeScreens.findIndex((sc) => sc.slug === slug);
  return i > 0 ? intakeScreens[i - 1].slug : null;
}

/** Position within a multi-screen step, e.g. "Question 2 of 4" in Your situation. */
export function questionPosition(slug: string): { index: number; count: number } {
  const screen = getScreen(slug);
  const siblings = intakeScreens.filter((sc) => sc.step === screen?.step);
  return { index: siblings.findIndex((sc) => sc.slug === slug), count: siblings.length };
}

export function firstScreenOfStep(step: IntakeStepKey): string {
  return intakeScreens.find((sc) => sc.step === step)?.slug ?? FIRST_SCREEN;
}
