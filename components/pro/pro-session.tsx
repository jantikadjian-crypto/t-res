"use client";

import { createContext, use, useCallback, useState } from "react";
import { MOCK_TODAY, proSubscription, proTeam, type ProTeamMember } from "@/lib/mockData";

type ProSession = { email: string; signedInOn: string };

// The firm's subscription this visit. Display-only, like the taxpayer's plan: no payments, no card entry.
export type ProPlanState = { planId: string; status: "active" | "canceled"; changedOn?: string; switchedFrom?: string };

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
  // Settings: the firm plan and who's on the team, so billing and Firm & team agree on seats.
  proPlan: ProPlanState;
  switchProPlan: (planId: string) => void;
  cancelProPlan: () => void;
  resumeProPlan: () => void;
  // Reminders sent to fictional clients this visit, by document id. Jordan's live in CaseProvider,
  // because the taxpayer app has to see them.
  proReminders: Record<string, string>;
  sendProReminder: (documentId: string) => void;
  team: ProTeamMember[];
  inviteMember: (member: { name: string; email: string; role: ProTeamMember["role"] }) => void;
  removeMember: (id: string) => void;
};

const ProSessionContext = createContext<ProSessionValue | null>(null);

// T-Res Pro sign-in is a mock (v1 has no real accounts): the session lives in React state for this visit only,
// so a refresh signs you out. Mounted in the root layout so it survives switching to the taxpayer app and back.
export function ProSessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<ProSession | null>(null);
  const [justSignedOut, setJustSignedOut] = useState(false);
  const [doneIds, setDoneIds] = useState<string[]>([]);
  const [sentBack, setSentBack] = useState<Record<string, string>>({});
  const [proPlan, setProPlan] = useState<ProPlanState>({ planId: proSubscription.planId, status: "active" });
  const [team, setTeam] = useState<ProTeamMember[]>(proTeam);
  const [proReminders, setProReminders] = useState<Record<string, string>>({});

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

  const switchProPlan = useCallback((planId: string) => {
    setProPlan((prev) => ({
      planId,
      status: "active",
      changedOn: MOCK_TODAY,
      switchedFrom: prev.planId === planId ? prev.switchedFrom : prev.planId,
    }));
  }, []);
  const cancelProPlan = useCallback(() => setProPlan((prev) => ({ ...prev, status: "canceled", changedOn: MOCK_TODAY })), []);
  const resumeProPlan = useCallback(() => setProPlan((prev) => ({ ...prev, status: "active", changedOn: MOCK_TODAY })), []);

  const sendProReminder = useCallback(
    (documentId: string) => setProReminders((prev) => ({ ...prev, [documentId]: MOCK_TODAY })),
    []
  );

  const inviteMember = useCallback((member: { name: string; email: string; role: ProTeamMember["role"] }) => {
    setTeam((prev) => [...prev, { id: `invite-${prev.length + 1}`, ...member, status: "Invited" }]);
  }, []);
  const removeMember = useCallback((id: string) => setTeam((prev) => prev.filter((m) => m.id !== id)), []);

  return (
    <ProSessionContext
      value={{
        session,
        justSignedOut,
        signIn,
        signOut,
        doneIds,
        markDone,
        sentBack,
        sendBack,
        undoItem,
        proPlan,
        switchProPlan,
        cancelProPlan,
        resumeProPlan,
        proReminders,
        sendProReminder,
        team,
        inviteMember,
        removeMember,
      }}
    >
      {children}
    </ProSessionContext>
  );
}

export function useProSession(): ProSessionValue {
  const ctx = use(ProSessionContext);
  if (!ctx) throw new Error("useProSession must be used inside <ProSessionProvider>");
  return ctx;
}
