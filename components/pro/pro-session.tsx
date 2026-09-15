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
};

const ProSessionContext = createContext<ProSessionValue | null>(null);

// T-Res Pro sign-in is a mock (v1 has no real accounts): the session lives in React state for this visit only,
// so a refresh signs you out. Mounted in the root layout so it survives switching to the taxpayer app and back.
export function ProSessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<ProSession | null>(null);
  const [justSignedOut, setJustSignedOut] = useState(false);

  const signIn = useCallback((email: string) => {
    setSession({ email, signedInOn: MOCK_TODAY });
    setJustSignedOut(false);
  }, []);

  const signOut = useCallback(() => {
    setSession(null);
    setJustSignedOut(true);
  }, []);

  return <ProSessionContext value={{ session, justSignedOut, signIn, signOut }}>{children}</ProSessionContext>;
}

export function useProSession(): ProSessionValue {
  const ctx = use(ProSessionContext);
  if (!ctx) throw new Error("useProSession must be used inside <ProSessionProvider>");
  return ctx;
}
