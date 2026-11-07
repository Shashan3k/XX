import type { Metadata } from "next";
import { CATALOG, CHIT_PLANS, PLAN_COUNT_HEADLINE } from "@/data/panasunaData";
import { PageIntro } from "@/components/site/PageIntro";
import { PlanCatalog } from "@/components/plans/PlanCatalog";

export const metadata: Metadata = {
  title: "Chit plans — Panasuna Chits (P) Ltd.",
  description: `${PLAN_COUNT_HEADLINE}+ Panasuna chit fund plans and active groups: ${CHIT_PLANS.length} schemes from ₹1 Lakh to ₹1 Crore, short term (15–30 months) or long term (40–60 months). 100% of every chit's value is held as an FDR in a Scheduled Bank.`,
};

export default function ChitPlansPage() {
  return (
    <main id="main" tabIndex={-1} aria-labelledby="page-title" className="flex-1 outline-none">
      <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-8">
        <PageIntro title={CATALOG.title} lead={CATALOG.lead} />
        <PlanCatalog />
      </div>
    </main>
  );
}
