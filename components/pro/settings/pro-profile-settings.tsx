"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, inputClass, selectClass } from "@/components/form";
import { useProSession } from "@/components/pro/pro-session";
import { formatDate } from "@/lib/format";
import { practitioner, proFirm, proPlans } from "@/lib/mockData";
import { cn } from "@/lib/utils";

type Profile = { displayName: string; email: string; phone: string; timezone: string };

const initial: Profile = {
  displayName: practitioner.name,
  email: practitioner.email,
  phone: practitioner.phone,
  timezone: practitioner.timezone,
};

const TIMEZONES = ["Eastern Time · New York", "Central Time · Austin, TX", "Mountain Time · Denver", "Pacific Time · Los Angeles"];

function validate(p: Profile) {
  return {
    displayName: p.displayName.trim() ? null : "Clients see this name. It can't be blank.",
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email.trim()) ? null : "Enter an email address like name@example.com.",
    phone: p.phone.replace(/\D/g, "").length >= 10 ? null : "Enter a 10-digit phone number.",
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

export function ProProfileSettings() {
  const { proPlan, team } = useProSession();
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

  const plan = proPlans.find((p) => p.id === proPlan.planId);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader className="border-b">
          <CardTitle>Your details</CardTitle>
          <CardDescription>How clients and T-Res reach you. Changing these doesn&apos;t change your IRS records.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field id="pro-legal-name" label="Legal name" hint="Must match your IRS enrollment. Ask support to change it.">
              <input id="pro-legal-name" className={inputClass} value={practitioner.legalName} readOnly />
            </Field>
          </div>
          <div className="space-y-1.5">
            <Field id="pro-display-name" label="Name clients see" hint="Shown on everything sent under your name.">
              <input
                id="pro-display-name"
                className={inputClass}
                value={form.displayName}
                onChange={(e) => set("displayName", e.target.value)}
                aria-invalid={!!errors.displayName}
                aria-describedby="pro-display-name-error"
              />
            </Field>
            <ErrorText id="pro-display-name-error" message={errors.displayName} />
          </div>
          <div className="space-y-1.5">
            <Field id="pro-phone" label="Direct phone" hint="Used for sign-in codes and same-day escalations.">
              <input
                id="pro-phone"
                type="tel"
                autoComplete="tel"
                className={inputClass}
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                aria-invalid={!!errors.phone}
                aria-describedby="pro-phone-error"
              />
            </Field>
            <ErrorText id="pro-phone-error" message={errors.phone} />
          </div>
          <div className="space-y-1.5">
            <Field id="pro-email" label="Work email">
              <input
                id="pro-email"
                type="email"
                autoComplete="email"
                className={inputClass}
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                aria-invalid={!!errors.email}
                aria-describedby="pro-email-error"
              />
            </Field>
            <ErrorText id="pro-email-error" message={errors.email} />
          </div>
          <Field id="pro-timezone" label="Time zone" hint="Deadlines and quiet hours follow this.">
            <select
              id="pro-timezone"
              className={cn(selectClass, "w-full")}
              value={form.timezone}
              onChange={(e) => set("timezone", e.target.value)}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </Field>
        </CardContent>
        <CardFooter className="flex-wrap justify-between gap-3">
          <p role="status" className={cn("flex items-center gap-2 text-sm text-green-700", !justSaved && "invisible")}>
            <CheckCircle2 className="size-4" aria-hidden />
            Saved.
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

      <div className="space-y-6">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Credentials</CardTitle>
            <CardDescription>What the IRS holds for you. T-Res never files under anyone else&apos;s number.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-[minmax(0,8.5rem)_minmax(0,1fr)] gap-x-4 gap-y-3 text-sm">
              <dt className="text-muted-foreground">Credential</dt>
              <dd>{practitioner.credential}</dd>
              <dt className="text-muted-foreground">Enrollment no.</dt>
              <dd className="font-mono">{practitioner.enrollmentNumber}</dd>
              <dt className="text-muted-foreground">Enrolled through</dt>
              <dd>{formatDate(practitioner.enrolledThrough)}</dd>
              <dt className="text-muted-foreground">PTIN</dt>
              <dd className="font-mono">{practitioner.ptin}</dd>
              <dt className="text-muted-foreground">CAF number</dt>
              <dd className="font-mono">{practitioner.cafNumber}</dd>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle>Your practice</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-[minmax(0,8.5rem)_minmax(0,1fr)] gap-x-4 gap-y-3 text-sm">
              <dt className="text-muted-foreground">Firm</dt>
              <dd>
                <Link href="/pro/settings/firm" className="text-primary hover:underline">
                  {proFirm.name}
                </Link>
              </dd>
              <dt className="text-muted-foreground">Team</dt>
              <dd>
                <Link href="/pro/settings/firm" className="text-primary hover:underline">
                  {team.length} {team.length === 1 ? "person" : "people"}
                </Link>
              </dd>
              <dt className="text-muted-foreground">With T-Res since</dt>
              <dd>{formatDate(practitioner.memberSince)}</dd>
              <dt className="text-muted-foreground">Plan</dt>
              <dd>
                <Link href="/pro/settings/billing" className="text-primary hover:underline">
                  {plan?.name}
                  {proPlan.status !== "active" && " (canceled)"}
                </Link>
              </dd>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
