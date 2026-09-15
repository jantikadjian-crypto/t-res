import type { Metadata } from "next";
import { IntakeFrame } from "@/components/intake/intake-frame";
import { IntakeProvider } from "@/components/intake/intake-provider";

export const metadata: Metadata = {
  title: "Get Started · T-Res",
};

// Full-screen: no app sidebar. The provider persists answers across screens.
export default function IntakeLayout({ children }: LayoutProps<"/intake">) {
  return (
    <IntakeProvider>
      <IntakeFrame>{children}</IntakeFrame>
    </IntakeProvider>
  );
}
