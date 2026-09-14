import { ComingNext, PageHeader } from "@/components/page-header";

export default function NoticesPage() {
  return (
    <>
      <PageHeader
        title="Notices"
        description="Every letter the IRS has sent you, translated into plain English."
      />
      <ComingNext>Notice Center: notice list, plain-English decode, and upload.</ComingNext>
    </>
  );
}
