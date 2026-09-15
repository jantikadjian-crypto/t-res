import type { Metadata } from "next";
import { ProFirmSettings } from "@/components/pro/settings/pro-firm-settings";

export const metadata: Metadata = { title: "Firm & team · T-Res Pro" };

export default function Page() {
  return <ProFirmSettings />;
}
