import type { Metadata } from "next";
import { ABOUT_PAGE, HERITAGE_SPAN } from "@/data/panasunaData";
import { PageIntro } from "@/components/site/PageIntro";
import { HeritageTimeline } from "@/components/about/HeritageTimeline";
import { BoardShowcase } from "@/components/about/BoardShowcase";
import { Philosophies, Purpose } from "@/components/about/Philosophies";
import { ClosingCta } from "@/components/home/ClosingCta";

export const metadata: Metadata = {
  title: "About us — Panasuna Chits (P) Ltd.",
  description:
    "Fifty years of Panasuna Chits in Salem: our story since 1975, our mission to make life easy, the Board of Directors, and the ideas on saving and customer service we work by.",
};

export default function AboutPage() {
  return (
    <main id="main" tabIndex={-1} aria-labelledby="page-title" className="flex-1 outline-none">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <PageIntro title={ABOUT_PAGE.title} lead={ABOUT_PAGE.lead} badge={HERITAGE_SPAN.label} />
      </div>
      <HeritageTimeline />
      <div className="mx-auto flex max-w-7xl flex-col gap-24 px-4 pb-24 sm:px-8 md:gap-32 md:pb-32">
        <Purpose />
        <BoardShowcase />
        <Philosophies />
      </div>
      <ClosingCta />
    </main>
  );
}
