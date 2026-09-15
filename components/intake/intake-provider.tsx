"use client";

import { createContext, use, useCallback, useState } from "react";
import { initialIntakeState, type IntakeState } from "@/lib/intakeScreens";

type IntakeContextValue = {
  state: IntakeState;
  update: (patch: Partial<IntakeState>) => void;
  replayBannerOpen: boolean;
  dismissReplayBanner: () => void;
};

const IntakeContext = createContext<IntakeContextValue | null>(null);

// Lives in the wizard layout, which doesn't remount between screens, so answers
// survive Back/Continue. Seeded with Jordan's answers (replayable wizard).
export function IntakeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<IntakeState>(initialIntakeState);
  const [replayBannerOpen, setReplayBannerOpen] = useState(true);
  const update = useCallback((patch: Partial<IntakeState>) => setState((s) => ({ ...s, ...patch })), []);
  const dismissReplayBanner = useCallback(() => setReplayBannerOpen(false), []);

  return (
    <IntakeContext value={{ state, update, replayBannerOpen, dismissReplayBanner }}>{children}</IntakeContext>
  );
}

export function useIntake(): IntakeContextValue {
  const ctx = use(IntakeContext);
  if (!ctx) throw new Error("useIntake must be used inside <IntakeProvider>");
  return ctx;
}
