import Link from "next/link";
import {
  ArrowRight,
  DollarSign,
  FileSearch,
  FileWarning,
  Hourglass,
  Landmark,
  Sparkles,
} from "lucide-react";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GovernanceBadge } from "@/components/governance-badge";
import { LinkButton } from "@/components/link-button";
import { MetricTile } from "@/components/metric-tile";
import { PageHeader } from "@/components/page-header";
import { StatusBadge, StatusDot } from "@/components/status";
import { ReliefNoteText } from "@/components/tax-years/relief-note";
import { daysUntil, durationLabel, formatDate, formatMoney } from "@/lib/format";
import {
  documents,
  taxYears,
  totalOwed,
  transcriptsLastChecked,
  yearBalance,
  yearNextStep,
  type TaxYear,
} from "@/lib/mockData";
import { cn } from "@/lib/utils";

const balanceParts = [
  { key: "tax", label: "Tax", color: "bg-blue-600", explain: "Tax on your return that wasn't paid" },
  { key: "penalties", label: "Penalties", color: "bg-orange-500", explain: "Charges for paying late" },
  { key: "interest", label: "Interest", color: "bg-yellow-400", explain: "Added daily on what's unpaid, about 7% a year" },
] as const;

const liens = taxYears.filter((y) => y.lienFiled);
const unfiled = taxYears.filter((y) => y.status === "unfiled");
const earliestCsed = taxYears
  .filter((y): y is TaxYear & { csed: string } => y.csed !== null)
  .sort((a, b) => a.csed.localeCompare(b.csed))[0];
const lienDocument = documents.find((d) => /tax lien/i.test(d.name) && d.source === "IRS");

// The IRS record behind a year's numbers: account transcript, or wage & income for unfiled years.
const transcriptFor = (year: number) => documents.find((d) => d.category === "Transcript" && d.taxYear === year);

function BalanceCard({ y }: { y: TaxYear }) {
  if (!y.balance) {
    return (
      <Card>
        <CardHeader className="border-b">
          <CardTitle>No balance yet: this return isn&apos;t filed</CardTitle>
          <CardDescription>The IRS can&apos;t bill you for {y.year} until the return is filed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {y.estimatedBalance !== undefined && (
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums">≈ {formatMoney(y.estimatedBalance)}</span>
              <span className="text-sm text-muted-foreground">estimated owed once filed</span>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Our estimate uses the income the IRS already has on record for you (below). Delivery income usually
            has no tax taken out, which is why a balance is likely. Filing also stops the failure-to-file penalty
            from growing.
          </p>
          <GovernanceBadge href={`/tax-years/${y.year}`} />
        </CardContent>
        <CardFooter>
          <LinkButton href="/action-items">
            Upload your W-2s and 1099s
            <ArrowRight aria-hidden />
          </LinkButton>
        </CardFooter>
      </Card>
    );
  }

  const total = yearBalance(y);
  const transcript = transcriptFor(y.year);
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>What you owe for {y.year}</CardTitle>
        <CardDescription>
          From your IRS account transcript, checked {formatDate(transcriptsLastChecked)}
        </CardDescription>
        {transcript && (
          <CardAction>
            <LinkButton href={`/documents/${transcript.id}`} variant="ghost" size="sm">
              View transcript
              <ArrowRight aria-hidden />
            </LinkButton>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-secondary" aria-hidden>
          {balanceParts.map((p) => (
            <div key={p.key} className={p.color} style={{ width: `${(y.balance![p.key] / total) * 100}%` }} />
          ))}
        </div>
        <ul className="divide-y">
          {balanceParts.map((p) => (
            <li key={p.key} className="flex items-center gap-3 py-3 first:pt-0">
              <span className={cn("size-2.5 shrink-0 rounded-sm", p.color)} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{p.label}</p>
                <p className="text-xs text-muted-foreground">{p.explain}</p>
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">
                {Math.round((y.balance![p.key] / total) * 100)}%
              </span>
              <span className="w-20 text-right text-sm font-medium tabular-nums">{formatMoney(y.balance![p.key])}</span>
            </li>
          ))}
          {y.paymentsMade > 0 && (
            <li className="flex items-center gap-3 py-3">
              <span className="size-2.5 shrink-0" aria-hidden />
              <p className="flex-1 text-sm text-muted-foreground">Payments you&apos;ve already made (already subtracted)</p>
              <span className="w-20 text-right text-sm text-green-700 tabular-nums">−{formatMoney(y.paymentsMade)}</span>
            </li>
          )}
        </ul>
        {y.reliefNote && (
          <div className="flex gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-green-600" aria-hidden />
            <div className="space-y-1">
              <p className="text-sm font-medium text-green-900">Possible savings</p>
              <ReliefNoteText year={y} />
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pt-1">
                <Link href="/intake/assessment" className="text-sm font-medium text-green-900 underline">
                  See our full assessment
                </Link>
                <GovernanceBadge href={`/tax-years/${y.year}`} />
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-between">
        <span className="text-sm text-muted-foreground">Total owed for {y.year}</span>
        <span className="font-semibold tabular-nums">{formatMoney(total)}</span>
      </CardFooter>
    </Card>
  );
}

function CollectionClock({ y }: { y: TaxYear }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hourglass className="size-4 text-blue-600" aria-hidden />
          IRS collection deadline
        </CardTitle>
        <CardDescription>
          The IRS has 10 years from assessment to collect. After that date, whatever is left is legally wiped out.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {y.csed && y.assessedOn ? (
          <>
            <div className="text-2xl font-bold tabular-nums">{durationLabel(daysUntil(y.csed))} left</div>
            <div className="h-2 w-full rounded-full bg-secondary">
              <div
                className="h-2 rounded-full bg-primary"
                style={{
                  width: `${Math.min(100, (-daysUntil(y.assessedOn) / (daysUntil(y.csed) - daysUntil(y.assessedOn))) * 100)}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Assessed {formatDate(y.assessedOn)}</span>
              <span>Ends {formatDate(y.csed)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Some options, like an Offer in Compromise or bankruptcy, pause this clock.
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            The 10-year clock hasn&apos;t started. It starts when the IRS processes your {y.year} return.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function TaxYearDetail({ year }: { year: number }) {
  const y = taxYears.find((t) => t.year === year) ?? taxYears[0];
  const step = yearNextStep(y);
  const incomeTotal = y.incomeOnRecord.reduce((s, r) => s + r.amount, 0);
  const transcript = transcriptFor(y.year);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tax Years"
        description="What you owe for each year, and how long the IRS has to collect it."
        actions={
          <LinkButton href="/documents/from-irs" variant="outline">
            <FileSearch aria-hidden />
            IRS transcripts
          </LinkButton>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile
          icon={DollarSign}
          iconClass="text-red-600"
          label="Total owed"
          value={formatMoney(totalOwed)}
          caption={`Across ${taxYears.filter((t) => t.balance).length} years · see the plan`}
          href="/intake/assessment"
        />
        <MetricTile
          icon={Landmark}
          iconClass="text-orange-600"
          label="Liens filed"
          value={String(liens.length)}
          caption={liens.length ? `${liens.map((l) => l.year).join(", ")} · public record` : "None"}
          href={lienDocument ? `/documents/${lienDocument.id}` : undefined}
        />
        <MetricTile
          icon={FileWarning}
          iconClass="text-purple-600"
          label="Not filed"
          value={String(unfiled.length)}
          caption={unfiled.map((u) => `${u.year} · est. ${formatMoney(u.estimatedBalance ?? 0)}`).join(", ") || "All filed"}
          href={unfiled[0] ? `/tax-years/${unfiled[0].year}` : undefined}
        />
        <MetricTile
          icon={Hourglass}
          iconClass="text-blue-600"
          label="Collection deadline"
          value={durationLabel(daysUntil(earliestCsed.csed))}
          caption={`Earliest: ${earliestCsed.year} · ends ${formatDate(earliestCsed.csed)}`}
          href={`/tax-years/${earliestCsed.year}`}
        />
      </div>

      <nav aria-label="Tax year" className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
        {taxYears.map((t) => {
          const active = t.year === y.year;
          return (
            <Link
              key={t.year}
              href={`/tax-years/${t.year}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                active ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <StatusDot tone={t.tone} />
              {t.year}
            </Link>
          );
        })}
      </nav>

      <Card>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-medium">{y.year} tax year</h2>
              <StatusBadge tone={y.tone}>{y.statusLabel}</StatusBadge>
            </div>
            <p className="text-sm text-muted-foreground">{y.plainEnglish}</p>
            <p className="text-xs text-muted-foreground">
              {y.filedOn ? `Return filed ${formatDate(y.filedOn)}` : "Return not filed"}
              {y.assessedOn && ` · assessed ${formatDate(y.assessedOn)}`}
            </p>
          </div>
          {step.primary && (
            <LinkButton href={step.href} className="shrink-0">
              {step.label}
              <ArrowRight aria-hidden />
            </LinkButton>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <BalanceCard y={y} />

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Income the IRS has on record</CardTitle>
              <CardDescription>
                From your {y.year} wage &amp; income records. Anything missing? Upload the form and we&apos;ll check it.
              </CardDescription>
              <CardAction>
                <LinkButton href={transcript ? `/documents/${transcript.id}` : "/documents/from-irs"} variant="ghost" size="sm">
                  View transcript
                  <ArrowRight aria-hidden />
                </LinkButton>
              </CardAction>
            </CardHeader>
            <CardContent className="overflow-x-auto px-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="px-6 pb-2 font-medium">Payer</th>
                    <th className="px-2 pb-2 font-medium">Form</th>
                    <th className="px-6 pb-2 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-t">
                  {y.incomeOnRecord.map((r) => (
                    <tr key={`${r.payer}-${r.form}`}>
                      <td className="px-6 py-3">{r.payer}</td>
                      <td className="px-2 py-3 font-mono text-xs">{r.form}</td>
                      <td className="px-6 py-3 text-right tabular-nums">{formatMoney(r.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t">
                  <tr>
                    <td className="px-6 pt-3 font-medium" colSpan={2}>
                      Total reported income
                    </td>
                    <td className="px-6 pt-3 text-right font-semibold tabular-nums">{formatMoney(incomeTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <CollectionClock y={y} />

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Timeline</CardTitle>
              <CardDescription>What has happened with {y.year}, newest first</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="relative space-y-5 border-l pl-5">
                {[...y.events].reverse().map((e) => (
                  <li key={`${e.date}-${e.label}`} className="relative">
                    <StatusDot tone={e.tone} className="absolute top-1.5 -left-[25px] size-2.5 ring-4 ring-card" />
                    {e.href ? (
                      <Link href={e.href} className="text-sm font-medium hover:text-primary hover:underline">
                        {e.label}
                      </Link>
                    ) : (
                      <p className="text-sm font-medium">{e.label}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{formatDate(e.date)}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
