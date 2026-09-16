"use client";

import { useMemo } from "react";
import { FileText, Inbox, LayoutGrid, ListChecks, Settings, UserRound, Users, type LucideIcon } from "lucide-react";
import { useCase } from "@/components/case-provider";
import { useProWorkspace } from "@/components/pro/use-pro-workspace";
import { SearchPalette } from "@/components/search/search-palette";
import { allProDocuments } from "@/lib/proDocuments";
import {
  PRO_KIND_ORDER,
  proClientSearchItems,
  proDocumentSearchItems,
  proQueueSearchItems,
  staticProSearchItems,
  type ProSearchKind,
} from "@/lib/proSearch";
import type { SearchItem } from "@/lib/search";

const kindIcons: Record<ProSearchKind, LucideIcon> = {
  Page: LayoutGrid,
  Client: UserRound,
  Document: FileText,
  Approval: Inbox,
  Task: ListChecks,
  Team: Users,
  Settings: Settings,
};

const SUGGESTIONS = ["LT11", "levy", "Jordan", "2848", "seats"];

const QUICK_LINKS: SearchItem[] = [
  { id: "pro-quick-today", kind: "Page", title: "Today", href: "/pro" },
  { id: "pro-quick-clients", kind: "Page", title: "Clients", href: "/pro/clients" },
  { id: "pro-quick-documents", kind: "Page", title: "Documents", href: "/pro/documents" },
  { id: "pro-quick-approvals", kind: "Page", title: "Approvals", href: "/pro/approvals" },
  { id: "pro-quick-billing", kind: "Settings", title: "Billing & plan", href: "/pro/settings/billing" },
  { id: "pro-quick-plcy", kind: "Page", title: "PLCY governance console", href: "/plcy" },
];

const staticItems = staticProSearchItems();

// Search the practice: opened from the T-Res Pro top bar, with Ctrl+K / Cmd+K, or "/".
export function ProCommandPalette({ onClose }: { onClose: () => void }) {
  const { clients, rows } = useProWorkspace();
  const { docs } = useCase();
  const items = useMemo(
    () => [
      ...staticItems,
      ...proClientSearchItems(clients),
      ...proDocumentSearchItems(allProDocuments(docs)),
      ...proQueueSearchItems(rows),
    ],
    [clients, docs, rows]
  );

  return (
    <SearchPalette
      items={items}
      icons={kindIcons}
      kindOrder={PRO_KIND_ORDER}
      label="Search your practice"
      placeholder="Search clients, documents, approvals, settings…"
      suggestions={SUGGESTIONS}
      quickLinks={QUICK_LINKS}
      emptyHint="Try a client name, a form like 2848, a notice like LT11, or a word like levy."
      onClose={onClose}
    />
  );
}
