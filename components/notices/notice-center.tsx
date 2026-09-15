"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CalendarClock,
  Clock,
  FileSearch,
  FileText,
  Inbox,
  Info,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useCase } from "@/components/case-provider";
import { EAReviewedBadge } from "@/components/ea-reviewed-badge";
import { LinkButton } from "@/components/link-button";
import { MetricTile } from "@/components/metric-tile";
import { NoticeUpload } from "@/components/notices/notice-upload";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status";
import { daysRemainingLabel, daysUntil, deadlineTone, formatDate, formatMoney } from "@/lib/format";
import { libraryMatches } from "@/lib/library";
import { notices as allNotices, type Notice } from "@/lib/mockData";
import { cn } from "@/lib/utils";

type DecodeKey = Exclude<keyof Notice["decode"], "eaReviewed">;

const decodeSections: { key: DecodeKey; label: string; icon: LucideIcon }[] = [
  { key: "whatItIs", label: "What it is", icon: FileText },
  { key: "whatItMeans", label: "What it means for you", icon: Info },
  { key: "deadline", label: "Deadline", icon: CalendarClock },
  { key: "whatWeAreDoing", label: "What we're doing", icon: ShieldCheck },
];

function deadlineText(n: Notice) {
  return n.status === "closed"
    ? `Was due ${formatDate(n.respondBy)}`
    : `Respond by ${formatDate(n.respondBy)} · ${daysRemainingLabel(n.respondBy)}`;
}

const firstReceived = [...allNotices].sort((a, b) => a.receivedOn.localeCompare(b.receivedOn))[0];

export function NoticeCenter({ selectedId }: { selectedId: string }) {
  // Live: a notice moves to "We're handling it" once its to-dos are signed and approved.
  const { notices, openNotices } = useCase();
  // Open notices first (soonest deadline on top), then closed ones, newest first.
  const orderedNotices = [
    ...openNotices,
    ...notices.filter((n) => n.status === "closed").sort((a, b) => b.receivedOn.localeCompare(a.receivedOn)),
  ];
  const selected = notices.find((n) => n.id === selectedId) ?? orderedNotices[0];
  const needAction = notices.filter((n) => n.status === "action-needed").length;
  const handling = notices.filter((n) => n.status === "in-progress").length;
  const next = openNotices[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notices"
        description="Every letter the IRS has sent you, translated into plain English."
        actions={
          <LinkButton href="/documents" variant="outline">
            <FileSearch aria-hidden />
            Original letters
          </LinkButton>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile
          icon={AlertTriangle}
          iconClass="text-red-600"
          label="Needs action"
          value={String(needAction)}
          caption="Waiting on a response"
          href={`/notices/${notices.find((n) => n.status === "action-needed")?.id ?? orderedNotices[0].id}`}
        />
        <MetricTile
          icon={Clock}
          iconClass="text-blue-600"
          label="We're handling"
          value={String(handling)}
          caption="Nothing needed from you"
          href={`/notices/${notices.find((n) => n.status === "in-progress")?.id ?? orderedNotices[0].id}`}
        />
        <MetricTile
          icon={CalendarClock}
          iconClass="text-orange-600"
          label="Next deadline"
          value={next ? `${daysUntil(next.respondBy)} days` : "None"}
          caption={next ? `${next.code} · ${formatDate(next.respondBy)}` : "You're all caught up"}
          href={next ? `/notices/${next.id}` : undefined}
        />
        <MetricTile
          icon={Inbox}
          iconClass="text-purple-600"
          label="On file"
          value={String(notices.length)}
          caption={`Since ${formatDate(firstReceived.receivedOn)} · see the letters`}
          href="/documents"
        />
      </div>

      <NoticeUpload />

      <div className="grid gap-6 lg:grid-cols-5">
        <ul className="space-y-3 lg:col-span-2" aria-label="Your notices">
          {orderedNotices.map((n) => {
            const active = n.id === selected.id;
            return (
              <li key={n.id}>
                <Link
                  href={`/notices/${n.id}`}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "block rounded-xl border bg-card p-4 transition-colors hover:border-foreground/25",
                    active && "border-primary ring-1 ring-primary hover:border-primary"
                  )}
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <StatusBadge tone={n.tone}>{n.statusLabel}</StatusBadge>
                    <Badge variant="outline" className="font-mono">
                      {n.code}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{n.taxYear} tax year</span>
                  </div>
                  <p className="text-sm font-medium">{n.plainTitle}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Received {formatDate(n.receivedOn)} · {deadlineText(n)}
                  </p>
                  <p className="mt-3 text-sm font-medium tabular-nums">
                    {formatMoney(n.amount)}{" "}
                    <span className="text-xs font-normal text-muted-foreground">on the notice</span>
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>

        <Card className="self-start lg:sticky lg:top-20 lg:col-span-3">
          <CardHeader className="border-b">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="font-mono">
                {selected.code}
              </Badge>
              <span className="text-xs text-muted-foreground">{selected.title}</span>
            </div>
            <CardTitle className="text-lg">{selected.plainTitle}</CardTitle>
            <CardDescription>
              {selected.taxYear} tax year · {formatMoney(selected.amount)} on the notice · received{" "}
              {formatDate(selected.receivedOn)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selected.status === "closed" ? (
              <StatusBadge tone="neutral">{selected.statusLabel}</StatusBadge>
            ) : (
              <StatusBadge tone={deadlineTone(selected.respondBy)}>{deadlineText(selected)}</StatusBadge>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              {decodeSections.map(({ key, label, icon: Icon }) => (
                <div key={key} className="rounded-lg bg-accent/50 p-4">
                  <div className="mb-1.5 flex items-center gap-2 text-sm font-medium">
                    <Icon className="size-4 text-primary" aria-hidden />
                    {label}
                  </div>
                  <p className="text-sm text-muted-foreground">{selected.decode[key]}</p>
                </div>
              ))}
            </div>
            {selected.decode.eaReviewed && <EAReviewedBadge />}
          </CardContent>
          <CardFooter className="flex-wrap gap-2">
            {selected.status === "action-needed" && (
              <LinkButton href="/action-items">
                Respond now
                <ArrowRight aria-hidden />
              </LinkButton>
            )}
            <LinkButton href={`/documents/${selected.documentId}`} variant="outline">
              <FileText aria-hidden />
              View the letter
            </LinkButton>
            {libraryMatches(selected.code)
              .slice(0, 1)
              .map((entry) => (
                <LinkButton key={entry.slug} href={`/library/${entry.slug}`} variant="outline">
                  <BookOpen aria-hidden />
                  What is a {selected.code}?
                </LinkButton>
              ))}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
