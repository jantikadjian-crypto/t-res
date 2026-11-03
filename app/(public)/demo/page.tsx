import type { Metadata } from "next";
import { DemoLanding } from "@/components/demo/demo-landing";

export const metadata: Metadata = {
  title: "Explore the T-Res prototype",
  description: "Three ways into the same T-Res case: the public assessment, the taxpayer's app, and T-Res Pro.",
};

// The front door for a shared demo link: pick a view. Jordan's app stays at /.
export default function DemoPage() {
  return <DemoLanding />;
}
