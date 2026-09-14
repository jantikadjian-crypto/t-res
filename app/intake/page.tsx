import { ComingNext, PageHeader } from "@/components/page-header";

export default function IntakePage() {
  return (
    <>
      <PageHeader
        title="Get Started"
        description="A few short questions to set up your case, one at a time."
      />
      <ComingNext>
        Intake wizard: notice upload, your situation, authorization, financial snapshot, document
        checklist, assessment, and your options.
      </ComingNext>
    </>
  );
}
