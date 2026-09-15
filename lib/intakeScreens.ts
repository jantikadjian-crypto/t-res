// Get Started wizard: the one list of steps and screens. The rail, progress bar,
// Back/Continue and routing all read from here. Spec: docs/intake-wizard-scope.md.
import { intakeAnswers, taxpayer, type IntakeAnswers } from "@/lib/mockData";

export const EMERGENCY_SITUATION = "The IRS took money from my pay or bank account";

export const SITUATION_OPTIONS = [
  "I owe and can't pay it all at once",
  "I owe and can pay",
  "I haven't filed some years",
  "I got a letter I don't understand",
  EMERGENCY_SITUATION,
];

// Answers live in React state for the session only (no localStorage in v1).
export type IntakeState = IntakeAnswers & { noLetter: boolean };

export function initialIntakeState(): IntakeState {
  return { ...structuredClone(intakeAnswers), noLetter: false };
}

export function isUrgent(s: IntakeState): boolean {
  return s.situation === EMERGENCY_SITUATION || s.moneyTakenOrEmployerContacted === true;
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
    isAnswered: (s) => s.monthlyIncome.some((r) => r.amount > 0),
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
