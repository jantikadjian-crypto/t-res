import { ActionQueue } from "@/components/action-items/action-queue";
import { PageHeader } from "@/components/page-header";

export default function ActionItemsPage() {
  return (
    <>
      <PageHeader
        title="Action Items"
        description="Things only you can do. Each one takes a few minutes."
      />
      <ActionQueue />
    </>
  );
}
