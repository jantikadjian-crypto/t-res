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
  // Appears only once this other to-do is done (e.g. the return, after the W-2s are in).
  after?: string;
  // Button labels for items you review and approve, when "Read the letter" / "Approve letter" don't fit.
  openLabel?: string;
  approveLabel?: string;
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
  // Appears only once this to-do is done.
  after?: string;
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
      "Chris V. can speak with the IRS about your income tax (Form 1040) for 2021, 2022 and 2023.",
      "He gets copies of your IRS notices and can see your records for those years.",
      "He can't cash or deposit your refund checks, and he can't sign tax returns for you.",
      "You can cancel it at any time by telling us or the IRS.",
    ],
    taxMatters: [{ matter: "Income", form: "1040", years: "2021, 2022, 2023" }],
  },
};

export const enrolledAgent: EnrolledAgent = {
  name: "Chris V.",
  credential: "Enrolled Agent",
};

export const caseNumber = "TR-2026-0142";

export const transcriptsLastChecked = "2026-09-12";

export const caseStages: CaseStage[] = [
  { key: "intake", label: "Intake", description: "We learned about your situation." },
  { key: "authorization", label: "Authorization", description: "You let us see your IRS records, so we can prepare everything for you." },
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

// The 2023 return T-Res prepares once the W-2s and 1099s are in (from the IRS wage & income record).
const return2023Preview = `2023 Form 1040, prepared by T-Res — Jordan A. Reyes, single

Wages from Lone Star Logistics (W-2): $58,400
Delivery income from DoorDash (1099-NEC), less car costs: see Schedule C
Interest from Ally Bank (1099-INT): $42
Self-employment tax on the delivery income: included

Estimated balance due: about $4,900. It joins your payment plan once the return is filed.`;

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

Chris V., Enrolled Agent`,
  },
  {
    id: "act_opa",
    lane: "self-serve",
    type: "upload",
    title: "Set up your payment plan on IRS.gov",
    why: "Once your 2023 return is filed, apply online. It stops the levy the CP504 warns about, and we give you every answer to enter.",
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

I received your CP504 notice dated September 2, 2026. I am filing my missing 2023 return and applying for a long-term payment plan through my IRS online account, to pay my balances by direct debit.

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
    id: "act_file23s",
    lane: "self-serve",
    after: "act_w2",
    type: "approve-letter",
    title: "Review and e-file your 2023 return",
    why: "We prepared it from your W-2s and 1099s. Check it, then e-file it. It has to be filed before your payment plan can be approved.",
    dueBy: "2026-09-23",
    done: false,
    relatedTaxYear: 2023,
    letterPreview: return2023Preview,
    openLabel: "Review your return",
    approveLabel: "E-file my return",
  },
  {
    id: "act_file23r",
    lane: "represented",
    after: "act_w2",
    type: "approve-letter",
    title: "Approve your 2023 return",
    why: "Chris prepared it from your W-2s and 1099s. Approve it and Chris e-files it, so your payment plan can go ahead.",
    dueBy: "2026-09-23",
    done: false,
    relatedTaxYear: 2023,
    letterPreview: `${return2023Preview}\n\nPreparer: Chris V., Enrolled Agent`,
    openLabel: "Review your return",
    approveLabel: "Approve for e-filing",
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
    id: "doc_1040_23s", name: "2023 Form 1040 (draft).pdf", category: "Tax return", source: "T-Res", taxYear: 2023, addedOn: MOCK_TODAY, sizeKb: 212, status: "draft", relatedActionId: "act_file23s", lane: "self-serve", after: "act_w2",
    summary: "Your 2023 return, prepared from your W-2s and 1099s, for you to e-file. Estimated balance due: about $4,900.",
  },
  {
    id: "doc_1040_23r", name: "2023 Form 1040 (draft).pdf", category: "Tax return", source: "T-Res", taxYear: 2023, addedOn: MOCK_TODAY, sizeKb: 214, status: "draft", relatedActionId: "act_file23r", lane: "represented", after: "act_w2",
    summary: "Your 2023 return, prepared by Chris V. from your W-2s and 1099s. Chris e-files it once you approve. Estimated balance due: about $4,900.",
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
    summary: "Power of attorney that lets Chris V. speak to the IRS for you, so you don't have to take their calls.",
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

// T-Res Pro. The professional's version: same shape, different stakes — a same-day escalation
// can't be switched off, and the digest replaces "case updates".
export const proNotificationTopics: NotificationTopic[] = [
  { id: "emergency", label: "Same-day escalations", description: "A levy, a seizure or a final notice that needs you today. Always on.", email: true, text: true, emailLocked: true },
  { id: "approvals", label: "Approvals waiting", description: "AI work under your name that needs your sign-off.", email: true, text: false },
  { id: "deadlines", label: "IRS deadlines", description: "Before any client deadline. Email reminders can't be turned off.", email: true, text: true, emailLocked: true },
  { id: "flagged", label: "Flagged checks", description: "When T-Res isn't confident enough to act on its own.", email: true, text: false },
  { id: "client", label: "Client activity", description: "Uploads, signatures and replies from your clients.", email: false, text: false },
  { id: "digest", label: "Weekly practice digest", description: "A short Monday email: what moved, what's due, what's waiting.", email: true, text: false },
];

// How long before a client deadline the professional wants to know.
export const proReminderLeadDays = [14, 7, 3, 1];

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
  // Logged only once this to-do is done (e.g. checking a confirmation after it's uploaded).
  showsAfter?: string;
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
    name: "Letters and returns you send yourself",
    rule: "Letters and returns the taxpayer signs and sends themselves, from templates and rules Chris approved, at 90% confidence or higher. Nothing goes out under Chris's name.",
    outcome: "Auto-approve",
    spotCheck: "Chris spot-checks 1 in 20",
  },
  {
    id: "pol_selfcheck",
    name: "Checks on what you did yourself",
    rule: "Confirmations the taxpayer uploads after doing something themselves, matched against the answers we gave. Anything that doesn't match goes to Chris.",
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
    summary:
      "Drafted a one-page reply Jordan signs and mails: it says the 2023 return is being filed and a payment plan requested online, and asks the IRS to hold collection.",
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
  {
    id: "gov_return_self",
    lane: "self-serve",
    actionId: "act_file23s",
    showsAfter: "act_w2",
    title: "2023 return for Jordan to e-file",
    kind: "Tax return",
    producedBy: "T-Res return preparer",
    createdOn: MOCK_TODAY,
    confidence: 0.94,
    policyId: "pol_selfletters",
    status: "auto-approved",
    decidedOn: MOCK_TODAY,
    summary: "Prepared Jordan's 2023 Form 1040 from the uploaded W-2s and 1099s, for Jordan to e-file. Estimated balance due about $4,900.",
    output: return2023Preview,
    checks: [
      { label: "Every W-2 and 1099 on the IRS wage & income record is included", passed: true },
      { label: "Math checked by the rules engine", passed: true },
      { label: "Balance due matches our estimate (about $4,900)", passed: true },
      { label: "Filed by Jordan, not under Chris's name", passed: true },
    ],
    evidence: [
      { label: "2023 wage & income transcript", href: "/documents/doc_wi_23" },
      { label: "The draft return", href: "/documents/doc_1040_23s" },
    ],
    resultHref: "/documents/doc_1040_23s",
  },
  {
    id: "gov_return_rep",
    lane: "represented",
    actionId: "act_file23r",
    showsAfter: "act_w2",
    title: "2023 return to e-file under your name",
    kind: "Tax return",
    producedBy: "T-Res return preparer",
    createdOn: MOCK_TODAY,
    confidence: 0.94,
    policyId: "pol_submission",
    status: "pending",
    eaMinutes: 6,
    approveLabel: "Approve for e-filing",
    summary: "Prepared Jordan's 2023 Form 1040 from the uploaded W-2s and 1099s. You're the preparer, so it's yours to approve before it's e-filed.",
    output: `${return2023Preview}\n\nPreparer: Chris V., Enrolled Agent`,
    checks: [
      { label: "Every W-2 and 1099 on the IRS wage & income record is included", passed: true },
      { label: "Math checked by the rules engine", passed: true },
      { label: "Balance due matches our estimate (about $4,900)", passed: true },
    ],
    evidence: [
      { label: "2023 wage & income transcript", href: "/documents/doc_wi_23" },
      { label: "The draft return", href: "/documents/doc_1040_23r" },
    ],
    resultHref: "/documents/doc_1040_23r",
  },
  {
    id: "gov_opa",
    lane: "self-serve",
    actionId: "act_opa",
    showsAfter: "act_opa",
    title: "IRS payment plan confirmation checked",
    kind: "Document check",
    producedBy: "T-Res document reader",
    createdOn: MOCK_TODAY,
    confidence: 0.97,
    policyId: "pol_selfcheck",
    status: "auto-approved",
    decidedOn: MOCK_TODAY,
    summary: "Read the payment plan confirmation Jordan uploaded and matched it against the answers we gave. It checks out.",
    checks: [
      { label: "It's an IRS payment plan confirmation for Jordan", passed: true },
      { label: "Monthly amount matches the answers we gave (about $440)", passed: true },
      { label: "Covers the 2021 and 2022 balances", passed: true },
      { label: "Paid by direct debit, which the lien withdrawal needs", passed: true },
    ],
    evidence: [{ label: "Jordan's to-dos", href: "/action-items" }],
    resultHref: "/action-items",
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

// T-Res Pro: the demo practitioner account. Sign-in is a mock (any password, demo code); v1 has no real accounts.
export const practitioner = {
  name: enrolledAgent.name,
  credential: enrolledAgent.credential,
  cafNumber: representativeDetails.cafNumber,
  email: "chris@tres-demo.example",
  phoneMasked: "(512) •••-••47",
  demoCode: "135790",
  // Settings: what the IRS and we hold about him.
  legalName: "Christopher R. Vance",
  ptin: "P01234567",
  enrollmentNumber: representativeDetails.enrollment.replace("Enrollment card no. ", ""),
  // Enrolled agents renew on a three-year cycle.
  enrolledThrough: "2029-03-31",
  phone: representativeDetails.phone,
  timezone: "Central Time · Austin, TX",
  memberSince: "2025-04-18",
};

// The practice behind T-Res Pro. Display-only mock data, like the taxpayer's billing: no payments, no card entry.
export const proFirm = {
  name: "Vance Tax Resolution",
  ein: "87-•••••21",
  address: "600 Congress Ave, Suite 1400, Austin, TX 78701",
  website: "vancetax.example",
  supportEmail: "help@vancetax.example",
};

export type ProTeamMember = {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Preparer" | "Assistant";
  status: "Active" | "Invited";
  lastActive?: string;
};

// What a role may do, in plain English — shown beside it so nobody has to guess.
export const proRoles: { role: ProTeamMember["role"]; can: string }[] = [
  { role: "Owner", can: "Everything, including billing and who's on the team" },
  { role: "Preparer", can: "Work every client and approve AI work under their own name" },
  { role: "Assistant", can: "Gather documents and chase clients; can't approve anything" },
];

export const proTeam: ProTeamMember[] = [
  { id: "chris", name: enrolledAgent.name, email: "chris@tres-demo.example", role: "Owner", status: "Active", lastActive: MOCK_TODAY },
  { id: "renee", name: "Renée Adeyemi", email: "renee@vancetax.example", role: "Preparer", status: "Active", lastActive: "2026-09-12" },
  { id: "sam", name: "Sam Okafor", email: "sam@vancetax.example", role: "Assistant", status: "Active", lastActive: MOCK_TODAY },
  { id: "dana-seat", name: "Dana Whitfield", email: "dana@vancetax.example", role: "Preparer", status: "Invited" },
];

// Placeholder pricing, like the taxpayer plans: the tiers are the point, the numbers aren't final.
export const proPlans = [
  {
    id: "solo",
    name: "Solo",
    price: 89,
    clients: 25,
    seats: 1,
    blurb: "One practitioner, a steady caseload.",
    features: ["Up to 25 active clients", "1 seat", "AI drafting and checks", "PLCY governance log", "Email support"],
  },
  {
    id: "practice",
    name: "Practice",
    price: 249,
    clients: 100,
    seats: 5,
    blurb: "A small practice with staff who prepare and chase.",
    features: [
      "Up to 100 active clients",
      "5 seats",
      "Everything in Solo",
      "Your own approval policies in PLCY",
      "Shared document requests",
      "Priority support",
    ],
  },
  {
    id: "firm",
    name: "Firm",
    price: 599,
    clients: 400,
    seats: 20,
    blurb: "Several practitioners, one supervision record.",
    features: [
      "Up to 400 active clients",
      "20 seats",
      "Everything in Practice",
      "Firm-wide audit evidence export",
      "Break-glass escalation cover",
      "Named onboarding contact",
    ],
  },
];

export const proSubscription = {
  planId: "practice",
  startedOn: "2025-04-18",
  renewsOn: "2026-10-18",
  paymentMethod: { brand: "Visa", last4: "8821", expires: "04/29" },
  billingEmail: "billing@vancetax.example",
};

export const proInvoices = [
  { id: "TRP-2026-09", date: "2026-09-18", description: "Practice · September 2026", amount: 249 },
  { id: "TRP-2026-08", date: "2026-08-18", description: "Practice · August 2026", amount: 249 },
  { id: "TRP-2026-07", date: "2026-07-18", description: "Practice · July 2026", amount: 249 },
];

// T-Res Pro caseload and queue. Every client except Jordan is fictional and static; Jordan's row, queue items
// and deadlines come live from CaseProvider (PLCY items waiting for Chris, lane, open notices).
export type ProQueueKind = "emergency" | "call" | "approval" | "flagged" | "recommendation" | "spot-check";

export type ProQueueItem = {
  id: string;
  clientId?: string;
  kind: ProQueueKind;
  title: string;
  why: string;
  minutes: number;
  deadline?: string;
  cta: string;
  // What the AI prepared, what to check, and the one action (in place on Today, or on the full review).
  preview: { summary: string; points: { label: string; ok?: boolean }[]; doneLabel: string; doneNote: string };
  // Approvals only: what the full review at /pro/approvals/[id] shows.
  review?: { producedBy: string; confidence: number; draft?: string; evidence: string[] };
};

export type ProClient = {
  id: string;
  name: string;
  lane: Lane | "new";
  stage: string;
  balance: number;
  situation: string;
  deadline?: { label: string; date: string; waitingOn?: string };
  tone: Tone;
  lastActivity: string;
};

export const proClients: ProClient[] = [
  { id: "jordan", name: `${taxpayer.firstName} ${taxpayer.lastName}`, lane: "represented", stage: "Document Collection", balance: 21000, situation: "CP504 for 2021; 2023 not filed", tone: "bad", lastActivity: MOCK_TODAY },
  { id: "marcus", name: "Marcus Bell", lane: "represented", stage: "Resolution Strategy", balance: 31600, situation: "LT11 received; hearing request drafted", deadline: { label: "LT11 hearing request", date: "2026-10-13" }, tone: "bad", lastActivity: "2026-09-13" },
  { id: "priya", name: "Priya Nair", lane: "represented", stage: "Resolution Strategy", balance: 38900, situation: "Wage levy in place since Sep 12", deadline: { label: "Levy release call", date: MOCK_TODAY }, tone: "bad", lastActivity: "2026-09-12" },
  { id: "daniel", name: "Daniel Ortiz", lane: "self-serve", stage: "Submitted to IRS", balance: 14700, situation: "Payment plan set up online; amount doesn't match", deadline: { label: "First plan payment", date: "2026-10-01" }, tone: "warn", lastActivity: MOCK_TODAY },
  { id: "grace", name: "Grace Liu", lane: "represented", stage: "Resolution Strategy", balance: 2480, situation: "CP2000 for 2022: stock sales without cost basis", deadline: { label: "CP2000 response", date: "2026-09-28" }, tone: "warn", lastActivity: "2026-09-11" },
  { id: "tom", name: "Tom Walsh", lane: "new", stage: "Intake", balance: 16400, situation: "Intake done; assessment ready", tone: "neutral", lastActivity: MOCK_TODAY },
  { id: "aisha", name: "Aisha Thompson", lane: "represented", stage: "Resolution Strategy", balance: 61300, situation: "Offer in Compromise package drafted", deadline: { label: "Offer in Compromise filing (target)", date: "2026-09-25" }, tone: "warn", lastActivity: "2026-09-10" },
  { id: "robert", name: "Robert Kim", lane: "represented", stage: "Submitted to IRS", balance: 18200, situation: "Payment plan active; could do it themselves", deadline: { label: "Plan payment", date: "2026-10-05" }, tone: "good", lastActivity: "2026-09-08" },
  { id: "maya", name: "Maya Chen", lane: "self-serve", stage: "Submitted to IRS", balance: 12400, situation: "Payment plan active", deadline: { label: "Plan payment", date: "2026-10-02" }, tone: "good", lastActivity: "2026-09-09" },
  { id: "samuel", name: "Samuel Okafor", lane: "self-serve", stage: "Submitted to IRS", balance: 3100, situation: "2022 return e-filed; plan requested", tone: "good", lastActivity: "2026-09-06" },
  { id: "elena", name: "Elena Garcia", lane: "represented", stage: "Submitted to IRS", balance: 9800, situation: "Collection pause requested; waiting on the IRS", tone: "neutral", lastActivity: "2026-08-30" },
  { id: "nina", name: "Nina Patel", lane: "represented", stage: "Resolved", balance: 0, situation: "Paid in full; lien withdrawn; monitoring", tone: "good", lastActivity: "2026-09-01" },
];

export const proQueue: ProQueueItem[] = [
  {
    id: "q_marcus",
    clientId: "marcus",
    kind: "emergency",
    title: "LT11: approve the hearing request",
    why: "Final levy notice arrived Sep 13. The Collection Due Process hearing request (Form 12153) is drafted and checked.",
    minutes: 15,
    deadline: "2026-10-13",
    cta: "Review hearing request",
    preview: {
      summary:
        "Asks for a Collection Due Process hearing for 2020–2021 and proposes a payment plan of about $520 a month instead of a levy. Filing within the 30 days pauses most levies while the hearing is pending.",
      points: [
        { label: "Filed within the 30-day window (deadline Oct 13, 2026)", ok: true },
        { label: "Form 2848 on file for 2020–2021", ok: true },
        { label: "Proposed payment fits Marcus's budget", ok: true },
        { label: "Goes out under your name" },
      ],
      doneLabel: "Approve and send",
      doneNote: "Hearing request approved · goes out today",
    },
    review: {
      producedBy: "T-Res letter drafter",
      confidence: 0.95,
      draft: `Form 12153, Request for a Collection Due Process or Equivalent Hearing
Taxpayer: Marcus Bell · Tax years: 2020, 2021 · Notice: LT11

Reason for the hearing: I can't pay the full balance now. I propose an installment agreement of about $520 a month as an alternative to levy.

Representative: Chris V., Enrolled Agent (Form 2848 on file)`,
      evidence: ["LT11 – Final Notice of Intent to Levy", "Form 2848 (signed)", "Money snapshot"],
    },
  },
  {
    id: "q_priya",
    clientId: "priya",
    kind: "call",
    title: "Wage levy: call the IRS for a release",
    why: "Priya's employer started withholding on Sep 12. The hardship case is ready: after the levy, rent and childcare aren't covered.",
    minutes: 20,
    deadline: MOCK_TODAY,
    cta: "Open call sheet",
    preview: {
      summary: "Call the Practitioner Priority Service and ask for the wage levy to be released for economic hardship, with a payment plan to follow.",
      points: [
        { label: "Ask for: a levy release for economic hardship, then a payment plan of about $300 a month" },
        { label: "Have ready: Form 2848 (on file), Priya's pay stubs and money snapshot (in the case)" },
        { label: "Balance: $38,900 for 2019–2021" },
        { label: "If it's refused: ask for a manager, or request a Collection Appeals Program hearing" },
      ],
      doneLabel: "Log the call",
      doneNote: "Call logged · levy release requested",
    },
  },
  {
    id: "q_daniel",
    clientId: "daniel",
    kind: "flagged",
    title: "Payment plan confirmation doesn't match",
    why: "Daniel set up the plan online. The confirmation says $350 a month; the answers we gave were $410.",
    minutes: 5,
    cta: "Compare",
    preview: {
      summary:
        "At $350 a month the plan runs about a year longer and costs more in interest. Daniel can change the amount in the IRS online account in a few minutes.",
      points: [
        { label: "Monthly amount: $350 (we gave $410)", ok: false },
        { label: "Tax years: 2020–2022", ok: true },
        { label: "Paid by direct debit", ok: true },
      ],
      doneLabel: "Send Daniel the fix",
      doneNote: "Fix sent · Daniel updates the amount online",
    },
  },
  {
    id: "q_grace",
    clientId: "grace",
    kind: "approval",
    title: "CP2000 response letter",
    why: "Agrees with $1,120 of the proposed $2,480 and disputes the rest with the cost basis from the 1099-B.",
    minutes: 6,
    deadline: "2026-09-28",
    cta: "Review letter",
    preview: {
      summary:
        "The IRS matched stock sales without their cost basis. The letter accepts the dividend change and shows the basis for the stock sales, with the brokerage statement attached.",
      points: [
        { label: "Amounts match the 2022 wage & income transcript", ok: true },
        { label: "Cost basis matches the brokerage statement", ok: true },
        { label: "Goes out before Sep 28, 2026", ok: true },
        { label: "Goes out under your name" },
      ],
      doneLabel: "Approve and send",
      doneNote: "Letter approved · goes out today",
    },
    review: {
      producedBy: "T-Res letter drafter",
      confidence: 0.93,
      draft: `Re: CP2000 for tax year 2022 — Grace Liu

We agree with the proposed change to dividend income ($1,120 of tax). We disagree with the change for stock sales: the IRS figures leave out the cost basis. The enclosed brokerage statement shows the basis for each sale, which removes the rest of the proposed amount.

Chris V., Enrolled Agent`,
      evidence: ["CP2000 notice", "Brokerage 1099-B, 2022", "2022 wage & income transcript"],
    },
  },
  {
    id: "q_tom",
    clientId: "tom",
    kind: "recommendation",
    title: "New assessment: payment plan about $310 a month",
    why: "Intake done today. Owes about $16,400 for 2022–2023, both returns filed, so doing it without representation is an option.",
    minutes: 3,
    cta: "Review assessment",
    preview: {
      summary: "Recommends a long-term payment plan of about $310 a month, and the self-serve lane, since the balance is under $50,000.",
      points: [
        { label: "Income and expenses match the uploaded pay stubs", ok: true },
        { label: "Monthly amount fits the IRS's allowable living expenses", ok: true },
        { label: "Both returns filed", ok: true },
      ],
      doneLabel: "Approve recommendation",
      doneNote: "Assessment approved · Tom picks a lane",
    },
    review: {
      producedBy: "T-Res case assessor",
      confidence: 0.91,
      draft: `Recommendation: long-term payment plan, about $310 a month by direct debit.
Lane: self-serve (balance under $50,000, both returns filed).
Ruled out: Offer in Compromise (the balance can be paid in full over time).`,
      evidence: ["Pay stubs", "2022 and 2023 wage & income transcripts"],
    },
  },
  {
    id: "q_aisha",
    clientId: "aisha",
    kind: "approval",
    title: "Offer in Compromise package",
    why: "Form 656 and Form 433-A drafted: offers $4,200 against $61,300 owed.",
    minutes: 25,
    deadline: "2026-09-25",
    cta: "Review package",
    preview: {
      summary:
        "The offer equals Aisha's reasonable collection potential: little equity in assets and about $260 a month left over, counted over 12 months.",
      points: [
        { label: "Offer matches reasonable collection potential: $1,080 equity + 12 × $260", ok: true },
        { label: "All returns filed and this year's estimated payments made", ok: true },
        { label: "Application fee and 20% payment included (or a low-income waiver)" },
        { label: "Goes out under your name" },
      ],
      doneLabel: "Approve the offer",
      doneNote: "Offer approved · filed by Sep 25",
    },
    review: {
      producedBy: "T-Res offer preparer",
      confidence: 0.9,
      draft: `Form 656, Offer in Compromise — Aisha Thompson
Offer: $4,200, as a lump-sum offer (20% with the application, the rest in 5 or fewer payments)
Tax years: 2017–2021 · Balance: $61,300
Basis: reasonable collection potential of $4,200 ($1,080 equity + 12 × $260)`,
      evidence: ["Form 433-A", "Bank statements, Apr–Jun", "Account transcripts, 2017–2021"],
    },
  },
  {
    id: "q_spot",
    kind: "spot-check",
    title: "Spot checks: 4 auto-approved explanations",
    why: "1 in 20 of this week's auto-approved notice explanations, picked at random.",
    minutes: 8,
    cta: "Start spot checks",
    preview: {
      summary: "Read each explanation against its letter. Anything wrong goes back to T-Res and tightens the policy.",
      points: [
        { label: "Maya Chen · CP521 explained" },
        { label: "Samuel Okafor · CP71C explained" },
        { label: "Elena Garcia · CP503 explained" },
        { label: "Robert Kim · CP523 explained" },
      ],
      doneLabel: "Mark all as checked",
      doneNote: "4 spot checks done · all correct",
    },
  },
];

// Lane changes across the practice (Jordan's escalation is added live).
export const proEscalations = [{ clientId: "marcus", date: "2026-09-13", text: "Moved to you: an LT11 arrived while doing it themselves" }];
export const proLaneSuggestions = [
  {
    id: "lane_robert",
    clientId: "robert",
    text: "Owes $18,200, and the payment plan fits the budget. Could do it themselves and save on fees.",
    cta: "Suggest it to Robert",
    doneNote: "Suggested today · Robert decides",
  },
];

// This week across the practice, from PLCY.
export const proWeek = { aiActions: 214, handledByPolicy: 206, eaMinutes: 110 };

// What the practice is still waiting on from fictional clients. Jordan's requests come live from
// CaseProvider instead, so they move as the demo moves.
export type ProDocumentRequest = {
  clientId: string;
  name: string;
  requestedOn: string;
  why: string;
  needs: "signature" | "upload";
};

export const proDocumentRequests: ProDocumentRequest[] = [
  { clientId: "marcus", name: "Form 12153 – Hearing request", requestedOn: "2026-09-14", why: "Needs Marcus's signature before we file it", needs: "signature" },
  { clientId: "priya", name: "Bank statements, Jul–Sep", requestedOn: "2026-09-13", why: "The IRS asks for three months when it releases a levy", needs: "upload" },
  { clientId: "grace", name: "Brokerage cost-basis report, 2022", requestedOn: "2026-09-12", why: "Cuts the CP2000 bill if the basis is right", needs: "upload" },
  { clientId: "aisha", name: "Form 656 – Offer in Compromise", requestedOn: "2026-09-10", why: "Needs Aisha's signature and the application fee", needs: "signature" },
  { clientId: "tom", name: "2023 bank statements", requestedOn: MOCK_TODAY, why: "The last piece before the 433-F is complete", needs: "upload" },
];

// One fictional client's case from the professional's side (Jordan's is built live instead).
export type ProAuthorization = { form: string; what: string; status: string; date?: string; tone: Tone };
export type ProAiOutcome =
  | "Auto-approved"
  | "Approved by you"
  | "Resolved by you"
  | "Changes requested"
  | "Waiting for you"
  | "Flagged"
  | "Routed to you";
export type ProClientDetail = {
  since: string;
  plan: string;
  years: string;
  authorizations: ProAuthorization[];
  timeline: { date: string; text: string; tone: Tone }[];
  documents: { name: string; date: string; source: "Client" | "T-Res" | "IRS" }[];
  // `queueId`: the queue item this AI action waits on; once it's done, the outcome becomes `doneOutcome`.
  aiActions: { date: string; title: string; outcome: ProAiOutcome; queueId?: string; doneOutcome?: ProAiOutcome }[];
};

const auth8821 = (date: string): ProAuthorization => ({
  form: "Form 8821",
  what: "Lets T-Res see the IRS records (read-only)",
  status: "Signed",
  date,
  tone: "good",
});
const auth2848 = (date: string): ProAuthorization => ({
  form: "Form 2848",
  what: "Lets you represent the client before the IRS",
  status: "Signed",
  date,
  tone: "good",
});
const auth2848NotNeeded: ProAuthorization = {
  form: "Form 2848",
  what: "Lets you represent the client before the IRS",
  status: "Not needed: doing it themselves",
  tone: "neutral",
};

export const proClientDetails: Record<string, ProClientDetail> = {
  marcus: {
    since: "2026-08-20",
    plan: "Full Resolution",
    years: "2020–2021",
    authorizations: [auth8821("2026-08-20"), auth2848("2026-09-13")],
    timeline: [
      { date: "2026-08-20", text: "Started with T-Res in the self-serve lane", tone: "neutral" },
      { date: "2026-09-02", text: "Payment plan answers prepared", tone: "neutral" },
      { date: "2026-09-13", text: "LT11 arrived; case moved to you by PLCY", tone: "bad" },
      { date: "2026-09-13", text: "Form 2848 signed", tone: "good" },
      { date: "2026-09-14", text: "Hearing request (Form 12153) drafted and checked", tone: "warn" },
    ],
    documents: [
      { name: "LT11 – Final Notice of Intent to Levy.pdf", date: "2026-09-13", source: "Client" },
      { name: "Form 2848 (signed).pdf", date: "2026-09-13", source: "T-Res" },
      { name: "Form 12153 – Hearing request (draft).pdf", date: "2026-09-14", source: "T-Res" },
    ],
    aiActions: [
      { date: "2026-09-14", title: "Hearing request drafted", outcome: "Waiting for you", queueId: "q_marcus", doneOutcome: "Approved by you" },
      { date: "2026-09-13", title: "Moved to you: final levy notice", outcome: "Routed to you" },
      { date: "2026-09-13", title: "LT11 explained in plain English", outcome: "Auto-approved" },
    ],
  },
  priya: {
    since: "2026-07-15",
    plan: "Full Resolution",
    years: "2019–2021",
    authorizations: [auth8821("2026-07-15"), auth2848("2026-07-16")],
    timeline: [
      { date: "2026-07-15", text: "Started with T-Res", tone: "neutral" },
      { date: "2026-09-12", text: "Employer received a wage levy (Form 668-W)", tone: "bad" },
      { date: "2026-09-13", text: "Hardship case and call sheet prepared", tone: "warn" },
    ],
    documents: [
      { name: "Form 668-W copy (from employer).pdf", date: "2026-09-12", source: "Client" },
      { name: "Pay stubs, Aug–Sep.pdf", date: "2026-09-12", source: "Client" },
      { name: "Money snapshot (433-F figures).pdf", date: "2026-09-13", source: "T-Res" },
    ],
    aiActions: [
      { date: "2026-09-13", title: "Call sheet prepared: levy release for hardship", outcome: "Waiting for you", queueId: "q_priya", doneOutcome: "Resolved by you" },
      { date: "2026-09-13", title: "Pay stubs read and matched to the money snapshot", outcome: "Auto-approved" },
    ],
  },
  daniel: {
    since: "2026-08-28",
    plan: "Guided",
    years: "2020–2022",
    authorizations: [auth8821("2026-08-28"), auth2848NotNeeded],
    timeline: [
      { date: "2026-08-28", text: "Started with T-Res in the self-serve lane", tone: "neutral" },
      { date: "2026-09-10", text: "2022 return e-filed", tone: "good" },
      { date: "2026-09-14", text: "Payment plan set up online; confirmation uploaded", tone: "neutral" },
      { date: "2026-09-14", text: "Confirmation didn't match the answers we gave; flagged to you", tone: "warn" },
    ],
    documents: [
      { name: "Payment plan confirmation.pdf", date: "2026-09-14", source: "Client" },
      { name: "2022 Form 1040 (e-filed).pdf", date: "2026-09-10", source: "T-Res" },
    ],
    aiActions: [
      { date: "2026-09-14", title: "Payment plan confirmation checked", outcome: "Flagged", queueId: "q_daniel", doneOutcome: "Resolved by you" },
      { date: "2026-09-10", title: "2022 return prepared", outcome: "Auto-approved" },
    ],
  },
  grace: {
    since: "2026-09-01",
    plan: "Full Resolution",
    years: "2022",
    authorizations: [auth8821("2026-09-01"), auth2848("2026-09-02")],
    timeline: [
      { date: "2026-08-29", text: "CP2000 for 2022 received", tone: "warn" },
      { date: "2026-09-01", text: "Started with T-Res", tone: "neutral" },
      { date: "2026-09-11", text: "Brokerage statement uploaded", tone: "neutral" },
      { date: "2026-09-12", text: "Response letter drafted", tone: "warn" },
    ],
    documents: [
      { name: "CP2000 – Proposed changes to 2022.pdf", date: "2026-09-01", source: "Client" },
      { name: "Brokerage 1099-B, 2022.pdf", date: "2026-09-11", source: "Client" },
      { name: "CP2000 response (draft).pdf", date: "2026-09-12", source: "T-Res" },
    ],
    aiActions: [
      { date: "2026-09-12", title: "CP2000 response letter drafted", outcome: "Waiting for you", queueId: "q_grace", doneOutcome: "Approved by you" },
      { date: "2026-09-01", title: "CP2000 explained in plain English", outcome: "Auto-approved" },
    ],
  },
  tom: {
    since: MOCK_TODAY,
    plan: "Not chosen yet",
    years: "2022–2023",
    authorizations: [
      auth8821(MOCK_TODAY),
      { form: "Form 2848", what: "Lets you represent the client before the IRS", status: "Not signed: lane not chosen yet", tone: "warn" },
    ],
    timeline: [
      { date: MOCK_TODAY, text: "Finished Get Started", tone: "neutral" },
      { date: MOCK_TODAY, text: "Assessment ready for your approval", tone: "warn" },
    ],
    documents: [
      { name: "Pay stubs, Aug–Sep.pdf", date: MOCK_TODAY, source: "Client" },
      { name: "2022 and 2023 wage & income transcripts.pdf", date: MOCK_TODAY, source: "IRS" },
    ],
    aiActions: [
      { date: MOCK_TODAY, title: "Assessment: payment plan about $310 a month", outcome: "Waiting for you", queueId: "q_tom", doneOutcome: "Approved by you" },
      { date: MOCK_TODAY, title: "Self-serve eligibility: qualifies", outcome: "Auto-approved" },
    ],
  },
  aisha: {
    since: "2026-06-10",
    plan: "Full Resolution",
    years: "2017–2021",
    authorizations: [auth8821("2026-06-10"), auth2848("2026-06-10")],
    timeline: [
      { date: "2026-06-10", text: "Started with T-Res", tone: "neutral" },
      { date: "2026-07-02", text: "Financial statement (Form 433-A) gathered", tone: "neutral" },
      { date: "2026-08-15", text: "Offer in Compromise chosen over a payment plan", tone: "neutral" },
      { date: "2026-09-10", text: "Offer package drafted", tone: "warn" },
    ],
    documents: [
      { name: "Form 433-A (draft).pdf", date: "2026-09-10", source: "T-Res" },
      { name: "Form 656 – Offer in Compromise (draft).pdf", date: "2026-09-10", source: "T-Res" },
      { name: "Bank statements, Apr–Jun.pdf", date: "2026-07-02", source: "Client" },
    ],
    aiActions: [
      { date: "2026-09-10", title: "Offer package drafted", outcome: "Waiting for you", queueId: "q_aisha", doneOutcome: "Approved by you" },
      { date: "2026-08-14", title: "Reasonable collection potential worked out", outcome: "Auto-approved" },
    ],
  },
  robert: {
    since: "2026-03-02",
    plan: "Full Resolution",
    years: "2021–2022",
    authorizations: [auth8821("2026-03-02"), auth2848("2026-03-02")],
    timeline: [
      { date: "2026-03-02", text: "Started with T-Res", tone: "neutral" },
      { date: "2026-04-10", text: "Payment plan approved: about $260 a month", tone: "good" },
      { date: "2026-09-05", text: "Plan payment made on time", tone: "good" },
      { date: "2026-09-08", text: "Now qualifies to do it themselves", tone: "neutral" },
    ],
    documents: [
      { name: "Payment plan approval letter.pdf", date: "2026-04-10", source: "IRS" },
      { name: "Form 433-D – Direct debit agreement.pdf", date: "2026-04-12", source: "T-Res" },
    ],
    aiActions: [
      { date: "2026-09-08", title: "Self-serve eligibility: now qualifies", outcome: "Auto-approved" },
      { date: "2026-09-05", title: "Plan payment checked: on time", outcome: "Auto-approved" },
    ],
  },
  maya: {
    since: "2026-05-18",
    plan: "Guided",
    years: "2022–2023",
    authorizations: [auth8821("2026-05-18"), auth2848NotNeeded],
    timeline: [
      { date: "2026-05-18", text: "Started with T-Res in the self-serve lane", tone: "neutral" },
      { date: "2026-06-01", text: "Payment plan set up online", tone: "good" },
      { date: "2026-09-02", text: "Plan payment made on time", tone: "good" },
      { date: "2026-09-09", text: "CP521 reminder explained", tone: "neutral" },
    ],
    documents: [
      { name: "Payment plan confirmation.pdf", date: "2026-06-01", source: "Client" },
      { name: "CP521 – Payment plan reminder.pdf", date: "2026-09-09", source: "Client" },
    ],
    aiActions: [
      { date: "2026-09-09", title: "CP521 explained in plain English", outcome: "Auto-approved" },
      { date: "2026-06-01", title: "Payment plan confirmation checked", outcome: "Auto-approved" },
    ],
  },
  samuel: {
    since: "2026-08-05",
    plan: "Guided",
    years: "2022",
    authorizations: [auth8821("2026-08-05"), auth2848NotNeeded],
    timeline: [
      { date: "2026-08-05", text: "Started with T-Res in the self-serve lane", tone: "neutral" },
      { date: "2026-09-01", text: "2022 return e-filed", tone: "good" },
      { date: "2026-09-06", text: "Payment plan requested online", tone: "neutral" },
    ],
    documents: [
      { name: "2022 Form 1040 (e-filed).pdf", date: "2026-09-01", source: "T-Res" },
      { name: "CP71C – Annual reminder.pdf", date: "2026-08-05", source: "Client" },
    ],
    aiActions: [
      { date: "2026-09-01", title: "2022 return prepared", outcome: "Auto-approved" },
      { date: "2026-08-05", title: "CP71C explained in plain English", outcome: "Auto-approved" },
    ],
  },
  elena: {
    since: "2026-04-22",
    plan: "Full Resolution",
    years: "2020–2022",
    authorizations: [auth8821("2026-04-22"), auth2848("2026-04-22")],
    timeline: [
      { date: "2026-04-22", text: "Started with T-Res", tone: "neutral" },
      { date: "2026-06-15", text: "Money snapshot: nothing left over each month", tone: "warn" },
      { date: "2026-07-20", text: "Collection pause (Currently Not Collectible) requested", tone: "neutral" },
      { date: "2026-08-30", text: "Waiting on the IRS decision", tone: "neutral" },
    ],
    documents: [
      { name: "Form 433-F – Collection information statement.pdf", date: "2026-07-18", source: "T-Res" },
      { name: "CP503 – Second reminder.pdf", date: "2026-04-22", source: "Client" },
    ],
    aiActions: [
      { date: "2026-07-18", title: "Money snapshot checked against IRS living-expense standards", outcome: "Auto-approved" },
      { date: "2026-04-22", title: "CP503 explained in plain English", outcome: "Auto-approved" },
    ],
  },
  nina: {
    since: "2025-11-03",
    plan: "Resolution + Protection",
    years: "2019–2020",
    authorizations: [auth8821("2025-11-03"), auth2848("2025-11-03")],
    timeline: [
      { date: "2025-11-03", text: "Started with T-Res", tone: "neutral" },
      { date: "2026-01-15", text: "Paid in full", tone: "good" },
      { date: "2026-03-02", text: "Lien withdrawal approved", tone: "good" },
      { date: "2026-09-01", text: "Monthly transcript check: no changes", tone: "good" },
    ],
    documents: [
      { name: "Form 10916(c) – Lien withdrawal.pdf", date: "2026-03-02", source: "IRS" },
      { name: "2020 account transcript.pdf", date: "2026-09-01", source: "IRS" },
    ],
    aiActions: [{ date: "2026-09-01", title: "Monthly transcript check", outcome: "Auto-approved" }],
  },
};
