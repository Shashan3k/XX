"use client";

import * as React from "react";
import Link from "next/link";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CHIT_FUND_BASICS, COMPARE_TOOLS, HOW_CHITS_WORK, HOW_CHITS_WORK_PAGE, navHref } from "@/data/panasunaData";
import { useLocale } from "@/lib/i18n";
import { pageScroll } from "@/components/providers/SmoothScroll";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { Button } from "@/components/ui/button";
import { CompareTools } from "@/components/compare/CompareTools";
import { ChitJourney } from "./ChitJourney";

const H2 =
  "text-[clamp(2rem,4vw,3.4rem)] leading-[1.08] tracking-[-0.01em] text-foreground ta:text-[clamp(1.7rem,3vw,2.6rem)] ta:leading-[1.4] ta:tracking-normal";

/** /how-chits-work below the intro: the journey (full bleed), the basics, the comparisons, next steps. */
export function HowChitsWorkBody() {
  const { t } = useLocale();
  const basics = CHIT_FUND_BASICS.whyInvest;

  // Arriving on #compare: the desktop pin adds 4.4 screens of spacer after the browser has already
  // jumped to the hash, so jump again once the journey has laid out, and on any ScrollTrigger refresh
  // in the first moments (fonts, GLB fallbacks) — never later, so a reader's own scrolling wins.
  React.useEffect(() => {
    if (window.location.hash !== `#${COMPARE_TOOLS.anchor}`) return;
    const go = () => {
      const el = document.getElementById(COMPARE_TOOLS.anchor);
      if (el) pageScroll.to(el);
    };
    const frame = requestAnimationFrame(go);
    ScrollTrigger.addEventListener("refresh", go);
    const stop = window.setTimeout(() => ScrollTrigger.removeEventListener("refresh", go), 1500);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(stop);
      ScrollTrigger.removeEventListener("refresh", go);
    };
  }, []);

  return (
    <>
      <section aria-labelledby="journey-title" className="pb-24 md:pb-32">
        <header className="mx-auto max-w-7xl px-4 sm:px-8">
          <h2 id="journey-title" className={H2}>
            {t(HOW_CHITS_WORK.title)}
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">{t(HOW_CHITS_WORK.lead)}</p>
          <a
            href={`#${COMPARE_TOOLS.anchor}`}
            onClick={(e) => {
              const el = document.getElementById(COMPARE_TOOLS.anchor);
              if (!el) return;
              e.preventDefault();
              pageScroll.to(el);
              el.querySelector<HTMLElement>("h2")?.focus({ preventScroll: true });
            }}
            className="mt-4 inline-block text-sm font-semibold text-gold-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
          >
            {t(COMPARE_TOOLS.jump)}
          </a>
        </header>
        <div className="mt-12">
          <ChitJourney />
        </div>
      </section>

      <div className="mx-auto flex max-w-7xl flex-col gap-24 px-4 pb-24 sm:px-8 md:gap-32 md:pb-32">
        <section aria-labelledby="why-title" className="grid gap-10 border-t border-hairline pt-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <h2 id="why-title" className={H2}>
            {t(basics.title)}
          </h2>
          <ul className="grid gap-px overflow-hidden rounded-3xl border border-hairline bg-hairline sm:grid-cols-2">
            {basics.points.map((point, i) => (
              <li key={i} className="flex flex-col gap-3 bg-background p-6">
                <span className="text-sm font-semibold text-gold-ink tabular-nums">0{i + 1}</span>
                <span className="text-lg text-foreground">{t(point)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section id={COMPARE_TOOLS.anchor} aria-labelledby="compare-title" className="scroll-mt-24 flex flex-col gap-10">
          <header className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
            <h2 id="compare-title" tabIndex={-1} className={`${H2} outline-none`}>
              {t(COMPARE_TOOLS.title)}
            </h2>
            <p className="text-muted-foreground lg:pb-2">{t(COMPARE_TOOLS.lead)}</p>
          </header>
          <CompareTools />
        </section>

        <section
          aria-labelledby="next-title"
          className="flex flex-col gap-6 rounded-3xl border border-hairline bg-card/50 p-6 sm:p-10 md:flex-row md:items-center md:justify-between"
        >
          <h2 id="next-title" className={H2}>
            {t(HOW_CHITS_WORK_PAGE.next.title)}
          </h2>
          <div className="flex min-w-0 flex-wrap gap-3">
            <MagneticButton size="xl" className="h-auto min-h-12 shrink px-6 py-2 text-center whitespace-normal" render={<Link href="/#find-your-chit" />}>
              {t(HOW_CHITS_WORK_PAGE.next.find)}
            </MagneticButton>
            <Button
              size="xl"
              variant="outline"
              className="h-auto min-h-12 border-hairline-strong px-6 py-2 text-center whitespace-normal"
              render={<Link href={navHref("calculator")} />}
            >
              {t(HOW_CHITS_WORK_PAGE.next.calculator)}
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
