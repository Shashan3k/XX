"use client";

import Link from "next/link";
import { AUCTION_PROCESS, AUCTION_SIMULATOR, navHref } from "@/data/panasunaData";
import { useLocale } from "@/lib/i18n";
import { AuctionSimulator } from "@/components/widgets";

/** Home §7: the auction simulator, with a way into the full process page. */
export function AuctionSection() {
  const { t } = useLocale();
  return (
    <section id="auction-simulator" aria-labelledby="auction-title" className="scroll-mt-20 border-t border-hairline py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <header className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
          <h2
            id="auction-title"
            className="text-[clamp(2.25rem,4.6vw,3.9rem)] leading-[1.06] tracking-[-0.01em] text-foreground ta:text-[clamp(1.85rem,3.4vw,2.9rem)] ta:leading-[1.4] ta:tracking-normal"
          >
            {t(AUCTION_SIMULATOR.title)}
          </h2>
          <div className="flex flex-col gap-4 lg:pb-2">
            <p className="text-muted-foreground">{t(AUCTION_SIMULATOR.lead)}</p>
            <Link
              href={navHref("auction")}
              className="self-start text-sm font-semibold text-gold-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
            >
              {t(AUCTION_PROCESS.stepsTitle)}
            </Link>
          </div>
        </header>
        <div className="mt-12">
          <AuctionSimulator id="home-auction" />
        </div>
      </div>
    </section>
  );
}
