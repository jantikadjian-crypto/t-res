import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "T-Res · Your IRS case",
  description: "Track your IRS notices, balances, and next steps in plain English.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-canvas">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
