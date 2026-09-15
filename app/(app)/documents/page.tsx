import type { Metadata } from "next";
import { DocumentsView } from "@/components/documents/documents-view";

export const metadata: Metadata = { title: "Documents · T-Res" };

export default function DocumentsPage() {
  return <DocumentsView view="all" />;
}
