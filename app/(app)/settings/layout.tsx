import { PageHeader } from "@/components/page-header";
import { SettingsTabs } from "@/components/settings/settings-tabs";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageHeader title="Settings" description="Your details, how we keep you posted, your security, and your plan." />
      <div className="space-y-6">
        <SettingsTabs />
        {children}
      </div>
    </>
  );
}
