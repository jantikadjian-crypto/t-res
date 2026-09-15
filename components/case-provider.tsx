"use client";

import { createContext, use, useCallback, useMemo, useState } from "react";
import {
  actionItems as seedActions,
  documentNotes,
  documents as seedDocuments,
  escalationPlan,
  governanceItems as seedGovernance,
  laterDocuments,
  laterGovernanceItems,
  laterNotices,
  MOCK_TODAY,
  notices as seedNotices,
  subscription,
  type ActionItem,
  type CaseDocument,
  type DocumentNote,
  type GovernanceItem,
  type Lane,
  type Notice,
  type PlanStatus,
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

export type PlanState = {
  planId: string;
  status: PlanStatus;
  changedOn?: string;
  resumesOn?: string;
  cancelReason?: string;
  // Set when the taxpayer switched plans this session; the EA confirms it.
  switchedFrom?: string;
};

type Completion = { completedOn: string; uploadedFile?: string };
type GovernanceDecision = { status: "approved" | "changes-requested"; decidedOn: string; note?: string };
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
  notices: Notice[];
  openNotices: Notice[];
  // PLCY governance: AI actions and Chris's decisions on them (demo: made in the PLCY view).
  governance: GovernanceItem[];
  decideGovernance: (id: string, status: GovernanceDecision["status"], note?: string) => void;
  undoGovernance: (id: string) => void;
  // Self-serve (Guided plan) or represented by Chris. A final levy notice escalates a self-serve case.
  lane: Lane;
  escalatedOn: string | null;
  escalate: () => void;
  signatures: Record<string, SignatureRecord>;
  recordSignature: (record: SignatureRecord) => void;
  plan: PlanState;
  cancelPlan: (reason?: string) => void;
  pausePlan: () => void;
  resumePlan: () => void;
  switchPlan: (planId: string) => void;
};

const CaseContext = createContext<CaseContextValue | null>(null);

// One place for everything the taxpayer changes during a session: uploads, notes, finished
// to-dos, signatures and their plan. Lives in the root layout so every page agrees.
// React state only (v1).
export function CaseProvider({ children }: { children: React.ReactNode }) {
  const [docs, setDocs] = useState<CaseDocument[]>(seedDocuments);
  const [notes, setNotes] = useState<Record<string, DocumentNote[]>>(documentNotes);
  const [completions, setCompletions] = useState<Record<string, Completion>>({});
  const [signatures, setSignatures] = useState<Record<string, SignatureRecord>>({});
  const [plan, setPlan] = useState<PlanState>({ planId: subscription.planId, status: "active" });
  const [decisions, setDecisions] = useState<Record<string, GovernanceDecision>>({});
  const [escalatedOn, setEscalatedOn] = useState<string | null>(null);

  // The Guided plan is the self-serve lane, unless something only an EA can handle moved the case to Chris.
  const lane: Lane = escalatedOn ? "represented" : plan.planId === "guided" ? "self-serve" : "represented";

  // Demo trigger: an LT11 arrives while the taxpayer is self-serve. The letter joins the case, PLCY routes
  // it to Chris for the same day, and the case switches to represented (Form 2848 is due today).
  const escalate = useCallback(() => {
    setEscalatedOn((on) => on ?? MOCK_TODAY);
    setDocs((prev) => [...laterDocuments.filter((d) => !prev.some((p) => p.id === d.id)), ...prev]);
  }, []);

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

  const cancelPlan = useCallback(
    (reason?: string) => setPlan((p) => ({ ...p, status: "canceled", changedOn: MOCK_TODAY, resumesOn: undefined, cancelReason: reason })),
    []
  );
  const pausePlan = useCallback(
    () => setPlan((p) => ({ ...p, status: "paused", changedOn: MOCK_TODAY, resumesOn: subscription.pauseResumesOn })),
    []
  );
  const resumePlan = useCallback(
    () => setPlan((p) => ({ ...p, status: "active", changedOn: MOCK_TODAY, resumesOn: undefined, cancelReason: undefined })),
    []
  );
  const switchPlan = useCallback(
    (planId: string) =>
      setPlan((p) => ({
        planId,
        status: "active",
        changedOn: MOCK_TODAY,
        switchedFrom: planId === subscription.planId ? undefined : (p.switchedFrom ?? p.planId),
      })),
    []
  );

  // To-dos finished so far (in the data, or this session). Some items only appear after another is done.
  const doneIds = useMemo(
    () => new Set([...seedActions.filter((a) => a.done).map((a) => a.id), ...Object.keys(completions)]),
    [completions]
  );

  // Only this lane's to-dos. After an escalation, signing Form 2848 is about the LT11 and due today.
  const actions = useMemo(
    () =>
      seedActions
        .filter((a) => (!a.lane || a.lane === lane) && (!a.after || doneIds.has(a.after)))
        .map((a) =>
          escalatedOn && a.id === escalationPlan.signActionId
            ? { ...a, dueBy: escalatedOn, why: escalationPlan.signWhy, relatedNoticeId: escalationPlan.noticeId }
            : a
        )
        .map((a) => {
          const c = completions[a.id];
          return c ? { ...a, done: true, completedOn: c.completedOn, uploadedFile: c.uploadedFile ?? a.uploadedFile } : a;
        }),
    [completions, lane, escalatedOn, doneIds]
  );

  const visibleDocs = useMemo(
    () => docs.filter((d) => (!d.lane || d.lane === lane) && (!d.after || doneIds.has(d.after))),
    [docs, lane, doneIds]
  );

  const openActions = useMemo(
    () => actions.filter((a) => !a.done).sort((a, b) => a.dueBy.localeCompare(b.dueBy)),
    [actions]
  );

  // A notice needs action until every to-do tied to it is done. Then it's ours to handle.
  const notices = useMemo(
    () =>
      [...seedNotices, ...(escalatedOn ? laterNotices : [])].map((n) => {
        const related = actions.filter((a) => a.relatedNoticeId === n.id);
        return n.status === "action-needed" && related.length > 0 && related.every((a) => a.done)
          ? lane === "self-serve"
            ? { ...n, status: "in-progress" as const, statusLabel: "You've responded", tone: "good" as const }
            : { ...n, status: "in-progress" as const, statusLabel: "We're handling it", tone: "warn" as const }
          : n;
      }),
    [actions, escalatedOn, lane]
  );

  const openNotices = useMemo(
    () => notices.filter((n) => n.status !== "closed").sort((a, b) => a.respondBy.localeCompare(b.respondBy)),
    [notices]
  );

  const decideGovernance = useCallback(
    (id: string, status: GovernanceDecision["status"], note?: string) =>
      setDecisions((prev) => ({ ...prev, [id]: { status, decidedOn: MOCK_TODAY, note } })),
    []
  );
  const undoGovernance = useCallback(
    (id: string) => setDecisions((prev) => Object.fromEntries(Object.entries(prev).filter(([key]) => key !== id))),
    []
  );

  // Live checks (e.g. "Form 2848 signed") follow the documents in this session.
  const governance = useMemo(
    () =>
      [...seedGovernance, ...(escalatedOn ? laterGovernanceItems : [])]
        .filter((g) => (!g.lane || g.lane === lane) && (!g.showsAfter || doneIds.has(g.showsAfter)))
        .map((g) => ({
        ...g,
        ...decisions[g.id],
        checks: g.checks.map((c) =>
          c.signedDocId ? { ...c, passed: docs.some((d) => d.id === c.signedDocId && d.status === "on-file") } : c
        ),
      })),
    [decisions, docs, escalatedOn, lane, doneIds]
  );

  return (
    <CaseContext
      value={{
        docs: visibleDocs,
        notesFor,
        addDocuments,
        attachFile,
        addNote,
        editNote,
        deleteNote,
        actions,
        openActions,
        completeAction,
        notices,
        openNotices,
        governance,
        decideGovernance,
        undoGovernance,
        lane,
        escalatedOn,
        escalate,
        signatures,
        recordSignature,
        plan,
        cancelPlan,
        pausePlan,
        resumePlan,
        switchPlan,
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
