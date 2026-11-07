import type { Metadata } from "next";
import { HOW_CHITS_WORK_PAGE } from "@/data/panasunaData";
import { PageIntro } from "@/components/site/PageIntro";
import { HowChitsWorkBody } from "@/components/how/HowChitsWorkBody";

export const metadata: Metadata = {
  title: "How chits work — Panasuna Chits (P) Ltd.",
  description:
    "Follow a real Panasuna chit group through its five stages — joining, monthly installments, the auction, the dividend and the payout — and see how a chit compares with deposits, loans, mutual funds and credit cards.",
};

export default function HowChitsWorkPage() {
  return (
    <main id="main" tabIndex={-1} aria-labelledby="page-title" className="flex-1 outline-none">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <PageIntro title={HOW_CHITS_WORK_PAGE.title} lead={HOW_CHITS_WORK_PAGE.lead} />
      </div>
      <HowChitsWorkBody />
    </main>
  );
}
