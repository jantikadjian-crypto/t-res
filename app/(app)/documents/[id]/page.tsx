import type { Metadata } from "next";
import { DocumentDetail } from "@/components/documents/document-detail";
import { documents, laterDocuments } from "@/lib/mockData";

// Case-file documents (and ones that arrive during the demo) are prerendered. Ones uploaded during a
// session aren't known to the server, so they render on demand and DocumentDetail reads them from the provider.
const allDocuments = [...documents, ...laterDocuments];

export function generateStaticParams() {
  return allDocuments.map((d) => ({ id: d.id }));
}

export async function generateMetadata(props: PageProps<"/documents/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const doc = allDocuments.find((d) => d.id === id);
  return { title: `${doc ? `${doc.name.replace(/\.pdf$/i, "")} · ` : ""}Documents · T-Res` };
}

export default async function DocumentPage(props: PageProps<"/documents/[id]">) {
  const { id } = await props.params;
  return <DocumentDetail id={id} />;
}
