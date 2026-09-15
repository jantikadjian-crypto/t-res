import type { Metadata } from "next";
import { DocumentsView } from "@/components/documents/documents-view";

export const metadata: Metadata = { title: "Documents waiting on you · T-Res" };

export default function WaitingDocumentsPage() {
  return <DocumentsView view="all" status="waiting" />;
}
