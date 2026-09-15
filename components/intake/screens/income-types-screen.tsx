"use client";

import { ChoiceCard, ChoiceGroup } from "@/components/intake/choice";
import { useIntake } from "@/components/intake/intake-provider";
import { INCOME_TYPE_OPTIONS, NOT_WORKING } from "@/lib/intakeScreens";

export function IncomeTypesScreen() {
  const { state, update } = useIntake();

  // "Not working right now" can't be combined with the others.
  const toggle = (value: string) => {
    const on = state.incomeTypes.includes(value);
    if (on) return update({ incomeTypes: state.incomeTypes.filter((v) => v !== value) });
    if (value === NOT_WORKING) return update({ incomeTypes: [NOT_WORKING] });
    update({ incomeTypes: [...state.incomeTypes.filter((v) => v !== NOT_WORKING), value] });
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Pick all that apply.</p>
      <ChoiceGroup label="How do you earn money?" multiple>
        {INCOME_TYPE_OPTIONS.map((o) => (
          <ChoiceCard
            key={o.value}
            multiple
            checked={state.incomeTypes.includes(o.value)}
            onClick={() => toggle(o.value)}
            title={o.title}
            description={o.description}
          />
        ))}
      </ChoiceGroup>
    </div>
  );
}
