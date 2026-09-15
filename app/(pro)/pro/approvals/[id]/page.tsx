import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProApprovalView } from "@/components/pro/pro-approvals";
import { governanceItems, laterGovernanceItems, proQueue } from "@/lib/mockData";

export const dynamicParams = false;

// Jordan's PLCY items (including ones that arrive during the demo) and fictional clients' approvals.
const reviewable = [
  ...[...governanceItems, ...laterGovernanceItems].map((g) => ({ id: g.id, title: g.title })),
  ...proQueue.filter((q) => ["emergency", "approval", "recommendation"].includes(q.kind)).map((q) => ({ id: q.id, title: q.title })),
];

export function generateStaticParams() {
  return reviewable.map((r) => ({ id: r.id }));
}

export async function generateMetadata(props: PageProps<"/pro/approvals/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const item = reviewable.find((r) => r.id === id);
  return { title: `${item ? `${item.title} · ` : ""}Approvals · T-Res Pro` };
}

export default async function ProApprovalPage(props: PageProps<"/pro/approvals/[id]">) {
  const { id } = await props.params;
  if (!reviewable.some((r) => r.id === id)) notFound();
  return <ProApprovalView id={id} />;
}
