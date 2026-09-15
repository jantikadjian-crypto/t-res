// Get Started screen 10: the document checklist, built from the taxpayer's answers.
// Never a generic list: every item says why the IRS wants it.
import type { IntakeState } from "@/lib/intakeScreens";
import { documents, notices, type DocumentCategory } from "@/lib/mockData";

export type ChecklistItem = {
  key: string;
  title: string;
  why: string;
  category: DocumentCategory;
  taxYear?: number;
  // Case-file documents that satisfy this item (uploaded, or already requested).
  docIds: string[];
};

const docsMatching = (pattern: RegExp, taxYear?: number) =>
  documents.filter((d) => pattern.test(d.name) && (taxYear === undefined || d.taxYear === taxYear)).map((d) => d.id);

export function buildDocumentChecklist(s: IntakeState): ChecklistItem[] {
  const items: ChecklistItem[] = [];

  if (s.noticeDocumentId) {
    const notice = notices.find((n) => n.documentId === s.noticeDocumentId);
    items.push({
      key: "notice",
      title: notice ? `Your ${notice.code} notice` : "Your IRS notice",
      why: "So we know exactly what the IRS sent you.",
      category: "IRS notice",
      taxYear: notice?.taxYear,
      docIds: [s.noticeDocumentId],
    });
  }

  if (s.unfiledAnswer === "some") {
    for (const year of s.unfiledYears) {
      items.push({
        key: `w2-${year}`,
        title: `${year} W-2s and 1099s`,
        why: `Needed to file your missing ${year} return.`,
        category: "Financial",
        taxYear: year,
        docIds: docsMatching(/W-2|1099/, year),
      });
    }
  }

  items.push({
    key: "bank",
    title: "Your last 3 months of bank statements",
    why: "The IRS uses them to set a payment you can actually afford.",
    category: "Financial",
    docIds: docsMatching(/bank statement/i),
  });

  if (s.incomeTypes.includes("W-2 job")) {
    items.push({
      key: "paystubs",
      title: "Your 2 most recent pay stubs",
      why: "They confirm what you take home each month.",
      category: "Financial",
      docIds: docsMatching(/pay stub/i),
    });
  }

  if (s.incomeTypes.includes("Gig or delivery work")) {
    items.push({
      key: "gig",
      title: "Your gig or delivery earnings summary",
      why: "Apps like Uber and DoorDash give a yearly tax summary showing what you earned and your miles driven.",
      category: "Financial",
      docIds: [],
    });
  }

  for (const [i, asset] of s.assets.entries()) {
    if (asset.kind === "vehicle" && asset.owed > 0) {
      items.push({
        key: `loan-${i}`,
        title: `Loan statement for your ${asset.label}`,
        why: "Shows what you still owe, so the IRS only counts the part you own.",
        category: "Financial",
        docIds: docsMatching(/loan statement/i),
      });
    }
    if (asset.kind === "home" && asset.owed > 0) {
      items.push({
        key: `mortgage-${i}`,
        title: "Your latest mortgage statement",
        why: "Shows what you still owe on your home.",
        category: "Financial",
        docIds: [],
      });
    }
    if (asset.kind === "retirement") {
      items.push({
        key: `retirement-${i}`,
        title: `Latest statement for your ${asset.label}`,
        why: "The IRS asks about retirement savings. We'll explain your options before anything is decided.",
        category: "Financial",
        docIds: [],
      });
    }
  }

  return items;
}
