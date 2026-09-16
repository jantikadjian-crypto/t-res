// The T-Res Pro Library: the same IRS forms, notices and terms the taxpayer sees, plus the layer a
// practitioner actually needs — the clock that starts, where it's filed, what trips people up, and
// what T-Res does automatically. Entries are NOT duplicated: lib/library.ts stays the one source of
// definitions and IRS links, and this file adds `proNotes` on top, plus entries only a professional
// needs (e-Services, the statutes, TFRP, Circular 230).
//
// Reference support for the professional's own work, not advice: every entry links to the IRS source,
// and figures and deadlines have to be checked against it. Every IRS link here was fetched and
// returned 200 (CLAUDE.md).
import { libraryEntries, libraryEntry, type LibraryEntry } from "@/lib/library";

export type ProNote = {
  // What this means for the practice, in a line or two.
  practice: string;
  // Hard clocks, with the rule that sets them.
  clocks?: { label: string; rule: string }[];
  // How it actually gets filed or pulled.
  filing?: string;
  // What trips practitioners up.
  watchFor?: string[];
  // What T-Res does without you, and the policy that allows it.
  automation?: { does: string; policyId: string };
  // Named authority. Not a link: check the current text.
  authority?: string[];
};

// Entries a taxpayer never needs and a practitioner uses constantly.
export const proOnlyEntries: LibraryEntry[] = [
  {
    slug: "e-services",
    name: "e-Services",
    kind: "Term",
    short: "The IRS's online suite for tax professionals",
    definition:
      "The IRS's account for practitioners: Transcript Delivery System, TIN matching, e-file provider services and secure messaging. Access needs identity verification, and the account locks if it goes unused.",
    aliases: ["e-Services", "eServices", "TDS access"],
    irs: { url: "https://www.irs.gov/e-services", label: "e-Services for tax professionals" },
    related: ["transcript-delivery-system", "caf-number", "account-transcript"],
  },
  {
    slug: "transcript-delivery-system",
    name: "Transcript Delivery System (TDS)",
    kind: "Term",
    short: "Where you pull a client's transcripts once the authorization is on file",
    definition:
      "The e-Services tool that returns account, return, wage & income and record-of-account transcripts for a client you're authorized for. It reads the CAF file, so nothing appears until the Form 2848 or 8821 has been processed.",
    aliases: ["TDS", "Transcript Delivery System", "transcript delivery"],
    irs: { url: "https://www.irs.gov/tax-professionals/transcript-delivery-system-tds", label: "Transcript Delivery System" },
    related: ["e-services", "account-transcript", "wage-income-transcript", "form-8821"],
  },
  {
    slug: "tax-pro-account",
    name: "Tax Pro Account",
    kind: "Term",
    short: "Authorization requests the client approves online",
    definition:
      "Lets you send a power of attorney or information authorization request straight to a client's IRS Online Account. They approve it there, and it records to the CAF in days rather than weeks — no fax, no wet signature.",
    aliases: ["Tax Pro Account", "online POA", "digital authorization"],
    irs: { url: "https://www.irs.gov/tax-professionals/tax-pro-account", label: "Tax Pro Account" },
    related: ["form-2848", "form-8821", "caf-number", "irs-online-account"],
  },
  {
    slug: "practitioner-priority-service",
    name: "Practitioner Priority Service",
    kind: "Term",
    short: "The IRS phone line for authorized representatives",
    definition:
      "A dedicated line for practitioners with an authorization on file, for account questions the transcripts can't answer. Expect to give your CAF number, and to be asked to fax the authorization if it hasn't been processed yet.",
    aliases: ["PPS", "Practitioner Priority Service", "practitioner line"],
    irs: { url: "https://www.irs.gov/tax-professionals/practitioner-priority-service-r", label: "Practitioner Priority Service" },
    related: ["caf-number", "form-2848", "levy"],
  },
  {
    slug: "circular-230",
    name: "Circular 230",
    kind: "Term",
    short: "The rules governing practice before the IRS",
    definition:
      "Treasury Department Circular No. 230 (31 CFR Part 10) sets what representatives must do: due diligence, telling a client about an error or omission, avoiding conflicts without informed consent, not unreasonably delaying a matter, and the standards for written advice. The Office of Professional Responsibility enforces it.",
    aliases: ["Circular 230", "OPR", "practice standards", "31 CFR Part 10"],
    irs: {
      url: "https://www.irs.gov/tax-professionals/office-of-professional-responsibility-and-circular-230",
      label: "Office of Professional Responsibility and Circular 230",
    },
    related: ["enrolled-agent", "form-2848"],
  },
  {
    slug: "ased",
    name: "Assessment statute (ASED)",
    kind: "Term",
    short: "How long the IRS has to assess more tax",
    definition:
      "Generally three years from the later of the filing date or the due date. It stretches to six years where more than 25% of gross income was left off, and never expires for a false or fraudulent return, or where no return was filed at all.",
    aliases: ["ASED", "assessment statute", "statute of limitations on assessment"],
    irs: { url: "https://www.irs.gov/pub/irs-pdf/p556.pdf", label: "Publication 556: Examination and Appeal Rights (PDF)" },
    related: ["csed", "rsed", "cp2000", "form-1040"],
  },
  {
    slug: "rsed",
    name: "Refund statute (RSED)",
    kind: "Term",
    short: "How long a client has to claim a refund",
    definition:
      "A refund claim generally has to be filed within three years of filing the return, or two years of paying the tax, whichever is later — and the amount refundable is capped by what was paid in the lookback period. Late-filed returns with withholding are where this bites.",
    aliases: ["RSED", "refund statute", "refund claim deadline"],
    irs: { url: "https://www.irs.gov/pub/irs-pdf/p556.pdf", label: "Publication 556: Examination and Appeal Rights (PDF)" },
    related: ["ased", "form-843", "form-1040"],
  },
  {
    slug: "trust-fund-recovery-penalty",
    name: "Trust Fund Recovery Penalty",
    kind: "Term",
    short: "Payroll tax the IRS can assess against a person",
    definition:
      "Where a business failed to pay over withheld payroll tax, the IRS can assess the trust fund portion personally against anyone responsible who acted willfully. It arrives as Letter 1153 after an interview, and it survives the business closing or going bankrupt.",
    aliases: ["TFRP", "trust fund recovery penalty", "Letter 1153", "responsible person", "6672"],
    irs: {
      url: "https://www.irs.gov/businesses/small-businesses-self-employed/employment-taxes",
      label: "Employment taxes",
    },
    related: ["levy", "installment-agreement", "currently-not-collectible"],
  },
  {
    slug: "reasonable-collection-potential",
    name: "Reasonable collection potential",
    kind: "Term",
    short: "What an offer has to beat",
    definition:
      "The IRS's calculation of what it could collect: the net realizable equity in assets, plus future income over the number of months the offer runs. An offer below RCP is rejected unless special circumstances or effective tax administration applies.",
    aliases: ["RCP", "reasonable collection potential", "net realizable equity"],
    irs: { url: "https://www.irs.gov/payments/offer-in-compromise", label: "Offer in compromise" },
    related: ["offer-in-compromise", "form-656", "form-433-a", "currently-not-collectible"],
  },
  {
    slug: "reasonable-cause",
    name: "Reasonable cause",
    kind: "Term",
    short: "Penalty relief on the facts, not on a clean record",
    definition:
      "Relief where the client exercised ordinary business care and prudence but still couldn't comply: illness, records destroyed, reliance on a professional in some cases. It's judged on facts and circumstances, and unlike first-time abate it doesn't use up anything.",
    aliases: ["reasonable cause", "penalty abatement", "penalty relief"],
    irs: { url: "https://www.irs.gov/payments/penalty-relief-for-reasonable-cause", label: "Penalty relief for reasonable cause" },
    related: ["first-time-abatement", "form-843", "failure-to-file-penalty", "failure-to-pay-penalty"],
  },
  {
    slug: "equivalent-hearing",
    name: "Equivalent hearing",
    kind: "Term",
    short: "What's left after the CDP window closes",
    definition:
      "A late collection hearing request, available for up to a year after the notice. Appeals will look at the case, but there's no right to take the determination to the Tax Court, and it doesn't suspend the collection statute the way a timely CDP request does.",
    aliases: ["equivalent hearing", "late CDP", "EH"],
    irs: { url: "https://www.irs.gov/pub/irs-pdf/p1660.pdf", label: "Publication 1660: Collection Appeal Rights (PDF)" },
    related: ["cdp-hearing", "form-12153", "lt11", "letter-3172"],
  },
  {
    slug: "irs-appeals",
    name: "IRS Independent Office of Appeals",
    kind: "Term",
    short: "Where a disagreement goes before court",
    definition:
      "A separate office that settles disputes without litigation, weighing the hazards of going to court. It handles collection hearings, examination disagreements and penalty appeals, and is meant to be independent of the office that made the decision.",
    aliases: ["Appeals", "Office of Appeals", "appeals conference"],
    irs: { url: "https://www.irs.gov/independent-office-of-appeals", label: "Independent Office of Appeals" },
    related: ["cdp-hearing", "form-12153", "form-9423", "cp2000"],
  },
];

// The practitioner layer on entries the taxpayer already sees, plus the pro-only ones above.
export const proNotes: Record<string, ProNote> = {
  "form-2848": {
    practice:
      "Your authority to act. Nothing — transcripts, calls, submissions — happens before this is on the CAF, so it is the first thing to chase on a new case.",
    clocks: [
      { label: "CAF processing", rule: "Days through Tax Pro Account or the online submission tool; weeks by fax or mail." },
      { label: "Future years", rule: "You may list years that haven't ended yet, but only a limited number ahead — check the current instructions." },
    ],
    filing:
      "Submit Forms 2848 and 8821 Online (identity verification required), Tax Pro Account for a client-approved request, or fax to the CAF unit for your state.",
    watchFor: [
      "Every tax matter and period has to be listed. A missing year means a second form and another wait.",
      "A POA does not let you sign the client's return except in the narrow cases the regulations allow.",
      "Filing a new 2848 revokes an earlier one for the same matters unless you tick the box to keep it.",
      "Copies of notices go to the representative only where the form asks for them.",
    ],
    automation: {
      does: "T-Res prepares the form from the intake answers, checks the years against the transcripts, and routes it to you to sign. It never files under your CAF without your approval.",
      policyId: "pol_submission",
    },
    authority: ["IRC §6103(c)", "Circular 230 §10.3"],
  },
  "form-8821": {
    practice:
      "Read-only access. Enough to pull transcripts and see what the IRS holds, which is usually all you need to price the work before anyone signs a POA.",
    filing: "Same channels as the 2848. It records to the CAF too, so transcripts appear in TDS once processed.",
    watchFor: [
      "It does not let you speak for the client, argue a case or negotiate — that needs a 2848.",
      "Useful for a second pair of eyes in the firm without extending representation.",
    ],
    automation: {
      does: "T-Res asks for the 8821 first on every case so it can read the record, and only asks for the 2848 when representation is actually needed.",
      policyId: "pol_submission",
    },
  },
  "form-12153": {
    practice: "The request that buys a CDP hearing. Get it in within the window and levies stop while Appeals looks at the case.",
    clocks: [
      { label: "Timely CDP request", rule: "30 days from a final notice of intent to levy, or from the lien filing notice window." },
      { label: "Equivalent hearing", rule: "Up to a year after, with no Tax Court review and no statute suspension." },
    ],
    filing: "To the address on the notice — not the general service centre. Keep proof of mailing; timeliness is the whole game.",
    watchFor: [
      "List every alternative you might want: instalment agreement, offer, currently not collectible, innocent spouse, lien withdrawal.",
      "A timely request suspends the collection statute while it's pending, which cuts both ways for the client.",
      "The underlying liability can only be raised where the client never had an earlier chance to dispute it.",
    ],
    automation: {
      does: "T-Res drafts the request with the alternatives that fit the case, checks the deadline against the notice date, and sends it to you.",
      policyId: "pol_submission",
    },
    authority: ["IRC §6330", "IRC §6320"],
  },
  "form-9423": {
    practice:
      "The Collection Appeals Program: faster than CDP, and available for actions CDP doesn't cover, such as a rejected or terminated instalment agreement.",
    clocks: [{ label: "After the manager conference", rule: "A short window measured in business days — check Publication 1660 before relying on it." }],
    watchFor: [
      "No Tax Court review of a CAP decision, and no statute suspension.",
      "You normally have to talk to the revenue officer's manager first.",
    ],
    authority: ["Publication 1660"],
  },
  "form-433-f": {
    practice: "The short financial statement. Fine for most instalment agreements and hardship requests taken over the phone.",
    watchFor: [
      "Allowable living expenses drive the outcome — use the current national and local standards, not the client's actual spend.",
      "Expect substantiation for anything above standard: housing, vehicles, health care.",
    ],
    automation: {
      does: "T-Res builds the figures from the documents on file, flags anything above the standards, and shows you what it used.",
      policyId: "pol_rules",
    },
  },
  "form-433-a": {
    practice: "The long form, and the one that matters for an offer. Everything in it feeds the reasonable collection potential.",
    watchFor: [
      "Asset values are net realizable equity, not market value.",
      "Dissipated assets can come back into the calculation.",
      "433-A (OIC) is a different form from the collection 433-A — make sure the right one goes with the offer.",
    ],
  },
  "form-656": {
    practice: "The offer itself. Compliance first: unfiled returns or missing estimated payments sink it before anyone reads the numbers.",
    clocks: [
      { label: "IRS decision", rule: "An offer not decided within two years of receipt is deemed accepted." },
      { label: "Appeal a rejection", rule: "30 days from the rejection letter." },
    ],
    filing: "Application fee and initial payment unless the low-income certification applies. Check the current fee on the IRS page.",
    watchFor: [
      "The collection statute is suspended while the offer is pending, plus the appeal period.",
      "Accepted offers require compliance for five years or the liability comes back.",
      "Refunds for the year of acceptance are kept by the IRS.",
      "Accepted offers are on public inspection for a year.",
    ],
    automation: {
      does: "T-Res works out the reasonable collection potential from the financials and tells you whether an offer is realistic before you spend time on it. The recommendation is yours to approve.",
      policyId: "pol_advice",
    },
    authority: ["IRC §7122", "IRC §7122(f)"],
  },
  "form-9465": {
    practice: "Only needed where the online agreement won't take it — most cases can be set up online or on the phone in less time.",
    watchFor: ["A direct debit agreement carries a lower user fee and defaults less often.", "Attach a financial statement only where the balance or terms require one."],
  },
  "form-12277": {
    practice:
      "Withdrawal removes the public notice as though it was never filed, which is what the client actually wants. A release just says it's satisfied.",
    watchFor: [
      "Common grounds: the agreement is on direct debit and the balance is within the threshold, or withdrawal helps collection.",
      "Ask for notice to credit agencies in the box provided, or the record stays stale.",
    ],
  },
  "form-843": {
    practice: "The claim form for penalties and certain interest. Not for income tax — that's an amended return.",
    clocks: [{ label: "Refund claim window", rule: "Bounded by the refund statute: three years from filing, two from payment." }],
    watchFor: ["Reasonable cause belongs in the explanation with dates and documents.", "First-time abate is usually quicker by phone than by form."],
  },
  "form-4506-t": {
    practice: "The fallback when the authorization isn't processed yet or the client needs transcripts sent to a third party.",
    watchFor: ["Slower than TDS. If you have an 8821 on the CAF, pull them yourself instead."],
  },
  lt11: {
    practice: "The final notice before levy, and the one that starts the CDP clock. Treat it as a same-day item.",
    clocks: [{ label: "CDP request", rule: "30 days from the notice date." }],
    automation: {
      does: "T-Res moves a self-serve case to you the moment a final levy notice arrives, and drafts the hearing request.",
      policyId: "pol_emergency",
    },
    authority: ["IRC §6331(d)", "IRC §6330"],
  },
  "letter-3172": {
    practice: "Notice that a lien has been filed. It carries its own CDP right, separate from the levy one.",
    clocks: [{ label: "CDP request", rule: "30 days from the end of the five-business-day window after filing." }],
    watchFor: ["Consider withdrawal (Form 12277) rather than waiting for release.", "The lien attaches to everything the client owns, including after-acquired property."],
    authority: ["IRC §6320"],
  },
  cp504: {
    practice:
      "Reads like a final notice and isn't one: it allows a levy on a state refund, but a proper final notice with CDP rights has to come first for anything else.",
    watchFor: ["Don't file a CDP request off a CP504 and assume the clock is protected — wait for the LT11 or Letter 1058."],
    automation: { does: "T-Res explains it in plain English for the client and drafts the response.", policyId: "pol_explain" },
  },
  cp2000: {
    practice: "Not a bill and not an audit: a matching proposal. The response window is short and an unanswered one becomes a notice of deficiency.",
    clocks: [
      { label: "Respond", rule: "30 days from the notice date (60 if the address is outside the US)." },
      { label: "After a notice of deficiency", rule: "90 days to petition the Tax Court." },
    ],
    watchFor: ["Check basis on securities sales — the IRS matches proceeds, not gain.", "Agreeing in part is normal; say which items and why."],
    automation: { does: "T-Res compares the notice line by line against the wage and income transcript and drafts the reply.", policyId: "pol_submission" },
  },
  cp523: {
    practice: "The agreement is about to default. Reinstatement is usually possible, and cheaper than starting again.",
    clocks: [{ label: "Act before termination", rule: "The notice gives a date; after it, collection resumes." }],
    watchFor: ["A new balance is the usual cause — fix the withholding or estimated payments at the same time, or it recurs."],
  },
  "installment-agreement": {
    practice: "The workhorse. Most cases end here; the question is only which flavour and whether a financial statement is needed.",
    watchFor: [
      "Streamlined terms avoid a financial statement where the balance and term fit — check the current thresholds.",
      "The collection statute keeps running on a plan, which sometimes makes the longest term the right answer.",
      "A lien may still be filed above the notice threshold.",
    ],
    automation: { does: "T-Res works out what the client can pay, prepares the request, and brings the recommendation to you.", policyId: "pol_advice" },
    authority: ["IRC §6159"],
  },
  "offer-in-compromise": {
    practice: "Rare and slow. Screen with the reasonable collection potential before promising anything — most offers fail on compliance or on equity in assets.",
    watchFor: ["Doubt as to collectibility is the common ground; effective tax administration is narrow.", "Expect a lien while it's pending."],
    automation: { does: "T-Res runs the RCP from the financials and says plainly when an offer isn't realistic.", policyId: "pol_advice" },
    authority: ["IRC §7122"],
  },
  "currently-not-collectible": {
    practice: "Not forgiveness: collection pauses while hardship lasts, and the file is reviewed when income rises.",
    watchFor: [
      "The collection statute keeps running, which is often the real benefit.",
      "Penalties and interest keep accruing.",
      "A lien is still likely above the threshold.",
    ],
    authority: ["IRM 5.16.1"],
  },
  "first-time-abatement": {
    practice: "An administrative waiver for a clean three-year record. Quick by phone, and worth checking before writing a reasonable-cause letter.",
    watchFor: [
      "Consider reasonable cause first where it exists and keep the waiver for a year that has no other argument.",
      "The client has to be filed and paid, or in an agreement.",
    ],
    automation: { does: "T-Res checks the three-year record on the transcripts and tells you whether the waiver is available.", policyId: "pol_rules" },
  },
  levy: {
    practice: "Money already gone. A bank levy holds funds before they move; a wage levy keeps taking until it's released.",
    clocks: [{ label: "Bank levy", rule: "21 days before the bank sends the funds — that's the window to get a release." }],
    watchFor: ["Economic hardship requires release.", "Get the release faxed to the employer or bank yourself; don't rely on the post."],
    authority: ["IRC §6343", "IRC §6331(e)", "IRC §6332(c)"],
  },
  "federal-tax-lien": {
    practice: "A claim against everything the client owns. Withdrawal, discharge and subordination are separate remedies for different problems.",
    watchFor: ["Discharge frees one asset for a sale; subordination lets another creditor move ahead so a refinance can fund the tax."],
  },
  csed: {
    practice: "The number that decides strategy. Pull it from the account transcript before recommending anything.",
    watchFor: [
      "Pending offers, CDP requests, bankruptcy and time abroad suspend it; each suspension adds time.",
      "A long instalment agreement can outlive the statute, which is sometimes the best outcome available.",
    ],
    authority: ["IRC §6502"],
  },
  "account-transcript": {
    practice: "The case file. Assessments, payments, holds and the codes that tell you what the IRS has actually done.",
    watchFor: ["Codes worth knowing: 150 return filed, 480 offer pending, 530 currently not collectible.", "Read the cycle dates, not just the amounts."],
  },
  "wage-income-transcript": {
    practice: "What the IRS thinks the client earned. The starting point for any unfiled year and any matching notice.",
    watchFor: ["The current year is incomplete until well into the following year — don't file off it too early."],
  },
  "caf-number": {
    practice: "Your identifier on every authorization. Keep the address and phone on the CAF current or copies of notices go to the wrong place.",
  },
  "cdp-hearing": {
    practice: "The one collection appeal with a route to the Tax Court, which is why the 30 days matter more than anything else on the case.",
    clocks: [{ label: "Timely request", rule: "30 days from the final notice." }],
    authority: ["IRC §6330"],
  },
  "enrolled-agent": {
    practice: "Unlimited practice rights before the IRS, with a renewal cycle and continuing education to keep them.",
  },
  // Pro-only entries.
  "e-services": {
    practice: "Set it up before you need it. Identity verification takes longer than the case usually allows.",
    watchFor: ["Accounts go dormant if unused.", "Each person in the firm needs their own — credentials are not shared."],
  },
  "transcript-delivery-system": {
    practice: "First stop on every new case: account, return and wage & income transcripts for the open years.",
    watchFor: ["Nothing shows until the authorization is on the CAF.", "Pull the record of account where you need the return and the account together."],
    automation: { does: "T-Res reads the transcripts it is given and builds the timeline, balances and statute dates from them.", policyId: "pol_rules" },
  },
  "tax-pro-account": {
    practice: "The fastest way to get authority on file. Worth walking a client through it on the phone rather than waiting on a fax.",
    watchFor: ["The client needs an IRS Online Account with verified identity.", "Not every authorization type is supported — check before promising."],
  },
  "practitioner-priority-service": {
    practice: "For the account questions transcripts can't answer, and for chasing a levy release when time matters.",
    watchFor: ["Have the CAF number and the authorization to hand.", "Hold times vary wildly by season."],
  },
  "circular-230": {
    practice:
      "The standard you're held to, and the reason T-Res's badges matter: anything sent under your name is your work, however it was drafted.",
    watchFor: [
      "You must tell a client about an error or omission you find, and what to do about it.",
      "Due diligence applies to what you rely on — including software output.",
      "Conflicts between spouses or between a business and its owners need informed consent in writing.",
    ],
    authority: ["31 CFR Part 10", "§10.21", "§10.22", "§10.29", "§10.34"],
  },
  ased: {
    practice: "Check it before agreeing to an examination extension, and before chasing an old year that can no longer be assessed.",
    authority: ["IRC §6501"],
  },
  rsed: {
    practice: "The reason to file old returns even when nothing is owed: a refund outside the window is lost, not carried forward.",
    authority: ["IRC §6511"],
  },
  "trust-fund-recovery-penalty": {
    practice: "The personal exposure behind a payroll case. Identify who is at risk early, before the interview.",
    clocks: [{ label: "Appeal Letter 1153", rule: "60 days from the letter." }],
    watchFor: ["Willfulness is about knowing and choosing to pay someone else first.", "Bankruptcy does not usually clear it."],
    authority: ["IRC §6672"],
  },
  "reasonable-collection-potential": {
    practice: "Run it before the client's hopes get ahead of the arithmetic. It is the single number that decides whether an offer is worth filing.",
    automation: { does: "T-Res calculates it from the financial statement and shows its working, for you to approve.", policyId: "pol_advice" },
  },
  "reasonable-cause": {
    practice: "Facts, dates and documents. A letter that recites the standard without evidence gets a form rejection.",
    watchFor: ["Reliance on a professional helps for some penalties and not for others.", "Ask for reasonable cause first and keep first-time abate in reserve."],
  },
  "equivalent-hearing": {
    practice: "The fallback when the 30 days are gone. Say so plainly to the client: no Tax Court, and the statute keeps running.",
  },
  "irs-appeals": {
    practice: "Where most collection disputes actually settle. Go in with the alternative you want and the numbers to support it.",
  },
};

const proOnly = new Set(proOnlyEntries.map((e) => e.slug));
export const isProOnly = (slug: string) => proOnly.has(slug);

/** Every entry a professional can look up: the shared library plus the pro-only ones. */
export const proLibraryEntries: LibraryEntry[] = [...libraryEntries, ...proOnlyEntries];

export function proLibraryEntry(slug: string): LibraryEntry | undefined {
  return libraryEntry(slug) ?? proOnlyEntries.find((e) => e.slug === slug);
}

export const proNoteFor = (slug: string): ProNote | undefined => proNotes[slug];

/** Entries with a practitioner note, for the "practice notes" filter and for counting. */
export const hasProNote = (slug: string) => slug in proNotes;

// Matching an entry to the caseload: aliases against what each client's case actually says.
type CaseloadItem = { id: string; name: string; text: string };

/** Which clients this entry touches right now, so the Library is operational and not encyclopedic. */
export function caseloadMatches(entry: LibraryEntry, items: CaseloadItem[]): CaseloadItem[] {
  const needles = [entry.name, ...entry.aliases].map((a) => a.toLowerCase()).filter((a) => a.length > 3);
  return items.filter((item) => {
    const text = item.text.toLowerCase();
    return needles.some((n) => text.includes(n));
  });
}
