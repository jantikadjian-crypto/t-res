// "Search everything": one index of pages, case data, the Library, settings and the wizard.
// When you add a page or a new kind of data, add it here so it can be found.
import { formatMoney } from "@/lib/format";
import { intakeScreens, intakeSteps } from "@/lib/intakeScreens";
import { libraryEntries } from "@/lib/library";
import {
  account,
  actionItems,
  enrolledAgent,
  notices,
  paidInvoices,
  resolutionPlans,
  subscription,
  taxYears,
  yearBalance,
  type CaseDocument,
  type DocumentNote,
} from "@/lib/mockData";

export type SearchKind = "Page" | "Notice" | "To-do" | "Document" | "Note" | "Tax year" | "Library" | "Settings" | "Get Started";

// Tie-break order when two results score the same.
const KIND_ORDER: SearchKind[] = ["Page", "Notice", "To-do", "Document", "Note", "Tax year", "Library", "Settings", "Get Started"];

export type SearchItem = {
  id: string;
  kind: SearchKind;
  title: string;
  subtitle?: string;
  href: string;
  keywords?: string;
};

const pages: SearchItem[] = [
  { id: "page-dashboard", kind: "Page", title: "Dashboard", subtitle: "Where your case stands today", href: "/", keywords: "home overview total owed deadline case stage" },
  { id: "page-notices", kind: "Page", title: "Notices", subtitle: "Every IRS letter, in plain English", href: "/notices", keywords: "letters mail upload notice" },
  { id: "page-tax-years", kind: "Page", title: "Tax Years", subtitle: "What you owe for each year", href: "/tax-years", keywords: "balance owed years collection deadline" },
  { id: "page-actions", kind: "Page", title: "Action Items", subtitle: "Things only you can do", href: "/action-items", keywords: "to-do tasks sign upload approve" },
  { id: "page-documents", kind: "Page", title: "Documents", subtitle: "Your whole case file", href: "/documents", keywords: "files uploads pdf" },
  { id: "page-my-documents", kind: "Page", title: "My documents", subtitle: "Files you've uploaded", href: "/documents/mine", keywords: "my uploads" },
  { id: "page-waiting", kind: "Page", title: "Documents waiting on you", subtitle: "To sign, approve or upload", href: "/documents/waiting", keywords: "requested missing signature" },
  { id: "page-library", kind: "Page", title: "Library", subtitle: "IRS forms, notices and terms explained", href: "/library", keywords: "glossary definitions help reference irs forms" },
  { id: "page-intake", kind: "Page", title: "Get Started", subtitle: "Your intake answers", href: "/intake/notice", keywords: "onboarding wizard intake questions" },
  { id: "page-sign", kind: "Page", title: "Sign Form 2848", subtitle: "Secure signing", href: "/sign/doc_2848", keywords: "signature e-sign power of attorney" },
];

const settings: SearchItem[] = [
  {
    id: "settings-profile",
    kind: "Settings",
    title: "Profile",
    subtitle: "Your name, email, phone and address",
    href: "/settings",
    keywords: `settings account ${account.email} ${account.phone} ${account.mailingAddress} name`,
  },
  {
    id: "settings-notifications",
    kind: "Settings",
    title: "Notification settings",
    subtitle: "Email and text reminders",
    href: "/settings/notifications",
    keywords: "alerts reminders email text sms deadline",
  },
  {
    id: "settings-security",
    kind: "Settings",
    title: "Security",
    subtitle: "Two-step verification and who can act for you",
    href: "/settings/security",
    keywords: "two-step verification sign-in devices password form 8821 form 2848 authorization",
  },
  {
    id: "settings-billing",
    kind: "Settings",
    title: "Billing & plan",
    subtitle: "Your plan, payments and card",
    href: "/settings/billing",
    keywords: [
      "billing plan payment subscription upgrade downgrade invoice receipt card",
      subscription.paymentMethod.brand,
      subscription.paymentMethod.last4,
      ...resolutionPlans.map((p) => `${p.name} ${formatMoney(p.price)}`),
      ...paidInvoices.map((i) => i.id),
    ].join(" "),
  },
  {
    id: "settings-cancel",
    kind: "Settings",
    title: "Cancel plan",
    subtitle: "Pause, switch or cancel",
    href: "/settings/billing/cancel",
    keywords: "cancel subscription stop pause",
  },
];

// Everything that doesn't change during a session.
export function staticSearchItems(): SearchItem[] {
  return [
    ...pages,
    ...notices.map<SearchItem>((n) => ({
      id: `notice-${n.id}`,
      kind: "Notice",
      title: `${n.code}: ${n.plainTitle}`,
      subtitle: `${n.title} · ${n.taxYear} tax year · ${n.statusLabel}`,
      href: `/notices/${n.id}`,
      keywords: [n.decode.whatItIs, n.decode.whatItMeans, n.decode.deadline, n.decode.whatWeAreDoing, formatMoney(n.amount)].join(" "),
    })),
    ...actionItems.map<SearchItem>((a) => ({
      id: `todo-${a.id}`,
      kind: "To-do",
      title: a.title,
      subtitle: a.why,
      href: "/action-items",
      keywords: `${a.uploadHint ?? ""} ${a.type}`,
    })),
    ...taxYears.map<SearchItem>((y) => ({
      id: `year-${y.year}`,
      kind: "Tax year",
      title: `${y.year} tax year`,
      subtitle: `${y.statusLabel}${y.balance ? ` · ${formatMoney(yearBalance(y))}` : ""}`,
      href: `/tax-years/${y.year}`,
      keywords: [
        y.plainEnglish,
        y.reliefNote ?? "",
        ...y.events.map((e) => e.label),
        ...y.incomeOnRecord.map((r) => `${r.payer} ${r.form}`),
      ].join(" "),
    })),
    ...libraryEntries.map<SearchItem>((e) => ({
      id: `library-${e.slug}`,
      kind: "Library",
      title: e.name,
      subtitle: e.short,
      href: `/library/${e.slug}`,
      keywords: `${e.aliases.join(" ")} ${e.kind} ${e.definition} ${e.forYou ?? ""}`,
    })),
    ...settings,
    ...intakeScreens.map<SearchItem>((s) => ({
      id: `intake-${s.slug}`,
      kind: "Get Started",
      title: s.title,
      subtitle: `Get Started · ${intakeSteps.find((st) => st.key === s.step)?.label ?? "Finish"}`,
      href: `/intake/${s.slug}`,
      keywords: s.why,
    })),
  ];
}

// Documents and notes change as the taxpayer uploads and writes, so they come from live state.
export function caseSearchItems(docs: CaseDocument[], notesFor: (docId: string) => DocumentNote[]): SearchItem[] {
  return docs.flatMap<SearchItem>((d) => [
    {
      id: `doc-${d.id}`,
      kind: "Document",
      title: d.name,
      subtitle: `${d.category} · from ${d.source}${d.taxYear ? ` · ${d.taxYear}` : ""}`,
      href: `/documents/${d.id}`,
      keywords: `${d.summary} ${d.fileName ?? ""} ${d.status}`,
    },
    ...notesFor(d.id).map<SearchItem>((n) => ({
      id: `note-${n.id}`,
      kind: "Note",
      title: n.text.length > 90 ? `${n.text.slice(0, 88)}…` : n.text,
      subtitle: `Note on ${d.name} · ${n.author === "ea" ? enrolledAgent.name : "You"}`,
      href: `/documents/${d.id}#notes`,
      keywords: n.text,
    })),
  ]);
}

export function tokenize(query: string): string[] {
  return query.toLowerCase().split(/\s+/).filter(Boolean);
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Every word must appear somewhere; matches in the title count most. */
export function searchItems(items: SearchItem[], query: string, limit = 40): SearchItem[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];
  const exact = query.trim().toLowerCase();
  const scored: { item: SearchItem; score: number }[] = [];

  for (const item of items) {
    const title = item.title.toLowerCase();
    const subtitle = (item.subtitle ?? "").toLowerCase();
    const keywords = (item.keywords ?? "").toLowerCase();
    let score = 0;
    let matchesAll = true;
    for (const t of tokens) {
      if (new RegExp(`(^|[^a-z0-9])${escapeRegExp(t)}`).test(title)) score += 6;
      else if (title.includes(t)) score += 4;
      else if (subtitle.includes(t)) score += 2;
      else if (keywords.includes(t)) score += 1;
      else {
        matchesAll = false;
        break;
      }
    }
    if (!matchesAll) continue;
    if (title === exact) score += 10;
    scored.push({ item, score });
  }

  return scored
    .sort((a, b) => b.score - a.score || KIND_ORDER.indexOf(a.item.kind) - KIND_ORDER.indexOf(b.item.kind))
    .slice(0, limit)
    .map((s) => s.item);
}
