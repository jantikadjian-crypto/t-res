// The practice's document library: every client's paperwork in one list.
// Jordan's documents are live (CaseProvider); every other client's are static mock data.
// The taxpayer's own view of the same files is components/documents — this is the professional's.
import {
  documents as jordanDocuments,
  laterDocuments as jordanLaterDocuments,
  proClientDetails,
  proClients,
  proDocumentRequests,
  taxpayer,
  type CaseDocument,
  type Tone,
} from "@/lib/mockData";

export const JORDAN_ID = "jordan";
const jordanName = `${taxpayer.firstName} ${taxpayer.lastName}`;

// From the practice's point of view: whose move is it?
export type ProDocStatus = "on-file" | "waiting-signature" | "waiting-upload" | "draft" | "in-review";

export const proDocStatusMeta: Record<ProDocStatus, { tone: Tone; label: string; waiting: boolean }> = {
  "on-file": { tone: "good", label: "On file", waiting: false },
  "waiting-signature": { tone: "bad", label: "Waiting on signature", waiting: true },
  "waiting-upload": { tone: "warn", label: "Waiting on client", waiting: true },
  draft: { tone: "warn", label: "Draft with client", waiting: true },
  "in-review": { tone: "neutral", label: "In review", waiting: false },
};

export type ProDocumentSource = "Client" | "T-Res" | "IRS";

export type ProDocument = {
  // Client and document in one id, safe as a file name for the static build.
  id: string;
  clientId: string;
  client: string;
  name: string;
  source: ProDocumentSource;
  addedOn: string;
  status: ProDocStatus;
  category?: string;
  taxYear?: number;
  summary?: string;
  why?: string;
  // Only Jordan's: the live case document behind this row, which carries the shared notes thread.
  caseDocId?: string;
};

const clientName = (id: string) => proClients.find((c) => c.id === id)?.name ?? id;

const caseStatus: Record<CaseDocument["status"], ProDocStatus> = {
  "on-file": "on-file",
  "needs-signature": "waiting-signature",
  requested: "waiting-upload",
  draft: "draft",
  "in-review": "in-review",
};

// The taxpayer's "You" is the client from this side.
const caseSource: Record<CaseDocument["source"], ProDocumentSource> = { You: "Client", "T-Res": "T-Res", IRS: "IRS" };

function fromCaseDocument(doc: CaseDocument): ProDocument {
  return {
    id: `${JORDAN_ID}__${doc.id}`,
    clientId: JORDAN_ID,
    client: jordanName,
    name: doc.name,
    source: caseSource[doc.source],
    addedOn: doc.addedOn,
    status: caseStatus[doc.status],
    category: doc.category,
    taxYear: doc.taxYear,
    summary: doc.summary,
    caseDocId: doc.id,
  };
}

/** Everything that doesn't move during a visit: the fictional clients' files and open requests. */
export function staticProDocuments(): ProDocument[] {
  const filed = Object.entries(proClientDetails).flatMap(([clientId, detail]) =>
    detail.documents.map<ProDocument>((d, i) => ({
      id: `${clientId}__doc-${i}`,
      clientId,
      client: clientName(clientId),
      name: d.name,
      source: d.source,
      addedOn: d.date,
      status: "on-file",
    }))
  );
  const requested = proDocumentRequests.map<ProDocument>((r, i) => ({
    id: `${r.clientId}__req-${i}`,
    clientId: r.clientId,
    client: clientName(r.clientId),
    name: r.name,
    source: "T-Res",
    addedOn: r.requestedOn,
    status: r.needs === "signature" ? "waiting-signature" : "waiting-upload",
    why: r.why,
  }));
  return [...filed, ...requested];
}

const byNewest = (a: ProDocument, b: ProDocument) => b.addedOn.localeCompare(a.addedOn) || a.client.localeCompare(b.client);

/** The whole library. Pass the live docs from useCase() so Jordan's rows follow the case. */
export function allProDocuments(caseDocs: CaseDocument[]): ProDocument[] {
  return [...caseDocs.map(fromCaseDocument), ...staticProDocuments()].sort(byNewest);
}

/** Every id the library can show, including documents that only arrive after an escalation. */
export function proDocumentIds(): string[] {
  return [
    ...[...jordanDocuments, ...jordanLaterDocuments].map((d) => `${JORDAN_ID}__${d.id}`),
    ...staticProDocuments().map((d) => d.id),
  ];
}

/** Named for breadcrumbs and search without needing the live case. */
export function proDocumentName(id: string): string | undefined {
  const jordanDoc = [...jordanDocuments, ...jordanLaterDocuments].find((d) => `${JORDAN_ID}__${d.id}` === id);
  if (jordanDoc) return jordanDoc.name;
  return staticProDocuments().find((d) => d.id === id)?.name;
}

export const isWaiting = (d: ProDocument) => proDocStatusMeta[d.status].waiting;
