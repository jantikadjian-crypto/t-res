import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FaqView } from "@/components/faq/faq-view";
import { faqTabs, type FaqTab } from "@/lib/faq";

export const dynamicParams = false;

// Lane tabs are real pages, like the Documents tabs.
const laneTabs = faqTabs.filter((t) => t.key !== "all");

export function generateStaticParams() {
  return laneTabs.map((t) => ({ lane: t.key }));
}

export async function generateMetadata(props: PageProps<"/questions/[lane]">): Promise<Metadata> {
  const { lane } = await props.params;
  const tab = laneTabs.find((t) => t.key === lane);
  return { title: `${tab ? `${tab.label} · ` : ""}Questions & answers · T-Res` };
}

export default async function QuestionsLanePage(props: PageProps<"/questions/[lane]">) {
  const { lane } = await props.params;
  if (!laneTabs.some((t) => t.key === lane)) notFound();
  return <FaqView tab={lane as FaqTab} />;
}
