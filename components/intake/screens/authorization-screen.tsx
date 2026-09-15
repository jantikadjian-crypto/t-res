"use client";

import { useState } from "react";
import { CheckCircle2, Eye, MessageSquareText, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/form";
import { ChoiceCard, ChoiceGroup } from "@/components/intake/choice";
import { useIntake } from "@/components/intake/intake-provider";
import { StatusBadge } from "@/components/status";
import { formatDate } from "@/lib/format";
import { isUrgent } from "@/lib/intakeScreens";
import { enrolledAgent, MOCK_TODAY, taxpayerIdentity } from "@/lib/mockData";
import { cn } from "@/lib/utils";

function FormCard({
  icon: Icon,
  form,
  title,
  points,
  status,
  children,
}: {
  icon: typeof Eye;
  form: string;
  title: string;
  points: string[];
  status: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-4 rounded-xl border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent">
            <Icon className="size-5" aria-hidden />
          </span>
          <div>
            <p className="font-mono text-xs text-muted-foreground">{form}</p>
            <p className="font-medium">{title}</p>
          </div>
        </div>
        {status}
      </div>
      <ul className="space-y-1 pl-13 text-sm text-muted-foreground">
        {points.map((p) => (
          <li key={p} className="list-disc">
            {p}
          </li>
        ))}
      </ul>
      {children}
    </div>
  );
}

export function AuthorizationScreen() {
  const { state, update } = useIntake();
  const urgent = isUrgent(state);
  const { form8821SignedOn, form2848 } = state.authorization;

  // "later" is stored as waiting-for-signature; "now" is null until signed. Urgent cases must sign now.
  const choice2848 = urgent || form2848 !== "waiting-for-signature" ? "now" : "later";
  const needs8821 = form8821SignedOn === null;
  const needs2848 = choice2848 === "now" && form2848 !== "signed";
  const formsToSign = [needs8821 && "Form 8821", needs2848 && "Form 2848"].filter(Boolean) as string[];

  const [legalName, setLegalName] = useState(taxpayerIdentity.legalName);
  const [address, setAddress] = useState(taxpayerIdentity.address);
  const [signature, setSignature] = useState("");
  const [consent, setConsent] = useState(false);

  const sign = () => {
    update({
      authorization: {
        form8821SignedOn: form8821SignedOn ?? MOCK_TODAY,
        form2848: needs2848 ? "signed" : form2848,
      },
    });
    setSignature("");
    setConsent(false);
  };

  return (
    <div className="space-y-4">
      <FormCard
        icon={Eye}
        form="Form 8821 · required"
        title="Lets us see your IRS records"
        points={["Read-only: we can't change anything or make payments.", "Lets us pull your IRS transcripts today."]}
        status={
          form8821SignedOn ? (
            <StatusBadge tone="good">Signed {formatDate(form8821SignedOn)}</StatusBadge>
          ) : (
            <StatusBadge tone="warn">Needs your signature</StatusBadge>
          )
        }
      />

      <FormCard
        icon={MessageSquareText}
        form={urgent ? "Form 2848 · required today" : "Form 2848 · power of attorney"}
        title={`Lets ${enrolledAgent.name} speak to the IRS for you`}
        points={[
          `${enrolledAgent.name} handles IRS calls and letters, so you don't have to.`,
          "You can cancel it at any time.",
        ]}
        status={
          form2848 === "signed" ? (
            <StatusBadge tone="good">Signed</StatusBadge>
          ) : choice2848 === "later" ? (
            <StatusBadge tone="neutral">On your to-do list</StatusBadge>
          ) : (
            <StatusBadge tone={urgent ? "bad" : "warn"}>Needs your signature</StatusBadge>
          )
        }
      >
        {!urgent && form2848 !== "signed" && (
          <ChoiceGroup label="When do you want to sign Form 2848?" className="grid gap-3 space-y-0 sm:grid-cols-2">
            <ChoiceCard
              checked={choice2848 === "now"}
              onClick={() => update({ authorization: { ...state.authorization, form2848: null } })}
              title="Sign now"
              description={`${enrolledAgent.name} can start calling the IRS right away.`}
            />
            <ChoiceCard
              checked={choice2848 === "later"}
              onClick={() => update({ authorization: { ...state.authorization, form2848: "waiting-for-signature" } })}
              title="I'll sign later"
              description="We'll add it to your to-do list."
            />
          </ChoiceGroup>
        )}
      </FormCard>

      {formsToSign.length > 0 ? (
        <div className="space-y-4 rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2">
            <PenLine className="size-4 text-primary" aria-hidden />
            <p className="font-medium">Sign {formsToSign.join(" and ")} electronically</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="auth-name" label="Legal name">
              <input id="auth-name" className={inputClass} value={legalName} onChange={(e) => setLegalName(e.target.value)} />
            </Field>
            <Field id="auth-ssn" label="Social Security number" hint="From your IRS records. Nothing is sent in this demo.">
              <input id="auth-ssn" className={inputClass} value={taxpayerIdentity.ssnMasked} readOnly />
            </Field>
            <div className="sm:col-span-2">
              <Field id="auth-address" label="Home address">
                <input id="auth-address" className={inputClass} value={address} onChange={(e) => setAddress(e.target.value)} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field id="auth-signature" label="Type your full name to sign">
                <input
                  id="auth-signature"
                  className={cn(inputClass, "font-serif text-base italic")}
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder={legalName}
                  autoComplete="off"
                />
              </Field>
            </div>
          </div>
          <label htmlFor="auth-consent" className="flex items-start gap-3 text-sm">
            <input
              id="auth-consent"
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 size-4 accent-primary"
            />
            I agree to sign {formsToSign.join(" and ")} electronically, and that my typed name counts as my signature.
          </label>
          <Button onClick={sign} disabled={!signature.trim() || !consent}>
            <PenLine aria-hidden />
            Sign {formsToSign.length === 1 ? formsToSign[0] : "both forms"}
          </Button>
        </div>
      ) : (
        <div className="flex gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" aria-hidden />
          <p>
            {form2848 === "signed"
              ? `All signed. ${enrolledAgent.name} can pull your records and speak to the IRS for you.`
              : "You're authorized. We can pull your IRS records now, and Form 2848 is on your to-do list."}
          </p>
        </div>
      )}
    </div>
  );
}
