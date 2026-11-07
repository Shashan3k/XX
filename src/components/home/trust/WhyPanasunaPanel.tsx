"use client";

import * as React from "react";
import { TRUST_SECTION, WHY_PANASUNA, type WhyPillar } from "@/data/panasunaData";
import { useLocale } from "@/lib/i18n";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";
import { PillarIcon } from "@/components/icons/PillarIcon";
import { TiltCard } from "@/components/motion/TiltCard";

/** Alternating 7/5 spans so the six pillars read as a composed set, not a 3-up card kit. */
const WIDE = new Set<WhyPillar["id"]>(["timely-payment", "fdr-security", "customer-centric"]);

function PillarCard({ pillar }: { pillar: WhyPillar }) {
  const { t } = useLocale();
  const reduce = usePrefersReducedMotion();
  const [play, setPlay] = React.useState(0);
  const replay = () => !reduce && setPlay((n) => n + 1);
  const wide = WIDE.has(pillar.id);

  return (
    <TiltCard
      onHoverStart={replay}
      onViewportEnter={() => !reduce && setPlay((n) => n || 1)}
      viewport={{ once: true, amount: 0.6 }}
      className={cn(
        "flex flex-col gap-5 bg-card/70 p-6 sm:p-7",
        wide ? "lg:col-span-7" : "lg:col-span-5",
      )}
    >
      <span
        className="grid size-16 shrink-0 place-items-center rounded-full border border-hairline-strong text-gold-ink [background:radial-gradient(circle_at_30%_25%,var(--tilt-glare),transparent_70%)] [transform:translateZ(36px)]"
      >
        <PillarIcon id={pillar.id} play={play} className="size-9" />
      </span>
      <div className="flex flex-col gap-2 [transform:translateZ(18px)]">
        <h4 className="text-lg font-semibold text-foreground">{t(pillar.title)}</h4>
        <p className="text-muted-foreground">{t(pillar.body)}</p>
        {pillar.chips && (
          <ul className="mt-2 flex flex-wrap gap-2">
            {pillar.chips.map((chip) => (
              <li key={chip.en} className="rounded-full border border-hairline px-3 py-1 text-sm text-foreground">
                {t(chip)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </TiltCard>
  );
}

export function WhyPanasunaPanel() {
  const { t } = useLocale();
  return (
    <div className="flex flex-col gap-8">
      <h3 className="text-2xl font-semibold text-foreground sm:text-3xl">{t(TRUST_SECTION.why.title)}</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:gap-5">
        {WHY_PANASUNA.map((pillar) => (
          <PillarCard key={pillar.id} pillar={pillar} />
        ))}
      </div>
    </div>
  );
}
