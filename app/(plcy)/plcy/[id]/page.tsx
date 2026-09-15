import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GovernanceItemView } from "@/components/plcy/governance-item";
import { governanceItems } from "@/lib/mockData";

export const dynamicParams = false;

export function generateStaticParams() {
  return governanceItems.map((g) => ({ id: g.id }));
}

export async function generateMetadata(props: PageProps<"/plcy/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const item = governanceItems.find((g) => g.id === id);
  return { title: `${item ? `${item.title} · ` : ""}PLCY` };
}

export default async function PlcyItemPage(props: PageProps<"/plcy/[id]">) {
  const { id } = await props.params;
  if (!governanceItems.some((g) => g.id === id)) notFound();
  return <GovernanceItemView id={id} />;
}
