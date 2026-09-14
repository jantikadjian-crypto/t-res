import { notFound } from "next/navigation";
import { TaxYearDetail } from "@/components/tax-years/tax-year-detail";
import { taxYears } from "@/lib/mockData";

export const dynamicParams = false;

export function generateStaticParams() {
  return taxYears.map((y) => ({ year: String(y.year) }));
}

export default async function TaxYearPage(props: PageProps<"/tax-years/[year]">) {
  const { year } = await props.params;
  if (!taxYears.some((y) => String(y.year) === year)) notFound();
  return <TaxYearDetail year={Number(year)} />;
}
