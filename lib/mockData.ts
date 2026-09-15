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
  // Where to see the details: a notice, document or to-do.
  href?: string;
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
  // The same note for the self-serve lane, where the taxpayer sends the request.
  selfServeReliefNote?: string;
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
  // AI-generated decode; always shown with its review badge (logged in PLCY as governanceItems).
  decode: {
    whatItIs: string;
    whatItMeans: string;
    deadline: string;
    whatWeAreDoing: string;
  };
  // Wording for the self-serve lane, where the taxpayer acts and T-Res prepares (overrides decode).
  selfServe?: Partial<Notice["decode"]>;
};

// Self-serve: the taxpayer deals with the IRS themselves, T-Res prepares everything (Guided plan).
// Represented: Chris acts for them under Form 2848. To-dos and documents for one lane only carry `lane`.
export type Lane = "self-serve" | "represented";

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
  // Set when an upload finishes this item.
  uploadedFile?: string;
  lane?: Lane;
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
  // Plain-English "what this is", shown on the document page and searchable.
  summary: string;
  // The file actually uploaded, when it differs from the document's name.
  fileName?: string;
  relatedActionId?: string;
  lane?: Lane;
};

export type DocumentNote = {
  id: string;
  author: "you" | "ea";
  date: string;
  text: string;
  editedOn?: string;
};

export type AppNotification = {
  id: string;
  date: string;
  message: string;
  read: boolean;
  href: string;
};

export const taxpayer: Taxpayer = {
  id: "tp_001",
  firstName: "Jordan",
  lastName: "Reyes",
  email: "jordan.reyes@example.com",
  state: "TX",
  filingStatus: "Single",
};

// Fake identity shown (never collected) on the authorization screen. No real PII in v1.
export const taxpayerIdentity = {
  legalName: "Jordan A. Reyes",
  ssnMasked: "•••-••-4417",
  ssnLast4: "4417",
  address: "1418 Cedar Bend Dr, Austin, TX 78758",
  phoneMasked: "(512) •••-••82",
  // Shown on screen in the demo in place of a real text message.
  demoVerificationCode: "246810",
};

// Fake representative details printed on the Form 2848 preview.
export const representativeDetails = {
  cafNumber: "0312-45678R",
  phone: "(512) 555-0147",
  designation: "c — Enrolled Agent",
  enrollment: "Enrollment card no. 00112233",
  signedOn: "2026-09-10",
};

// Documents that can be signed in the Sign flow, with what signing them allows, in plain English.
export const signingTerms: Record<
  string,
  { formLabel: string; agreeing: string[]; taxMatters: { matter: string; form: string; years: string }[] }
> = {
  doc_2848: {
    formLabel: "Form 2848",
    agreeing: [
      "Chris G. can speak with the IRS about your income tax (Form 1040) for 2021, 2022 and 2023.",
      "He gets copies of your IRS notices and can see your records for those years.",
      "He can't cash or deposit your refund checks, and he can't sign tax returns for you.",
      "You can cancel it at any time by telling us or the IRS.",
    ],
    taxMatters: [{ matter: "Income", form: "1040", years: "2021, 2022, 2023" }],
  },
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
    selfServeReliefNote:
      "Your 2021 penalties ($2,310) may qualify for First-Time Penalty Abatement, because you had no penalties in the three years before. We've written the request for you to send once your 2023 return is filed.",
    incomeOnRecord: [
      { payer: "Lone Star Logistics LLC", form: "W-2", amount: 61200 },
      { payer: "Uber Technologies (rideshare)", form: "1099-K", amount: 8900 },
    ],
    events: [
      { date: "2022-04-18", label: "Return filed", tone: "good", href: "/documents/doc_1040_21" },
      { date: "2022-05-16", label: "Balance assessed", tone: "warn", href: "/documents/doc_tr_21" },
      { date: "2023-02-10", label: "Payment of $1,500 received", tone: "good", href: "/documents/doc_tr_21" },
      { date: "2025-08-18", label: "CP503 second reminder", tone: "warn", href: "/notices/ntc_cp503" },
      { date: "2025-11-03", label: "Federal tax lien filed", tone: "bad", href: "/documents/doc_668y" },
      { date: "2026-09-02", label: "CP504 notice received", tone: "bad", href: "/notices/ntc_cp504" },
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
      { date: "2023-04-17", label: "Return filed", tone: "good", href: "/documents/doc_1040_22" },
      { date: "2023-06-12", label: "Balance assessed", tone: "warn", href: "/documents/doc_tr_22" },
      { date: "2026-09-08", label: "CP14 notice received", tone: "warn", href: "/notices/ntc_cp14" },
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
      "No 2023 return on file yet. It has to be filed before a payment plan, so we'll prepare it once your W-2s and 1099s are in.",
    incomeOnRecord: [
      { payer: "Lone Star Logistics LLC", form: "W-2", amount: 58400 },
      { payer: "DoorDash, Inc. (delivery)", form: "1099-NEC", amount: 11700 },
      { payer: "Ally Bank", form: "1099-INT", amount: 42 },
    ],
    events: [
      { date: "2024-04-15", label: "Filing deadline passed", tone: "bad", href: "/action-items" },
      { date: "2026-09-12", label: "2023 income records pulled from the IRS", tone: "neutral", href: "/documents/doc_wi_23" },
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
    selfServe: {
      whatWeAreDoing:
        "You're handling this yourself with our help. Set up your payment plan on IRS.gov with the answers we give you, and mail the one-page reply we wrote for you. While a payment plan is in place, the IRS can't levy.",
    },
    decode: {
      whatItIs:
        "A notice saying the IRS intends to collect your unpaid 2021 balance by taking (levying) your state tax refund or other property.",
      whatItMeans:
        "This is serious but very common, and it is fixable. Responding before the deadline keeps your options open and stops the process.",
      deadline:
        "Respond by Sep 26, 2026. After that the IRS can take your state refund and send a final notice (LT11) before it can touch wages or bank accounts.",
      whatWeAreDoing:
        "We are drafting a response and requesting a hold on collection while we set up a resolution. We need your signature on Form 2848 to send it.",
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
    selfServe: {
      deadline:
        "The IRS asks for payment by Sep 29, 2026. The payment plan you set up covers 2022 as well, so you don't need to reply separately.",
      whatWeAreDoing: "Nothing extra for you to do. We include 2022 in the payment plan answers we give you.",
    },
    decode: {
      whatItIs: "The IRS's first bill for the money owed on your 2022 return.",
      whatItMeans:
        "This is a routine bill, not a threat of collection. Penalties and interest keep growing until the balance is resolved.",
      deadline:
        "The IRS asks for payment by Sep 29, 2026. Because 2022 is part of your case, we'll respond for you before then.",
      whatWeAreDoing:
        "We are rolling 2022 into the same resolution as 2021 so you only deal with one plan. No action needed from you on this one.",
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
    selfServe: {
      whatWeAreDoing:
        "Once your payment plan is running by direct debit, we'll prepare the lien withdrawal request (Form 12277) for you to sign and send. That's possible when the balance is under $25,000.",
    },
    decode: {
      whatItIs:
        "Notice that the IRS filed a Notice of Federal Tax Lien — a public record that it has a legal claim to your property for the 2021 balance.",
      whatItMeans:
        "The lien stays until the balance is paid or resolved. It can affect credit applications and selling property. It does not mean anything has been taken.",
      deadline:
        "The formal hearing deadline was Dec 17, 2025 and has passed. A similar 'equivalent hearing' is still available until Nov 10, 2026.",
      whatWeAreDoing:
        "Once your payment plan is in place we'll ask for the lien to be withdrawn. That's possible when the balance is under $25,000 and paid by direct debit.",
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
    lane: "represented",
    title: "Sign Form 2848 (Power of Attorney)",
    why: "Lets Chris speak to the IRS on your behalf, so you don't have to.",
    dueBy: "2026-09-17",
    done: false,
    relatedNoticeId: "ntc_cp504",
  },
  {
    id: "act_letter",
    type: "approve-letter",
    lane: "represented",
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
    id: "act_opa",
    lane: "self-serve",
    type: "upload",
    title: "Set up your payment plan on IRS.gov",
    why: "It stops the levy the CP504 warns about. We give you every answer to enter.",
    dueBy: "2026-09-24",
    done: false,
    relatedNoticeId: "ntc_cp504",
    uploadHint:
      "In your IRS online account, apply for a long-term payment plan: about $440 a month by direct debit. Then upload the confirmation page so we can check it.",
  },
  {
    id: "act_reply",
    lane: "self-serve",
    type: "approve-letter",
    title: "Mail your CP504 reply",
    why: "We wrote it for you. Read it and approve it, then print, sign and mail it before Sep 26.",
    dueBy: "2026-09-25",
    done: false,
    relatedNoticeId: "ntc_cp504",
    letterPreview: `To: Internal Revenue Service
Re: CP504, tax year 2021 — Jordan A. Reyes, SSN •••-••-4417

I received your CP504 notice dated September 2, 2026. I have applied for a long-term payment plan through my IRS online account to pay my 2021 and 2022 balances by direct debit, and I am preparing my 2023 return.

Please hold collection while my payment plan request is processed.

Jordan A. Reyes`,
  },
  {
    id: "act_fta",
    lane: "self-serve",
    type: "approve-letter",
    title: "Send your penalty relief request",
    why: "It could remove $2,310 in 2021 penalties. Send it once your 2023 return is filed: the IRS needs every return filed first.",
    dueBy: "2026-10-09",
    done: false,
    relatedTaxYear: 2021,
    letterPreview: `To: Internal Revenue Service
Re: Request for First-Time Penalty Abatement, tax year 2021 — Jordan A. Reyes, SSN •••-••-4417

I am asking you to remove the penalties on my 2021 account under the First-Time Abatement policy. I had no penalties for 2018, 2019 or 2020, all of my required returns are filed, and I have a payment plan in place for the balance.

Jordan A. Reyes`,
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
  {
    id: "doc_cp504", name: "CP504 – Notice of Intent to Levy.pdf", category: "IRS notice", source: "You", taxYear: 2021, addedOn: "2026-09-04", sizeKb: 412, status: "on-file",
    summary: "The IRS's final warning before it can take your state refund or other property for 2021. Your response is due Sep 26, 2026.",
  },
  {
    id: "doc_cp14", name: "CP14 – Balance Due Notice.pdf", category: "IRS notice", source: "You", taxYear: 2022, addedOn: "2026-09-09", sizeKb: 298, status: "on-file",
    summary: "The IRS's first bill for your 2022 balance. We're handling the response for you.",
  },
  {
    id: "doc_l3172", name: "Letter 3172 – Federal Tax Lien Filing.pdf", category: "IRS notice", source: "You", taxYear: 2021, addedOn: "2026-09-04", sizeKb: 356, status: "on-file",
    summary: "Notice that the IRS filed a public lien for your 2021 balance, and your window to ask for a hearing (now passed).",
  },
  {
    id: "doc_cp503", name: "CP503 – Second Reminder.pdf", category: "IRS notice", source: "You", taxYear: 2021, addedOn: "2026-09-04", sizeKb: 240, status: "on-file",
    summary: "The IRS's second reminder about your 2021 balance. It has since been replaced by the CP504.",
  },
  {
    id: "doc_668y", name: "Form 668(Y) – Notice of Federal Tax Lien.pdf", category: "IRS notice", source: "IRS", taxYear: 2021, addedOn: "2026-09-05", sizeKb: 188, status: "on-file",
    summary: "The lien itself, as filed with Travis County. It stays on public record until the 2021 balance is resolved or the lien is withdrawn.",
  },
  {
    id: "doc_1040_21", name: "2021 Form 1040 (copy).pdf", category: "Tax return", source: "You", taxYear: 2021, addedOn: "2026-09-03", sizeKb: 1840, status: "on-file",
    summary: "Your 2021 tax return as you filed it. We use it to check the IRS's numbers.",
  },
  {
    id: "doc_1040_22", name: "2022 Form 1040 (copy).pdf", category: "Tax return", source: "You", taxYear: 2022, addedOn: "2026-09-03", sizeKb: 1760, status: "on-file",
    summary: "Your 2022 tax return as you filed it. We use it to check the IRS's numbers.",
  },
  {
    id: "doc_tr_21", name: "2021 Account Transcript.pdf", category: "Transcript", source: "IRS", taxYear: 2021, addedOn: "2026-09-12", sizeKb: 96, status: "on-file",
    summary: "The IRS's official record of every charge, payment and penalty on your 2021 account.",
  },
  {
    id: "doc_tr_22", name: "2022 Account Transcript.pdf", category: "Transcript", source: "IRS", taxYear: 2022, addedOn: "2026-09-12", sizeKb: 91, status: "on-file",
    summary: "The IRS's official record of every charge, payment and penalty on your 2022 account.",
  },
  {
    id: "doc_wi_23", name: "2023 Wage & Income Transcript.pdf", category: "Transcript", source: "IRS", taxYear: 2023, addedOn: "2026-09-12", sizeKb: 74, status: "on-file",
    summary: "Every W-2 and 1099 the IRS received for you in 2023. We'll use it to prepare your missing return.",
  },
  {
    id: "doc_reply", name: "CP504 Reply (draft).pdf", category: "Prepared by us", source: "T-Res", taxYear: 2021, addedOn: "2026-09-13", sizeKb: 22, status: "draft", relatedActionId: "act_reply", lane: "self-serve",
    summary: "The one-page reply to your CP504 that you mail yourself. It tells the IRS you've applied for a payment plan and asks it to hold collection.",
  },
  {
    id: "doc_ftaletter", name: "First-Time Abatement Request (draft).pdf", category: "Prepared by us", source: "T-Res", taxYear: 2021, addedOn: "2026-09-13", sizeKb: 19, status: "draft", relatedActionId: "act_fta", lane: "self-serve",
    summary: "Your request to remove $2,310 in 2021 penalties. Send it once your 2023 return is filed.",
  },
  {
    id: "doc_engage", name: "Engagement Letter (signed).pdf", category: "Authorization", source: "T-Res", addedOn: "2026-09-03", sizeKb: 142, status: "on-file",
    summary: "Our agreement to work on your case, signed Sep 3, 2026.",
  },
  {
    id: "doc_8821", name: "Form 8821 – Tax Information Authorization (signed).pdf", category: "Authorization", source: "T-Res", addedOn: "2026-09-03", sizeKb: 104, status: "on-file",
    summary: "Lets us see your IRS records. It's read-only: we can't change anything or make payments with it. Signed Sep 3, 2026.",
  },
  {
    id: "doc_2848", name: "Form 2848 – Power of Attorney.pdf", category: "Authorization", source: "T-Res", addedOn: "2026-09-10", sizeKb: 118, status: "needs-signature", relatedActionId: "act_2848", lane: "represented",
    summary: "Power of attorney that lets Chris G. speak to the IRS for you, so you don't have to take their calls.",
  },
  {
    id: "doc_letter", name: "CP504 Response Letter (draft).pdf", category: "Prepared by us", source: "T-Res", taxYear: 2021, addedOn: "2026-09-13", sizeKb: 36, status: "draft", relatedActionId: "act_letter", lane: "represented",
    summary: "Our draft reply to your CP504. It asks for a 60-day hold on collection and for the 2021 penalty to be removed.",
  },
  {
    id: "doc_intake", name: "Intake Summary.pdf", category: "Prepared by us", source: "T-Res", addedOn: "2026-09-03", sizeKb: 210, status: "on-file",
    summary: "A summary of what you told us when you signed up, and the plan we recommended.",
  },
  {
    id: "doc_w2_23", name: "2023 W-2s and 1099s", category: "Financial", source: "You", taxYear: 2023, addedOn: "2026-09-07", sizeKb: 0, status: "requested", relatedActionId: "act_w2",
    summary: "Needed to file your 2023 return: the Lone Star Logistics W-2, the DoorDash 1099-NEC and the Ally Bank 1099-INT.",
  },
  {
    id: "doc_bank", name: "Bank statements (Jun–Aug 2026)", category: "Financial", source: "You", addedOn: "2026-09-07", sizeKb: 0, status: "requested", relatedActionId: "act_bank",
    summary: "Your Ally Bank statements for June, July and August 2026. The IRS uses them to set a payment you can afford.",
  },
  {
    id: "doc_paystub_0829", name: "Pay stub – Aug 29, 2026.jpg", fileName: "IMG_2044.jpg", category: "Financial", source: "You", addedOn: "2026-09-13", sizeKb: 2310, status: "in-review",
    summary: "Your most recent pay stub from Lone Star Logistics. The IRS uses recent pay stubs to confirm your take-home pay.",
  },
  {
    id: "doc_paystub_0815", name: "Pay stub – Aug 15, 2026.pdf", category: "Financial", source: "You", addedOn: "2026-09-13", sizeKb: 184, status: "in-review",
    summary: "Your pay stub from two weeks earlier. Two recent stubs show the IRS what you usually earn.",
  },
  {
    id: "doc_carloan", name: "Honda Financial – Loan Statement Aug 2026.pdf", category: "Financial", source: "You", addedOn: "2026-09-11", sizeKb: 132, status: "on-file",
    summary: "Shows you still owe $9,800 on your 2019 Honda Civic. The IRS only counts the part of the car you own outright.",
  },
];

// Notes on documents, shared between Jordan and the Enrolled Agent. Keyed by document id.
export const documentNotes: Record<string, DocumentNote[]> = {
  doc_paystub_0829: [
    {
      id: "note-ps0829-1",
      author: "you",
      date: "2026-09-13",
      text: "Took this photo in the ADP app. It includes 6 hours of overtime, so it's a bit higher than a normal check.",
      editedOn: "2026-09-13",
    },
  ],
  doc_carloan: [
    { id: "note-carloan-1", author: "you", date: "2026-09-11", text: "The payment is $465 a month, auto-debited on the 3rd." },
    {
      id: "note-carloan-2",
      author: "ea",
      date: "2026-09-12",
      text: "Got it, thanks. That matches what you told us in your money snapshot.",
    },
  ],
  doc_cp504: [
    { id: "note-cp504-1", author: "you", date: "2026-09-04", text: "Got this in the mail on Sep 2. The envelope said FINAL NOTICE in red." },
    {
      id: "note-cp504-2",
      author: "ea",
      date: "2026-09-05",
      text: "Thanks, Jordan. This is the levy warning for 2021. Our response letter is drafted; we're only waiting on your Form 2848 signature before we send it.",
    },
  ],
  doc_l3172: [
    {
      id: "note-l3172-1",
      author: "ea",
      date: "2026-09-05",
      text: "The formal hearing window closed Dec 17, 2025. An equivalent hearing is still possible until Nov 10, 2026 if we need it.",
    },
  ],
  doc_tr_21: [
    {
      id: "note-tr21-1",
      author: "ea",
      date: "2026-09-12",
      text: "Transcript matches the CP504 amount. Your $1,500 payment from Feb 2023 is applied correctly.",
    },
  ],
  doc_1040_21: [
    {
      id: "note-1040-21-1",
      author: "you",
      date: "2026-09-03",
      text: "This is the copy from TurboTax. I drove for Uber that year and didn't make estimated payments.",
    },
  ],
  doc_2848: [
    { id: "note-2848-1", author: "ea", date: "2026-09-10", text: "Please sign by Sep 17 so we can answer the CP504 in time." },
  ],
  doc_letter: [
    {
      id: "note-letter-1",
      author: "ea",
      date: "2026-09-13",
      text: "Draft ready for you to read. It asks for a 60-day hold and penalty relief on 2021.",
    },
  ],
  doc_w2_23: [
    {
      id: "note-w2-1",
      author: "you",
      date: "2026-09-08",
      text: "I have the W-2 but I'm still looking for the DoorDash 1099. Can I download it from the Dasher app?",
    },
    {
      id: "note-w2-2",
      author: "ea",
      date: "2026-09-09",
      text: "Yes: Dasher app › Account › Tax information. The PDF download works perfectly.",
    },
  ],
};

export const notifications: AppNotification[] = [
  { id: "n1", date: "2026-09-12", message: "We checked your IRS transcripts. No new changes.", read: false, href: "/documents/from-irs" },
  { id: "n2", date: "2026-09-08", message: "New notice received: CP14 for 2022.", read: false, href: "/notices/ntc_cp14" },
  { id: "n3", date: "2026-09-02", message: "New notice received: CP504 for 2021.", read: false, href: "/notices/ntc_cp504" },
];

export type MoneyRow = { label: string; amount: number };
export type AssetKind = "bank" | "vehicle" | "retirement" | "home" | "other";
export type AssetRow = { kind: AssetKind; label: string; value: number; owed: number };

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
    alsoDoing: { text: string; href: string }[];
    ruledOut: { option: string; why: string }[];
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
    { kind: "bank", label: "Checking (Ally Bank)", value: 2300, owed: 0 },
    { kind: "vehicle", label: "2019 Honda Civic", value: 14000, owed: 9800 },
  ],
  assessment: {
    recommendedPath: "Payment plan (installment agreement)",
    estimatedMonthly: 440,
    summary:
      "You owe about $21,000 for 2021–2022, and we estimate about $4,900 more for 2023 once it's filed. With about $910 left over each month, a payment plan of roughly $440 a month over six years is the most realistic path, and it stops collection.",
    alsoDoing: [
      { text: "File your 2023 return first — the IRS won't approve a plan until every year is filed.", href: "/tax-years/2023" },
      { text: "Ask for First-Time Penalty Abatement on 2021, which could save $2,310.", href: "/tax-years/2021" },
      { text: "Pay about $900 up front to get under $25,000, so we can ask for the lien to be withdrawn.", href: "/documents/doc_668y" },
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
  },
  chosenPlanId: "full",
};

// Every feature a plan can include, in the order the plan comparison shows them.
export const planFeatures = [
  "Payment-plan request prepared",
  "Missing 2023 return prepared",
  "EA review of everything",
  "Chris talks to the IRS for you",
  "Penalty relief request",
  "Lien withdrawal request",
  "Monthly IRS transcript monitoring",
  "Yearly filing check-in",
];

// Placeholder prices until Jack confirms real ones.
export const resolutionPlans = [
  {
    id: "guided",
    name: "Guided",
    price: 395,
    installments: 1,
    priceNote: "one-time",
    blurb: "We prepare your payment-plan request and 2023 return. You submit them yourself.",
    includes: ["Payment-plan request prepared", "2023 return prepared", "EA review of everything"],
    features: planFeatures.slice(0, 3),
    recommended: false,
  },
  {
    id: "full",
    name: "Full Resolution",
    price: 1650,
    installments: 6,
    priceNote: "or 6 × $275",
    blurb: "Chris represents you with the IRS from start to finish. You never have to call them.",
    includes: ["Everything in Guided", "Chris talks to the IRS for you", "Penalty relief request", "Lien withdrawal request"],
    features: planFeatures.slice(0, 6),
    recommended: true,
  },
  {
    id: "protect",
    name: "Resolution + Protection",
    price: 2160,
    installments: 6,
    priceNote: "or 6 × $360",
    blurb: "Full Resolution, plus we watch your IRS account for three years so nothing surprises you again.",
    includes: ["Everything in Full Resolution", "Monthly transcript monitoring", "Yearly filing check-in"],
    features: planFeatures,
    recommended: false,
  },
];

// Account, plan and billing. Display-only mock data: no real payments or card details.
export const account = {
  preferredName: "Jordan",
  email: "jordan.reyes@example.com",
  phone: "(512) 555-0182",
  mailingAddress: "1418 Cedar Bend Dr, Austin, TX 78758",
  memberSince: "2026-09-03",
  twoStepMethod: "Text message to (512) •••-••82",
};

export const signInActivity = [
  { id: "s1", when: "Sep 14, 2026 · 9:12 AM", device: "Chrome on Windows", place: "Austin, TX", current: true },
  { id: "s2", when: "Sep 12, 2026 · 8:47 PM", device: "Safari on iPhone", place: "Austin, TX", current: false },
  { id: "s3", when: "Sep 3, 2026 · 6:30 PM", device: "Safari on iPhone", place: "Austin, TX", current: false },
];

export type NotificationTopic = {
  id: string;
  label: string;
  description: string;
  email: boolean;
  text: boolean;
  // Deadline emails can't be switched off: missing one can cost the taxpayer real options.
  emailLocked?: boolean;
};

export const notificationTopics: NotificationTopic[] = [
  { id: "notices", label: "New IRS notices", description: "When a new letter shows up on your IRS account, or you upload one.", email: true, text: true },
  { id: "deadlines", label: "Deadline reminders", description: "Before any IRS deadline. Email reminders can't be turned off.", email: true, text: true, emailLocked: true },
  { id: "requests", label: "Document and signature requests", description: "When we need something from you.", email: true, text: true },
  { id: "updates", label: "Case updates from Chris", description: "When your case moves to a new stage.", email: true, text: false },
  { id: "summary", label: "Weekly case summary", description: "A short Monday email with where things stand.", email: false, text: false },
];

export const reminderLeadDays = [14, 7, 3, 1];

export type PlanStatus = "active" | "paused" | "canceled";

export const subscription = {
  planId: "full",
  startedOn: "2026-09-03",
  installmentsPaid: 1,
  installmentAmount: 275,
  nextChargeOn: "2026-10-03",
  // A 30-day pause from MOCK_TODAY.
  pauseResumesOn: "2026-10-14",
  paymentMethod: { brand: "Visa", last4: "4242", expires: "08/28" },
  billingEmail: "jordan.reyes@example.com",
};

export const paidInvoices = [
  { id: "INV-0142-01", date: "2026-09-03", description: "Full Resolution · payment 1 of 6", amount: 275 },
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
  if (y.lienFiled) {
    const notice = openNotices.find((n) => n.taxYear === y.year);
    return { href: notice ? `/notices/${notice.id}` : "/notices", label: "Open notice", primary: true };
  }
  return { href: `/tax-years/${y.year}`, label: "Details", primary: false };
}

// PLCY is T-Res's AI governance layer. Every AI action in the case is logged there, and a policy
// Chris approved decides whether it's auto-approved or routed to him. Chris works in PLCY, not T-Res.
export type GovernanceStatus = "pending" | "auto-approved" | "approved" | "changes-requested";

export type GovernancePolicy = {
  id: string;
  name: string;
  rule: string;
  outcome: "Auto-approve" | "Route to EA" | "Same-day EA";
  spotCheck?: string;
};

export type GovernanceCheck = {
  label: string;
  passed: boolean;
  // Live check: passes once this document is signed and on file.
  signedDocId?: string;
};

export type GovernanceItem = {
  id: string;
  title: string;
  kind: string;
  producedBy: string;
  createdOn: string;
  confidence: number; // 0–1
  policyId: string;
  status: GovernanceStatus;
  decidedOn?: string;
  note?: string;
  // Chris's time on it, in minutes (review, or a spot check).
  eaMinutes?: number;
  summary: string;
  output?: string;
  checks: GovernanceCheck[];
  evidence: { label: string; href: string }[];
  // Where the result shows up for the taxpayer.
  resultHref: string;
  noticeId?: string;
  // What Chris's approve button says, when "Approve" isn't specific enough.
  approveLabel?: string;
  // Only part of the case in this lane (e.g. a letter under Chris's name exists only when represented).
  lane?: Lane;
  // The to-do this output belongs to, so its badge shows there too.
  actionId?: string;
};

export const governancePolicies: GovernancePolicy[] = [
  {
    id: "pol_submission",
    name: "IRS submissions under Chris's name",
    rule: "Anything sent to the IRS under Chris's name or CAF number, however confident the AI is.",
    outcome: "Route to EA",
  },
  {
    id: "pol_advice",
    name: "Money recommendations",
    rule: "Which resolution to pursue and how much to pay each month.",
    outcome: "Route to EA",
  },
  {
    id: "pol_explain",
    name: "Plain-English explanations",
    rule: "Notice and document explanations at 90% confidence or higher, with every fact matched to a source document.",
    outcome: "Auto-approve",
    spotCheck: "Chris spot-checks 1 in 20",
  },
  {
    id: "pol_rules",
    name: "Rules-engine results",
    rule: "Deadlines, balances and eligibility worked out by rules Chris approved. No AI guesswork.",
    outcome: "Auto-approve",
    spotCheck: "Chris spot-checks 1 in 50",
  },
  {
    id: "pol_selfletters",
    name: "Letters you send yourself",
    rule: "Letters the taxpayer signs and sends themselves, from templates Chris approved, at 90% confidence or higher. Nothing goes out under Chris's name.",
    outcome: "Auto-approve",
    spotCheck: "Chris spot-checks 1 in 20",
  },
  {
    id: "pol_emergency",
    name: "Emergencies and final levy notices",
    rule: "Money already taken from a paycheck or bank account, or a final notice before levy (LT11 or Letter 1058). Moves a self-serve case to Chris.",
    outcome: "Same-day EA",
  },
];

export const governanceItems: GovernanceItem[] = [
  {
    id: "gov_letter",
    lane: "represented",
    actionId: "act_letter",
    title: "CP504 response letter",
    kind: "IRS submission",
    producedBy: "T-Res letter drafter",
    createdOn: "2026-09-13",
    confidence: 0.94,
    policyId: "pol_submission",
    status: "pending",
    eaMinutes: 2,
    summary:
      "Drafted Jordan's response to the CP504. It asks for a 60-day hold on collection, says a payment plan is coming, and requests First-Time Penalty Abatement for 2021.",
    output: actionItems.find((a) => a.id === "act_letter")?.letterPreview,
    checks: [
      { label: "Name and SSN match the Form 8821 on file", passed: true },
      { label: "2021 balance matches the account transcript ($14,200)", passed: true },
      { label: "Goes out before the CP504 deadline (Sep 26, 2026)", passed: true },
      { label: "Penalty relief meets First-Time Abatement rules: no penalties 2018–2020", passed: true },
      { label: "Form 2848 signed by Jordan, so Chris can send it", passed: false, signedDocId: "doc_2848" },
    ],
    evidence: [
      { label: "CP504 notice", href: "/documents/doc_cp504" },
      { label: "2021 account transcript", href: "/documents/doc_tr_21" },
      { label: "Form 8821 (signed)", href: "/documents/doc_8821" },
      { label: "The draft letter", href: "/documents/doc_letter" },
    ],
    resultHref: "/documents/doc_letter",
    noticeId: "ntc_cp504",
  },
  {
    id: "gov_assessment",
    title: "Resolution recommendation",
    kind: "Money recommendation",
    producedBy: "T-Res case assessor",
    createdOn: "2026-09-12",
    confidence: 0.91,
    policyId: "pol_advice",
    status: "approved",
    decidedOn: "2026-09-12",
    eaMinutes: 3,
    summary:
      "Recommended a payment plan of about $440 a month covering 2021–2023, after ruling out an Offer in Compromise and a pause in collection.",
    checks: [
      { label: "Income and expenses match Jordan's uploaded pay stubs", passed: true },
      { label: "Monthly amount fits the IRS's allowable living expenses", passed: true },
      { label: "Every required return is filed or being prepared (2023)", passed: true },
    ],
    evidence: [
      { label: "Jordan's assessment", href: "/intake/assessment" },
      { label: "Jordan's uploads", href: "/documents/mine" },
    ],
    resultHref: "/intake/assessment",
  },
  {
    id: "gov_lane",
    title: "Self-serve eligibility",
    kind: "Eligibility check",
    producedBy: "T-Res rules engine",
    createdOn: "2026-09-12",
    confidence: 1,
    policyId: "pol_rules",
    status: "auto-approved",
    decidedOn: "2026-09-12",
    summary:
      "Found that Jordan can resolve this without representation: set up the payment plan online, file 2023 and ask for penalty relief themselves, with T-Res preparing everything.",
    checks: [
      { label: "Owes $50,000 or less (about $25,900 with 2023)", passed: true },
      { label: "Only 2023 is unfiled, and T-Res can prepare it", passed: true },
      { label: "No money taken and no employer contacted", passed: true },
      { label: "About $440 a month fits the $910 left over", passed: true },
    ],
    evidence: [
      { label: "Jordan's assessment", href: "/intake/assessment" },
      { label: "2021 account transcript", href: "/documents/doc_tr_21" },
      { label: "2023 wage & income transcript", href: "/documents/doc_wi_23" },
    ],
    resultHref: "/intake/assessment",
  },
  {
    id: "gov_fta",
    title: "First-Time Abatement eligibility (2021)",
    kind: "Eligibility check",
    producedBy: "T-Res rules engine",
    createdOn: "2026-09-12",
    confidence: 1,
    policyId: "pol_rules",
    status: "auto-approved",
    decidedOn: "2026-09-12",
    eaMinutes: 1,
    summary: "Found that Jordan's $2,310 in 2021 penalties qualify for First-Time Abatement. Chris spot-checked it on Sep 13.",
    checks: [
      { label: "No penalties in 2018, 2019 or 2020", passed: true },
      { label: "Every required return is filed or being prepared", passed: true },
      { label: "Balance is paid or a payment plan is being arranged", passed: true },
    ],
    evidence: [{ label: "2021 account transcript", href: "/documents/doc_tr_21" }],
    resultHref: "/tax-years/2021",
  },
  {
    id: "gov_cp504",
    title: "CP504 explained in plain English",
    kind: "Explanation",
    producedBy: "T-Res notice reader",
    createdOn: "2026-09-04",
    confidence: 0.97,
    policyId: "pol_explain",
    status: "auto-approved",
    decidedOn: "2026-09-04",
    summary: "Read the CP504 Jordan uploaded and explained what it is, what it means, the deadline and what we're doing.",
    checks: [
      { label: "Notice code, amount and deadline match the letter and the transcript", passed: true },
      { label: "Written at a 6th-grade reading level", passed: true },
      { label: "Makes no promises about outcomes", passed: true },
    ],
    evidence: [{ label: "CP504 notice", href: "/documents/doc_cp504" }],
    resultHref: "/notices/ntc_cp504",
  },
  {
    id: "gov_cp14",
    title: "CP14 explained in plain English",
    kind: "Explanation",
    producedBy: "T-Res notice reader",
    createdOn: "2026-09-09",
    confidence: 0.98,
    policyId: "pol_explain",
    status: "auto-approved",
    decidedOn: "2026-09-09",
    summary: "Read the CP14 Jordan uploaded and explained it as a routine first bill for 2022.",
    checks: [
      { label: "Notice code, amount and deadline match the letter and the transcript", passed: true },
      { label: "Written at a 6th-grade reading level", passed: true },
      { label: "Makes no promises about outcomes", passed: true },
    ],
    evidence: [{ label: "CP14 notice", href: "/documents/doc_cp14" }],
    resultHref: "/notices/ntc_cp14",
  },
  {
    id: "gov_l3172",
    title: "Letter 3172 explained in plain English",
    kind: "Explanation",
    producedBy: "T-Res notice reader",
    createdOn: "2026-09-04",
    confidence: 0.95,
    policyId: "pol_explain",
    status: "auto-approved",
    decidedOn: "2026-09-04",
    summary: "Read the lien letter Jordan uploaded and explained the lien, the hearing window that has passed, and the path to a withdrawal.",
    checks: [
      { label: "Notice code, amount and deadline match the letter and the transcript", passed: true },
      { label: "Written at a 6th-grade reading level", passed: true },
      { label: "Makes no promises about outcomes", passed: true },
    ],
    evidence: [{ label: "Letter 3172", href: "/documents/doc_l3172" }],
    resultHref: "/notices/ntc_l3172",
  },
  {
    id: "gov_cp503",
    title: "CP503 explained in plain English",
    kind: "Explanation",
    producedBy: "T-Res notice reader",
    createdOn: "2026-09-04",
    confidence: 0.97,
    policyId: "pol_explain",
    status: "auto-approved",
    decidedOn: "2026-09-04",
    summary: "Read the CP503 Jordan uploaded and explained that the CP504 has replaced it, so there's nothing to do.",
    checks: [
      { label: "Notice code, amount and deadline match the letter and the transcript", passed: true },
      { label: "Written at a 6th-grade reading level", passed: true },
      { label: "Makes no promises about outcomes", passed: true },
    ],
    evidence: [{ label: "CP503 notice", href: "/documents/doc_cp503" }],
    resultHref: "/notices/ntc_cp503",
  },
  {
    id: "gov_2023",
    title: "2023 balance estimate",
    kind: "Estimate",
    producedBy: "T-Res rules engine",
    createdOn: "2026-09-12",
    confidence: 0.88,
    policyId: "pol_rules",
    status: "auto-approved",
    decidedOn: "2026-09-12",
    summary: "Estimated about $4,900 owed for 2023 from the income the IRS has on record. Shown to Jordan as an estimate, not a bill.",
    checks: [
      { label: "Income taken from the 2023 wage & income transcript", passed: true },
      { label: "Labelled as an estimate everywhere Jordan sees it", passed: true },
    ],
    evidence: [{ label: "2023 wage & income transcript", href: "/documents/doc_wi_23" }],
    resultHref: "/tax-years/2023",
  },
  {
    id: "gov_reply",
    lane: "self-serve",
    actionId: "act_reply",
    title: "CP504 reply for Jordan to mail",
    kind: "Letter",
    producedBy: "T-Res letter drafter",
    createdOn: "2026-09-13",
    confidence: 0.95,
    policyId: "pol_selfletters",
    status: "auto-approved",
    decidedOn: "2026-09-13",
    summary: "Drafted a one-page reply Jordan signs and mails: it says a payment plan has been requested online and asks the IRS to hold collection.",
    output: actionItems.find((a) => a.id === "act_reply")?.letterPreview,
    checks: [
      { label: "Name and SSN match the Form 8821 on file", passed: true },
      { label: "Goes out before the CP504 deadline (Sep 26, 2026)", passed: true },
      { label: "Built from the CP504 reply template Chris approved", passed: true },
      { label: "Signed by Jordan, not under Chris's name", passed: true },
    ],
    evidence: [
      { label: "CP504 notice", href: "/documents/doc_cp504" },
      { label: "The draft reply", href: "/documents/doc_reply" },
    ],
    resultHref: "/documents/doc_reply",
  },
  {
    id: "gov_ftaletter",
    lane: "self-serve",
    actionId: "act_fta",
    title: "Penalty relief request for Jordan to send",
    kind: "Letter",
    producedBy: "T-Res letter drafter",
    createdOn: "2026-09-13",
    confidence: 0.93,
    policyId: "pol_selfletters",
    status: "auto-approved",
    decidedOn: "2026-09-13",
    summary: "Drafted Jordan's First-Time Abatement request for $2,310 in 2021 penalties, to send once the 2023 return is filed.",
    output: actionItems.find((a) => a.id === "act_fta")?.letterPreview,
    checks: [
      { label: "No penalties in 2018, 2019 or 2020", passed: true },
      { label: "Scheduled after the 2023 return, since every return must be filed first", passed: true },
      { label: "Built from the First-Time Abatement template Chris approved", passed: true },
      { label: "Signed by Jordan, not under Chris's name", passed: true },
    ],
    evidence: [
      { label: "2021 account transcript", href: "/documents/doc_tr_21" },
      { label: "The draft request", href: "/documents/doc_ftaletter" },
    ],
    resultHref: "/documents/doc_ftaletter",
  },
];

// What happens next in the demo: a final levy notice arrives while Jordan is in the self-serve lane.
// None of this is part of the case until CaseProvider's escalate() adds it (account menu → Demo).
export const escalationPlan = {
  noticeId: "ntc_lt11",
  signActionId: "act_2848",
  signDocId: "doc_2848",
  signWhy: `So ${enrolledAgent.name} can ask for a hearing and put collection on hold today.`,
};

export const laterNotices: Notice[] = [
  {
    id: "ntc_lt11",
    code: "LT11",
    title: "Final Notice of Intent to Levy and Notice of Your Right to a Hearing",
    plainTitle: "Final notice before the IRS can take wages or bank accounts",
    taxYear: 2021,
    receivedOn: MOCK_TODAY,
    respondBy: "2026-10-14",
    amount: 14310,
    status: "action-needed",
    statusLabel: "Action needed",
    tone: "bad",
    documentId: "doc_lt11",
    decode: {
      whatItIs:
        "The IRS's final notice before it can levy your wages, bank accounts or other property for 2021. It also gives you the right to a Collection Due Process hearing.",
      whatItMeans:
        "This is the most serious letter so far, and it's still fixable. Asking for a hearing within 30 days pauses most levies while it's decided.",
      deadline: "Ask for a hearing by Oct 14, 2026, 30 days from the letter. After that, the IRS can levy wages and bank accounts.",
      whatWeAreDoing: `${enrolledAgent.name} is taking over today. Once your Form 2848 is signed, ${enrolledAgent.name} will ask for a hearing and a hold on collection, then set up your payment plan through the hearing.`,
    },
  },
];

export const laterDocuments: CaseDocument[] = [
  {
    id: "doc_lt11",
    name: "LT11 – Final Notice of Intent to Levy.pdf",
    category: "IRS notice",
    source: "You",
    taxYear: 2021,
    addedOn: MOCK_TODAY,
    sizeKb: 388,
    status: "on-file",
    summary:
      "The IRS's final notice before it can levy wages or bank accounts for 2021. It gives you 30 days, until Oct 14, 2026, to ask for a hearing.",
  },
];

export const laterGovernanceItems: GovernanceItem[] = [
  {
    id: "gov_lt11",
    title: "Final levy notice: case moved to you",
    kind: "Escalation",
    producedBy: "T-Res notice reader",
    createdOn: MOCK_TODAY,
    confidence: 0.96,
    policyId: "pol_emergency",
    status: "pending",
    eaMinutes: 15,
    approveLabel: "Approve and request the hearing",
    summary:
      "Read the LT11 Jordan uploaded. Jordan was in the self-serve lane, but a final levy notice needs an Enrolled Agent, so PLCY moved the case to you. Proposed plan: request a Collection Due Process hearing (Form 12153) today, ask for a hold on collection, and set up the payment plan through the hearing.",
    checks: [
      { label: "Notice code, amount and date match the letter and the 2021 transcript", passed: true },
      { label: "Hearing deadline worked out: Oct 14, 2026, 30 days from the letter", passed: true },
      { label: "Balance still qualifies for a payment plan (under $50,000)", passed: true },
      { label: "Form 2848 signed by Jordan, so you can act for them", passed: false, signedDocId: "doc_2848" },
    ],
    evidence: [
      { label: "LT11 notice", href: "/documents/doc_lt11" },
      { label: "CP504 notice", href: "/documents/doc_cp504" },
      { label: "2021 account transcript", href: "/documents/doc_tr_21" },
    ],
    resultHref: "/notices/ntc_lt11",
    noticeId: "ntc_lt11",
  },
];
