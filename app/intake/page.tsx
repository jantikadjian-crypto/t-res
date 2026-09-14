import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ComingNext, PageHeader } from "@/components/page-header";
import { formatDate } from "@/lib/format";
import { intakeAnswers, taxpayer } from "@/lib/mockData";

// The seven steps from docs/intake-wizard-scope.md. The wizard itself is not built yet.
const steps = [
  { title: "Upload your notice", detail: "We read the letter and explain it in plain English." },
  { title: "Your situation", detail: "What's going on, unfiled years, and how you earn money." },
  { title: "Authorization", detail: "Let us see your IRS records and speak for you." },
  { title: "Money snapshot", detail: "Income, monthly costs, and what you own." },
  { title: "Your document checklist", detail: "Only the paperwork your case needs." },
  { title: "Your assessment", detail: "Our recommended path and what we ruled out." },
  { title: "Choose your path", detail: "Three options, one recommended." },
];

export default function IntakePage() {
  return (
    <>
      <PageHeader
        title="Get Started"
        description="A few short questions to set up your case, one at a time."
      />
      <div className="space-y-6">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Seven steps, about 10 minutes</CardTitle>
            <CardDescription>
              {taxpayer.firstName} finished these on {formatDate(intakeAnswers.submittedOn)}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {steps.map((s, i) => (
                <li key={s.title} className="flex gap-3 rounded-lg border p-3">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" aria-hidden />
                  <div>
                    <p className="text-sm font-medium">
                      {i + 1}. {s.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{s.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
        <ComingNext>
          The step-by-step wizard is being scoped. Once the scope is approved, each step becomes its own screen.
        </ComingNext>
      </div>
    </>
  );
}
