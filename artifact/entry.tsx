// Interactive progress artifact: the real app, rendered in the browser with a hash router.
// scripts/build-artifact.mjs bundles this file and swaps next/link and next/navigation for the
// shims next to it. Next.js itself never loads this file.
import { Fragment, useEffect, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import ActionItemsPage from "@/app/(app)/action-items/page";
import DashboardPage from "@/app/(app)/page";
import SettingsLayout from "@/app/(app)/settings/layout";
import ProSettingsLayout from "@/app/(pro)/pro/settings/layout";
import { AppShell } from "@/components/app-shell/app-shell";
import { CaseProvider } from "@/components/case-provider";
import type { DocumentView } from "@/components/documents/document-library";
import { DocumentDetail } from "@/components/documents/document-detail";
import { DocumentsView } from "@/components/documents/documents-view";
import { FaqView } from "@/components/faq/faq-view";
import { IntakeFrame } from "@/components/intake/intake-frame";
import { IntakeProvider } from "@/components/intake/intake-provider";
import { screenBodies } from "@/components/intake/screen-bodies";
import { LibraryEntryView, LibraryView } from "@/components/library/library-views";
import { NoticeCenter } from "@/components/notices/notice-center";
import { GovernanceInbox } from "@/components/plcy/governance-inbox";
import { GovernanceItemView } from "@/components/plcy/governance-item";
import { PlcyFrame } from "@/components/plcy/plcy-frame";
import { ProApprovals, ProApprovalView } from "@/components/pro/pro-approvals";
import { ProClientView } from "@/components/pro/pro-client";
import { ProClients } from "@/components/pro/pro-clients";
import { ProFrame } from "@/components/pro/pro-frame";
import { ProLogin } from "@/components/pro/pro-login";
import { ProSessionProvider } from "@/components/pro/pro-session";
import { ProToday } from "@/components/pro/pro-today";
import { ProBilling } from "@/components/pro/settings/pro-billing";
import { ProFirmSettings } from "@/components/pro/settings/pro-firm-settings";
import { ProNotificationSettings } from "@/components/pro/settings/pro-notification-settings";
import { ProProfileSettings } from "@/components/pro/settings/pro-profile-settings";
import { ProSecuritySettings } from "@/components/pro/settings/pro-security-settings";
import { BillingOverview } from "@/components/settings/billing-overview";
import { CancelFlow } from "@/components/settings/cancel-flow";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { ProfileSettings } from "@/components/settings/profile-settings";
import { SecuritySettings } from "@/components/settings/security-settings";
import { SignFlow } from "@/components/signing/sign-flow";
import { TaxYearDetail } from "@/components/tax-years/tax-year-detail";
import { FIRST_SCREEN } from "@/lib/intakeScreens";
import { laterNotices, nextNotice, notices, taxYears } from "@/lib/mockData";
import { usePathname } from "./next-navigation";

const documentViews: Record<string, DocumentView> = { mine: "mine", "from-tres": "tres", "from-irs": "irs" };

function page(pathname: string, section?: string, detail?: string, extra?: string): ReactNode {
  switch (section) {
    case "notices":
      return (
        <NoticeCenter
          selectedId={[...notices, ...laterNotices].some((n) => n.id === detail) ? (detail as string) : nextNotice.id}
        />
      );
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
    case "questions":
      return <FaqView tab={detail === "self-serve" || detail === "full-support" ? detail : "all"} />;
    case "library":
      return detail ? <LibraryEntryView slug={detail} /> : <LibraryView />;
    default:
      return <DashboardPage />;
  }
}

// Mirrors the app/ directory. Like Next, layouts (app shell, wizard frame) persist across
// navigation while each page starts fresh, so filters and drafts don't leak between pages.
function route(pathname: string): ReactNode {
  const [section, detail, extra] = pathname.split("/").filter(Boolean);

  if (section === "intake") {
    // Unknown screens start the wizard from the top, like /intake does.
    const slug = detail && screenBodies[detail] ? detail : FIRST_SCREEN;
    const Body = screenBodies[slug];
    return (
      <IntakeProvider>
        <IntakeFrame>
          <Fragment key={slug}>
            <Body />
          </Fragment>
        </IntakeFrame>
      </IntakeProvider>
    );
  }

  if (section === "sign") return <SignFlow key={pathname} docId={detail ?? ""} />;

  if (section === "pro") {
    return (
      <ProFrame>
        <Fragment key={pathname}>
          {detail === "login" ? (
            <ProLogin />
          ) : detail === "clients" ? (
            extra ? (
              <ProClientView id={extra} />
            ) : (
              <ProClients />
            )
          ) : detail === "approvals" ? (
            extra ? (
              <ProApprovalView id={extra} />
            ) : (
              <ProApprovals />
            )
          ) : detail === "settings" ? (
            <ProSettingsLayout>
              {extra === "firm" ? (
                <ProFirmSettings />
              ) : extra === "notifications" ? (
                <ProNotificationSettings />
              ) : extra === "security" ? (
                <ProSecuritySettings />
              ) : extra === "billing" ? (
                <ProBilling />
              ) : (
                <ProProfileSettings />
              )}
            </ProSettingsLayout>
          ) : (
            <ProToday />
          )}
        </Fragment>
      </ProFrame>
    );
  }

  if (section === "plcy") {
    return (
      <PlcyFrame>
        <Fragment key={pathname}>{detail ? <GovernanceItemView id={detail} /> : <GovernanceInbox />}</Fragment>
      </PlcyFrame>
    );
  }

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
      <ProSessionProvider>
        <div className="min-h-screen bg-canvas antialiased">{route(pathname)}</div>
      </ProSessionProvider>
    </CaseProvider>
  );
}

// Each product's shareable link opens on its own start page (taxpayer app: the dashboard; T-Res Pro: sign-in).
// scripts/build-artifact.mjs sets this per product.
const START_ROUTE = process.env.NEXT_PUBLIC_START_ROUTE ?? "/";
if (!window.location.hash.replace("#", "")) window.location.replace(`#${START_ROUTE}`);

const container = document.getElementById("root");
if (container) createRoot(container).render(<App />);
