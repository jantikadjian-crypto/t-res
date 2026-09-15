import { notFound } from "next/navigation";
import { LibraryEntryView } from "@/components/library/library-views";
import { libraryEntries, libraryEntry } from "@/lib/library";

export const dynamicParams = false;

export function generateStaticParams() {
  return libraryEntries.map((e) => ({ slug: e.slug }));
}

export default async function LibraryEntryPage(props: PageProps<"/library/[slug]">) {
  const { slug } = await props.params;
  if (!libraryEntry(slug)) notFound();
  return <LibraryEntryView slug={slug} />;
}
