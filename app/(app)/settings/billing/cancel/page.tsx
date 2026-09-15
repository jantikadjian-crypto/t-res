import type { Metadata } from "next";
import { CancelFlow } from "@/components/settings/cancel-flow";

export const metadata: Metadata = { title: "Cancel plan · T-Res" };

export default function CancelPlanPage() {
  return <CancelFlow />;
}
