import type { Metadata } from "next";
import { ProNotificationSettings } from "@/components/pro/settings/pro-notification-settings";

export const metadata: Metadata = { title: "Notifications · T-Res Pro" };

export default function Page() {
  return <ProNotificationSettings />;
}
