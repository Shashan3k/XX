"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  AUCTION_SIMULATOR,
  CHIT_PLANS,
  formatINR,
  formatPercent,
  type AuctionRowId,
  type ChitPlan,
} from "@/data/panasunaData";
import { COMMISSION_RATE, MAX_DISCOUNT_RATE, auctionOutcome, structureMonth } from "@/lib/auction";
import { useLocale } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useEnquiry } from "@/components/enquiry/EnquiryProvider";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { PlanSelect } from "@/components/plans/PlanSelect";
import { Slider } from "@/components/ui/slider";

// WebGL never blocks the simulator: figures render first, the podium streams in after.
const AuctionPodium = dynamic(() => import("./AuctionPodium"), { ssr: false });

const copy = AUCTION_SIMULATOR;
const DEFAULT_PLAN = CHIT_PLANS.find((p) => p.id === copy.defaultPlanId) ?? CHIT_PLANS[0];
const MIN_PCT = COMMISSION_RATE * 100;
const MAX_PCT = MAX_DISCOUNT_RATE * 100;

/** AnimatedNumber tweens integers, so percentages travel as tenths. */
const tenths = (n: number) => formatPercent(n / 1000);

/** Fill colours shared by the split bar, the row bars and the podium's share ring. */
const FILL = {
  payout: "bg-foreground/75 dark:bg-[#237359]",
  commission: "bg-muted-foreground/40",
  pool: "bg-gold",
} as const;

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * `withMonths` (/auction-process): an auction-month slider loads that month's real discount from the
 * `Structure` sheet; the bid slider stays free for what-ifs. Month 1 is the company chit (no auction).
 */
export function AuctionSimulator({ id = "auction-simulator-controls", withMonths = false }: { id?: string; withMonths?: boolean }) {
  const { t } = useLocale();
  const theme = useTheme();
  const reduce = usePrefersReducedMotion();
  const { openEnquiry } = useEnquiry();
  const [planId, setPlanId] = React.useState(DEFAULT_PLAN.id);
  const defaultMonth = Math.round(DEFAULT_PLAN.durationMonths * 0.7);
  const [month, setMonth] = React.useState(defaultMonth);
  const [pct, setPct] = React.useState(() =>
    withMonths ? structureMonth(DEFAULT_PLAN, defaultMonth).discountRate * 100 : copy.defaultDiscountRate * 100,
  );
  const [strike, setStrike] = React.useState(0);

  const plan = CHIT_PLANS.find((p) => p.id === planId) ?? DEFAULT_PLAN;
  const sched = withMonths ? structureMonth(plan, month) : null;
  const company = sched?.companyChit ?? false;
  const scheduledPct = sched ? sched.discountRate * 100 : null;
  const o = company ? sched! : auctionOutcome(plan, pct / 100);
  const shownPct = company ? 0 : pct;
  const V = plan.chitValue;
  const split = { payout: o.prize / V, commission: o.commission / V, pool: o.dividendPool / V };
  const level = Math.max(0, (shownPct - MIN_PCT) / (MAX_PCT - MIN_PCT));

  /**
   * Jump to a month (and plan): the bid follows that month's Structure discount. While the month
   * slider is being dragged the gavel waits (`strike: false`) and falls once on release, so a drag
   * doesn't re-mount every subscriber dot on each step.
   */
  const goTo = (next: typeof plan, m: number, strike = true) => {
    const s = structureMonth(next, m);
    setMonth(s.month);
    if (!s.companyChit) setPct(s.discountRate * 100);
    if (strike) setStrike((k) => k + 1);
  };
  const bar = { duration: reduce ? 0 : 0.6, ease: EASE };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-12">
      {/* The podium: sticky beside the controls on desktop, so every change is seen as it happens. */}
      <div className="lg:sticky lg:top-32 lg:self-start">
        <figure className="relative isolate overflow-hidden rounded-3xl border border-hairline bg-[radial-gradient(ellipse_70%_60%_at_50%_55%,var(--stage-glow),var(--background)_75%)] lg:h-[calc(100svh-9rem)] lg:max-h-[46rem]">
          {/* The stage: on phones the caption flows below it (long Tamil captions would cover the scene). */}
          <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full">
            <AuctionPodium split={split} level={level} strike={strike} reduce={reduce} theme={theme} />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-5 sm:p-6">
              <div>
                <p className="text-sm text-muted-foreground">{t(copy.discount)}</p>
                <AnimatedNumber
                  value={Math.round(shownPct * 10)}
                  format={tenths}
                  className="text-[clamp(2.25rem,5vw,3.75rem)] leading-none font-semibold tracking-[-0.03em] text-gold-gradient"
                />
              </div>
              <p className="text-right text-sm text-muted-foreground">
                <AnimatedNumber value={o.prize} className="block text-2xl font-semibold text-foreground" />
                {t(copy.legend.payout)}
              </p>
            </div>
          </div>
          <figcaption className="px-5 pb-5 text-xs text-muted-foreground sm:absolute sm:inset-x-0 sm:bottom-0 sm:bg-linear-to-t sm:from-background/90 sm:to-transparent sm:p-6 sm:pt-16">
            {t(copy.podiumCaption)}
          </figcaption>
        </figure>
      </div>

      <div className="flex min-w-0 flex-col gap-8">
        <section aria-label={t(copy.plan)} className="flex flex-col gap-6 rounded-3xl border border-hairline bg-card/60 p-5 sm:p-7">
          <div className="flex flex-col gap-2">
            <label htmlFor={`${id}-plan`} className="text-sm font-semibold text-foreground">
              {t(copy.plan)}
            </label>
            <PlanSelect
              id={`${id}-plan`}
              value={planId}
              onValueChange={(pid) => {
                setPlanId(pid);
                if (!withMonths) return;
                const next = CHIT_PLANS.find((p) => p.id === pid) ?? DEFAULT_PLAN;
                // Keep the month at the same point in the cycle when the duration changes.
                goTo(next, Math.max(1, Math.round((month / plan.durationMonths) * next.durationMonths)));
              }}
            />
          </div>

          {sched && (
            <div className="flex flex-col gap-3 border-t border-hairline pt-6">
              <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
                <span className="text-sm font-semibold text-foreground">{t(copy.month)}</span>
                <output aria-live="polite" className="text-lg text-foreground tabular-nums lining-nums">
                  {sched.month} / {plan.durationMonths}
                </output>
              </div>
              <Slider
                value={sched.month}
                min={1}
                max={plan.durationMonths}
                step={1}
                onValueChange={(v) => goTo(plan, Array.isArray(v) ? v[0] : v, false)}
                onValueCommitted={() => setStrike((k) => k + 1)}
                getAriaLabel={() => t(copy.month)}
                getAriaValueText={() => `${sched.month} / ${plan.durationMonths}`}
                className="py-2 [&_[data-slot=slider-thumb]]:size-6 [&_[data-slot=slider-thumb]]:border-gold-ink [&_[data-slot=slider-track]]:h-1.5"
              />
              {company ? (
                <div className="rounded-2xl border border-gold-ink/50 bg-gold/8 p-4">
                  <p className="font-semibold text-gold-ink">{t(copy.companyChit.title)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{t(copy.companyChit.body)}</p>
                </div>
              ) : (
                <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground tabular-nums lining-nums">
                  <span>
                    {t(copy.structure)}:{" "}
                    <span className="font-semibold text-foreground">
                      {formatPercent(sched.payoutRate)} {t(copy.structurePayout)}
                    </span>{" "}
                    · {formatPercent(sched.discountRate)} {t(copy.structureDiscount)}
                  </span>
                  {scheduledPct !== null && Math.abs(scheduledPct - pct) > 0.001 && (
                    <button
                      type="button"
                      onClick={() => goTo(plan, sched.month)}
                      className="rounded-full border border-hairline-strong px-3 py-1 text-xs font-semibold text-gold-ink transition-colors hover:border-gold-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      {t(copy.useStructure)}
                    </button>
                  )}
                </p>
              )}
              <p className="text-xs text-muted-foreground">{t(copy.monthHint)}</p>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-hairline pt-6">
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
              <span id={`${id}-discount`} className="text-sm font-semibold text-foreground">
                {t(copy.discount)}
              </span>
              <output aria-live="polite" className="text-lg text-foreground tabular-nums lining-nums">
                {formatPercent(shownPct / 100)} · {formatINR(o.discount)}
              </output>
            </div>
            <Slider
              value={pct}
              min={MIN_PCT}
              max={MAX_PCT}
              step={withMonths ? 0.05 : 0.5}
              disabled={company}
              onValueChange={(v) => setPct(Array.isArray(v) ? v[0] : v)}
              onValueCommitted={() => setStrike((s) => s + 1)}
              getAriaLabel={() => t(copy.discount)}
              getAriaValueText={() => `${formatPercent(shownPct / 100)}, ${formatINR(o.discount)}`}
              className="py-2 [&_[data-slot=slider-thumb]]:size-6 [&_[data-slot=slider-thumb]]:border-gold-ink [&_[data-slot=slider-track]]:h-1.5"
            />
            <div aria-hidden="true" className="flex justify-between text-xs text-muted-foreground tabular-nums lining-nums">
              <span>{formatPercent(COMMISSION_RATE)}</span>
              <span>{formatPercent(MAX_DISCOUNT_RATE)}</span>
            </div>
            <p className="text-xs text-muted-foreground">{t(copy.discountHint)}</p>
          </div>
        </section>

        <section aria-labelledby={`${id}-split`} className="flex flex-col gap-6 rounded-3xl border border-hairline p-5 sm:p-7">
          <figure className="flex flex-col gap-3">
            <figcaption id={`${id}-split`} className="text-sm font-semibold text-foreground">
              {t(copy.whereItGoes)}
            </figcaption>
            <div
              role="img"
              aria-label={(["payout", "commission", "pool"] as const)
                .map((k) => `${t(copy.legend[k])} ${formatPercent(split[k])}`)
                .join(", ")}
              className="flex h-4 w-full gap-0.5"
            >
              {(["payout", "commission", "pool"] as const).map((k) => (
                <motion.span
                  key={k}
                  className={cn("h-full rounded-[3px]", FILL[k])}
                  initial={false}
                  animate={{ width: `${split[k] * 100}%` }}
                  transition={bar}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
              {(["payout", "commission", "pool"] as const).map((k) => (
                <span key={k} className="inline-flex items-center gap-1.5 tabular-nums">
                  <span aria-hidden="true" className={cn("size-2.5 rounded-[2px]", FILL[k])} />
                  {t(copy.legend[k])} {formatPercent(split[k])}
                </span>
              ))}
            </div>
          </figure>

          <dl className="flex flex-col divide-y divide-hairline border-t border-hairline">
            <Row id="gross" value={V} segments={[{ fill: "bg-foreground/20", share: 1 }]} />
            <Row
              id="discount"
              value={o.discount}
              segments={[
                { fill: FILL.commission, share: split.commission },
                { fill: FILL.pool, share: split.pool },
              ]}
            />
            <Row id="commission" value={o.commission} segments={[{ fill: FILL.commission, share: split.commission }]} />
            <Row id="pool" value={o.dividendPool} segments={[{ fill: FILL.pool, share: split.pool }]} />
            <Row
              id="share"
              value={o.dividendPerMember}
              // A single share is tiny against the chit; measure it against the installment it reduces.
              segments={[{ fill: FILL.pool, share: o.dividendPerMember / plan.monthlyInstallment }]}
            />
            <Row
              id="next"
              value={o.netInstallment}
              segments={[{ fill: "bg-foreground/45", share: o.netInstallment / plan.monthlyInstallment }]}
              aside={
                <>
                  {t(copy.rows.next.note)} <s>{formatINR(plan.monthlyInstallment)}</s>
                </>
              }
            />
            <Row id="payout" value={o.prize} segments={[{ fill: FILL.payout, share: split.payout }]} strong />
          </dl>

          <Subscribers plan={plan} share={o.dividendPerMember} pulse={strike} />
          <p className="text-xs text-muted-foreground">{t(copy.disclaimer)}</p>
        </section>

        <div>
          <MagneticButton size="xl" className="min-h-12 px-6" onClick={() => openEnquiry(plan.id)}>
            {t(copy.cta)}
          </MagneticButton>
        </div>
      </div>
    </div>
  );
}

function Row({
  id,
  value,
  segments,
  aside,
  strong,
}: {
  id: AuctionRowId;
  value: number;
  segments: readonly { fill: string; share: number }[];
  aside?: React.ReactNode;
  strong?: boolean;
}) {
  const { t } = useLocale();
  const reduce = usePrefersReducedMotion();
  const row = copy.rows[id];
  return (
    // dt and dd sit directly in the row (valid <dl> grouping); the decorative bar rides inside the dd
    // but is pinned to the row's full width.
    <div className="group/row relative flex items-baseline justify-between gap-4 pt-4 pb-7.5 last:pb-3.5">
      <dt className="min-w-0">
        <span className={cn("block text-sm", strong ? "font-semibold text-foreground" : "text-foreground")}>{t(row.label)}</span>
        <span className="block text-xs text-muted-foreground tabular-nums">{aside ?? t(row.note)}</span>
      </dt>
      <dd className={cn("shrink-0 text-right", strong ? "text-2xl font-semibold text-gold-ink" : "text-lg font-semibold text-foreground")}>
        <AnimatedNumber value={value} />
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-4 flex h-1.5 gap-0.5 overflow-hidden rounded-full bg-hairline/60 group-last/row:bottom-0"
        >
          {segments.map((s, i) => (
            <motion.span
              key={i}
              className={cn("h-full rounded-full", s.fill)}
              initial={false}
              animate={{ width: `${Math.min(1, Math.max(0, s.share)) * 100}%` }}
              transition={{ duration: reduce ? 0 : 0.6, ease: EASE }}
            />
          ))}
        </span>
      </dd>
    </div>
  );
}

/** One dot per subscriber, each lit by the same share: the pool divides equally. */
function Subscribers({ plan, share, pulse }: { plan: ChitPlan; share: number; pulse: number }) {
  const { t } = useLocale();
  const reduce = usePrefersReducedMotion();
  const n = plan.durationMonths;
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-hairline bg-card/40 p-4">
      <p className="text-sm text-foreground tabular-nums lining-nums">
        <span className="font-semibold">{n}</span> {t(copy.shared)} · <span className="font-semibold text-gold-ink">{formatINR(share)}</span>
      </p>
      <div aria-hidden="true" className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-1">
        {Array.from({ length: n }, (_, i) => (
          <motion.span
            // Re-keyed on each bid so the share visibly lands on every seat in turn.
            key={`${pulse}-${i}`}
            className="aspect-square rounded-full bg-gold"
            initial={reduce ? false : { scale: 0.4, opacity: 0.35 }}
            animate={{ scale: 1, opacity: share > 0 ? 1 : 0.25 }}
            transition={{ duration: 0.35, delay: reduce ? 0 : i * 0.008, ease: EASE }}
          />
        ))}
      </div>
    </div>
  );
}
