"use client";

import { createContext, use, useState } from "react";

// What a visitor told us on the public /assessment page. Held in React state (root layout) so the Get Started
// wizard can start from it instead of from the demo client's answers. Nothing is stored or sent in v1.
export type Lead = {
  name: string;
  situation: string;
  owedLabel: string;
  unfiled: "none" | "1-2" | "3+" | "unsure";
  unfiledLabel: string;
  taken: "yes" | "no" | "unsure";
  takenLabel: string;
};

type LeadContextValue = { lead: Lead | null; setLead: (lead: Lead) => void };

const LeadContext = createContext<LeadContextValue | null>(null);

export function LeadProvider({ children }: { children: React.ReactNode }) {
  const [lead, setLead] = useState<Lead | null>(null);
  return <LeadContext value={{ lead, setLead }}>{children}</LeadContext>;
}

export function useLead(): LeadContextValue {
  const ctx = use(LeadContext);
  if (!ctx) throw new Error("useLead must be used inside <LeadProvider>");
  return ctx;
}
