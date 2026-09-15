import type { Metadata } from "next";
import { ProLogin } from "@/components/pro/pro-login";

export const metadata: Metadata = { title: "Sign in · T-Res Pro" };

export default function ProLoginPage() {
  return <ProLogin />;
}
