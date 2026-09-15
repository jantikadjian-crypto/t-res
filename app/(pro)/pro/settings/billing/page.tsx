import type { Metadata } from "next";
import { ProBilling } from "@/components/pro/settings/pro-billing";

export const metadata: Metadata = { title: "Billing & plan · T-Res Pro" };

export default function Page() {
  return <ProBilling />;
}
