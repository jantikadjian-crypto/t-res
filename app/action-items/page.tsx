import { ComingNext, PageHeader } from "@/components/page-header";

export default function ActionItemsPage() {
  return (
    <>
      <PageHeader
        title="Action Items"
        description="Your case moves forward when these are done."
      />
      <ComingNext>Checklist of things to sign, upload, and approve.</ComingNext>
    </>
  );
}
