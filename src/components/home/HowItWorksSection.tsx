"use client";

import Link from "next/link";
import { COMPARE_TOOLS, HOW_CHITS_WORK, NAV, navHref } from "@/data/panasunaData";
import { useLocale } from "@/lib/i18n";
import { ChitJourney } from "@/components/how/ChitJourney";

/** Home §6: the five-stage journey, full bleed, with a way into the full page. */
export function HowItWorksSection() {
  const { t } = useLocale();
  const page = NAV.find((n) => n.id === "how-chits-work")!;
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="scroll-mt-20 border-t border-hairline pt-24 pb-24 md:pt-32 md:pb-32">
      <header className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
        <h2
          id="how-title"
          className="text-[clamp(2.25rem,4.6vw,3.9rem)] leading-[1.06] tracking-[-0.01em] text-foreground ta:text-[clamp(1.85rem,3.4vw,2.9rem)] ta:leading-[1.4] ta:tracking-normal"
        >
          {t(HOW_CHITS_WORK.title)}
        </h2>
        <div className="flex flex-col gap-4 lg:pb-2">
          <p className="text-muted-foreground">{t(HOW_CHITS_WORK.lead)}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link
              href={navHref("how-chits-work")}
              className="text-sm font-semibold text-gold-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
            >
              {t(page.label)}
            </Link>
            <Link
              href={`${navHref("how-chits-work")}#${COMPARE_TOOLS.anchor}`}
              className="text-sm font-semibold text-gold-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
            >
              {t(COMPARE_TOOLS.jump)}
            </Link>
          </div>
        </div>
      </header>
      <div className="mt-12 md:mt-16">
        <ChitJourney />
      </div>
    </section>
  );
}
