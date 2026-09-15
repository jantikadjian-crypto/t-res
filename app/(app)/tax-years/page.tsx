import { TaxYearDetail } from "@/components/tax-years/tax-year-detail";
import { taxYears } from "@/lib/mockData";

export default function TaxYearsPage() {
  return <TaxYearDetail year={taxYears[0].year} />;
}
