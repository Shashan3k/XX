"use client";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import * as React from "react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { useLocale } from "@/lib/i18n";
import { POPULAR_PLANS, formatINR } from "@/data/panasunaData";
import { COMMISSION_RATE, MAX_DISCOUNT_RATE, auctionOutcome } from "@/lib/auction";
import { AUCTION_COPY, PlanPicker } from "./shared";

/**
 * Variant A — bid slider. One month, one lever: drag the winning discount and watch where
 * the chit value goes. Clearest cause → effect; says nothing about the whole cycle.
 */
export function AuctionBidSlider() {
  const { t } = useLocale();
  const reduce = usePrefersReducedMotion();
  const [plan, setPlan] = React.useState(POPULAR_PLANS[2]);
  const [pct, setPct] = React.useState(20);
  const o = auctionOutcome(plan, pct / 100);

  const share = (n: number) => `${(n / plan.chitValue) * 100}%`;
  const bar = [
    { key: "prize", value: o.prize, className: "bg-gold", label: t(AUCTION_COPY.prize) },
    { key: "commission", value: o.commission, className: "bg-alabaster", label: t(AUCTION_COPY.commission) },
    { key: "pool", value: o.dividendPool, className: "bg-[#3E7FCC]", label: t(AUCTION_COPY.pool) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PlanPicker value={plan} onChange={setPlan} />

      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor="bid-slider" className="text-sm text-alabaster-muted">
            {t(AUCTION_COPY.discount)}
          </label>
          <span className="font-semibold text-alabaster tabular-nums">
            {pct}% · <AnimatedNumber value={o.discount} />
          </span>
        </div>
        <Slider
          id="bid-slider"
          min={COMMISSION_RATE * 100}
          max={MAX_DISCOUNT_RATE * 100}
          step={1}
          value={pct}
          onValueChange={(v) => setPct(Array.isArray(v) ? v[0] : v)}
          getAriaLabel={() => t(AUCTION_COPY.discount)}
        />
      </div>

      {/* Where the chit value goes: one bar, three parts, 2px surface gaps between fills. */}
      <figure className="flex flex-col gap-3">
        <div className="flex h-4 w-full gap-0.5 overflow-hidden rounded-[4px]" role="img" aria-label={bar.map((b) => `${b.label} ${formatINR(b.value)}`).join(", ")}>
          {bar.map((b) => (
            <motion.span
              key={b.key}
              className={`${b.className} h-full first:rounded-l-[4px] last:rounded-r-[4px]`}
              initial={false}
              animate={{ width: share(b.value) }}
              transition={{ duration: reduce ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          ))}
        </div>
        <figcaption className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-alabaster-muted">
          {bar.map((b) => (
            <span key={b.key} className="inline-flex items-center gap-1.5">
              <span className={`${b.className} size-2.5 rounded-[2px]`} aria-hidden="true" />
              {b.label}
            </span>
          ))}
        </figcaption>
      </figure>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-5">
        <div>
          <dt className="text-sm text-alabaster-muted">{t(AUCTION_COPY.prize)}</dt>
          <dd className="font-[family-name:var(--font-jakarta)] text-3xl text-gold">
            <AnimatedNumber value={o.prize} />
          </dd>
        </div>
        <div>
          <dt className="text-sm text-alabaster-muted">{t(AUCTION_COPY.dividend)}</dt>
          <dd className="font-[family-name:var(--font-jakarta)] text-3xl text-alabaster">
            <AnimatedNumber value={o.dividendPerMember} />
          </dd>
        </div>
        <div className="col-span-2 rounded-xl border border-hairline bg-emerald-700/30 px-4 py-3">
          <dt className="text-sm text-alabaster-muted">{t(AUCTION_COPY.net)}</dt>
          <dd className="flex flex-wrap items-baseline gap-x-2">
            <AnimatedNumber value={o.netInstallment} className="text-2xl font-semibold text-alabaster" />
            <span className="text-sm text-alabaster-muted tabular-nums">
              {t(AUCTION_COPY.instead)} <s>{formatINR(plan.monthlyInstallment)}</s>
            </span>
          </dd>
        </div>
      </dl>
      <p className="text-xs text-alabaster-muted">{t(AUCTION_COPY.illustrative)}</p>
    </div>
  );
}
