import type { Metadata } from "next";
import { RESOURCES_PAGE } from "@/data/panasunaData";
import { PageIntro } from "@/components/site/PageIntro";
import { FaqHub } from "@/components/faq/FaqHub";
import { ResourceTools } from "@/components/faq/ResourceTools";

export const metadata: Metadata = {
  title: "Resources — Panasuna Chits (P) Ltd.",
  description:
    "Answers to common chit fund questions — auctions, dividends, joining a group, missed installments, documents and support — plus the terms used in every chit agreement.",
};

export default function ResourcesPage() {
  return (
    <main id="main" tabIndex={-1} aria-labelledby="page-title" className="flex-1 outline-none">
      <div className="mx-auto flex max-w-7xl flex-col gap-24 px-4 pb-24 sm:px-8 md:gap-32 md:pb-32">
        <div>
          <PageIntro title={RESOURCES_PAGE.title} lead={RESOURCES_PAGE.lead} />
          <FaqHub />
        </div>
        <ResourceTools />
      </div>
    </main>
  );
}
