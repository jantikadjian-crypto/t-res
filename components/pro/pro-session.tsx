"use client";

import { createContext, use, useCallback, useState } from "react";
import { MOCK_TODAY } from "@/lib/mockData";

type ProSession = { email: string; signedInOn: string };

type ProSessionValue = {
  session: ProSession | null;
  // True right after signing out, so the sign-in page can say so.
  justSignedOut: boolean;
  signIn: (email: string) => void;
  signOut: () => void;
  // What the professional finished this visit on fictional clients (Jordan's decisions live in CaseProvider/PLCY):
  // items done or approved, and approvals sent back to T-Res with a note.
  doneIds: string[];
  markDone: (id: string) => void;
  sentBack: Record<string, string>;
  sendBack: (id: string, note: string) => void;
  undoItem: (id: string) => void;
};

const ProSessionContext = createContext<ProSessionValue | null>(null);

// T-Res Pro sign-in is a mock (v1 has no real accounts): the session lives in React state for this visit only,
// so a refresh signs you out. Mounted in the root layout so it survives switching to the taxpayer app and back.
export function ProSessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<ProSession | null>(null);
  const [justSignedOut, setJustSignedOut] = useState(false);
  const [doneIds, setDoneIds] = useState<string[]>([]);
  const [sentBack, setSentBack] = useState<Record<string, string>>({});

  const signIn = useCallback((email: string) => {
    setSession({ email, signedInOn: MOCK_TODAY });
    setJustSignedOut(false);
  }, []);

  const signOut = useCallback(() => {
    setSession(null);
    setJustSignedOut(true);
  }, []);

  const markDone = useCallback((id: string) => setDoneIds((prev) => (prev.includes(id) ? prev : [...prev, id])), []);
  const sendBack = useCallback((id: string, note: string) => setSentBack((prev) => ({ ...prev, [id]: note })), []);
  const undoItem = useCallback((id: string) => {
    setDoneIds((prev) => prev.filter((d) => d !== id));
    setSentBack((prev) => Object.fromEntries(Object.entries(prev).filter(([key]) => key !== id)));
  }, []);

  return (
    <ProSessionContext value={{ session, justSignedOut, signIn, signOut, doneIds, markDone, sentBack, sendBack, undoItem }}>
      {children}
    </ProSessionContext>
  );
}

export function useProSession(): ProSessionValue {
  const ctx = use(ProSessionContext);
  if (!ctx) throw new Error("useProSession must be used inside <ProSessionProvider>");
  return ctx;
}
