"use client";

import { ChoiceCard, ChoiceGroup } from "@/components/intake/choice";
import { useIntake } from "@/components/intake/intake-provider";
import type { IntakeState } from "@/lib/intakeScreens";
import { cn } from "@/lib/utils";

const YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025];

const answers: { value: NonNullable<IntakeState["unfiledAnswer"]>; title: string; description: string }[] = [
  { value: "some", title: "Yes, some years", description: "Pick the years below." },
  { value: "none", title: "No, I've filed every year", description: "Great, that keeps more options open." },
  { value: "not-sure", title: "I'm not sure", description: "That's fine. We'll check your IRS records." },
];

export function UnfiledScreen() {
  const { state, update } = useIntake();

  const toggleYear = (year: number) =>
    update({
      unfiledYears: state.unfiledYears.includes(year)
        ? state.unfiledYears.filter((y) => y !== year)
        : [...state.unfiledYears, year].sort(),
    });

  return (
    <div className="space-y-6">
      <ChoiceGroup label="Are there any years you haven't filed?">
        {answers.map((a) => (
          <ChoiceCard
            key={a.value}
            checked={state.unfiledAnswer === a.value}
            onClick={() =>
              update({ unfiledAnswer: a.value, unfiledYears: a.value === "some" ? state.unfiledYears : [] })
            }
            title={a.title}
            description={a.description}
          />
        ))}
      </ChoiceGroup>

      {state.unfiledAnswer === "some" && (
        <div className="space-y-3">
          <p className="text-sm font-medium" id="unfiled-years-label">
            Which years haven&apos;t you filed?
          </p>
          <div role="group" aria-labelledby="unfiled-years-label" className="flex flex-wrap gap-2">
            {YEARS.map((year) => {
              const on = state.unfiledYears.includes(year);
              return (
                <button
                  key={year}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleYear(year)}
                  className={cn(
                    "h-10 min-w-20 rounded-lg border px-4 text-sm font-medium tabular-nums transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    on ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-accent"
                  )}
                >
                  {year}
                </button>
              );
            })}
          </div>
          {state.unfiledYears.length === 0 && (
            <p className="text-xs text-muted-foreground">Pick at least one year, or choose &ldquo;I&apos;m not sure&rdquo;.</p>
          )}
        </div>
      )}
    </div>
  );
}
