import type { Metadata } from "next";
import { FaqView } from "@/components/faq/faq-view";

export const metadata: Metadata = { title: "Questions & answers · T-Res" };

export default function QuestionsPage() {
  return <FaqView tab="all" />;
}
