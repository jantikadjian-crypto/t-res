import { governancePolicies, type GovernancePolicy, type GovernanceStatus, type Tone } from "@/lib/mockData";

// Shared labels for the PLCY views. Written from Chris's side: "you" is the EA.
export const governanceStatus: Record<GovernanceStatus, { tone: Tone; label: string }> = {
  pending: { tone: "warn", label: "Waiting for you" },
  "auto-approved": { tone: "neutral", label: "Auto-approved by policy" },
  approved: { tone: "good", label: "Approved by you" },
  "changes-requested": { tone: "warn", label: "Changes requested" },
};

export const outcomeTone: Record<GovernancePolicy["outcome"], Tone> = {
  "Auto-approve": "good",
  "Route to EA": "warn",
  "Same-day EA": "bad",
};

export const policyFor = (id: string) => governancePolicies.find((p) => p.id === id);
