// T-Res Pro's search index: the professional's own pages, clients, approvals, team and settings.
// Deliberately separate from the taxpayer index (lib/search.ts) in both directions — a professional
// searching "CP504" should land on a client, not inside Jordan's app, and the taxpayer never sees
// the caseload. The matching engine is shared.
import { formatMoney } from "@/lib/format";
import {
  practitioner,
  proClientDetails,
  proFirm,
  proPlans,
  proSubscription,
  proTeam,
  type ProClient,
} from "@/lib/mockData";
import { proDocStatusMeta, type ProDocument } from "@/lib/proDocuments";
import type { SearchItem } from "@/lib/search";

export type ProSearchKind = "Page" | "Client" | "Document" | "Approval" | "Task" | "Team" | "Settings";

// Tie-break order when two results score the same.
export const PRO_KIND_ORDER: ProSearchKind[] = ["Page", "Client", "Document", "Approval", "Task", "Team", "Settings"];

const pages: SearchItem[] = [
  {
    id: "pro-page-today",
    kind: "Page",
    title: "Today",
    subtitle: "What needs you today, in order",
    href: "/pro",
    keywords: "dashboard queue home emergencies deadlines minutes done escalations",
  },
  {
    id: "pro-page-clients",
    kind: "Page",
    title: "Clients",
    subtitle: "Your whole caseload",
    href: "/pro/clients",
    keywords: "caseload cases represented self-serve new balance stage attention",
  },
  {
    id: "pro-page-documents",
    kind: "Page",
    title: "Documents",
    subtitle: "Every client's paperwork in one place",
    href: "/pro/documents",
    keywords: "files library uploads signatures requests waiting irs transcripts paperwork",
  },
  {
    id: "pro-page-dashboard",
    kind: "Page",
    title: "Dashboard",
    subtitle: "How the practice is doing",
    href: "/pro/dashboard",
    keywords: "metrics numbers under management balances stages lanes handled by policy time saved",
  },
  {
    id: "pro-page-approvals",
    kind: "Page",
    title: "Approvals",
    subtitle: "AI work waiting for your sign-off",
    href: "/pro/approvals",
    keywords: "review approve send back sign-off inbox exceptions ai drafts",
  },
  {
    id: "pro-page-plcy",
    kind: "Page",
    title: "PLCY governance console",
    subtitle: "Policies, checks and the supervision record",
    href: "/plcy",
    keywords: "governance policies audit log evidence break glass escalation supervision",
  },
];

const settings: SearchItem[] = [
  {
    id: "pro-settings-profile",
    kind: "Settings",
    title: "Profile & credentials",
    subtitle: "Your name, licence, PTIN and CAF number",
    href: "/pro/settings",
    keywords: [
      "settings account enrolled agent credential licence license enrollment renewal",
      practitioner.legalName,
      practitioner.ptin,
      practitioner.cafNumber,
      practitioner.enrollmentNumber,
      practitioner.email,
      practitioner.phone,
      practitioner.timezone,
    ].join(" "),
  },
  {
    id: "pro-settings-firm",
    kind: "Settings",
    title: "Firm & team",
    subtitle: "Your practice details and who can act in it",
    href: "/pro/settings/firm",
    keywords: [
      "firm practice team seats roles invite remove owner preparer assistant staff ein address website",
      proFirm.name,
      proFirm.address,
      proFirm.website,
      proFirm.supportEmail,
    ].join(" "),
  },
  {
    id: "pro-settings-notifications",
    kind: "Settings",
    title: "Notification settings",
    subtitle: "What reaches you, and how fast",
    href: "/pro/settings/notifications",
    keywords: "alerts reminders email text sms digest same-day emergency deadline quiet hours",
  },
  {
    id: "pro-settings-security",
    kind: "Settings",
    title: "Security",
    subtitle: "Two-step verification, sessions and client data",
    href: "/pro/settings/security",
    keywords: "two-step verification sign-in devices sessions password e-services caf ptin data",
  },
  {
    id: "pro-settings-billing",
    kind: "Settings",
    title: "Billing & plan",
    subtitle: "Your firm plan, seats, card and invoices",
    href: "/pro/settings/billing",
    keywords: [
      "billing plan subscription upgrade downgrade cancel invoice receipt card payment seats capacity renew",
      proSubscription.paymentMethod.brand,
      proSubscription.paymentMethod.last4,
      proSubscription.billingEmail,
      ...proPlans.map((p) => `${p.name} ${formatMoney(p.price)}`),
    ].join(" "),
  },
];

const team: SearchItem[] = proTeam.map<SearchItem>((m) => ({
  id: `pro-team-${m.id}`,
  kind: "Team",
  title: m.name,
  subtitle: `${m.role} · ${m.status === "Invited" ? "Invited, not signed in yet" : m.email}`,
  href: "/pro/settings/firm",
  keywords: `${m.email} ${m.role} ${m.status} team seat firm staff`,
}));

/** Everything that doesn't change while the professional works. */
export function staticProSearchItems(): SearchItem[] {
  return [...pages, ...settings, ...team];
}

/** The caseload, live: Jordan's row follows the case, so pass the clients from useProWorkspace(). */
export function proClientSearchItems(clients: ProClient[]): SearchItem[] {
  return clients.map<SearchItem>((c) => {
    const detail = proClientDetails[c.id];
    return {
      id: `pro-client-${c.id}`,
      kind: "Client",
      title: c.name,
      subtitle: `${c.stage} · ${formatMoney(c.balance)} · ${c.lane === "self-serve" ? "Doing it themselves" : c.lane === "new" ? "New" : "You represent them"}`,
      href: `/pro/clients/${c.id}`,
      keywords: [
        c.situation,
        c.deadline?.label ?? "",
        c.deadline?.waitingOn ?? "",
        detail?.years ?? "",
        detail?.plan ?? "",
        ...(detail?.timeline ?? []).map((t) => t.text),
        ...(detail?.authorizations ?? []).map((a) => `${a.form} ${a.what}`),
      ].join(" "),
    };
  });
}

// Only the fields the index needs, so this file stays free of component imports.
export type QueueLike = {
  id: string;
  clientId?: string;
  client?: string;
  kind: string;
  title: string;
  why: string;
  deadline?: string;
  href?: string;
};

/** The queue, live: approvals open their review, everything else opens where the work is. */
export function proQueueSearchItems(rows: QueueLike[]): SearchItem[] {
  return rows.map<SearchItem>((r) => ({
    id: `pro-queue-${r.id}`,
    kind: r.href ? "Approval" : "Task",
    title: r.title,
    subtitle: r.client ? `${r.client} · ${r.why}` : r.why,
    href: r.href ?? (r.clientId ? `/pro/clients/${r.clientId}` : "/pro"),
    keywords: `${r.kind} ${r.deadline ?? ""} ${r.client ?? ""} queue today waiting`,
  }));
}

/** The document library, live: Jordan's rows follow the case, so pass what the library built. */
export function proDocumentSearchItems(documents: ProDocument[]): SearchItem[] {
  return documents.map<SearchItem>((d) => ({
    id: `pro-doc-${d.id}`,
    kind: "Document",
    title: d.name,
    subtitle: `${d.client} · ${proDocStatusMeta[d.status].label}`,
    href: `/pro/documents/${d.id}`,
    keywords: `${d.source} ${d.category ?? ""} ${d.summary ?? ""} ${d.why ?? ""} ${d.taxYear ?? ""} document file`,
  }));
}
