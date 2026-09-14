import { NoticeCenter } from "@/components/notices/notice-center";
import { nextNotice } from "@/lib/mockData";

export default function NoticesPage() {
  return <NoticeCenter selectedId={nextNotice.id} />;
}
