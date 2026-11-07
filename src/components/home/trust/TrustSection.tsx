"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { TRUST_SECTION } from "@/data/panasunaData";
import { useLocale } from "@/lib/i18n";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { VaultCounter } from "@/components/motion/VaultCounter";
import { HeritagePanel } from "./HeritagePanel";
import { TrustEnginePanel } from "./TrustEnginePanel";
import { WhyPanasunaPanel } from "./WhyPanasunaPanel";

const TABS = [
  { id: "heritage", Panel: HeritagePanel },
  { id: "engine", Panel: TrustEnginePanel },
  { id: "why", Panel: WhyPanasunaPanel },
] as const;

/** Tab content crossfades over 200ms (panasuna-brand §6); the gold underline is the Coss indicator. */
function Crossfade({ children }: { children: React.ReactNode }) {
  const reduce = usePrefersReducedMotion();
  return (
    <motion.div initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      {children}
    </motion.div>
  );
}

export function TrustSection() {
  const { t } = useLocale();

  return (
    <section id="trust" aria-labelledby="trust-title" className="relative scroll-mt-20 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <header className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
          <h2
            id="trust-title"
            className="text-[clamp(2.25rem,4.6vw,3.9rem)] leading-[1.06] tracking-[-0.01em] text-foreground ta:text-[clamp(1.85rem,3.4vw,2.9rem)] ta:leading-[1.4] ta:tracking-normal"
          >
            {t(TRUST_SECTION.title)}
          </h2>
          <div className="flex flex-col gap-4 text-muted-foreground lg:pb-2">
            {TRUST_SECTION.leadParagraphs.map((p) => (
              <p key={p.en}>{t(p)}</p>
            ))}
          </div>
        </header>

        {/* Trust indicators: only verified figures, each rolled in like a vault combination. */}
        <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 border-y border-hairline py-10 lg:grid-cols-4 lg:gap-0">
          {TRUST_SECTION.indicators.map((ind) => (
            <div key={ind.id} className="flex min-w-0 flex-col lg:border-l lg:border-hairline lg:px-8 lg:first:border-l-0 lg:first:pl-0">
              <dt className="order-2 mt-4 font-semibold text-foreground">{t(ind.label)}</dt>
              <dd className="order-1 text-[clamp(2.75rem,5.4vw,4.75rem)] leading-none font-semibold tracking-[-0.03em] text-gold-ink">
                <VaultCounter value={ind.value} prefix={ind.prefix} suffix={ind.suffix} />
              </dd>
              <dd className="order-3 mt-1 text-sm text-muted-foreground tabular-nums">{t(ind.detail)}</dd>
            </div>
          ))}
        </dl>

        <Tabs defaultValue="heritage" className="mt-16 gap-10 md:mt-20">
          <TabsList
            variant="underline"
            className="grid w-full grid-cols-3 gap-x-0 border-b border-hairline py-0 sm:flex sm:w-fit sm:justify-start"
          >
            {TABS.map(({ id }) => (
              <TabsTab
                key={id}
                value={id}
                className="h-auto min-h-12 px-3 py-3 text-center text-sm leading-snug font-semibold whitespace-normal text-muted-foreground sm:h-auto sm:px-5 sm:text-base data-active:text-foreground"
              >
                {t(TRUST_SECTION.tabs[id])}
              </TabsTab>
            ))}
          </TabsList>
          {TABS.map(({ id, Panel }) => (
            <TabsPanel key={id} value={id}>
              <Crossfade>
                <Panel />
              </Crossfade>
            </TabsPanel>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
