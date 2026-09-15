import type { Metadata } from "next";
import { BillingOverview } from "@/components/settings/billing-overview";

export const metadata: Metadata = { title: "Billing & plan · T-Res" };

export default function BillingPage() {
  return <BillingOverview />;
}
