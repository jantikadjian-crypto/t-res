"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, ChevronDown, FolderOpen, Info, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCase } from "@/components/case-provider";
import { inputClass } from "@/components/form";
import { GovernanceBadge } from "@/components/governance-badge";
import { LinkButton } from "@/components/link-button";
import { PageHeader } from "@/components/page-header";
import { faqForTab, faqTabs, type FaqItem, type FaqTab } from "@/lib/faq";
import { enrolledAgent } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const laneChip: Record<FaqItem["lane"], string | null> = {
  both: null,
  "self-serve": "Doing it yourself",
  "full-support": "Full support",
};

const matches = (item: FaqItem, words: string[]) => {
  const haystack = [item.q, ...item.a, item.forYou ?? ""].join(" ").toLowerCase();
  return words.every((w) => haystack.includes(w));
};

// Open and scroll to an answer linked as ...#q-<id> (works with the progress artifact's hash routes too).
function openLinkedAnswer() {
  const id = window.location.hash.split("#").pop();
  if (!id?.startsWith("q-")) return;
  const el = document.getElementById(id);
  if (el instanceof HTMLDetailsElement) {
    el.open = true;
    el.scrollIntoView({ block: "start" });
  }
}

export function FaqView({ tab }: { tab: FaqTab }) {
  const { lane } = useCase();
  const [query, setQuery] = useState("");
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const searching = words.length > 0;
  const groups = faqForTab(tab)
    .map((g) => ({ ...g, items: g.items.filter((i) => !searching || matches(i, words)) }))
    .filter((g) => g.items.length > 0);
  const shown = groups.reduce((n, g) => n + g.items.length, 0);
  const current = faqTabs.find((t) => t.key === tab) ?? faqTabs[0];
  const yourTab = lane === "self-serve" ? "self-serve" : "full-support";

  useEffect(() => {
    openLinkedAnswer();
    window.addEventListener("hashchange", openLinkedAnswer);
    return () => window.removeEventListener("hashchange", openLinkedAnswer);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Questions & answers"
        description={`Straight answers to what people worry about most, whether you do it yourself or ${enrolledAgent.name} represents you.`}
        actions={
          <LinkButton href="/library" variant="outline">
            <BookOpen aria-hidden />
            Library
          </LinkButton>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        {/* Reference content: Chris approves each answer. */}
        <GovernanceBadge tier="approved" />
        <span className="text-xs text-muted-foreground">We don&apos;t promise outcomes. If an answer depends on your case, we say so.</span>
      </div>

      {/* Which way you work with us: each tab is its own page */}
      <div className="space-y-2">
        <nav aria-label="Questions for" className="grid grid-cols-1 gap-1 rounded-xl bg-muted p-1 sm:grid-cols-3">
          {faqTabs.map((t) => {
            const active = t.key === tab;
            return (
              <Link
                key={t.key}
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  active ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t.label}
                <span className="text-xs tabular-nums opacity-70">
                  {faqForTab(t.key).reduce((n, g) => n + g.items.length, 0)}
                </span>
              </Link>
            );
          })}
        </nav>
        <p className="text-xs text-muted-foreground">
          {current.hint}{" "}
          {tab !== yourTab && (
            <Link href={faqTabs.find((t) => t.key === yourTab)?.href ?? "/questions"} className="text-primary hover:underline">
              {lane === "self-serve" ? "You're doing it yourself: see those answers" : `${enrolledAgent.name} represents you: see those answers`}
            </Link>
          )}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <label htmlFor="faq-search" className="sr-only">
            Search the questions
          </label>
          <input
            id="faq-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the questions, e.g. levy, cancel, ID.me…"
            className={cn(inputClass, "pl-9")}
          />
        </div>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {shown} {shown === 1 ? "answer" : "answers"}
          {searching && " match"}
        </p>
      </div>

      {!searching && (
        <div className="flex flex-wrap gap-2" aria-label="Jump to a topic">
          {groups.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => document.getElementById(`g-${g.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="rounded-full border bg-card px-3 py-1 text-xs font-medium transition-colors outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {g.title}
            </button>
          ))}
        </div>
      )}

      {groups.length === 0 ? (
        <Card>
          <CardContent className="space-y-3 py-6 text-center">
            <p className="text-sm text-muted-foreground">No answers match &ldquo;{query}&rdquo;.</p>
            <Button variant="outline" onClick={() => setQuery("")}>
              <X aria-hidden />
              Clear search
            </Button>
          </CardContent>
        </Card>
      ) : (
        groups.map((g) => (
          <section key={g.id} id={`g-${g.id}`} aria-labelledby={`g-${g.id}-title`} className="scroll-mt-20 space-y-3">
            <div>
              <h2 id={`g-${g.id}-title`} className="text-base font-medium">
                {g.title}
              </h2>
              <p className="text-sm text-muted-foreground">{g.description}</p>
            </div>
            <div className="space-y-2">
              {g.items.map((item) => (
                <details
                  key={item.id}
                  id={`q-${item.id}`}
                  open={searching || undefined}
                  className="group scroll-mt-20 rounded-xl border bg-card open:shadow-sm"
                >
                  <summary className="flex cursor-pointer list-none items-start gap-3 rounded-xl p-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
                    <span className="flex-1 font-medium">{item.q}</span>
                    {laneChip[item.lane] && (
                      <span className="hidden shrink-0 rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary sm:inline">
                        {laneChip[item.lane]}
                      </span>
                    )}
                    <ChevronDown className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden />
                  </summary>
                  <div className="space-y-3 border-t px-4 py-4 text-sm">
                    {item.a.map((p) => (
                      <p key={p} className="leading-relaxed">
                        {p}
                      </p>
                    ))}
                    {item.forYou && (
                      <div className="flex gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-blue-900">
                        <Info className="mt-0.5 size-4 shrink-0 text-blue-600" aria-hidden />
                        <p>
                          <span className="font-medium">For you: </span>
                          {item.forYou}
                        </p>
                      </div>
                    )}
                    {item.links && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {item.links.map((l) => (
                          <Link key={l.href + l.label} href={l.href} className="inline-flex items-center gap-1 text-primary hover:underline">
                            {l.label}
                            <ArrowRight className="size-3" aria-hidden />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))
      )}

      <Card>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <FolderOpen className="size-5 shrink-0 text-muted-foreground" aria-hidden />
          <div className="flex-1">
            <p className="text-sm font-medium">Still have a question?</p>
            <p className="text-sm text-muted-foreground">
              Leave a note on any document and {enrolledAgent.name} answers within one business day. Messaging is coming
              later.
            </p>
          </div>
          <LinkButton href="/documents" variant="outline">
            Go to Documents
          </LinkButton>
        </CardContent>
      </Card>
    </div>
  );
}
