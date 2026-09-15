"use client";

import Link from "next/link";
import { Eye, FolderOpen, Laptop, MessageSquareText, ShieldCheck, Smartphone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCase } from "@/components/case-provider";
import { LinkButton } from "@/components/link-button";
import { StatusBadge } from "@/components/status";
import { account, enrolledAgent, signInActivity } from "@/lib/mockData";

export function SecuritySettings() {
  const { docs, signatures } = useCase();
  const form2848 = docs.find((d) => d.id === "doc_2848");
  const signed2848 = signatures["doc_2848"];
  const needs2848 = form2848?.status === "needs-signature";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-green-600" aria-hidden />
            Two-step verification
          </CardTitle>
          <CardDescription>A code keeps anyone else out, even if they know your email.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="good">On</StatusBadge>
            <span>{account.twoStepMethod}</span>
          </div>
          <p className="text-muted-foreground">
            We text you a code when you sign in on a new device, and before you sign any document. To use a different
            number, update your phone in{" "}
            <Link href="/settings" className="text-primary hover:underline">
              Profile
            </Link>
            .
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Where you&apos;re signed in</CardTitle>
          <CardDescription>Don&apos;t recognise one? Tell {enrolledAgent.name} right away.</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <ul className="divide-y">
            {signInActivity.map((s) => (
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

      <Card className="lg:col-span-2">
        <CardHeader className="border-b">
          <CardTitle>Who can act for you with the IRS</CardTitle>
          <CardDescription>The IRS forms that let us see your records and speak for you. You can cancel either at any time.</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <ul className="divide-y">
            <li className="flex flex-col gap-3 px-6 py-4 first:pt-0 sm:flex-row sm:items-center">
              <Eye className="size-5 shrink-0 text-muted-foreground" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Form 8821 · T-Res can see your IRS records</p>
                <p className="text-xs text-muted-foreground">Read-only. We can&apos;t change anything or make payments.</p>
              </div>
              <StatusBadge tone="good">Signed Sep 3, 2026</StatusBadge>
              <LinkButton href="/documents/doc_8821" variant="outline" size="sm">
                View form
              </LinkButton>
            </li>
            <li className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center">
              <MessageSquareText className="size-5 shrink-0 text-muted-foreground" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Form 2848 · {enrolledAgent.name} can speak to the IRS for you</p>
                <p className="text-xs text-muted-foreground">Power of attorney for income tax, 2021–2023.</p>
              </div>
              {needs2848 ? (
                <>
                  <StatusBadge tone="bad">Needs your signature</StatusBadge>
                  <LinkButton href="/sign/doc_2848" size="sm">
                    Sign now
                  </LinkButton>
                </>
              ) : (
                <>
                  <StatusBadge tone="good">{signed2848 ? `Signed ${signed2848.signedAt}` : "Signed"}</StatusBadge>
                  <LinkButton href="/documents/doc_2848" variant="outline" size="sm">
                    View form
                  </LinkButton>
                </>
              )}
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <FolderOpen className="size-5 shrink-0 text-muted-foreground" aria-hidden />
          <div className="flex-1">
            <p className="text-sm font-medium">Your data</p>
            <p className="text-sm text-muted-foreground">Every letter, form and note in your case is in Documents, and it&apos;s yours to keep.</p>
          </div>
          <LinkButton href="/documents" variant="outline">
            Go to Documents
          </LinkButton>
        </CardContent>
      </Card>
    </div>
  );
}
