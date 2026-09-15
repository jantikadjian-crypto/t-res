"use client";

import { useState } from "react";
import { AlertTriangle, ArrowLeft, CheckCircle2, PauseCircle, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useCase } from "@/components/case-provider";
import { textareaClass } from "@/components/form";
import { ChoiceCard, ChoiceGroup } from "@/components/intake/choice";
import { LinkButton } from "@/components/link-button";
import { billingSummary } from "@/components/settings/billing-overview";
import { daysRemainingLabel, formatDate, formatMoney } from "@/lib/format";
import { account, caseNumber, enrolledAgent, MOCK_TODAY, nextNotice, resolutionPlans, subscription } from "@/lib/mockData";

const REASONS = [
  "It costs too much",
  "I'll handle it myself",
  "I found another tax professional",
  "My situation changed",
  "Something else",
];

const STEPS = ["Before you cancel", "Why you're leaving", "Confirm"];

// Cancelling must be as easy as signing up: three short steps, the reason is optional,
// and every alternative is a choice, never a hurdle.
export function CancelFlow() {
  const { plan, cancelPlan, pausePlan, resumePlan, switchPlan } = useCase();
  const [step, setStep] = useState(0);
  const [reason, setReason] = useState<string | null>(null);
  const [details, setDetails] = useState("");
  const [understood, setUnderstood] = useState(false);
  const [alternative, setAlternative] = useState<"paused" | "switched" | null>(null);
  const { current, paid, remaining } = billingSummary(plan.planId);
  const guided = resolutionPlans.find((p) => p.id === "guided");
  const guidedLeft = guided ? Math.max(0, guided.price - paid) : 0;
  const confirmation = `CXL-${caseNumber.split("-").pop()}-${MOCK_TODAY.slice(5).replace("-", "")}`;

  if (plan.status === "canceled") {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardContent className="space-y-5">
          <div className="flex gap-3">
            <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-green-600" aria-hidden />
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Your plan is canceled</h2>
              <p className="text-sm text-muted-foreground">
                Effective {formatDate(plan.changedOn ?? MOCK_TODAY)}. Confirmation number{" "}
                <span className="font-mono text-foreground">{confirmation}</span>. We&apos;ve emailed a copy to {account.email}.
              </p>
            </div>
          </div>
          <ul className="space-y-2 text-sm">
            <li>• You won&apos;t be charged again. The remaining {formatMoney(remaining)} is canceled.</li>
            <li>• {enrolledAgent.name} will tell the IRS he no longer represents you.</li>
            <li>• You can still see your documents and notes for 12 months.</li>
          </ul>
          <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden />
            Your {nextNotice.code} response is still due {formatDate(nextNotice.respondBy)} ({daysRemainingLabel(nextNotice.respondBy)}).
          </div>
        </CardContent>
        <CardFooter className="flex-wrap justify-between gap-2">
          <Button variant="outline" onClick={resumePlan}>
            Changed your mind? Restart my plan
          </Button>
          <LinkButton href="/settings/billing">Back to billing</LinkButton>
        </CardFooter>
      </Card>
    );
  }

  if (alternative) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardContent className="flex gap-3">
          <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-green-600" aria-hidden />
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">
              {alternative === "paused" ? "Payments paused" : `You're now on ${guided?.name}`}
            </h2>
            <p className="text-sm text-muted-foreground">
              {alternative === "paused"
                ? `Nothing is charged until ${formatDate(subscription.pauseResumesOn)}, and ${enrolledAgent.name} keeps working on your case.`
                : `You have ${formatMoney(guidedLeft)} left to pay. ${enrolledAgent.name} will confirm the change within one business day.`}
            </p>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <LinkButton href="/settings/billing">Back to billing</LinkButton>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <ol className="grid grid-cols-3 gap-2" aria-label="Cancel steps">
        {STEPS.map((s, i) => (
          <li key={s} aria-current={i === step ? "step" : undefined} className="space-y-2">
            <div className={i < step ? "h-1 rounded-full bg-green-500" : i === step ? "h-1 rounded-full bg-primary" : "h-1 rounded-full bg-secondary"} />
            <p className={i === step ? "text-xs font-medium" : "text-xs text-muted-foreground"}>{s}</p>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-lg">Before you cancel {current.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div role="alert" className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden />
              <p>
                <span className="font-medium text-red-900">
                  Your {nextNotice.code} response is due {formatDate(nextNotice.respondBy)} ({daysRemainingLabel(nextNotice.respondBy)}).
                </span>{" "}
                If you cancel, you&apos;ll need to respond to the IRS yourself.
              </p>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">What changes if you cancel today</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• {enrolledAgent.name} stops work on your case and tells the IRS he no longer represents you.</li>
                <li>• You won&apos;t be charged again. The remaining {formatMoney(remaining)} is canceled.</li>
                <li>• The {formatMoney(paid)} you&apos;ve paid covers the work already done.</li>
                <li>• You keep access to your documents and notes for 12 months.</li>
              </ul>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium">If money is the problem, these might help</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-3 rounded-xl border p-4">
                  <PauseCircle className="size-5 text-primary" aria-hidden />
                  <div>
                    <p className="text-sm font-medium">Pause payments for 30 days</p>
                    <p className="text-xs text-muted-foreground">{enrolledAgent.name} keeps working. Nothing charged until {formatDate(subscription.pauseResumesOn)}.</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-auto w-fit"
                    onClick={() => {
                      pausePlan();
                      setAlternative("paused");
                    }}
                  >
                    Pause instead
                  </Button>
                </div>
                {guided && plan.planId !== "guided" && (
                  <div className="flex flex-col gap-3 rounded-xl border p-4">
                    <Repeat className="size-5 text-primary" aria-hidden />
                    <div>
                      <p className="text-sm font-medium">Switch to {guided.name}</p>
                      <p className="text-xs text-muted-foreground">
                        We prepare everything, you submit it. {formatMoney(guidedLeft)} left after what you&apos;ve paid.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-auto w-fit"
                      onClick={() => {
                        switchPlan("guided");
                        setAlternative("switched");
                      }}
                    >
                      Switch instead
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-wrap justify-between gap-2">
            <LinkButton href="/settings/billing" variant="ghost">
              <ArrowLeft aria-hidden />
              Keep my plan
            </LinkButton>
            <Button variant="outline" onClick={() => setStep(1)}>
              Continue to cancel
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-lg">Can you tell us why? (optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ChoiceGroup label="Why are you cancelling?">
              {REASONS.map((r) => (
                <ChoiceCard key={r} checked={reason === r} onClick={() => setReason(r)} title={r} />
              ))}
            </ChoiceGroup>
            <div className="space-y-1.5">
              <label htmlFor="cancel-details" className="text-sm font-medium">
                Anything else you&apos;d like us to know?
              </label>
              <textarea
                id="cancel-details"
                rows={3}
                maxLength={1000}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className={textareaClass}
              />
            </div>
          </CardContent>
          <CardFooter className="flex-wrap justify-between gap-2">
            <Button variant="ghost" onClick={() => setStep(0)}>
              <ArrowLeft aria-hidden />
              Back
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep(2)}>
                Skip
              </Button>
              <Button variant="outline" onClick={() => setStep(2)}>
                Continue
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-lg">Confirm cancellation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)] gap-x-6 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Plan</dt>
              <dd>{current.name}</dd>
              <dt className="text-muted-foreground">Ends</dt>
              <dd>Today, {formatDate(MOCK_TODAY)}</dd>
              <dt className="text-muted-foreground">Future payments</dt>
              <dd>{formatMoney(remaining)}, canceled</dd>
              {reason && (
                <>
                  <dt className="text-muted-foreground">Reason</dt>
                  <dd>{reason}</dd>
                </>
              )}
            </dl>
            <label htmlFor="cancel-understand" className="flex items-start gap-3 rounded-lg bg-accent/60 p-3 text-sm">
              <input
                id="cancel-understand"
                type="checkbox"
                checked={understood}
                onChange={(e) => setUnderstood(e.target.checked)}
                className="mt-0.5 size-4 accent-primary"
              />
              I understand {enrolledAgent.name} will stop working on my case, and I&apos;ll deal with the IRS myself, including my{" "}
              {nextNotice.code} response.
            </label>
          </CardContent>
          <CardFooter className="flex-wrap justify-between gap-2">
            <Button variant="ghost" onClick={() => setStep(1)}>
              <ArrowLeft aria-hidden />
              Back
            </Button>
            <Button
              variant="destructive"
              disabled={!understood}
              onClick={() => cancelPlan([reason, details.trim()].filter(Boolean).join(": ") || undefined)}
            >
              Cancel my plan
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
