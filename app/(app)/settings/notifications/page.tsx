import type { Metadata } from "next";
import { NotificationSettings } from "@/components/settings/notification-settings";

export const metadata: Metadata = { title: "Notification settings · T-Res" };

export default function NotificationSettingsPage() {
  return <NotificationSettings />;
}
