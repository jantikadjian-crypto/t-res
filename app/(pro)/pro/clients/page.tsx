import type { Metadata } from "next";
import { ProClients } from "@/components/pro/pro-clients";

export const metadata: Metadata = { title: "Clients · T-Res Pro" };

export default function ProClientsPage() {
  return <ProClients />;
}
