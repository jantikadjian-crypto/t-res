import type { Metadata } from "next";
import { DocumentsView } from "@/components/documents/documents-view";

export const metadata: Metadata = { title: "Documents from the IRS · T-Res" };

export default function FromIrsDocumentsPage() {
  return <DocumentsView view="irs" />;
}
