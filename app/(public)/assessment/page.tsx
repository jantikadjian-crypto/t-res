import type { Metadata } from "next";
import { AssessmentLanding } from "@/components/assessment/assessment-landing";

export const metadata: Metadata = {
  title: "Free IRS tax resolution assessment · T-Res",
  description: "Answer five quick questions and get a plain-English read on your IRS problem and the best way to resolve it.",
};

// Public lead-generation entry point: every lead starts here, then continues into the Get Started wizard.
export default function AssessmentPage() {
  return <AssessmentLanding />;
}
