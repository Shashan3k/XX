"use client";

import Link from "next/link";
import { AUCTION_PROCESS, navHref } from "@/data/panasunaData";
import { useLocale } from "@/lib/i18n";
import { useEnquiry } from "@/components/enquiry/EnquiryProvider";
import { PayoutCurveExplorer } from "./PayoutCurveExplorer";
import { GoldenRules } from "./GoldenRules";
import { Button } from "@/components/ui/button";

const copy = AUCTION_PROCESS;
const H2 =
  "text-[clamp(1.9rem,3.6vw,2.9rem)] leading-[1.1] tracking-[-0.01em] text-foreground ta:text-[clamp(1.6rem,2.8vw,2.3rem)] ta:leading-[1.4] ta:tracking-normal";

/** /auction-process below the simulator: the payout curve explorer, the three golden rules, and next steps. */
export function AuctionProcessDetails() {
  const { t } = useLocale();
  const { openEnquiry } = useEnquiry();

  return (
    <div className="mt-24 flex flex-col gap-24 md:mt-32 md:gap-32">
      <PayoutCurveExplorer />
      <GoldenRules />

      <section
        aria-labelledby="process-cycle"
        className="flex flex-col gap-6 rounded-3xl border border-hairline bg-card/50 p-6 sm:p-10 md:flex-row md:items-end md:justify-between"
      >
        <div className="max-w-2xl">
          <h2 id="process-cycle" className={H2}>
            {t(copy.cycle.title)}
          </h2>
          <p className="mt-4 text-muted-foreground">{t(copy.cycle.body)}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button size="lg" className="min-h-11" render={<Link href={navHref("calculator")} />}>
            {t(copy.cycle.link)}
          </Button>
          <Button size="lg" variant="outline" className="min-h-11 border-hairline-strong" onClick={() => openEnquiry()}>
            {t(copy.enquire)}
          </Button>
        </div>
      </section>
    </div>
  );
}
