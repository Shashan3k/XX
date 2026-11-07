"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { CLOSING_CTA, navHref } from "@/data/panasunaData";
import { useLocale } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { MagneticButton } from "@/components/motion/MagneticButton";

const CtaScene = dynamic(() => import("./CtaScene"), { ssr: false });

/** Home §11 (and the close of /about): the last invitation, over the vault turning in the dark. */
export function ClosingCta() {
  const { t } = useLocale();
  const theme = useTheme();
  const reduce = usePrefersReducedMotion();

  return (
    <section aria-labelledby="closing-title" className="relative isolate overflow-hidden border-t border-hairline">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_55%_70%_at_75%_50%,var(--stage-glow),var(--background)_72%)] max-md:bg-[radial-gradient(ellipse_90%_55%_at_50%_80%,var(--stage-glow),var(--background)_72%)]" />
      <div className="absolute inset-0 -z-10 max-md:top-[45%] max-md:opacity-70 md:left-[42%]">
        <CtaScene reduce={reduce} theme={theme} />
      </div>
      <div className="mx-auto flex min-h-[34rem] max-w-7xl flex-col justify-center gap-8 px-4 pt-24 pb-[22rem] sm:px-8 md:min-h-[38rem] md:py-28">
        <h2
          id="closing-title"
          className="max-w-[14ch] text-[clamp(2.5rem,5.6vw,5rem)] leading-[1.02] tracking-[-0.015em] text-foreground ta:max-w-[18ch] ta:text-[clamp(1.9rem,3.8vw,3.4rem)] ta:leading-[1.35] ta:tracking-normal"
        >
          {t(CLOSING_CTA.title)}
        </h2>
        <p className="max-w-md text-lg text-muted-foreground">{t(CLOSING_CTA.lead)}</p>
        <div className="flex min-w-0 flex-wrap gap-3">
          <MagneticButton size="xl" className="h-auto min-h-12 shrink px-6 py-2 text-center whitespace-normal" render={<Link href={navHref("plans")} />}>
            {t(CLOSING_CTA.explore)}
          </MagneticButton>
          <MagneticButton
            size="xl"
            variant="outline"
            className="h-auto min-h-12 shrink border-hairline-strong bg-background/60 px-6 py-2 text-center whitespace-normal backdrop-blur-sm"
            render={<Link href={navHref("contact")} />}
          >
            {t(CLOSING_CTA.speak)}
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
