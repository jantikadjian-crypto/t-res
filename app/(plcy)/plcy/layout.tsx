import type { Metadata } from "next";
import { PlcyFrame } from "@/components/plcy/plcy-frame";

export const metadata: Metadata = { title: "Approvals · PLCY" };

// Mock of PLCY, the AI governance layer (Chris's view). Full-screen, no T-Res shell.
export default function PlcyLayout({ children }: LayoutProps<"/plcy">) {
  return <PlcyFrame>{children}</PlcyFrame>;
}
