import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProDocumentView } from "@/components/pro/documents/pro-document-view";
import { proDocumentIds, proDocumentName } from "@/lib/proDocuments";

export const dynamicParams = false;

// Every client document, including the ones that only arrive after an escalation.
export function generateStaticParams() {
  return proDocumentIds().map((id) => ({ id }));
}

export async function generateMetadata(props: PageProps<"/pro/documents/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const name = proDocumentName(id);
  return { title: `${name ? `${name} · ` : ""}Documents · T-Res Pro` };
}

export default async function ProDocumentPage(props: PageProps<"/pro/documents/[id]">) {
  const { id } = await props.params;
  if (!proDocumentIds().includes(id)) notFound();
  return <ProDocumentView id={id} />;
}
