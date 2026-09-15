import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProClientView } from "@/components/pro/pro-client";
import { proClients } from "@/lib/mockData";

export const dynamicParams = false;

export function generateStaticParams() {
  return proClients.map((c) => ({ id: c.id }));
}

export async function generateMetadata(props: PageProps<"/pro/clients/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const client = proClients.find((c) => c.id === id);
  return { title: `${client ? `${client.name} · ` : ""}Clients · T-Res Pro` };
}

export default async function ProClientPage(props: PageProps<"/pro/clients/[id]">) {
  const { id } = await props.params;
  if (!proClients.some((c) => c.id === id)) notFound();
  return <ProClientView id={id} />;
}
