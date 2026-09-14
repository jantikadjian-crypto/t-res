// All v1 data lives here. No APIs, no IRS integration — that is v2.
// One fictional taxpayer. Dates are ISO (YYYY-MM-DD) and measured against MOCK_TODAY
// so "days remaining" stays stable in demos.

export const MOCK_TODAY = "2026-09-14";

export type Tone = "good" | "warn" | "bad" | "neutral";

export type Taxpayer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  state: string;
  filingStatus: string;
};

export type EnrolledAgent = {
  name: string;
  credential: string;
};

export type CaseStage = {
  key: string;
  label: string;
  description: string;
};

export type TaxYearStatus = "balance-due" | "unfiled" | "resolved";

export type TaxYearEvent = {
  date: string;
  label: string;
  tone: Tone;
};

export type TaxYear = {
  year: number;
  status: TaxYearStatus;
  statusLabel: string;
  tone: Tone;
  // null when the return is unfiled and there is no assessment yet.
  balance: { tax: number; penalties: number; interest: number } | null;
  lienFiled: boolean;
  assessedOn: string | null;
  // Collection Statute Expiration Date: IRS has 10 years from assessment to collect.
  csed: string | null;
  plainEnglish: string;
  events: TaxYearEvent[];
};

export type NoticeStatus = "action-needed" | "in-progress" | "resolved";

export type Notice = {
  id: string;
  code: string;
  title: string;
  plainTitle: string;
  taxYear: number;
  receivedOn: string;
  respondBy: string;
  amount: number;
  status: NoticeStatus;
  tone: Tone;
  // AI-generated decode; always shown with the EA-Reviewed badge.
  decode: {
    whatItIs: string;
    whatItMeans: string;
    whatWeAreDoing: string;
    eaReviewed: boolean;
  };
};

export type ActionItemType = "sign" | "upload" | "approve-letter";

export type ActionItem = {
  id: string;
  type: ActionItemType;
  title: string;
  why: string;
  dueBy: string;
  done: boolean;
  relatedNoticeId?: string;
  relatedTaxYear?: number;
};

export type AppNotification = {
  id: string;
  date: string;
  message: string;
  read: boolean;
};

export const taxpayer: Taxpayer = {
  id: "tp_001",
  firstName: "Jordan",
  lastName: "Reyes",
  email: "jordan.reyes@example.com",
  state: "TX",
  filingStatus: "Single",
};

export const enrolledAgent: EnrolledAgent = {
  name: "Chris G.",
  credential: "Enrolled Agent",
};

export const transcriptsLastChecked = "2026-09-12";

export const caseStages: CaseStage[] = [
  { key: "intake", label: "Intake", description: "We learned about your situation." },
  { key: "authorization", label: "Authorization", description: "You gave us permission to speak with the IRS." },
  { key: "documents", label: "Document Collection", description: "We gather the paperwork the IRS will ask for." },
  { key: "strategy", label: "Resolution Strategy", description: "We choose the best option for you." },
  { key: "submitted", label: "Submitted to IRS", description: "Your resolution is with the IRS." },
  { key: "resolved", label: "Resolved", description: "Your case is closed." },
];

export const currentStageKey = "documents";

export const taxYears: TaxYear[] = [
  {
    year: 2021,
    status: "balance-due",
    statusLabel: "Balance due · Lien filed",
    tone: "bad",
    balance: { tax: 10450, penalties: 2310, interest: 1440 },
    lienFiled: true,
    assessedOn: "2022-05-16",
    csed: "2032-05-16",
    plainEnglish:
      "You owe money for 2021 and the IRS has filed a public claim (a lien) against your property. This is the year we are working on first.",
    events: [
      { date: "2022-04-18", label: "Return filed", tone: "good" },
      { date: "2022-05-16", label: "Balance assessed", tone: "warn" },
      { date: "2025-11-03", label: "Federal tax lien filed", tone: "bad" },
      { date: "2026-09-02", label: "CP504 notice received", tone: "bad" },
    ],
  },
  {
    year: 2022,
    status: "balance-due",
    statusLabel: "Balance due",
    tone: "warn",
    balance: { tax: 5420, penalties: 890, interest: 490 },
    lienFiled: false,
    assessedOn: "2023-06-12",
    csed: "2033-06-12",
    plainEnglish:
      "You owe money for 2022. There is no lien on this year yet. We will include it in the same resolution as 2021.",
    events: [
      { date: "2023-04-17", label: "Return filed", tone: "good" },
      { date: "2023-06-12", label: "Balance assessed", tone: "warn" },
      { date: "2026-09-08", label: "CP14 notice received", tone: "warn" },
    ],
  },
  {
    year: 2023,
    status: "unfiled",
    statusLabel: "Not filed",
    tone: "bad",
    balance: null,
    lienFiled: false,
    assessedOn: null,
    csed: null,
    plainEnglish:
      "The IRS has no 2023 return from you. Filing it is required before any payment plan can be approved — we will prepare it once your W-2s and 1099s are in.",
    events: [{ date: "2024-04-15", label: "Filing deadline passed", tone: "bad" }],
  },
];

export const notices: Notice[] = [
  {
    id: "ntc_cp504",
    code: "CP504",
    title: "Notice of Intent to Levy",
    plainTitle: "Final warning before the IRS can take property",
    taxYear: 2021,
    receivedOn: "2026-09-02",
    respondBy: "2026-09-26",
    amount: 14200,
    status: "action-needed",
    tone: "bad",
    decode: {
      whatItIs:
        "A notice saying the IRS intends to collect your unpaid 2021 balance by taking (levying) your state tax refund or other property.",
      whatItMeans:
        "This is serious but very common, and it is fixable. Responding before the deadline keeps your options open and stops the process.",
      whatWeAreDoing:
        "We are drafting a response and requesting a hold on collection while we set up a resolution. We need your signature on Form 2848 to send it.",
      eaReviewed: true,
    },
  },
  {
    id: "ntc_cp14",
    code: "CP14",
    title: "Balance Due Notice",
    plainTitle: "A bill for your 2022 balance",
    taxYear: 2022,
    receivedOn: "2026-09-08",
    respondBy: "2026-09-29",
    amount: 6800,
    status: "in-progress",
    tone: "warn",
    decode: {
      whatItIs: "The IRS's first bill for the money owed on your 2022 return.",
      whatItMeans:
        "This is a routine bill, not a threat of collection. Penalties and interest keep growing until the balance is resolved.",
      whatWeAreDoing:
        "We are rolling 2022 into the same resolution as 2021 so you only deal with one plan. No action needed from you on this one.",
      eaReviewed: true,
    },
  },
];

export const actionItems: ActionItem[] = [
  {
    id: "act_2848",
    type: "sign",
    title: "Sign Form 2848 (Power of Attorney)",
    why: "Lets Chris speak to the IRS on your behalf, so you don't have to.",
    dueBy: "2026-09-17",
    done: false,
    relatedNoticeId: "ntc_cp504",
  },
  {
    id: "act_letter",
    type: "approve-letter",
    title: "Approve our response to your CP504",
    why: "We've drafted the letter. Read it and approve so we can send it before the deadline.",
    dueBy: "2026-09-22",
    done: false,
    relatedNoticeId: "ntc_cp504",
  },
  {
    id: "act_w2",
    type: "upload",
    title: "Upload your 2023 W-2s and 1099s",
    why: "We need these to file your missing 2023 return.",
    dueBy: "2026-09-21",
    done: false,
    relatedTaxYear: 2023,
  },
  {
    id: "act_bank",
    type: "upload",
    title: "Upload your last 3 months of bank statements",
    why: "The IRS asks for these to set a payment amount you can actually afford.",
    dueBy: "2026-09-24",
    done: false,
  },
];

export const notifications: AppNotification[] = [
  { id: "n1", date: "2026-09-12", message: "We checked your IRS transcripts. No new changes.", read: false },
  { id: "n2", date: "2026-09-08", message: "New notice received: CP14 for 2022.", read: false },
  { id: "n3", date: "2026-09-02", message: "New notice received: CP504 for 2021.", read: false },
];

export const caseNumber = "TR-2026-0142";

// Derived values — compute here so every screen agrees.
export function yearBalance(y: TaxYear): number {
  return y.balance ? y.balance.tax + y.balance.penalties + y.balance.interest : 0;
}

export const totalOwed = taxYears.reduce((sum, y) => sum + yearBalance(y), 0);

export const openActionItems = actionItems
  .filter((a) => !a.done)
  .sort((a, b) => a.dueBy.localeCompare(b.dueBy));

export const openNotices = notices
  .filter((n) => n.status !== "resolved")
  .sort((a, b) => a.respondBy.localeCompare(b.respondBy));

export const currentStageIndex = caseStages.findIndex((s) => s.key === currentStageKey);

export const nextActionItem = openActionItems[0];

export const nextNotice = openNotices[0];
