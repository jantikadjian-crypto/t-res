import { notFound } from "next/navigation";
import { NoticeCenter } from "@/components/notices/notice-center";
import { notices } from "@/lib/mockData";

export const dynamicParams = false;

export function generateStaticParams() {
  return notices.map((n) => ({ id: n.id }));
}

export default async function NoticePage(props: PageProps<"/notices/[id]">) {
  const { id } = await props.params;
  if (!notices.some((n) => n.id === id)) notFound();
  return <NoticeCenter selectedId={id} />;
}
