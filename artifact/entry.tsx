// Interactive progress artifact: the real app, rendered in the browser with a hash router.
// scripts/build-artifact.mjs bundles this file and swaps next/link and next/navigation for the
// shims next to it. Next.js itself never loads this file.
import { Fragment, useEffect, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import ActionItemsPage from "@/app/(app)/action-items/page";
import DashboardPage from "@/app/(app)/page";
import SettingsLayout from "@/app/(app)/settings/layout";
import { AppShell } from "@/components/app-shell/app-shell";
import { CaseProvider } from "@/components/case-provider";
import type { DocumentView } from "@/components/documents/document-library";
import { DocumentDetail } from "@/components/documents/document-detail";
import { DocumentsView } from "@/components/documents/documents-view";
import { IntakeFrame } from "@/components/intake/intake-frame";
import { IntakeProvider } from "@/components/intake/intake-provider";
import { screenBodies } from "@/components/intake/screen-bodies";
import { ScreenPlaceholder } from "@/components/intake/screen-placeholder";
import { NoticeCenter } from "@/components/notices/notice-center";
import { BillingOverview } from "@/components/settings/billing-overview";
import { CancelFlow } from "@/components/settings/cancel-flow";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { ProfileSettings } from "@/components/settings/profile-settings";
import { SecuritySettings } from "@/components/settings/security-settings";
import { SignFlow } from "@/components/signing/sign-flow";
import { TaxYearDetail } from "@/components/tax-years/tax-year-detail";
import { FIRST_SCREEN } from "@/lib/intakeScreens";
import { nextNotice, notices, taxYears } from "@/lib/mockData";
import { usePathname } from "./next-navigation";

const documentViews: Record<string, DocumentView> = { mine: "mine", "from-tres": "tres", "from-irs": "irs" };

function page(pathname: string, section?: string, detail?: string, extra?: string): ReactNode {
  switch (section) {
    case "notices":
      return <NoticeCenter selectedId={notices.some((n) => n.id === detail) ? (detail as string) : nextNotice.id} />;
    case "tax-years":
      return <TaxYearDetail year={taxYears.some((y) => String(y.year) === detail) ? Number(detail) : taxYears[0].year} />;
    case "action-items":
      return <ActionItemsPage />;
    case "documents":
      if (!detail) return <DocumentsView view="all" />;
      if (detail === "waiting") return <DocumentsView view="all" status="waiting" />;
      if (documentViews[detail]) return <DocumentsView view={documentViews[detail]} />;
      return <DocumentDetail id={detail} />;
    case "settings":
      return (
        <SettingsLayout>
          {detail === "notifications" ? (
            <NotificationSettings />
          ) : detail === "security" ? (
            <SecuritySettings />
          ) : detail === "billing" ? (
            extra === "cancel" ? (
              <CancelFlow />
            ) : (
              <BillingOverview />
            )
          ) : (
            <ProfileSettings />
          )}
        </SettingsLayout>
      );
    default:
      return <DashboardPage />;
  }
}

// Mirrors the app/ directory. Like Next, layouts (app shell, wizard frame) persist across
// navigation while each page starts fresh, so filters and drafts don't leak between pages.
function route(pathname: string): ReactNode {
  const [section, detail, extra] = pathname.split("/").filter(Boolean);

  if (section === "intake") {
    const slug = detail ?? FIRST_SCREEN;
    const Body = screenBodies[slug];
    return (
      <IntakeProvider>
        <IntakeFrame>
          <Fragment key={slug}>{Body ? <Body /> : <ScreenPlaceholder slug={slug} />}</Fragment>
        </IntakeFrame>
      </IntakeProvider>
    );
  }

  if (section === "sign") return <SignFlow key={pathname} docId={detail ?? ""} />;

  return (
    <AppShell>
      <Fragment key={pathname}>{page(pathname, section, detail, extra)}</Fragment>
    </AppShell>
  );
}

function App() {
  const pathname = usePathname();

  // Like Next: a new page starts at the top, unless the link points at a section (#notes).
  useEffect(() => {
    const anchor = window.location.hash.split("#")[2];
    if (anchor) document.getElementById(anchor)?.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <CaseProvider>
      <div className="min-h-screen bg-canvas antialiased">{route(pathname)}</div>
    </CaseProvider>
  );
}

const container = document.getElementById("root");
if (container) createRoot(container).render(<App />);
