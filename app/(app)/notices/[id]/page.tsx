import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NoticeCenter } from "@/components/notices/notice-center";
import { laterNotices, notices } from "@/lib/mockData";

export const dynamicParams = false;

// laterNotices arrive during the demo (e.g. the LT11), so their pages exist from the start.
const allNotices = [...notices, ...laterNotices];

export function generateStaticParams() {
  return allNotices.map((n) => ({ id: n.id }));
}

export async function generateMetadata(props: PageProps<"/notices/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const notice = allNotices.find((n) => n.id === id);
  return { title: `${notice ? `${notice.code} · ` : ""}Notices · T-Res` };
}

export default async function NoticePage(props: PageProps<"/notices/[id]">) {
  const { id } = await props.params;
  if (!allNotices.some((n) => n.id === id)) notFound();
  return <NoticeCenter selectedId={id} />;
}
