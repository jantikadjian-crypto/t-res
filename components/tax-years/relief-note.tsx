"use client";

import Link from "next/link";
import { useCase } from "@/components/case-provider";
import type { TaxYear } from "@/lib/mockData";

// The "Possible savings" text, worded for the lane: we ask the IRS, or the taxpayer sends the request we wrote.
export function ReliefNoteText({ year }: { year: TaxYear }) {
  const { lane } = useCase();
  if (lane === "self-serve" && year.selfServeReliefNote) {
    return (
      <p className="text-sm text-green-800">
        {year.selfServeReliefNote}{" "}
        <Link href="/action-items" className="font-medium text-green-900 underline">
          Your request is in Action Items
        </Link>
      </p>
    );
  }
  return <p className="text-sm text-green-800">{year.reliefNote}</p>;
}
