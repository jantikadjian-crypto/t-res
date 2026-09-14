import { ComingNext, PageHeader } from "@/components/page-header";
import { taxpayer } from "@/lib/mockData";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title={`Welcome back, ${taxpayer.firstName}`}
        description="Here's where your case stands and what happens next."
      />
      <ComingNext>
        Dashboard is next: urgency banner, vitals cards, tax-year rows, and the action queue.
      </ComingNext>
    </>
  );
}
