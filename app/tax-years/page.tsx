import { ComingNext, PageHeader } from "@/components/page-header";

export default function TaxYearsPage() {
  return (
    <>
      <PageHeader
        title="Tax Years"
        description="What you owe for each year, and how long the IRS has to collect it."
      />
      <ComingNext>Per-year balance breakdown, collection-deadline countdown, and timeline.</ComingNext>
    </>
  );
}
