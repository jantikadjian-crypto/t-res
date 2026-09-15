import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GovernanceItemView } from "@/components/plcy/governance-item";
import { governanceItems, laterGovernanceItems } from "@/lib/mockData";

export const dynamicParams = false;

// Includes AI actions that only appear during the demo (the LT11 escalation).
const allItems = [...governanceItems, ...laterGovernanceItems];

export function generateStaticParams() {
  return allItems.map((g) => ({ id: g.id }));
}

export async function generateMetadata(props: PageProps<"/plcy/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const item = allItems.find((g) => g.id === id);
  return { title: `${item ? `${item.title} · ` : ""}PLCY` };
}

export default async function PlcyItemPage(props: PageProps<"/plcy/[id]">) {
  const { id } = await props.params;
  if (!allItems.some((g) => g.id === id)) notFound();
  return <GovernanceItemView id={id} />;
}
