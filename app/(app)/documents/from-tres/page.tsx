import type { Metadata } from "next";
import { DocumentsView } from "@/components/documents/documents-view";

export const metadata: Metadata = { title: "Documents from T-Res · T-Res" };

export default function FromTresDocumentsPage() {
  return <DocumentsView view="tres" />;
}
