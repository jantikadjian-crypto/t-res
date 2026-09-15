"use client";

import { AlertTriangle } from "lucide-react";
import { ChoiceCard, ChoiceGroup } from "@/components/intake/choice";
import { useIntake } from "@/components/intake/intake-provider";
import { enrolledAgent } from "@/lib/mockData";

export function LevyScreen() {
  const { state, update } = useIntake();

  return (
    <div className="space-y-4">
      <ChoiceGroup label="Has the IRS taken money or contacted your employer?">
        <ChoiceCard
          checked={state.moneyTakenOrEmployerContacted === true}
          onClick={() => update({ moneyTakenOrEmployerContacted: true })}
          title="Yes"
          description="Money was taken from a paycheck or bank account, or the IRS wrote to my employer."
          danger
        />
        <ChoiceCard
          checked={state.moneyTakenOrEmployerContacted === false}
          onClick={() => update({ moneyTakenOrEmployerContacted: false })}
          title="No"
          description="Nothing has been taken, just letters so far."
        />
      </ChoiceGroup>

      {state.moneyTakenOrEmployerContacted === true && (
        <div role="alert" className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden />
          <p>
            <span className="font-medium text-red-900">{enrolledAgent.name} will review your case today.</span> Continue
            to the next step so he can contact the IRS for you.
          </p>
        </div>
      )}
    </div>
  );
}
