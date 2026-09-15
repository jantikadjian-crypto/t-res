import type { Metadata } from "next";
import { ProToday } from "@/components/pro/pro-today";

export const metadata: Metadata = { title: "Today · T-Res Pro" };

export default function ProTodayPage() {
  return <ProToday />;
}
