import type { Metadata } from "next";
import { DocumentDetail } from "@/components/documents/document-detail";
import { documents } from "@/lib/mockData";

// Case-file documents are prerendered. Ones uploaded during a session aren't known to the
// server, so they render on demand and DocumentDetail reads them from the client provider.
export function generateStaticParams() {
  return documents.map((d) => ({ id: d.id }));
}

export async function generateMetadata(props: PageProps<"/documents/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const doc = documents.find((d) => d.id === id);
  return { title: `${doc ? `${doc.name.replace(/\.pdf$/i, "")} · ` : ""}Documents · T-Res` };
}

export default async function DocumentPage(props: PageProps<"/documents/[id]">) {
  const { id } = await props.params;
  return <DocumentDetail id={id} />;
}
