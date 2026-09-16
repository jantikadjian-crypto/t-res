import type { Metadata } from "next";
import { ProDocuments } from "@/components/pro/documents/pro-documents";

export const metadata: Metadata = { title: "Documents · T-Res Pro" };

export default function ProDocumentsPage() {
  return <ProDocuments />;
}
