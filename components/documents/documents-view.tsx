import { DocumentLibrary, type DocumentView, type StatusFilter } from "@/components/documents/document-library";
import { PageHeader } from "@/components/page-header";

// Shared body of /documents and its tab pages (/documents/mine, /from-tres, /from-irs, /waiting).
export function DocumentsView({ view, status }: { view: DocumentView; status?: StatusFilter }) {
  return (
    <>
      <PageHeader
        title="Documents"
        description="Everything you've shared with us, everything the IRS sent, and everything we've prepared for you."
      />
      <DocumentLibrary view={view} initialStatus={status} />
    </>
  );
}
