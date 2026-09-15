import type { Metadata } from "next";
import { LibraryView } from "@/components/library/library-views";

export const metadata: Metadata = { title: "Library · T-Res" };

export default function LibraryPage() {
  return <LibraryView />;
}
