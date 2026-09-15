import type { Metadata } from "next";
import { TaxYearDetail } from "@/components/tax-years/tax-year-detail";
import { taxYears } from "@/lib/mockData";

export const metadata: Metadata = { title: "Tax Years · T-Res" };

export default function TaxYearsPage() {
  return <TaxYearDetail year={taxYears[0].year} />;
}
