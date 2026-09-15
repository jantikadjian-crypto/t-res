import type { Metadata } from "next";
import { ProProfileSettings } from "@/components/pro/settings/pro-profile-settings";

export const metadata: Metadata = { title: "Profile & credentials · T-Res Pro" };

export default function Page() {
  return <ProProfileSettings />;
}
