"use client";

import Link from "next/link";
import { KeyRound, Laptop, Lock, ShieldCheck, Smartphone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkButton } from "@/components/link-button";
import { useProSession } from "@/components/pro/pro-session";
import { StatusBadge } from "@/components/status";
import { formatDate } from "@/lib/format";
import { practitioner, proFirm } from "@/lib/mockData";

// Where the practice is signed in. Static in the demo; the current row follows the mock session.
const sessions = [
  { id: "this", device: "This browser", place: "Austin, TX", when: "Now", current: true },
  { id: "phone", device: "iPhone · T-Res Pro", place: "Austin, TX", when: "Yesterday, 6:12pm", current: false },
  { id: "office", device: "Office iMac", place: "Austin, TX", when: "Sep 12, 9:04am", current: false },
];

export function ProSecuritySettings() {
  const { session, team } = useProSession();
  const approvers = team.filter((m) => m.role !== "Assistant");

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-green-600" aria-hidden />
            Two-step verification
          </CardTitle>
          <CardDescription>Required for everyone in your firm. It can&apos;t be switched off.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="good">On</StatusBadge>
            <span>Text to {practitioner.phoneMasked}</span>
          </div>
          <p className="text-muted-foreground">
            We text a code when anyone signs in on a new device, and again before anything goes out under your name. To
            use a different number, change your phone in{" "}
            <Link href="/pro/settings" className="text-primary hover:underline">
              Profile
            </Link>
            .
          </p>
          <p className="text-xs text-muted-foreground">
            Demo sign-in accepts any email and password, and the code is shown on screen.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Where you&apos;re signed in</CardTitle>
          <CardDescription>Signed in as {session?.email}.</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <ul className="divide-y">
            {sessions.map((s) => (
              <li key={s.id} className="flex items-center gap-3 px-6 py-3 first:pt-0">
                {s.device.includes("iPhone") ? (
                  <Smartphone className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                ) : (
                  <Laptop className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{s.device}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.place} · {s.when}
                  </p>
                </div>
                {s.current && <StatusBadge tone="good">This device</StatusBadge>}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-4 text-muted-foreground" aria-hidden />
            Your IRS credentials
          </CardTitle>
          <CardDescription>What T-Res holds, and what it never holds.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <dl className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)] gap-x-4 gap-y-2">
            <dt className="text-muted-foreground">CAF number</dt>
            <dd className="font-mono">{practitioner.cafNumber}</dd>
            <dt className="text-muted-foreground">PTIN</dt>
            <dd className="font-mono">{practitioner.ptin}</dd>
            <dt className="text-muted-foreground">Enrolled through</dt>
            <dd>{formatDate(practitioner.enrolledThrough)}</dd>
          </dl>
          <p className="text-muted-foreground">
            T-Res never stores your e-Services password or your IRS sign-in. Authorisations are per client, on Form 2848
            or 8821, and each one shows on that client&apos;s page.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Lock className="size-4 text-muted-foreground" aria-hidden />
            Who can approve under your name
          </CardTitle>
          <CardDescription>Anything sent as {proFirm.name} was approved by a person on this list.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <ul className="space-y-1.5">
            {approvers.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{m.name}</span>
                <span className="text-muted-foreground">{m.role}</span>
                {m.status === "Invited" && <StatusBadge tone="warn">Invited</StatusBadge>}
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground">
            The rules that decide what T-Res may do on its own, and what has to wait for one of you, live in PLCY.
          </p>
          <div className="flex flex-wrap gap-2">
            <LinkButton href="/plcy" variant="outline">
              Open PLCY policies
            </LinkButton>
            <LinkButton href="/pro/settings/firm" variant="ghost">
              Manage the team
            </LinkButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
