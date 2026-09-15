import type { Metadata } from "next";
import { ProApprovals } from "@/components/pro/pro-approvals";

export const metadata: Metadata = { title: "Approvals · T-Res Pro" };

export default function ProApprovalsPage() {
  return <ProApprovals />;
}
