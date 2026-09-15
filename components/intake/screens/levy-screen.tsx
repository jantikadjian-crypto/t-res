"use client";

import { AlertTriangle, ArrowRight } from "lucide-react";
import { ChoiceCard, ChoiceGroup } from "@/components/intake/choice";
import { useIntake } from "@/components/intake/intake-provider";
import { LinkButton } from "@/components/link-button";
import { nextSlug } from "@/lib/intakeScreens";
import { enrolledAgent } from "@/lib/mockData";

export function LevyScreen() {
  const { state, update } = useIntake();
  const next = nextSlug("levy", state);

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
        <div role="alert" className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center">
          <div className="flex flex-1 gap-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden />
            <p>
              <span className="font-medium text-red-900">{enrolledAgent.name} will review your case today.</span> The next
              step lets him contact the IRS for you.
            </p>
          </div>
          {next && (
            <LinkButton href={`/intake/${next}`} className="ml-7 w-fit bg-red-600 text-white hover:bg-red-700 sm:ml-0">
              Let {enrolledAgent.name} act for me
              <ArrowRight aria-hidden />
            </LinkButton>
          )}
        </div>
      )}
    </div>
  );
}
