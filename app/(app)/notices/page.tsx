import type { Metadata } from "next";
import { NoticeCenter } from "@/components/notices/notice-center";
import { nextNotice } from "@/lib/mockData";

export const metadata: Metadata = { title: "Notices · T-Res" };

export default function NoticesPage() {
  return <NoticeCenter selectedId={nextNotice.id} />;
}
