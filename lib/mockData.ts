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

export type IncomeRecord = {
  payer: string;
  form: string;
  amount: number;
};

export type TaxYear = {
  year: number;
  status: TaxYearStatus;
  statusLabel: string;
  tone: Tone;
  filedOn: string | null;
  // null when the return is unfiled and there is no assessment yet.
  balance: { tax: number; penalties: number; interest: number } | null;
  // Rough figure for unfiled years, from income the IRS already has on record.
  estimatedBalance?: number;
  paymentsMade: number;
  lienFiled: boolean;
  assessedOn: string | null;
  // Collection Statute Expiration Date: IRS has 10 years from assessment to collect.
  csed: string | null;
  plainEnglish: string;
  reliefNote?: string;
  // From the IRS wage & income transcript.
  incomeOnRecord: IncomeRecord[];
  events: TaxYearEvent[];
};

export type NoticeStatus = "action-needed" | "in-progress" | "closed";

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
  statusLabel: string;
  tone: Tone;
  documentId: string;
  // AI-generated decode; always shown with the EA-Reviewed badge.
  decode: {
    whatItIs: string;
    whatItMeans: string;
    deadline: string;
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
  completedOn?: string;
  relatedNoticeId?: string;
  relatedTaxYear?: number;
  uploadHint?: string;
  letterPreview?: string;
};

export type DocumentCategory =
  | "IRS notice"
  | "Tax return"
  | "Transcript"
  | "Financial"
  | "Authorization"
  | "Prepared by us";

export type DocumentStatus = "on-file" | "needs-signature" | "draft" | "requested" | "in-review";

export type CaseDocument = {
  id: string;
  name: string;
  category: DocumentCategory;
  source: "You" | "IRS" | "T-Res";
  taxYear?: number;
  addedOn: string;
  sizeKb: number;
  status: DocumentStatus;
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

export const caseNumber = "TR-2026-0142";

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
    filedOn: "2022-04-18",
    balance: { tax: 10450, penalties: 2310, interest: 1440 },
    paymentsMade: 1500,
    lienFiled: true,
    assessedOn: "2022-05-16",
    csed: "2032-05-16",
    plainEnglish:
      "You owe money for 2021 and the IRS has filed a public claim (a lien) against your property. This is the year we are working on first.",
    reliefNote:
      "Your 2021 penalties ($2,310) may qualify for First-Time Penalty Abatement, because you had no penalties in the three years before. We'll ask the IRS to remove them.",
    incomeOnRecord: [
      { payer: "Lone Star Logistics LLC", form: "W-2", amount: 61200 },
      { payer: "Uber Technologies (rideshare)", form: "1099-K", amount: 8900 },
    ],
    events: [
      { date: "2022-04-18", label: "Return filed", tone: "good" },
      { date: "2022-05-16", label: "Balance assessed", tone: "warn" },
      { date: "2023-02-10", label: "Payment of $1,500 received", tone: "good" },
      { date: "2025-08-18", label: "CP503 second reminder", tone: "warn" },
      { date: "2025-11-03", label: "Federal tax lien filed", tone: "bad" },
      { date: "2026-09-02", label: "CP504 notice received", tone: "bad" },
    ],
  },
  {
    year: 2022,
    status: "balance-due",
    statusLabel: "Balance due",
    tone: "warn",
    filedOn: "2023-04-17",
    balance: { tax: 5420, penalties: 890, interest: 490 },
    paymentsMade: 0,
    lienFiled: false,
    assessedOn: "2023-06-12",
    csed: "2033-06-12",
    plainEnglish:
      "You owe money for 2022. There is no lien on this year yet. We will include it in the same resolution as 2021.",
    incomeOnRecord: [
      { payer: "Lone Star Logistics LLC", form: "W-2", amount: 63800 },
      { payer: "Uber Technologies (rideshare)", form: "1099-K", amount: 5100 },
    ],
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
    filedOn: null,
    balance: null,
    estimatedBalance: 4900,
    paymentsMade: 0,
    lienFiled: false,
    assessedOn: null,
    csed: null,
    plainEnglish:
      "The IRS has no 2023 return from you. Filing it is required before any payment plan can be approved — we will prepare it once your W-2s and 1099s are in.",
    incomeOnRecord: [
      { payer: "Lone Star Logistics LLC", form: "W-2", amount: 58400 },
      { payer: "DoorDash, Inc. (delivery)", form: "1099-NEC", amount: 11700 },
      { payer: "Ally Bank", form: "1099-INT", amount: 42 },
    ],
    events: [
      { date: "2024-04-15", label: "Filing deadline passed", tone: "bad" },
      { date: "2026-09-12", label: "2023 income records pulled from the IRS", tone: "neutral" },
    ],
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
    statusLabel: "Action needed",
    tone: "bad",
    documentId: "doc_cp504",
    decode: {
      whatItIs:
        "A notice saying the IRS intends to collect your unpaid 2021 balance by taking (levying) your state tax refund or other property.",
      whatItMeans:
        "This is serious but very common, and it is fixable. Responding before the deadline keeps your options open and stops the process.",
      deadline:
        "Respond by Sep 26, 2026. After that the IRS can take your state refund and send a final notice (LT11) before it can touch wages or bank accounts.",
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
    statusLabel: "We're handling it",
    tone: "warn",
    documentId: "doc_cp14",
    decode: {
      whatItIs: "The IRS's first bill for the money owed on your 2022 return.",
      whatItMeans:
        "This is a routine bill, not a threat of collection. Penalties and interest keep growing until the balance is resolved.",
      deadline:
        "The IRS asks for payment by Sep 29, 2026. Because 2022 is part of your case, we'll respond for you before then.",
      whatWeAreDoing:
        "We are rolling 2022 into the same resolution as 2021 so you only deal with one plan. No action needed from you on this one.",
      eaReviewed: true,
    },
  },
  {
    id: "ntc_l3172",
    code: "Letter 3172",
    title: "Notice of Federal Tax Lien Filing and Your Right to a Hearing",
    plainTitle: "The IRS filed a public lien for your 2021 balance",
    taxYear: 2021,
    receivedOn: "2025-11-10",
    respondBy: "2025-12-17",
    amount: 14120,
    status: "closed",
    statusLabel: "Hearing window passed",
    tone: "neutral",
    documentId: "doc_l3172",
    decode: {
      whatItIs:
        "Notice that the IRS filed a Notice of Federal Tax Lien — a public record that it has a legal claim to your property for the 2021 balance.",
      whatItMeans:
        "The lien stays until the balance is paid or resolved. It can affect credit applications and selling property. It does not mean anything has been taken.",
      deadline:
        "The formal hearing deadline was Dec 17, 2025 and has passed. A similar 'equivalent hearing' is still available until Nov 10, 2026.",
      whatWeAreDoing:
        "Once your payment plan is in place we'll ask for the lien to be withdrawn. That's possible when the balance is under $25,000 and paid by direct debit.",
      eaReviewed: true,
    },
  },
  {
    id: "ntc_cp503",
    code: "CP503",
    title: "Second Reminder: Balance Due",
    plainTitle: "A second reminder about your 2021 balance",
    taxYear: 2021,
    receivedOn: "2025-08-18",
    respondBy: "2025-09-02",
    amount: 13960,
    status: "closed",
    statusLabel: "Replaced by CP504",
    tone: "neutral",
    documentId: "doc_cp503",
    decode: {
      whatItIs: "The IRS's second reminder that the 2021 balance was still unpaid.",
      whatItMeans:
        "Nothing to do on this one any more. The IRS has since sent the CP504, which is the notice that matters now.",
      deadline: "Its deadline (Sep 2, 2025) has passed and it has been replaced by your CP504.",
      whatWeAreDoing: "Kept on file for your case history. Everything is handled through the CP504 response.",
      eaReviewed: true,
    },
  },
];

export const actionItems: ActionItem[] = [
  {
    id: "act_engage",
    type: "sign",
    title: "Sign your engagement letter",
    why: "Confirms T-Res is working on your case.",
    dueBy: "2026-09-04",
    done: true,
    completedOn: "2026-09-03",
  },
  {
    id: "act_upload504",
    type: "upload",
    title: "Upload your CP504 notice",
    why: "So we can read exactly what the IRS sent you.",
    dueBy: "2026-09-05",
    done: true,
    completedOn: "2026-09-04",
    relatedNoticeId: "ntc_cp504",
  },
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
    letterPreview: `To: Internal Revenue Service
Re: CP504, tax year 2021 — Jordan Reyes

We represent Jordan Reyes under the enclosed Form 2848. Jordan intends to resolve the 2021 and 2022 balances in full through an installment agreement.

We request a 60-day hold on collection while we file the missing 2023 return and submit Form 9465, Installment Agreement Request. We also request First-Time Penalty Abatement of the 2021 failure-to-pay penalty.

Chris G., Enrolled Agent`,
  },
  {
    id: "act_w2",
    type: "upload",
    title: "Upload your 2023 W-2s and 1099s",
    why: "We need these to file your missing 2023 return.",
    dueBy: "2026-09-21",
    done: false,
    relatedTaxYear: 2023,
    uploadHint: "Lone Star Logistics W-2, DoorDash 1099-NEC, Ally Bank 1099-INT. PDF or a clear phone photo.",
  },
  {
    id: "act_bank",
    type: "upload",
    title: "Upload your last 3 months of bank statements",
    why: "The IRS asks for these to set a payment amount you can actually afford.",
    dueBy: "2026-09-24",
    done: false,
    uploadHint: "June, July and August 2026 from Ally Bank. PDF downloads from online banking work best.",
  },
];

export const documents: CaseDocument[] = [
  { id: "doc_cp504", name: "CP504 – Notice of Intent to Levy.pdf", category: "IRS notice", source: "You", taxYear: 2021, addedOn: "2026-09-04", sizeKb: 412, status: "on-file" },
  { id: "doc_cp14", name: "CP14 – Balance Due Notice.pdf", category: "IRS notice", source: "You", taxYear: 2022, addedOn: "2026-09-09", sizeKb: 298, status: "on-file" },
  { id: "doc_l3172", name: "Letter 3172 – Federal Tax Lien Filing.pdf", category: "IRS notice", source: "You", taxYear: 2021, addedOn: "2026-09-04", sizeKb: 356, status: "on-file" },
  { id: "doc_cp503", name: "CP503 – Second Reminder.pdf", category: "IRS notice", source: "You", taxYear: 2021, addedOn: "2026-09-04", sizeKb: 240, status: "on-file" },
  { id: "doc_668y", name: "Form 668(Y) – Notice of Federal Tax Lien.pdf", category: "IRS notice", source: "IRS", taxYear: 2021, addedOn: "2026-09-05", sizeKb: 188, status: "on-file" },
  { id: "doc_1040_21", name: "2021 Form 1040 (copy).pdf", category: "Tax return", source: "You", taxYear: 2021, addedOn: "2026-09-03", sizeKb: 1840, status: "on-file" },
  { id: "doc_1040_22", name: "2022 Form 1040 (copy).pdf", category: "Tax return", source: "You", taxYear: 2022, addedOn: "2026-09-03", sizeKb: 1760, status: "on-file" },
  { id: "doc_tr_21", name: "2021 Account Transcript.pdf", category: "Transcript", source: "IRS", taxYear: 2021, addedOn: "2026-09-12", sizeKb: 96, status: "on-file" },
  { id: "doc_tr_22", name: "2022 Account Transcript.pdf", category: "Transcript", source: "IRS", taxYear: 2022, addedOn: "2026-09-12", sizeKb: 91, status: "on-file" },
  { id: "doc_wi_23", name: "2023 Wage & Income Transcript.pdf", category: "Transcript", source: "IRS", taxYear: 2023, addedOn: "2026-09-12", sizeKb: 74, status: "on-file" },
  { id: "doc_engage", name: "Engagement Letter (signed).pdf", category: "Authorization", source: "T-Res", addedOn: "2026-09-03", sizeKb: 142, status: "on-file" },
  { id: "doc_8821", name: "Form 8821 – Tax Information Authorization (signed).pdf", category: "Authorization", source: "T-Res", addedOn: "2026-09-03", sizeKb: 104, status: "on-file" },
  { id: "doc_2848", name: "Form 2848 – Power of Attorney.pdf", category: "Authorization", source: "T-Res", addedOn: "2026-09-10", sizeKb: 118, status: "needs-signature" },
  { id: "doc_letter", name: "CP504 Response Letter (draft).pdf", category: "Prepared by us", source: "T-Res", taxYear: 2021, addedOn: "2026-09-13", sizeKb: 36, status: "draft" },
  { id: "doc_intake", name: "Intake Summary.pdf", category: "Prepared by us", source: "T-Res", addedOn: "2026-09-03", sizeKb: 210, status: "on-file" },
  { id: "doc_w2_23", name: "2023 W-2s and 1099s", category: "Financial", source: "You", taxYear: 2023, addedOn: "2026-09-07", sizeKb: 0, status: "requested" },
  { id: "doc_bank", name: "Bank statements (Jun–Aug 2026)", category: "Financial", source: "You", addedOn: "2026-09-07", sizeKb: 0, status: "requested" },
];

export const notifications: AppNotification[] = [
  { id: "n1", date: "2026-09-12", message: "We checked your IRS transcripts. No new changes.", read: false },
  { id: "n2", date: "2026-09-08", message: "New notice received: CP14 for 2022.", read: false },
  { id: "n3", date: "2026-09-02", message: "New notice received: CP504 for 2021.", read: false },
];

export type MoneyRow = { label: string; amount: number };
export type AssetRow = { label: string; value: number; owed: number };

export type IntakeAnswers = {
  submittedOn: string;
  noticeDocumentId: string | null;
  situation: string | null;
  unfiledAnswer: "some" | "none" | "not-sure" | null;
  unfiledYears: number[];
  incomeTypes: string[];
  moneyTakenOrEmployerContacted: boolean | null;
  authorization: { form8821SignedOn: string | null; form2848: "signed" | "waiting-for-signature" | null };
  household: { size: number; payFrequency: string };
  monthlyIncome: MoneyRow[];
  monthlyExpenses: MoneyRow[];
  assets: AssetRow[];
  assessment: {
    recommendedPath: string;
    estimatedMonthly: number;
    summary: string;
    alsoDoing: string[];
    ruledOut: { option: string; why: string }[];
    eaReviewed: boolean;
  };
  chosenPlanId: string | null;
};

// What Jordan told us in the Get Started wizard (see docs/intake-wizard-scope.md).
export const intakeAnswers: IntakeAnswers = {
  submittedOn: "2026-09-03",
  noticeDocumentId: "doc_cp504",
  situation: "I owe and can't pay it all at once",
  unfiledAnswer: "some",
  unfiledYears: [2023],
  incomeTypes: ["W-2 job", "Gig or delivery work"],
  moneyTakenOrEmployerContacted: false,
  authorization: { form8821SignedOn: "2026-09-03", form2848: "waiting-for-signature" },
  household: { size: 1, payFrequency: "Every two weeks" },
  monthlyIncome: [
    { label: "Take-home pay (Lone Star Logistics)", amount: 3920 },
    { label: "Delivery driving, after gas (DoorDash)", amount: 930 },
  ],
  monthlyExpenses: [
    { label: "Rent", amount: 1850 },
    { label: "Car payment (2019 Honda Civic)", amount: 465 },
    { label: "Gas and car insurance", amount: 390 },
    { label: "Utilities and phone", amount: 335 },
    { label: "Groceries and household", amount: 590 },
    { label: "Health insurance", amount: 310 },
  ],
  assets: [
    { label: "Checking (Ally Bank)", value: 2300, owed: 0 },
    { label: "2019 Honda Civic", value: 14000, owed: 9800 },
  ],
  assessment: {
    recommendedPath: "Payment plan (installment agreement)",
    estimatedMonthly: 440,
    summary:
      "You owe about $21,000 for 2021–2022, and we estimate about $4,900 more for 2023 once it's filed. With about $910 left over each month, a payment plan of roughly $440 a month over six years is the most realistic path, and it stops collection.",
    alsoDoing: [
      "File your 2023 return first — the IRS won't approve a plan until every year is filed.",
      "Ask for First-Time Penalty Abatement on 2021, which could save $2,310.",
      "Pay about $900 up front to get under $25,000, so we can ask for the lien to be withdrawn.",
    ],
    ruledOut: [
      {
        option: "Offer in Compromise (settling for less)",
        why: "What the IRS would expect you could pay (about $28,000) is more than you owe, so an offer would likely be rejected.",
      },
      {
        option: "Currently Not Collectible (pausing collection)",
        why: "This is for people with nothing left over each month. You have about $910, so the IRS would say no.",
      },
    ],
    eaReviewed: true,
  },
  chosenPlanId: "full",
};

export const resolutionPlans = [
  {
    id: "guided",
    name: "Guided",
    price: 395,
    priceNote: "one-time",
    blurb: "We prepare your payment-plan request and 2023 return. You submit them yourself.",
    includes: ["Payment-plan request prepared", "2023 return prepared", "EA review of everything"],
    recommended: false,
  },
  {
    id: "full",
    name: "Full Resolution",
    price: 1650,
    priceNote: "or 6 × $275",
    blurb: "Chris represents you with the IRS from start to finish. You never have to call them.",
    includes: ["Everything in Guided", "Chris talks to the IRS for you", "Penalty relief request", "Lien withdrawal request"],
    recommended: true,
  },
  {
    id: "protect",
    name: "Resolution + Protection",
    price: 2150,
    priceNote: "or 6 × $359",
    blurb: "Full Resolution, plus we watch your IRS account for three years so nothing surprises you again.",
    includes: ["Everything in Full Resolution", "Monthly transcript monitoring", "Yearly filing check-in"],
    recommended: false,
  },
];

// Derived values — compute here so every screen agrees.
export function yearBalance(y: TaxYear): number {
  return y.balance ? y.balance.tax + y.balance.penalties + y.balance.interest : 0;
}

export const totalOwed = taxYears.reduce((sum, y) => sum + yearBalance(y), 0);

export const openActionItems = actionItems
  .filter((a) => !a.done)
  .sort((a, b) => a.dueBy.localeCompare(b.dueBy));

export const openNotices = notices
  .filter((n) => n.status !== "closed")
  .sort((a, b) => a.respondBy.localeCompare(b.respondBy));

export const currentStageIndex = caseStages.findIndex((s) => s.key === currentStageKey);

export const nextActionItem = openActionItems[0];

export const nextNotice = openNotices[0];

// The way forward for a tax year: every red or amber year gets a remedy.
export function yearNextStep(y: TaxYear): { href: string; label: string; primary: boolean } {
  if (y.status === "unfiled") return { href: "/action-items", label: "Start filing", primary: true };
  if (y.lienFiled) return { href: "/notices", label: "Respond now", primary: true };
  return { href: `/tax-years/${y.year}`, label: "Details", primary: false };
}
