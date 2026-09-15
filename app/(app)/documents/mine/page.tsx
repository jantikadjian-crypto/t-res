import type { Metadata } from "next";
import { DocumentsView } from "@/components/documents/documents-view";

export const metadata: Metadata = { title: "My documents · T-Res" };

export default function MyDocumentsPage() {
  return <DocumentsView view="mine" />;
}
