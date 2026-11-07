import type { Metadata } from "next";
import { AUCTION_PROCESS } from "@/data/panasunaData";
import { PageIntro } from "@/components/site/PageIntro";
import { AuctionSimulator } from "@/components/widgets";
import { AuctionProcessDetails } from "@/components/auction/AuctionProcessDetails";

export const metadata: Metadata = {
  title: "Auction process — Panasuna Chits (P) Ltd.",
  description:
    "How a Panasuna chit auction works: try a hypothetical bid on any real plan and see the discount, foreman's commission, dividend per subscriber and the payout to the successful bidder.",
};

export default function AuctionProcessPage() {
  return (
    <main id="main" tabIndex={-1} aria-labelledby="page-title" className="flex-1 outline-none">
      <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-8">
        <PageIntro title={AUCTION_PROCESS.title} lead={AUCTION_PROCESS.lead} />
        {/* The anchor lands in this blank top padding, so no sliver of the heading peeks out under the header. */}
        <div id="simulator" className="scroll-mt-20 pt-10">
          <AuctionSimulator withMonths />
        </div>
        <AuctionProcessDetails />
      </div>
    </main>
  );
}
