import type { Metadata } from "next";
import { ProLibrary } from "@/components/pro/library/pro-library";

export const metadata: Metadata = { title: "Library · T-Res Pro" };

export default function ProLibraryPage() {
  return <ProLibrary />;
}
