import { PageHeader } from "@/components/page-header";
import { ProSettingsTabs } from "@/components/pro/settings/pro-settings-tabs";

// Settings are reached from the account menu (name, top right), not the Pro sidebar.
export default function ProSettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageHeader title="Settings" description="Your credentials, your practice, what reaches you, and what you pay us." />
      <div className="space-y-6">
        <ProSettingsTabs />
        {children}
      </div>
    </>
  );
}
