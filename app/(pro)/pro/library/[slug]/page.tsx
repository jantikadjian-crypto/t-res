import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProLibraryEntryView } from "@/components/pro/library/pro-library-entry";
import { proLibraryEntries, proLibraryEntry } from "@/lib/proLibrary";

export const dynamicParams = false;

// Every entry the taxpayer can see, plus the pro-only ones.
export function generateStaticParams() {
  return proLibraryEntries.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata(props: PageProps<"/pro/library/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const entry = proLibraryEntry(slug);
  return { title: `${entry ? `${entry.name} · ` : ""}Library · T-Res Pro` };
}

export default async function ProLibraryEntryPage(props: PageProps<"/pro/library/[slug]">) {
  const { slug } = await props.params;
  if (!proLibraryEntry(slug)) notFound();
  return <ProLibraryEntryView slug={slug} />;
}
