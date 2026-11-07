import type { Metadata } from "next";
import { Suspense } from "react";
import { CALCULATOR } from "@/data/panasunaData";
import { PageIntro } from "@/components/site/PageIntro";
import { ChitCalculator } from "@/components/calculator/ChitCalculator";

export const metadata: Metadata = {
  title: "Chit calculator — Panasuna Chits (P) Ltd.",
  description:
    "Pick any Panasuna chit scheme or slide your monthly budget to see the chit value, members, total subscription and illustrative auction dividends.",
};

export default function CalculatorPage() {
  return (
    <main id="main" tabIndex={-1} aria-labelledby="page-title" className="flex-1 outline-none">
      <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-8">
        <PageIntro title={CALCULATOR.title} lead={CALCULATOR.lead} />
        {/* The anchor lands in this blank top padding, so the podium card clears the sticky header. */}
        <div id="calculator" className="scroll-mt-20 pt-10">
          {/* ?plan= preselects a scheme (from the catalogue); it is read on the client, so the shell stays static. */}
          <Suspense>
            <ChitCalculator />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
