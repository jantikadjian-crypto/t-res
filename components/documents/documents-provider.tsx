"use client";

import { createContext, use, useCallback, useState } from "react";
import {
  documentNotes,
  documents as seedDocuments,
  MOCK_TODAY,
  type CaseDocument,
  type DocumentNote,
} from "@/lib/mockData";

type DocumentsContextValue = {
  docs: CaseDocument[];
  notesFor: (docId: string) => DocumentNote[];
  addDocuments: (added: CaseDocument[]) => void;
  attachFile: (docId: string, file: { name: string; sizeKb: number }) => void;
  addNote: (docId: string, text: string) => void;
  editNote: (docId: string, noteId: string, text: string) => void;
  deleteNote: (docId: string, noteId: string) => void;
};

const DocumentsContext = createContext<DocumentsContextValue | null>(null);

// Lives in app/(app)/documents/layout.tsx, so uploads and notes survive moving between
// the library and a document's page. React state only (no localStorage in v1).
export function DocumentsProvider({ children }: { children: React.ReactNode }) {
  const [docs, setDocs] = useState<CaseDocument[]>(seedDocuments);
  const [notes, setNotes] = useState<Record<string, DocumentNote[]>>(documentNotes);

  const notesFor = useCallback((docId: string) => notes[docId] ?? [], [notes]);

  const addDocuments = useCallback((added: CaseDocument[]) => setDocs((prev) => [...added, ...prev]), []);

  // Uploading a requested document, or replacing one of yours, puts it back into review.
  const attachFile = useCallback(
    (docId: string, file: { name: string; sizeKb: number }) =>
      setDocs((prev) =>
        prev.map((d) =>
          d.id === docId ? { ...d, fileName: file.name, sizeKb: file.sizeKb, addedOn: MOCK_TODAY, status: "in-review" } : d
        )
      ),
    []
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

  return (
    <DocumentsContext value={{ docs, notesFor, addDocuments, attachFile, addNote, editNote, deleteNote }}>
      {children}
    </DocumentsContext>
  );
}

export function useDocuments(): DocumentsContextValue {
  const ctx = use(DocumentsContext);
  if (!ctx) throw new Error("useDocuments must be used inside <DocumentsProvider>");
  return ctx;
}
