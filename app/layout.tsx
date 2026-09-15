import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "T-Res · Your IRS case",
  description: "Track your IRS notices, balances, and next steps in plain English.",
};

// The app shell lives in app/(app)/layout.tsx; the full-screen wizard in app/(onboarding).
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-canvas">{children}</body>
    </html>
  );
}
