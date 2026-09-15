import { DocumentLibrary } from "@/components/documents/document-library";
import { PageHeader } from "@/components/page-header";

export default function DocumentsPage() {
  return (
    <>
      <PageHeader
        title="Documents"
        description="Everything you've shared with us, everything the IRS sent, and everything we've prepared for you."
      />
      <DocumentLibrary />
    </>
  );
}
