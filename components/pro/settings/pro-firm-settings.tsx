"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Mail, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, inputClass, selectClass } from "@/components/form";
import { useProSession } from "@/components/pro/pro-session";
import { StatusBadge } from "@/components/status";
import { formatDate } from "@/lib/format";
import { proFirm, proPlans, proRoles, type ProTeamMember } from "@/lib/mockData";
import { cn } from "@/lib/utils";

type Firm = { name: string; address: string; website: string; supportEmail: string };

const initial: Firm = {
  name: proFirm.name,
  address: proFirm.address,
  website: proFirm.website,
  supportEmail: proFirm.supportEmail,
};

const ROLES: ProTeamMember["role"][] = ["Preparer", "Assistant"];

export function ProFirmSettings() {
  const { proPlan, team, inviteMember, removeMember } = useProSession();
  const [form, setForm] = useState<Firm>(initial);
  const [saved, setSaved] = useState<Firm>(initial);
  const [justSaved, setJustSaved] = useState(false);
  const [invite, setInvite] = useState({ name: "", email: "", role: "Preparer" as ProTeamMember["role"] });
  const [invited, setInvited] = useState<string | null>(null);

  const plan = proPlans.find((p) => p.id === proPlan.planId);
  const seatsUsed = team.length;
  const seatsLeft = Math.max(0, (plan?.seats ?? 0) - seatsUsed);
  const dirty = (Object.keys(form) as (keyof Firm)[]).some((k) => form[k] !== saved[k]);
  const set = (key: keyof Firm, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setJustSaved(false);
  };

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invite.email.trim());
  const canInvite = invite.name.trim().length > 1 && emailValid && seatsLeft > 0;

  const sendInvite = () => {
    inviteMember({ name: invite.name.trim(), email: invite.email.trim(), role: invite.role });
    setInvited(invite.name.trim());
    setInvite({ name: "", email: "", role: "Preparer" });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="border-b">
            <CardTitle>Your practice</CardTitle>
            <CardDescription>What clients see on letters, invoices and the documents you send them.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field id="firm-name" label="Firm name">
                <input id="firm-name" className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field id="firm-address" label="Business address" hint="Used on anything you send under your own letterhead.">
                <input
                  id="firm-address"
                  autoComplete="street-address"
                  className={inputClass}
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                />
              </Field>
            </div>
            <Field id="firm-website" label="Website">
              <input id="firm-website" className={inputClass} value={form.website} onChange={(e) => set("website", e.target.value)} />
            </Field>
            <Field id="firm-support" label="Client support email">
              <input
                id="firm-support"
                type="email"
                className={inputClass}
                value={form.supportEmail}
                onChange={(e) => set("supportEmail", e.target.value)}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field id="firm-ein" label="EIN" hint="Held for your invoices. Ask support to change it.">
                <input id="firm-ein" className={inputClass} value={proFirm.ein} readOnly />
              </Field>
            </div>
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
                disabled={!dirty || !form.name.trim()}
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
            <CardTitle>Seats</CardTitle>
            <CardDescription>An invite holds a seat until it&apos;s accepted.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-2xl font-bold tabular-nums">
              {seatsUsed} <span className="text-base font-normal text-muted-foreground">of {plan?.seats} used</span>
            </p>
            <div className="h-2 w-full rounded-full bg-secondary">
              <div
                className="h-2 rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(100, Math.round((seatsUsed / (plan?.seats || 1)) * 100))}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {seatsLeft > 0 ? `${seatsLeft} left on ${plan?.name}.` : `${plan?.name} is full.`}{" "}
              <Link href="/pro/settings/billing" className="text-primary hover:underline">
                Change plan
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Who can act in your practice</CardTitle>
          <CardDescription>Only you and your preparers can approve AI work. Nothing goes out under a name that didn&apos;t approve it.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="divide-y">
            {team.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {m.name
                    .split(/\s+/)
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{m.name}</span>
                    <StatusBadge tone={m.status === "Active" ? "good" : "warn"}>{m.status}</StatusBadge>
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">{m.email}</span>
                </span>
                <span className="text-sm text-muted-foreground">{m.role}</span>
                <span className="hidden w-32 text-xs text-muted-foreground sm:block">
                  {m.lastActive ? `Last active ${formatDate(m.lastActive)}` : "Waiting on the invite"}
                </span>
                {m.role === "Owner" ? (
                  <span className="text-xs text-muted-foreground">That&apos;s you</span>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => removeMember(m.id)} aria-label={`Remove ${m.name}`}>
                    <X className="size-4" aria-hidden />
                    Remove
                  </Button>
                )}
              </li>
            ))}
          </ul>

          <dl className="grid gap-1.5 rounded-lg bg-muted/50 p-3 text-xs sm:grid-cols-[minmax(0,5rem)_minmax(0,1fr)]">
            {proRoles.map((r) => (
              <div key={r.role} className="contents">
                <dt className="font-medium">{r.role}</dt>
                <dd className="text-muted-foreground">{r.can}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-3">
          <p className="text-sm font-medium">Invite someone</p>
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto]">
            <Field id="invite-name" label="Name">
              <input
                id="invite-name"
                className={inputClass}
                placeholder="Alex Moreau"
                value={invite.name}
                onChange={(e) => {
                  setInvite((i) => ({ ...i, name: e.target.value }));
                  setInvited(null);
                }}
              />
            </Field>
            <Field id="invite-email" label="Work email">
              <input
                id="invite-email"
                type="email"
                className={inputClass}
                placeholder="alex@vancetax.example"
                value={invite.email}
                onChange={(e) => {
                  setInvite((i) => ({ ...i, email: e.target.value }));
                  setInvited(null);
                }}
              />
            </Field>
            <Field id="invite-role" label="Role">
              <select
                id="invite-role"
                className={selectClass}
                value={invite.role}
                onChange={(e) => setInvite((i) => ({ ...i, role: e.target.value as ProTeamMember["role"] }))}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>
            <div className="flex items-end">
              <Button disabled={!canInvite} onClick={sendInvite}>
                <UserPlus className="size-4" aria-hidden />
                Send invite
              </Button>
            </div>
          </div>
          {seatsLeft === 0 && (
            <p className="text-xs text-yellow-700">
              Every seat on {plan?.name} is taken.{" "}
              <Link href="/pro/settings/billing" className="font-medium hover:underline">
                Move up a plan
              </Link>{" "}
              to invite more people.
            </p>
          )}
          {invited && (
            <p role="status" className="flex items-center gap-2 text-sm text-green-700">
              <Mail className="size-4" aria-hidden />
              Invite sent to {invited}. They hold a seat until they accept.
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
