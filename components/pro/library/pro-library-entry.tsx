"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft, ArrowRight, BookOpen, Clock, ExternalLink, FileText, Scale, ShieldCheck, Users } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormFiles } from "@/components/library/form-files";
import { kindStyle } from "@/components/library/library-browser";
import { LinkButton } from "@/components/link-button";
import { PageHeader } from "@/components/page-header";
import { useCaseloadIndex } from "@/components/pro/library/pro-library";
import { libraryFiles } from "@/lib/library";
import { governancePolicies } from "@/lib/mockData";
import { caseloadMatches, isProOnly, proLibraryEntry, proNoteFor } from "@/lib/proLibrary";
import { cn } from "@/lib/utils";

export function ProLibraryEntryView({ slug }: { slug: string }) {
  const entry = proLibraryEntry(slug);
  const caseload = useCaseloadIndex();

  if (!entry) {
    return (
      <PageHeader
        title="Not in the Library"
        description="No entry with that name."
        actions={
          <LinkButton href="/pro/library" variant="outline">
            <ArrowLeft aria-hidden />
            Library
          </LinkButton>
        }
      />
    );
  }

  const note = proNoteFor(entry.slug);
  const files = libraryFiles[entry.slug] ?? [];
  const related = entry.related.map(proLibraryEntry).filter((e) => e !== undefined);
  const clients = caseloadMatches(entry, caseload);
  const policy = note?.automation ? governancePolicies.find((p) => p.id === note.automation!.policyId) : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title={entry.name}
        description={entry.short}
        actions={
          <LinkButton href="/pro/library" variant="outline">
            <ArrowLeft aria-hidden />
            Library
          </LinkButton>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {note && (
            <Card>
              <CardHeader className="border-b">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("rounded-md border px-1.5 py-0.5 text-xs font-medium", kindStyle[entry.kind])}>{entry.kind}</span>
                  {isProOnly(entry.slug) && (
                    <span className="rounded-md border border-purple-200 bg-purple-50 px-1.5 py-0.5 text-xs font-medium text-purple-700">
                      Pro only
                    </span>
                  )}
                </div>
                <CardTitle>For the practice</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-sm leading-relaxed">{note.practice}</p>

                {note.clocks && note.clocks.length > 0 && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="flex items-center gap-2 text-sm font-medium text-red-900">
                      <Clock className="size-4 text-red-600" aria-hidden />
                      Clocks
                    </p>
                    <dl className="mt-2 space-y-2 text-sm text-red-800">
                      {note.clocks.map((c) => (
                        <div key={c.label} className="grid gap-0.5 sm:grid-cols-[minmax(0,9rem)_minmax(0,1fr)] sm:gap-x-4">
                          <dt className="font-medium">{c.label}</dt>
                          <dd>{c.rule}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}

                {note.filing && (
                  <div>
                    <p className="text-sm font-medium">How it&apos;s filed</p>
                    <p className="mt-1 text-sm text-foreground/80">{note.filing}</p>
                  </div>
                )}

                {note.watchFor && note.watchFor.length > 0 && (
                  <div>
                    <p className="flex items-center gap-2 text-sm font-medium">
                      <AlertTriangle className="size-4 text-yellow-600" aria-hidden />
                      Watch for
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {note.watchFor.map((w) => (
                        <li key={w} className="flex gap-2 text-sm text-foreground/80">
                          <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-foreground/30" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {note.authority && note.authority.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <Scale className="size-4 text-muted-foreground" aria-hidden />
                    {note.authority.map((a) => (
                      <span key={a} className="rounded-md border bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                        {a}
                      </span>
                    ))}
                    <span className="text-xs text-muted-foreground">Check the current text before you rely on it.</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="border-b">
              {!note && (
                <div className="flex items-center gap-2">
                  <span className={cn("rounded-md border px-1.5 py-0.5 text-xs font-medium", kindStyle[entry.kind])}>{entry.kind}</span>
                </div>
              )}
              <CardTitle>What it is</CardTitle>
              <CardDescription>The same definition your client reads, in their Library.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{entry.definition}</p>
            </CardContent>
          </Card>

          {files.length > 0 && (
            <Card id="files">
              <CardHeader className="border-b">
                <CardTitle>Printable IRS files</CardTitle>
                <CardDescription>Blank forms and the IRS&apos;s own sample notices, straight from IRS.gov.</CardDescription>
              </CardHeader>
              <CardContent>
                <FormFiles files={files} />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {note?.automation && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-green-600" aria-hidden />
                  What T-Res does
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-foreground/80">{note.automation.does}</p>
                {policy && (
                  <p className="text-xs text-muted-foreground">
                    Governed by <span className="font-medium text-foreground">{policy.name}</span> — {policy.outcome}.
                  </p>
                )}
                <Link href="/plcy" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                  Open the policy
                  <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Users className="size-4 text-orange-600" aria-hidden />
                In your caseload
              </CardTitle>
              <CardDescription>
                {clients.length ? `${clients.length} ${clients.length === 1 ? "client" : "clients"} where this comes up right now.` : "No client is on this right now."}
              </CardDescription>
            </CardHeader>
            {clients.length > 0 && (
              <CardContent className="px-0">
                <ul className="divide-y">
                  {clients.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/pro/clients/${c.id}`}
                        className="group/next flex items-center gap-3 px-6 py-2.5 text-sm outline-none hover:bg-accent/40 focus-visible:bg-accent/40"
                      >
                        <span className="flex-1 truncate group-hover/next:underline">{c.name}</span>
                        <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            )}
          </Card>

          {entry.irs && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="size-4 text-muted-foreground" aria-hidden />
                  On IRS.gov
                </CardTitle>
                <CardDescription>The source. Figures and deadlines change — this is what governs.</CardDescription>
              </CardHeader>
              <CardContent>
                <a
                  href={entry.irs.url}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(buttonVariants({ variant: "outline" }), "w-full justify-between")}
                >
                  {entry.irs.label}
                  <ExternalLink className="size-4" aria-hidden />
                </a>
              </CardContent>
            </Card>
          )}

          {related.length > 0 && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="size-4 text-blue-600" aria-hidden />
                  Related
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <ul className="divide-y">
                  {related.map((r) => (
                    <li key={r.slug}>
                      <Link
                        href={`/pro/library/${r.slug}`}
                        className="group/next flex items-center gap-3 px-6 py-2.5 text-sm outline-none hover:bg-accent/40 focus-visible:bg-accent/40"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate group-hover/next:underline">{r.name}</span>
                          <span className="block truncate text-xs text-muted-foreground">{r.short}</span>
                        </span>
                        <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
