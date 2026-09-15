"use client";

import { createContext, use, useCallback, useMemo, useState } from "react";
import {
  actionItems as seedActions,
  documentNotes,
  documents as seedDocuments,
  MOCK_TODAY,
  type ActionItem,
  type CaseDocument,
  type DocumentNote,
} from "@/lib/mockData";

export type SignatureRecord = {
  docId: string;
  documentName: string;
  signerName: string;
  method: "typed" | "drawn";
  typedName?: string;
  drawing?: string; // PNG data URL
  signedAt: string;
  identityMethod: string;
  device: string;
  ipAddress: string;
  fingerprint: string; // SHA-256 of what was signed
  audit: { label: string; at: string }[];
};

type Completion = { completedOn: string; uploadedFile?: string };
type UploadedFile = { name: string; sizeKb: number };

type CaseContextValue = {
  docs: CaseDocument[];
  notesFor: (docId: string) => DocumentNote[];
  addDocuments: (added: CaseDocument[]) => void;
  attachFile: (docId: string, file: UploadedFile) => void;
  addNote: (docId: string, text: string) => void;
  editNote: (docId: string, noteId: string, text: string) => void;
  deleteNote: (docId: string, noteId: string) => void;
  actions: ActionItem[];
  openActions: ActionItem[];
  completeAction: (actionId: string, file?: UploadedFile) => void;
  signatures: Record<string, SignatureRecord>;
  recordSignature: (record: SignatureRecord) => void;
};

const CaseContext = createContext<CaseContextValue | null>(null);

// One place for everything the taxpayer changes during a session: uploads, notes, finished
// to-dos and signatures. Lives in the root layout so every page agrees. React state only (v1).
export function CaseProvider({ children }: { children: React.ReactNode }) {
  const [docs, setDocs] = useState<CaseDocument[]>(seedDocuments);
  const [notes, setNotes] = useState<Record<string, DocumentNote[]>>(documentNotes);
  const [completions, setCompletions] = useState<Record<string, Completion>>({});
  const [signatures, setSignatures] = useState<Record<string, SignatureRecord>>({});

  const markDone = useCallback((actionId: string | undefined, uploadedFile?: string) => {
    if (!actionId) return;
    setCompletions((prev) => (prev[actionId] ? prev : { ...prev, [actionId]: { completedOn: MOCK_TODAY, uploadedFile } }));
  }, []);

  const notesFor = useCallback((docId: string) => notes[docId] ?? [], [notes]);

  const addDocuments = useCallback((added: CaseDocument[]) => setDocs((prev) => [...added, ...prev]), []);

  // Uploading a requested document (or replacing one of yours) puts it into review
  // and ticks off its to-do.
  const attachFile = useCallback(
    (docId: string, file: UploadedFile) => {
      setDocs((prev) =>
        prev.map((d) =>
          d.id === docId ? { ...d, fileName: file.name, sizeKb: file.sizeKb, addedOn: MOCK_TODAY, status: "in-review" } : d
        )
      );
      markDone(seedDocuments.find((d) => d.id === docId)?.relatedActionId, file.name);
    },
    [markDone]
  );

  // Finishing a to-do updates the document it's about.
  const completeAction = useCallback(
    (actionId: string, file?: UploadedFile) => {
      markDone(actionId, file?.name);
      const action = seedActions.find((a) => a.id === actionId);
      const doc = seedDocuments.find((d) => d.relatedActionId === actionId);
      if (!action || !doc) return;
      if (action.type === "upload" && file) {
        setDocs((prev) =>
          prev.map((d) =>
            d.id === doc.id ? { ...d, fileName: file.name, sizeKb: file.sizeKb, addedOn: MOCK_TODAY, status: "in-review" } : d
          )
        );
      }
      if (action.type === "approve-letter") {
        setDocs((prev) =>
          prev.map((d) =>
            d.id === doc.id ? { ...d, name: d.name.replace("(draft)", "(approved)"), addedOn: MOCK_TODAY, status: "on-file" } : d
          )
        );
      }
    },
    [markDone]
  );

  const recordSignature = useCallback(
    (record: SignatureRecord) => {
      setSignatures((prev) => ({ ...prev, [record.docId]: record }));
      setDocs((prev) =>
        prev.map((d) =>
          d.id === record.docId
            ? {
                ...d,
                name: d.name.includes("(signed)") ? d.name : d.name.replace(/\.pdf$/i, " (signed).pdf"),
                addedOn: MOCK_TODAY,
                status: "on-file",
              }
            : d
        )
      );
      markDone(seedDocuments.find((d) => d.id === record.docId)?.relatedActionId);
    },
    [markDone]
  );

  const addNote = useCallback((docId: string, text: string) => {
    const note: DocumentNote = { id: `note-${Date.now()}`, author: "you", date: MOCK_TODAY, text };
    setNotes((prev) => ({ ...prev, [docId]: [...(prev[docId] ?? []), note] }));
  }, []);

  const editNote = useCallback(
    (docId: string, noteId: string, text: string) =>
      setNotes((prev) => ({
        ...prev,
        [docId]: (prev[docId] ?? []).map((n) => (n.id === noteId ? { ...n, text, editedOn: MOCK_TODAY } : n)),
      })),
    []
  );

  const deleteNote = useCallback(
    (docId: string, noteId: string) =>
      setNotes((prev) => ({ ...prev, [docId]: (prev[docId] ?? []).filter((n) => n.id !== noteId) })),
    []
  );

  const actions = useMemo(
    () =>
      seedActions.map((a) => {
        const c = completions[a.id];
        return c ? { ...a, done: true, completedOn: c.completedOn, uploadedFile: c.uploadedFile ?? a.uploadedFile } : a;
      }),
    [completions]
  );

  const openActions = useMemo(
    () => actions.filter((a) => !a.done).sort((a, b) => a.dueBy.localeCompare(b.dueBy)),
    [actions]
  );

  return (
    <CaseContext
      value={{
        docs,
        notesFor,
        addDocuments,
        attachFile,
        addNote,
        editNote,
        deleteNote,
        actions,
        openActions,
        completeAction,
        signatures,
        recordSignature,
      }}
    >
      {children}
    </CaseContext>
  );
}

export function useCase(): CaseContextValue {
  const ctx = use(CaseContext);
  if (!ctx) throw new Error("useCase must be used inside <CaseProvider>");
  return ctx;
}
