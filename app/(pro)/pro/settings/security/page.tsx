import type { Metadata } from "next";
import { ProSecuritySettings } from "@/components/pro/settings/pro-security-settings";

export const metadata: Metadata = { title: "Security · T-Res Pro" };

export default function Page() {
  return <ProSecuritySettings />;
}
