import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NoticeCenter } from "@/components/notices/notice-center";
import { notices } from "@/lib/mockData";

export const dynamicParams = false;

export function generateStaticParams() {
  return notices.map((n) => ({ id: n.id }));
}

export async function generateMetadata(props: PageProps<"/notices/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const notice = notices.find((n) => n.id === id);
  return { title: `${notice ? `${notice.code} · ` : ""}Notices · T-Res` };
}

export default async function NoticePage(props: PageProps<"/notices/[id]">) {
  const { id } = await props.params;
  if (!notices.some((n) => n.id === id)) notFound();
  return <NoticeCenter selectedId={id} />;
}
