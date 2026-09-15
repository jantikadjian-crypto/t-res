import type { Metadata } from "next";
import { CaseProvider } from "@/components/case-provider";
import { ProSessionProvider } from "@/components/pro/pro-session";
import "./globals.css";

export const metadata: Metadata = {
  title: "T-Res · Your IRS case",
  description: "Track your IRS notices, balances, and next steps in plain English.",
};

// The app shell lives in app/(app)/layout.tsx; full-screen flows (wizard, signing) have their own frames.
// CaseProvider sits here so uploads, notes, to-dos and signatures carry across every page.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-canvas">
        <CaseProvider>
          <ProSessionProvider>{children}</ProSessionProvider>
        </CaseProvider>
      </body>
    </html>
  );
}
