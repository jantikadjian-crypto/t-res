import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LibraryEntryView } from "@/components/library/library-views";
import { libraryEntries, libraryEntry } from "@/lib/library";

export const dynamicParams = false;

export function generateStaticParams() {
  return libraryEntries.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata(props: PageProps<"/library/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const entry = libraryEntry(slug);
  return { title: `${entry ? `${entry.name} · ` : ""}Library · T-Res` };
}

export default async function LibraryEntryPage(props: PageProps<"/library/[slug]">) {
  const { slug } = await props.params;
  if (!libraryEntry(slug)) notFound();
  return <LibraryEntryView slug={slug} />;
}
