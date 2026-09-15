"use client";

import { useMemo } from "react";
import {
  BookOpen,
  CalendarRange,
  FileText,
  FileWarning,
  LayoutGrid,
  ListChecks,
  MessageCircleQuestionMark,
  MessageSquare,
  Rocket,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { useCase } from "@/components/case-provider";
import { SearchPalette } from "@/components/search/search-palette";
import { caseSearchItems, staticSearchItems, type SearchItem, type SearchKind } from "@/lib/search";

const kindIcons: Record<SearchKind, LucideIcon> = {
  Page: LayoutGrid,
  Notice: FileWarning,
  "To-do": ListChecks,
  Document: FileText,
  Note: MessageSquare,
  "Tax year": CalendarRange,
  Library: BookOpen,
  "Q&A": MessageCircleQuestionMark,
  Settings: Settings,
  "Get Started": Rocket,
};

const SUGGESTIONS = ["2848", "CP504", "DoorDash", "lien", "payment plan", "cancel"];

const QUICK_LINKS: SearchItem[] = [
  { id: "quick-dashboard", kind: "Page", title: "Dashboard", href: "/" },
  { id: "quick-documents", kind: "Page", title: "Documents", href: "/documents" },
  { id: "quick-library", kind: "Page", title: "Library", href: "/library" },
  { id: "quick-questions", kind: "Q&A", title: "Questions & answers", href: "/questions" },
  { id: "quick-billing", kind: "Settings", title: "Billing & plan", href: "/settings/billing" },
];

const staticItems = staticSearchItems();

// Search everything, the taxpayer's side: opened from the top bar, with Ctrl+K / Cmd+K, or "/".
export function CommandPalette({ onClose }: { onClose: () => void }) {
  const { docs, notesFor, actions, notices } = useCase();
  const items = useMemo(
    () => [...staticItems, ...caseSearchItems(docs, notesFor, actions, notices)],
    [docs, notesFor, actions, notices]
  );

  return (
    <SearchPalette
      items={items}
      icons={kindIcons}
      label="Search everything"
      placeholder="Search notices, documents, notes, forms, settings…"
      suggestions={SUGGESTIONS}
      quickLinks={QUICK_LINKS}
      emptyHint="Try a form number like 2848, a notice like CP504, or a word like lien."
      onClose={onClose}
    />
  );
}
