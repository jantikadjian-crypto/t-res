import { DocumentsProvider } from "@/components/documents/documents-provider";

// Shared by the library and each document's page, so uploads and notes carry across.
export default function DocumentsLayout({ children }: { children: React.ReactNode }) {
  return <DocumentsProvider>{children}</DocumentsProvider>;
}
