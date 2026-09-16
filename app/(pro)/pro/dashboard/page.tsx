import type { Metadata } from "next";
import { ProDashboard } from "@/components/pro/pro-dashboard";

export const metadata: Metadata = { title: "Dashboard · T-Res Pro" };

// How the practice is doing. Today (/pro) stays the queue where the work gets done.
export default function ProDashboardPage() {
  return <ProDashboard />;
}
