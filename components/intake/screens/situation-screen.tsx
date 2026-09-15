"use client";

import { ChoiceCard, ChoiceGroup } from "@/components/intake/choice";
import { useIntake } from "@/components/intake/intake-provider";
import { EMERGENCY_SITUATION, SITUATION_OPTIONS } from "@/lib/intakeScreens";

export function SituationScreen() {
  const { state, update } = useIntake();

  return (
    <ChoiceGroup label="What best describes you right now?">
      {SITUATION_OPTIONS.map((o) => (
        <ChoiceCard
          key={o.value}
          checked={state.situation === o.value}
          onClick={() => update({ situation: o.value })}
          title={o.value}
          description={o.description}
          danger={o.value === EMERGENCY_SITUATION}
        />
      ))}
    </ChoiceGroup>
  );
}
