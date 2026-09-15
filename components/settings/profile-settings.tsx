"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useCase } from "@/components/case-provider";
import { Field, inputClass } from "@/components/form";
import { formatDate } from "@/lib/format";
import { account, caseNumber, enrolledAgent, resolutionPlans, taxpayerIdentity } from "@/lib/mockData";
import { cn } from "@/lib/utils";

type Profile = { preferredName: string; email: string; phone: string; address: string };

const initial: Profile = {
  preferredName: account.preferredName,
  email: account.email,
  phone: account.phone,
  address: account.mailingAddress,
};

function validate(p: Profile) {
  return {
    preferredName: p.preferredName.trim() ? null : "Tell us what to call you.",
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email.trim()) ? null : "Enter an email address like name@example.com.",
    phone: p.phone.replace(/\D/g, "").length >= 10 ? null : "Enter a 10-digit phone number.",
    address: p.address.trim().length >= 8 ? null : "Enter your full mailing address.",
  };
}

function ErrorText({ id, message }: { id: string; message: string | null }) {
  if (!message) return null;
  return (
    <p id={id} className="text-xs text-red-600">
      {message}
    </p>
  );
}

export function ProfileSettings() {
  const { plan } = useCase();
  const [form, setForm] = useState<Profile>(initial);
  const [saved, setSaved] = useState<Profile>(initial);
  const [justSaved, setJustSaved] = useState(false);
  const errors = validate(form);
  const valid = Object.values(errors).every((e) => e === null);
  const dirty = (Object.keys(form) as (keyof Profile)[]).some((k) => form[k] !== saved[k]);
  const set = (key: keyof Profile, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setJustSaved(false);
  };

  const planName = resolutionPlans.find((p) => p.id === plan.planId)?.name;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader className="border-b">
          <CardTitle>Your details</CardTitle>
          <CardDescription>How we contact you. Changes here don&apos;t change your IRS records.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field id="profile-legal-name" label="Legal name" hint={`Must match your IRS records. To change it, ask ${enrolledAgent.name}.`}>
              <input id="profile-legal-name" className={inputClass} value={taxpayerIdentity.legalName} readOnly />
            </Field>
          </div>
          <div className="space-y-1.5">
            <Field id="profile-preferred" label="What should we call you?">
              <input
                id="profile-preferred"
                className={inputClass}
                value={form.preferredName}
                onChange={(e) => set("preferredName", e.target.value)}
                aria-invalid={!!errors.preferredName}
                aria-describedby="profile-preferred-error"
              />
            </Field>
            <ErrorText id="profile-preferred-error" message={errors.preferredName} />
          </div>
          <div className="space-y-1.5">
            <Field id="profile-phone" label="Mobile phone" hint="For text reminders and sign-in codes.">
              <input
                id="profile-phone"
                type="tel"
                autoComplete="tel"
                className={inputClass}
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                aria-invalid={!!errors.phone}
                aria-describedby="profile-phone-error"
              />
            </Field>
            <ErrorText id="profile-phone-error" message={errors.phone} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Field id="profile-email" label="Email">
              <input
                id="profile-email"
                type="email"
                autoComplete="email"
                className={inputClass}
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                aria-invalid={!!errors.email}
                aria-describedby="profile-email-error"
              />
            </Field>
            <ErrorText id="profile-email-error" message={errors.email} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Field id="profile-address" label="Mailing address" hint="Where the IRS and we send paper letters.">
              <input
                id="profile-address"
                autoComplete="street-address"
                className={inputClass}
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                aria-invalid={!!errors.address}
                aria-describedby="profile-address-error"
              />
            </Field>
            <ErrorText id="profile-address-error" message={errors.address} />
          </div>
        </CardContent>
        <CardFooter className="flex-wrap justify-between gap-3">
          <p role="status" className={cn("flex items-center gap-2 text-sm text-green-700", !justSaved && "invisible")}>
            <CheckCircle2 className="size-4" aria-hidden />
            Saved. We&apos;ll use these details from now on.
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              disabled={!dirty}
              onClick={() => {
                setForm(saved);
                setJustSaved(false);
              }}
            >
              Discard
            </Button>
            <Button
              disabled={!dirty || !valid}
              onClick={() => {
                setSaved(form);
                setJustSaved(true);
              }}
            >
              Save changes
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Card className="self-start">
        <CardHeader className="border-b">
          <CardTitle>Your case</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)] gap-x-4 gap-y-3 text-sm">
            <dt className="text-muted-foreground">Case number</dt>
            <dd className="font-mono">{caseNumber}</dd>
            <dt className="text-muted-foreground">Your EA</dt>
            <dd>
              <Link href="/settings/security" className="text-primary hover:underline">
                {enrolledAgent.name}, {enrolledAgent.credential}
              </Link>
            </dd>
            <dt className="text-muted-foreground">Member since</dt>
            <dd>{formatDate(account.memberSince)}</dd>
            <dt className="text-muted-foreground">Plan</dt>
            <dd>
              <Link href="/settings/billing" className="text-primary hover:underline">
                {planName}
                {plan.status !== "active" && ` (${plan.status})`}
              </Link>
            </dd>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
