import type { Metadata } from "next";
import { ProFrame } from "@/components/pro/pro-frame";

export const metadata: Metadata = { title: "T-Res Pro" };

// T-Res Pro, the professional's side: its own frame; every page but sign-in needs a (mock) session.
export default function ProLayout({ children }: LayoutProps<"/pro">) {
  return <ProFrame>{children}</ProFrame>;
}
