import Link from "next/link";
import { ArrowLeft, ArrowRight, ExternalLink, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EAReviewedBadge } from "@/components/ea-reviewed-badge";
import { kindStyle, LibraryBrowser } from "@/components/library/library-browser";
import { LinkButton } from "@/components/link-button";
import { PageHeader } from "@/components/page-header";
import { libraryEntry } from "@/lib/library";
import { cn } from "@/lib/utils";

// Bodies of /library and /library/[slug], shared by the Next pages and the progress artifact.

export function LibraryView() {
  return (
    <>
      <PageHeader
        title="Library"
        description="Plain-English definitions of the IRS forms, notices and terms in your case, with links to the official IRS pages."
      />
      <LibraryBrowser />
    </>
  );
}

export function LibraryEntryView({ slug }: { slug: string }) {
  const entry = libraryEntry(slug);
  if (!entry) {
    return (
      <PageHeader
        title="Not in the Library"
        description="We couldn't find that entry."
        actions={
          <LinkButton href="/library" variant="outline">
            <ArrowLeft aria-hidden />
            Library
          </LinkButton>
        }
      />
    );
  }
  const related = entry.related.map(libraryEntry).filter((e) => e !== undefined);

  return (
    <div className="space-y-6">
      <PageHeader
        title={entry.name}
        description={entry.short}
        actions={
          <LinkButton href="/library" variant="outline">
            <ArrowLeft aria-hidden />
            Library
          </LinkButton>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center gap-2">
                <span className={cn("rounded-md border px-1.5 py-0.5 text-xs font-medium", kindStyle[entry.kind])}>{entry.kind}</span>
              </div>
              <CardTitle>What it is</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed">{entry.definition}</p>
              {entry.forYou && (
                <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                  <Info className="mt-0.5 size-4 shrink-0 text-blue-600" aria-hidden />
                  <div>
                    <p className="font-medium">What it means for you</p>
                    <p className="text-blue-800">{entry.forYou}</p>
                  </div>
                </div>
              )}
              <EAReviewedBadge />
            </CardContent>
          </Card>

          {entry.inYourCase && entry.inYourCase.length > 0 && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle>In your case</CardTitle>
                <CardDescription>Where {entry.name} shows up for you</CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <ul className="divide-y">
                  {entry.inYourCase.map((l) => (
                    <li key={l.href + l.label}>
                      <Link
                        href={l.href}
                        className="flex items-center justify-between gap-3 px-6 py-3 text-sm outline-none first:pt-0 hover:text-primary focus-visible:bg-accent"
                      >
                        {l.label}
                        <ArrowRight className="size-4 shrink-0" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {entry.irs && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle>On IRS.gov</CardTitle>
                <CardDescription>The official IRS page. Opens in a new tab.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <a
                  href={entry.irs.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-colors outline-none hover:bg-primary/80 focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {entry.irs.label}
                  <ExternalLink className="size-4" aria-hidden />
                </a>
                <p className="text-xs break-all text-muted-foreground">{entry.irs.url}</p>
              </CardContent>
            </Card>
          )}

          {related.length > 0 && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Related</CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <ul className="divide-y">
                  {related.map((r) => (
                    <li key={r.slug}>
                      <Link
                        href={`/library/${r.slug}`}
                        className="block px-6 py-3 outline-none first:pt-0 hover:bg-accent/40 focus-visible:bg-accent"
                      >
                        <span className="block text-sm font-medium">{r.name}</span>
                        <span className="block text-xs text-muted-foreground">{r.short}</span>
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
