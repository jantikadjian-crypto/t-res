// The T-Res Library: plain-English definitions of IRS forms, notices and terms, with links to the
// official IRS pages. Reference content, not case data (case data lives in mockData.ts).
// Kept free of imports so scripts can load it directly (see the link check in CLAUDE.md).

export type LibraryKind = "Form" | "Notice" | "Term" | "Publication";

export type LibraryEntry = {
  slug: string;
  name: string;
  kind: LibraryKind;
  short: string;
  definition: string;
  // How it applies to Jordan's case.
  forYou?: string;
  // Words that mean this entry, used to link documents and notices to it.
  aliases: string[];
  irs?: { url: string; label: string };
  related: string[];
  inYourCase?: { label: string; href: string }[];
};

export const libraryEntries: LibraryEntry[] = [
  // Forms
  {
    slug: "form-1040",
    name: "Form 1040",
    kind: "Form",
    short: "U.S. Individual Income Tax Return",
    definition:
      "The yearly tax return most people file. It reports your income, deductions and credits, and works out whether you owe tax or get a refund.",
    forYou:
      "The IRS has your 2021 and 2022 returns. Your 2023 return hasn't been filed yet, and it has to be filed before any payment plan can be approved.",
    aliases: ["Form 1040", "1040"],
    irs: { url: "https://www.irs.gov/forms-pubs/about-form-1040", label: "About Form 1040" },
    related: ["form-w2", "failure-to-file-penalty", "wage-income-transcript"],
    inYourCase: [
      { label: "Your 2021 return", href: "/documents/doc_1040_21" },
      { label: "Your 2022 return", href: "/documents/doc_1040_22" },
      { label: "2023: not filed yet", href: "/tax-years/2023" },
    ],
  },
  {
    slug: "form-2848",
    name: "Form 2848",
    kind: "Form",
    short: "Power of Attorney and Declaration of Representative",
    definition:
      "Gives a licensed tax professional permission to represent you before the IRS: to talk to them for you, receive your notices, and act on the tax matters and years listed on the form.",
    forYou: "Lets Chris G. speak to the IRS for you about your income tax for 2021 to 2023. It's waiting on your signature.",
    aliases: ["Form 2848", "2848", "power of attorney"],
    irs: { url: "https://www.irs.gov/forms-pubs/about-form-2848", label: "About Form 2848" },
    related: ["form-8821", "enrolled-agent", "caf-number"],
    inYourCase: [
      { label: "Sign Form 2848", href: "/sign/doc_2848" },
      { label: "Your Form 2848", href: "/documents/doc_2848" },
    ],
  },
  {
    slug: "form-8821",
    name: "Form 8821",
    kind: "Form",
    short: "Tax Information Authorization",
    definition:
      "Lets someone see your IRS records, like transcripts and notices, without being able to act for you or make changes.",
    forYou: "You signed this on Sep 3, 2026, which is how we pull your IRS transcripts.",
    aliases: ["Form 8821", "8821", "tax information authorization"],
    irs: { url: "https://www.irs.gov/forms-pubs/about-form-8821", label: "About Form 8821" },
    related: ["form-2848", "account-transcript"],
    inYourCase: [{ label: "Your signed Form 8821", href: "/documents/doc_8821" }],
  },
  {
    slug: "form-9465",
    name: "Form 9465",
    kind: "Form",
    short: "Installment Agreement Request",
    definition:
      "The form for asking the IRS to let you pay what you owe in monthly payments. Many people can apply online instead.",
    forYou: "We'll file this to set up your payment plan once your 2023 return is in.",
    aliases: ["Form 9465", "9465"],
    irs: { url: "https://www.irs.gov/forms-pubs/about-form-9465", label: "About Form 9465" },
    related: ["installment-agreement", "form-433-f"],
    inYourCase: [{ label: "Our recommendation for you", href: "/intake/assessment" }],
  },
  {
    slug: "form-433-f",
    name: "Form 433-F",
    kind: "Form",
    short: "Collection Information Statement",
    definition:
      "A financial statement listing your income, monthly costs and what you own. The IRS uses it to decide what you can afford to pay.",
    forYou: "The money snapshot in Get Started is a plain-English version of this form.",
    aliases: ["Form 433-F", "433-F"],
    irs: { url: "https://www.irs.gov/pub/irs-pdf/f433f.pdf", label: "Form 433-F (PDF)" },
    related: ["form-433-a", "installment-agreement", "currently-not-collectible"],
    inYourCase: [{ label: "Your money snapshot", href: "/intake/money-in" }],
  },
  {
    slug: "form-433-a",
    name: "Form 433-A",
    kind: "Form",
    short: "Collection Information Statement for Wage Earners and Self-Employed Individuals",
    definition:
      "A longer, more detailed financial statement. The IRS asks for it with larger balances and with offers in compromise.",
    aliases: ["Form 433-A", "433-A"],
    irs: { url: "https://www.irs.gov/pub/irs-pdf/f433a.pdf", label: "Form 433-A (PDF)" },
    related: ["form-433-f", "offer-in-compromise"],
  },
  {
    slug: "form-656",
    name: "Form 656",
    kind: "Form",
    short: "Offer in Compromise",
    definition:
      "The application to settle your tax debt for less than the full amount. It comes in the Form 656-B booklet, with instructions and the financial forms you'd also need.",
    forYou: "We ruled this out for you: what the IRS would expect you could pay is more than you owe.",
    aliases: ["Form 656", "656"],
    irs: { url: "https://www.irs.gov/pub/irs-pdf/f656b.pdf", label: "Form 656-B booklet (PDF)" },
    related: ["offer-in-compromise", "form-433-a"],
    inYourCase: [{ label: "Why we ruled it out", href: "/intake/assessment" }],
  },
  {
    slug: "form-12277",
    name: "Form 12277",
    kind: "Form",
    short: "Application for Withdrawal of Filed Form 668(Y)",
    definition: "Asks the IRS to withdraw a public Notice of Federal Tax Lien, so it no longer shows as filed against you.",
    forYou: "Once your payment plan is set up, we'll use this to ask for your 2021 lien to be withdrawn.",
    aliases: ["Form 12277", "12277"],
    irs: { url: "https://www.irs.gov/pub/irs-pdf/f12277.pdf", label: "Form 12277 (PDF)" },
    related: ["lien-withdrawal", "federal-tax-lien", "form-668y"],
    inYourCase: [{ label: "Your lien notice", href: "/documents/doc_668y" }],
  },
  {
    slug: "form-668y",
    name: "Form 668(Y)",
    kind: "Form",
    short: "Notice of Federal Tax Lien",
    definition: "The public notice the IRS files with your county to show it has a legal claim to your property for unpaid tax.",
    forYou: "Filed for your 2021 balance on Nov 3, 2025.",
    aliases: ["Form 668(Y)", "668(Y)", "668Y", "Notice of Federal Tax Lien"],
    irs: {
      url: "https://www.irs.gov/businesses/small-businesses-self-employed/understanding-a-federal-tax-lien",
      label: "Understanding a federal tax lien",
    },
    related: ["federal-tax-lien", "lien-withdrawal", "letter-3172"],
    inYourCase: [
      { label: "Your Form 668(Y)", href: "/documents/doc_668y" },
      { label: "2021 tax year", href: "/tax-years/2021" },
    ],
  },
  {
    slug: "form-w2",
    name: "Form W-2",
    kind: "Form",
    short: "Wage and Tax Statement",
    definition: "Sent by your employer each year. It shows what you earned and how much tax was taken out of your pay.",
    forYou: "Lone Star Logistics sent you W-2s for 2021 to 2023. We need your 2023 W-2 to file that year.",
    aliases: ["Form W-2", "W-2", "W2"],
    irs: { url: "https://www.irs.gov/forms-pubs/about-form-w-2", label: "About Form W-2" },
    related: ["form-1040", "wage-income-transcript"],
    inYourCase: [{ label: "Upload your 2023 W-2s and 1099s", href: "/documents/doc_w2_23" }],
  },
  {
    slug: "form-1099-nec",
    name: "Form 1099-NEC",
    kind: "Form",
    short: "Nonemployee Compensation",
    definition: "Reports money you were paid as a contractor or freelancer. Usually no tax is taken out.",
    forYou: "DoorDash reported $11,700 for 2023 on this form.",
    aliases: ["Form 1099-NEC", "1099-NEC"],
    irs: { url: "https://www.irs.gov/forms-pubs/about-form-1099-nec", label: "About Form 1099-NEC" },
    related: ["form-1099-k", "wage-income-transcript"],
    inYourCase: [{ label: "2023 income on record", href: "/tax-years/2023" }],
  },
  {
    slug: "form-1099-k",
    name: "Form 1099-K",
    kind: "Form",
    short: "Payment Card and Third Party Network Transactions",
    definition: "Reports payments you received through apps and payment networks, like rideshare or online selling platforms.",
    forYou: "Uber reported your rideshare income for 2021 and 2022 on this form.",
    aliases: ["Form 1099-K", "1099-K"],
    irs: { url: "https://www.irs.gov/forms-pubs/about-form-1099-k", label: "About Form 1099-K" },
    related: ["form-1099-nec", "wage-income-transcript"],
    inYourCase: [{ label: "2021 income on record", href: "/tax-years/2021" }],
  },
  {
    slug: "form-1099-int",
    name: "Form 1099-INT",
    kind: "Form",
    short: "Interest Income",
    definition: "Reports interest a bank or other payer paid you during the year.",
    forYou: "Ally Bank reported $42 of interest for 2023.",
    aliases: ["Form 1099-INT", "1099-INT"],
    irs: { url: "https://www.irs.gov/forms-pubs/about-form-1099-int", label: "About Form 1099-INT" },
    related: ["wage-income-transcript"],
    inYourCase: [{ label: "2023 income on record", href: "/tax-years/2023" }],
  },

  // Notices
  {
    slug: "cp14",
    name: "CP14",
    kind: "Notice",
    short: "Balance due notice",
    definition:
      "The IRS's first bill after it finds you owe tax on a return. It lists what you owe and asks you to pay by a date.",
    forYou: "You got a CP14 for 2022 on Sep 8, 2026. We're handling the response.",
    aliases: ["CP14"],
    irs: { url: "https://www.irs.gov/individuals/understanding-your-cp14-notice", label: "Understanding your CP14 notice" },
    related: ["cp501", "installment-agreement", "failure-to-pay-penalty"],
    inYourCase: [{ label: "Your CP14", href: "/notices/ntc_cp14" }],
  },
  {
    slug: "cp501",
    name: "CP501",
    kind: "Notice",
    short: "Reminder of balance due",
    definition: "A reminder that you still owe, sent when the first bill hasn't been paid.",
    aliases: ["CP501"],
    irs: { url: "https://www.irs.gov/individuals/understanding-your-cp501-notice", label: "Understanding your CP501 notice" },
    related: ["cp14", "cp503"],
  },
  {
    slug: "cp503",
    name: "CP503",
    kind: "Notice",
    short: "Second reminder of balance due",
    definition: "A more urgent reminder that the balance is still unpaid. The next letter is usually a CP504.",
    forYou: "You got one for 2021 in August 2025. It has since been replaced by the CP504.",
    aliases: ["CP503"],
    irs: { url: "https://www.irs.gov/individuals/understanding-your-cp503-notice", label: "Understanding your CP503 notice" },
    related: ["cp501", "cp504"],
    inYourCase: [{ label: "Your CP503", href: "/notices/ntc_cp503" }],
  },
  {
    slug: "cp504",
    name: "CP504",
    kind: "Notice",
    short: "Notice of intent to levy",
    definition:
      "Warns that the IRS intends to take (levy) your state tax refund, and may go after other property, to collect an unpaid balance. It's serious, and very fixable if you respond by the date on the notice.",
    forYou: "Yours is for 2021, and the response is due Sep 26, 2026.",
    aliases: ["CP504"],
    irs: { url: "https://www.irs.gov/individuals/understanding-your-cp504-notice", label: "Understanding your CP504 notice" },
    related: ["levy", "lt11", "installment-agreement"],
    inYourCase: [
      { label: "Your CP504", href: "/notices/ntc_cp504" },
      { label: "Our response letter", href: "/documents/doc_letter" },
    ],
  },
  {
    slug: "lt11",
    name: "LT11 / Letter 1058",
    kind: "Notice",
    short: "Final notice of intent to levy and your right to a hearing",
    definition:
      "The last notice before the IRS can levy wages or bank accounts. You have 30 days to ask for a Collection Due Process hearing.",
    forYou: "You haven't received one. Answering your CP504 now helps keep it that way.",
    aliases: ["LT11", "Letter 1058"],
    irs: {
      url: "https://www.irs.gov/individuals/understanding-your-lt11-notice-or-letter-1058",
      label: "Understanding your LT11 or Letter 1058",
    },
    related: ["cp504", "levy", "cdp-hearing"],
  },
  {
    slug: "letter-3172",
    name: "Letter 3172",
    kind: "Notice",
    short: "Notice of federal tax lien filing and your right to a hearing",
    definition: "Tells you the IRS has filed a public lien, and explains how to ask for a hearing about it.",
    forYou:
      "You got this for 2021 in November 2025. The formal hearing window has passed, but an equivalent hearing is still possible.",
    aliases: ["Letter 3172", "3172"],
    irs: { url: "https://www.irs.gov/pub/irs-pdf/p1660.pdf", label: "Publication 1660: Collection Appeal Rights (PDF)" },
    related: ["federal-tax-lien", "cdp-hearing", "form-668y"],
    inYourCase: [{ label: "Your Letter 3172", href: "/notices/ntc_l3172" }],
  },
  {
    slug: "cp2000",
    name: "CP2000",
    kind: "Notice",
    short: "Proposed changes to your return",
    definition:
      "Sent when the income on your return doesn't match what employers, banks or apps reported. It proposes changes and asks you to agree or explain.",
    forYou: "You don't have one. Filing your 2023 return with all your 1099s helps avoid it.",
    aliases: ["CP2000"],
    irs: { url: "https://www.irs.gov/individuals/understanding-your-cp2000-series-notice", label: "Understanding your CP2000 series notice" },
    related: ["wage-income-transcript", "form-1099-nec"],
  },

  // Terms
  {
    slug: "installment-agreement",
    name: "Payment plan (installment agreement)",
    kind: "Term",
    short: "Paying what you owe in monthly amounts",
    definition:
      "An agreement to pay the IRS over time. If you owe $50,000 or less in tax, penalties and interest combined, you can usually get one without a full financial review, paying over up to 72 months. Interest keeps adding up until it's paid, but the late-payment penalty can be reduced while the plan is in place.",
    forYou: "Our recommendation for you: about $440 a month.",
    aliases: ["installment agreement", "payment plan"],
    irs: {
      url: "https://www.irs.gov/payments/payment-plans-installment-agreements",
      label: "Payment plans (installment agreements)",
    },
    related: ["form-9465", "form-433-f", "lien-withdrawal"],
    inYourCase: [{ label: "Our recommendation", href: "/intake/assessment" }],
  },
  {
    slug: "offer-in-compromise",
    name: "Offer in Compromise",
    kind: "Term",
    short: "Settling for less than you owe",
    definition:
      "Lets you settle your tax debt for less than the full amount when paying in full isn't realistic. The IRS compares your offer with what it thinks it could collect from your income and what you own.",
    forYou: "Ruled out for you: the IRS would expect about $28,000, more than you owe.",
    aliases: ["offer in compromise", "OIC"],
    irs: { url: "https://www.irs.gov/payments/offer-in-compromise", label: "Offer in compromise" },
    related: ["form-656", "form-433-a", "csed"],
    inYourCase: [{ label: "Why we ruled it out", href: "/intake/assessment" }],
  },
  {
    slug: "currently-not-collectible",
    name: "Currently Not Collectible",
    kind: "Term",
    short: "Pausing IRS collection",
    definition:
      "If paying anything would leave you unable to cover basic living costs, the IRS can pause collection. The debt doesn't go away, and penalties and interest keep growing.",
    forYou: "Ruled out for you, because you have about $910 left over each month.",
    aliases: ["currently not collectible", "CNC", "pause collection"],
    irs: {
      url: "https://www.irs.gov/businesses/small-businesses-self-employed/temporarily-delay-the-collection-process",
      label: "Temporarily delay the collection process",
    },
    related: ["form-433-f", "installment-agreement"],
    inYourCase: [{ label: "Your money left over", href: "/intake/money-out" }],
  },
  {
    slug: "first-time-abatement",
    name: "First-Time Penalty Abatement",
    kind: "Term",
    short: "One-time relief from penalties",
    definition:
      "The IRS can remove late-filing and late-payment penalties for one tax year if you had no penalties in the three years before, and you've filed and paid, or arranged to pay, what you owe.",
    forYou: "Your 2021 penalties ($2,310) may qualify. We'll ask the IRS to remove them.",
    aliases: ["first-time abatement", "penalty abatement", "FTA"],
    irs: {
      url: "https://www.irs.gov/payments/administrative-penalty-relief",
      label: "Administrative penalty relief",
    },
    related: ["failure-to-pay-penalty", "failure-to-file-penalty"],
    inYourCase: [{ label: "2021 tax year", href: "/tax-years/2021" }],
  },
  {
    slug: "levy",
    name: "Levy",
    kind: "Term",
    short: "The IRS taking property to pay a tax debt",
    definition:
      "A legal seizure of your property, like wages, money in a bank account, or a tax refund. It usually comes after several notices, and a payment plan normally stops it.",
    forYou: "Your CP504 warns about a levy of your state tax refund. Nothing has been taken.",
    aliases: ["levy", "levies", "levied"],
    irs: { url: "https://www.irs.gov/businesses/small-businesses-self-employed/levy", label: "Levy" },
    related: ["cp504", "lt11", "cdp-hearing"],
    inYourCase: [{ label: "Your CP504", href: "/notices/ntc_cp504" }],
  },
  {
    slug: "federal-tax-lien",
    name: "Federal tax lien",
    kind: "Term",
    short: "The IRS's legal claim to your property",
    definition:
      "The government's legal claim to your property when a tax debt isn't paid. A lien doesn't take anything, but the public notice can affect your credit and selling property.",
    forYou: "There's a lien for 2021. Getting it withdrawn is part of your plan.",
    aliases: ["federal tax lien", "tax lien", "lien"],
    irs: {
      url: "https://www.irs.gov/businesses/small-businesses-self-employed/understanding-a-federal-tax-lien",
      label: "Understanding a federal tax lien",
    },
    related: ["form-668y", "lien-withdrawal", "letter-3172"],
    inYourCase: [{ label: "2021 tax year", href: "/tax-years/2021" }],
  },
  {
    slug: "lien-withdrawal",
    name: "Lien withdrawal",
    kind: "Term",
    short: "Removing the public lien notice",
    definition:
      "Withdrawal removes the public Notice of Federal Tax Lien, as if it had never been filed. It's often possible if you owe $25,000 or less and pay by direct debit.",
    forYou: "Paying about $900 up front gets you under $25,000, so we can ask for this.",
    aliases: ["lien withdrawal", "withdraw the lien", "withdrawn"],
    irs: { url: "https://www.irs.gov/pub/irs-pdf/f12277.pdf", label: "Form 12277 (PDF)" },
    related: ["form-12277", "federal-tax-lien", "installment-agreement"],
    inYourCase: [{ label: "Our recommendation", href: "/intake/assessment" }],
  },
  {
    slug: "csed",
    name: "Collection statute (CSED)",
    kind: "Term",
    short: "The IRS's 10-year deadline to collect",
    definition:
      "The IRS generally has 10 years from the date a tax is assessed to collect it. After the Collection Statute Expiration Date, whatever is left is wiped out. Some things, like a pending offer in compromise or bankruptcy, pause the clock.",
    forYou: "For 2021, the IRS has until May 16, 2032.",
    aliases: ["CSED", "collection statute", "collection deadline"],
    irs: { url: "https://www.irs.gov/filing/time-irs-can-collect-tax", label: "Time IRS can collect tax" },
    related: ["offer-in-compromise", "account-transcript"],
    inYourCase: [{ label: "2021 collection deadline", href: "/tax-years/2021" }],
  },
  {
    slug: "account-transcript",
    name: "Account transcript",
    kind: "Term",
    short: "The IRS's record of a tax year",
    definition:
      "Shows every charge, payment, penalty and interest amount on a tax year, with the IRS's own code for each event.",
    forYou: "We pulled your 2021 and 2022 account transcripts on Sep 12, 2026.",
    aliases: ["account transcript"],
    irs: { url: "https://www.irs.gov/individuals/get-transcript", label: "Get transcript" },
    related: ["wage-income-transcript", "form-8821", "irs-online-account"],
    inYourCase: [
      { label: "2021 account transcript", href: "/documents/doc_tr_21" },
      { label: "2022 account transcript", href: "/documents/doc_tr_22" },
    ],
  },
  {
    slug: "wage-income-transcript",
    name: "Wage & income transcript",
    kind: "Term",
    short: "Every income form the IRS received for you",
    definition: "Lists the W-2s, 1099s and similar forms that employers, banks and apps sent to the IRS for a year.",
    forYou: "Your 2023 transcript shows $70,142 of income on record.",
    aliases: ["wage & income transcript", "wage and income transcript"],
    irs: { url: "https://www.irs.gov/individuals/get-transcript", label: "Get transcript" },
    related: ["form-w2", "form-1099-nec", "account-transcript"],
    inYourCase: [{ label: "2023 wage & income transcript", href: "/documents/doc_wi_23" }],
  },
  {
    slug: "enrolled-agent",
    name: "Enrolled Agent",
    kind: "Term",
    short: "A tax professional licensed by the IRS",
    definition:
      "A federally licensed tax practitioner who can represent taxpayers before the IRS on any tax matter, including collections and appeals.",
    forYou: "Chris G. is your Enrolled Agent.",
    aliases: ["enrolled agent"],
    irs: { url: "https://www.irs.gov/tax-professionals/enrolled-agents", label: "Enrolled agents" },
    related: ["form-2848", "caf-number"],
    inYourCase: [{ label: "Who can act for you", href: "/settings/security" }],
  },
  {
    slug: "caf-number",
    name: "CAF number",
    kind: "Term",
    short: "A representative's IRS ID number",
    definition:
      "The Centralized Authorization File number the IRS gives a representative. It goes on Form 2848 and Form 8821 so the IRS can match the authorization to them.",
    forYou: "Chris G.'s CAF number is printed on your Form 2848.",
    aliases: ["CAF number", "CAF"],
    irs: { url: "https://www.irs.gov/instructions/i2848", label: "Instructions for Form 2848" },
    related: ["form-2848", "enrolled-agent"],
    inYourCase: [{ label: "See it on your Form 2848", href: "/sign/doc_2848" }],
  },
  {
    slug: "cdp-hearing",
    name: "Collection Due Process hearing",
    kind: "Term",
    short: "Your right to appeal a lien or levy",
    definition:
      "A hearing with the IRS Independent Office of Appeals about a lien or levy. You usually have 30 days from the notice to ask. If you miss that, you can often still ask for an equivalent hearing up to a year later.",
    forYou:
      "The formal window for your 2021 lien passed on Dec 17, 2025. An equivalent hearing is available until Nov 10, 2026.",
    aliases: ["collection due process", "CDP", "equivalent hearing"],
    irs: { url: "https://www.irs.gov/pub/irs-pdf/p1660.pdf", label: "Publication 1660: Collection Appeal Rights (PDF)" },
    related: ["letter-3172", "lt11", "levy"],
    inYourCase: [{ label: "Your Letter 3172", href: "/notices/ntc_l3172" }],
  },
  {
    slug: "failure-to-pay-penalty",
    name: "Failure-to-pay penalty",
    kind: "Term",
    short: "The penalty for paying late",
    definition:
      "0.5% of the unpaid tax for each month it stays unpaid, up to 25%. It can drop to 0.25% a month while you're on a payment plan.",
    forYou: "It makes up part of the penalties on your 2021 and 2022 balances.",
    aliases: ["failure-to-pay penalty", "failure to pay", "late payment penalty"],
    irs: { url: "https://www.irs.gov/payments/failure-to-pay-penalty", label: "Failure to pay penalty" },
    related: ["first-time-abatement", "installment-agreement", "failure-to-file-penalty"],
    inYourCase: [{ label: "2021 balance breakdown", href: "/tax-years/2021" }],
  },
  {
    slug: "failure-to-file-penalty",
    name: "Failure-to-file penalty",
    kind: "Term",
    short: "The penalty for filing late",
    definition:
      "5% of the unpaid tax for each month a return is late, up to 25%. It's usually much bigger than the late-payment penalty, so filing matters even if you can't pay.",
    forYou: "It's growing on your unfiled 2023 return, which is why we'll file that first.",
    aliases: ["failure-to-file penalty", "failure to file", "late filing penalty"],
    irs: { url: "https://www.irs.gov/payments/failure-to-file-penalty", label: "Failure to file penalty" },
    related: ["failure-to-pay-penalty", "first-time-abatement", "form-1040"],
    inYourCase: [{ label: "2023 tax year", href: "/tax-years/2023" }],
  },
  {
    slug: "irs-online-account",
    name: "IRS Online Account",
    kind: "Term",
    short: "Your own account on IRS.gov",
    definition:
      "Lets you see your balance, payment history and transcripts, and approve authorization requests from tax professionals.",
    aliases: ["online account"],
    irs: { url: "https://www.irs.gov/payments/online-account-for-individuals", label: "Online account for individuals" },
    related: ["account-transcript", "form-2848"],
  },

  {
    slug: "cp90",
    name: "CP90",
    kind: "Notice",
    short: "Final notice of intent to levy and your right to a hearing",
    definition:
      "The IRS's final warning before it can take wages, bank accounts or other property. Like the LT11, it gives you 30 days to ask for a Collection Due Process hearing.",
    forYou: "You haven't received one. Answering your CP504 and setting up a payment plan keeps it that way.",
    aliases: ["CP90"],
    irs: { url: "https://www.irs.gov/individuals/understanding-your-cp90-notice", label: "Understanding your CP90 notice" },
    related: ["lt11", "cdp-hearing", "levy", "form-12153"],
  },
  {
    slug: "cp71c",
    name: "CP71C",
    kind: "Notice",
    short: "Annual reminder of balance due",
    definition: "A once-a-year reminder of a tax balance that's still unpaid, with the current amount including penalties and interest.",
    forYou: "You haven't received one. If your balances were still open next year, this is the reminder you'd get.",
    aliases: ["CP71C"],
    irs: { url: "https://www.irs.gov/individuals/understanding-your-cp71c-notice", label: "Understanding your CP71C notice" },
    related: ["cp14", "cp501", "installment-agreement"],
  },
  {
    slug: "cp521",
    name: "CP521",
    kind: "Notice",
    short: "Payment plan reminder",
    definition: "A monthly reminder for a payment plan: the payment that's due, when it's due, and how much you still owe.",
    forYou: "Once your payment plan starts, you'll get one of these each month.",
    aliases: ["CP521"],
    irs: { url: "https://www.irs.gov/individuals/understanding-your-cp521-notice", label: "Understanding your CP521 notice" },
    related: ["installment-agreement", "form-433-d", "cp523"],
    inYourCase: [{ label: "Your recommended payment plan", href: "/intake/assessment" }],
  },
  {
    slug: "cp523",
    name: "CP523",
    kind: "Notice",
    short: "Notice of intent to end your payment plan",
    definition:
      "Warns that the IRS plans to end (default) your payment plan, usually because of missed payments or a new unpaid balance, and may then levy. You can fix the problem or appeal before the date on the notice.",
    forYou: "Missed payments or a new balance could trigger this. We'll help you stay on track so you never get one.",
    aliases: ["CP523"],
    irs: { url: "https://www.irs.gov/individuals/understanding-your-cp523-notice", label: "Understanding your CP523 notice" },
    related: ["installment-agreement", "cp521", "form-9423", "levy"],
  },

  // More forms and IRS publications, each with a printable copy (see libraryFiles below).
  {
    slug: "form-433-d",
    name: "Form 433-D",
    kind: "Form",
    short: "Installment Agreement (direct debit)",
    definition:
      "Sets up a payment plan paid by automatic withdrawals from your bank account. Paying by direct debit is one of the conditions for having a lien withdrawn.",
    forYou: "We'll likely use this so your payments come out automatically, which also helps get your lien withdrawn.",
    aliases: ["Form 433-D", "433-D"],
    irs: { url: "https://www.irs.gov/pub/irs-pdf/f433d.pdf", label: "Form 433-D (PDF)" },
    related: ["installment-agreement", "lien-withdrawal", "form-9465"],
    inYourCase: [{ label: "Our recommendation", href: "/intake/assessment" }],
  },
  {
    slug: "form-12153",
    name: "Form 12153",
    kind: "Form",
    short: "Request for a Collection Due Process or Equivalent Hearing",
    definition: "The form to ask for a hearing with the IRS Independent Office of Appeals about a lien or levy.",
    forYou: "If it's needed, we'd use this to ask for an equivalent hearing on your 2021 lien before Nov 10, 2026.",
    aliases: ["Form 12153", "12153"],
    irs: { url: "https://www.irs.gov/pub/irs-pdf/f12153.pdf", label: "Form 12153 (PDF)" },
    related: ["cdp-hearing", "letter-3172", "lt11"],
    inYourCase: [{ label: "Your Letter 3172", href: "/notices/ntc_l3172" }],
  },
  {
    slug: "form-9423",
    name: "Form 9423",
    kind: "Form",
    short: "Collection Appeal Request",
    definition:
      "Appeals a collection action, like a levy or a rejected payment plan, through the Collection Appeals Program. It's usually faster than a Collection Due Process hearing, but the decision can't be taken to court.",
    aliases: ["Form 9423", "9423"],
    irs: { url: "https://www.irs.gov/pub/irs-pdf/f9423.pdf", label: "Form 9423 (PDF)" },
    related: ["cdp-hearing", "levy", "pub-1660"],
  },
  {
    slug: "form-843",
    name: "Form 843",
    kind: "Form",
    short: "Claim for Refund and Request for Abatement",
    definition:
      "Used to ask the IRS to remove (abate) penalties, or to refund certain taxes and fees. Penalty relief can often be asked for by phone or letter instead.",
    forYou: "One way we can ask for First-Time Penalty Abatement on your 2021 penalties.",
    aliases: ["Form 843", "843"],
    irs: { url: "https://www.irs.gov/pub/irs-pdf/f843.pdf", label: "Form 843 (PDF)" },
    related: ["first-time-abatement", "failure-to-pay-penalty"],
    inYourCase: [{ label: "2021 tax year", href: "/tax-years/2021" }],
  },
  {
    slug: "form-4506-t",
    name: "Form 4506-T",
    kind: "Form",
    short: "Request for Transcript of Tax Return",
    definition:
      "Asks the IRS to send transcripts of your tax records. Most people can get them faster in their IRS Online Account.",
    aliases: ["Form 4506-T", "4506-T"],
    irs: { url: "https://www.irs.gov/pub/irs-pdf/f4506t.pdf", label: "Form 4506-T (PDF)" },
    related: ["account-transcript", "wage-income-transcript", "irs-online-account"],
  },
  {
    slug: "pub-1",
    name: "Publication 1",
    kind: "Publication",
    short: "Your Rights as a Taxpayer",
    definition:
      "Explains the Taxpayer Bill of Rights, including the right to be informed, to challenge the IRS's position, to appeal, and to be represented.",
    aliases: ["Publication 1", "Pub 1", "taxpayer bill of rights"],
    irs: { url: "https://www.irs.gov/pub/irs-pdf/p1.pdf", label: "Publication 1 (PDF)" },
    related: ["enrolled-agent", "cdp-hearing"],
  },
  {
    slug: "pub-594",
    name: "Publication 594",
    kind: "Publication",
    short: "The IRS Collection Process",
    definition:
      "Walks through what happens when you owe: the bills and notices, liens, levies, and your options at each step.",
    forYou: "A good overview of where you are now: after the CP504, before any LT11.",
    aliases: ["Publication 594", "Pub 594", "collection process"],
    irs: { url: "https://www.irs.gov/pub/irs-pdf/p594.pdf", label: "Publication 594 (PDF)" },
    related: ["cp504", "levy", "federal-tax-lien", "installment-agreement"],
    inYourCase: [{ label: "Your CP504", href: "/notices/ntc_cp504" }],
  },
  {
    slug: "pub-1660",
    name: "Publication 1660",
    kind: "Publication",
    short: "Collection Appeal Rights",
    definition:
      "Explains your appeal rights for liens, levies and payment plans, including Collection Due Process hearings and the Collection Appeals Program.",
    aliases: ["Publication 1660", "Pub 1660", "collection appeal rights"],
    irs: { url: "https://www.irs.gov/pub/irs-pdf/p1660.pdf", label: "Publication 1660 (PDF)" },
    related: ["cdp-hearing", "form-12153", "form-9423"],
  },
  {
    slug: "pub-1450",
    name: "Publication 1450",
    kind: "Publication",
    short: "Requesting a Certificate of Release of Federal Tax Lien",
    definition: "How to get proof that a lien has been released once the debt is paid or can no longer be collected.",
    aliases: ["Publication 1450", "Pub 1450", "lien release"],
    irs: { url: "https://www.irs.gov/pub/irs-pdf/p1450.pdf", label: "Publication 1450 (PDF)" },
    related: ["federal-tax-lien", "lien-withdrawal"],
  },
  {
    slug: "pub-783",
    name: "Publication 783",
    kind: "Publication",
    short: "Applying for a Certificate of Discharge from Federal Tax Lien",
    definition: "How to have a specific property, like a home you're selling, taken out from under a lien.",
    aliases: ["Publication 783", "Pub 783", "lien discharge"],
    irs: { url: "https://www.irs.gov/pub/irs-pdf/p783.pdf", label: "Publication 783 (PDF)" },
    related: ["federal-tax-lien", "pub-1450"],
  },
];

// Printable copies stored in public/forms (details in lib/irsFiles.ts, generated by scripts/irs-forms.mjs).
export const libraryFiles: Record<string, string[]> = {
  "form-1040": ["f1040.pdf"],
  "form-2848": ["f2848.pdf", "i2848.pdf"],
  "form-8821": ["f8821.pdf"],
  "form-9465": ["f9465.pdf"],
  "form-433-f": ["f433f.pdf"],
  "form-433-a": ["f433a.pdf"],
  "form-433-d": ["f433d.pdf"],
  "form-656": ["f656b.pdf"],
  "form-12277": ["f12277.pdf"],
  "form-w2": ["fw2.pdf"],
  "form-1099-nec": ["f1099nec.pdf"],
  "form-1099-k": ["f1099k.pdf"],
  "form-1099-int": ["f1099int.pdf"],
  "form-12153": ["f12153.pdf"],
  "form-9423": ["f9423.pdf"],
  "form-843": ["f843.pdf"],
  "form-4506-t": ["f4506t.pdf"],
  "pub-1": ["p1.pdf"],
  "pub-594": ["p594.pdf"],
  "pub-1660": ["p1660.pdf"],
  "pub-1450": ["p1450.pdf"],
  "pub-783": ["p783.pdf"],
  "cdp-hearing": ["p1660.pdf", "f12153.pdf"],
  "letter-3172": ["p1660.pdf"],
  "lien-withdrawal": ["f12277.pdf", "p1450.pdf"],
  "installment-agreement": ["f9465.pdf", "f433d.pdf"],
  "first-time-abatement": ["f843.pdf"],
  // IRS sample notices (made-up details)
  cp14: ["cp14_english.pdf"],
  cp501: ["cp501_english.pdf"],
  cp503: ["cp503_english.pdf"],
  cp504: ["cp504_english.pdf"],
  lt11: ["lt11_english.pdf"],
  cp90: ["cp90_english.pdf"],
  cp71c: ["cp71c_english.pdf"],
  cp521: ["cp521_english.pdf"],
  cp523: ["cp523_english.pdf"],
};

export function libraryEntry(slug: string): LibraryEntry | undefined {
  return libraryEntries.find((e) => e.slug === slug);
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Library entries mentioned in a piece of text, e.g. a document name ("Form 2848 – …") or a notice code. */
export function libraryMatches(text: string): LibraryEntry[] {
  return libraryEntries.filter((e) =>
    e.aliases.some((alias) => new RegExp(`(^|[^a-z0-9])${escapeRegExp(alias)}s?($|[^a-z0-9])`, "i").test(text))
  );
}
