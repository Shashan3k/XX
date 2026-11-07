"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  PAYOUT_CURVE,
  PAYOUT_STRUCTURES,
  formatINR,
  formatINRCompact,
  formatMonths,
  formatPercent,
  personaFor,
  type Localized,
  type PayoutPersona,
} from "@/data/panasunaData";
import { simulateCycle } from "@/lib/auction";
import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { Slider } from "@/components/ui/slider";

const copy = PAYOUT_CURVE;
const ease = [0.22, 1, 0.36, 1] as const;

// Plot geometry (viewBox units). One series, one axis: payout as % of the chit, 65% → 100%.
const W = 640;
const H = 300;
const PAD = { l: 44, r: 14, t: 16, b: 30 };
const Y_MIN = 0.65;
const Y_MAX = 1;
const Y_TICKS = [0.7, 0.8, 0.9, 1];

const PERSONA_TONE: Record<PayoutPersona, string> = {
  company: "border-hairline text-muted-foreground",
  borrower: "border-ember/50 text-foreground",
  balanced: "border-hairline-strong text-foreground",
  saver: "border-gold-ink/60 text-gold-ink",
};

/**
 * /auction-process: "Early bidder vs patient saver". The six columns of the client's `Structure` sheet,
 * every month plotted, with a month scrubber (pointer on the plot, or the slider/keyboard) and that
 * month's full split: discount, commission, dividend per member and the reduced installment.
 */
export function PayoutCurveExplorer() {
  const { t, locale } = useLocale();
  const reduce = usePrefersReducedMotion();
  const id = React.useId();
  const [index, setIndex] = React.useState(3); // 40 months, ₹10,00,000
  const s = PAYOUT_STRUCTURES[index];
  const [month, setMonth] = React.useState(Math.round(s.months / 2));
  const m = Math.min(month, s.months);

  const x = (mo: number) => PAD.l + ((mo - 1) / (s.months - 1)) * (W - PAD.l - PAD.r);
  const y = (r: number) => PAD.t + ((Y_MAX - r) / (Y_MAX - Y_MIN)) * (H - PAD.t - PAD.b);

  // The reference column as a plan: its value, its months, and the installment that divides it evenly.
  const plan = React.useMemo(
    () => ({ chitValue: s.chitValue, durationMonths: s.months, monthlyInstallment: s.chitValue / s.months }),
    [s],
  );
  const points = React.useMemo(
    () =>
      simulateCycle(plan).map((c) => ({
        ...c,
        amount: c.prize,
        rate: c.payoutRate,
        persona: personaFor(c.month, c.payoutRate),
      })),
    [plan],
  );
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(p.month).toFixed(1)} ${y(p.rate).toFixed(1)}`).join("");
  const area = `${line}L${x(s.months).toFixed(1)} ${y(Y_MIN)}L${x(1)} ${y(Y_MIN)}Z`;
  const current = points[m - 1];
  const dotR = s.months > 40 ? 2.5 : 3.25;

  const pick = (i: number) => {
    setIndex(i);
    setMonth(Math.round(PAYOUT_STRUCTURES[i].months / 2));
  };

  const scrubFromPointer = (e: React.PointerEvent<SVGSVGElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const vx = ((e.clientX - box.left) / box.width) * W;
    const mo = Math.round(1 + ((vx - PAD.l) / (W - PAD.l - PAD.r)) * (s.months - 1));
    setMonth(Math.max(1, Math.min(s.months, mo)));
  };

  const persona = copy.personas[current.persona];

  return (
    <section aria-labelledby={`${id}-title`} className="flex flex-col gap-8">
      <header className="grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
        <h2
          id={`${id}-title`}
          className="text-[clamp(1.9rem,3.6vw,2.9rem)] leading-[1.1] tracking-[-0.01em] text-foreground ta:text-[clamp(1.6rem,2.8vw,2.3rem)] ta:leading-[1.4] ta:tracking-normal"
        >
          {t(copy.title)}
        </h2>
        <p className="text-muted-foreground lg:pb-1">{t(copy.lead)}</p>
      </header>

      <div role="group" aria-label={t(copy.pick)} className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {PAYOUT_STRUCTURES.map((st, i) => {
          const active = i === index;
          return (
            <button
              key={st.months}
              type="button"
              aria-pressed={active}
              onClick={() => pick(i)}
              className={cn(
                "relative isolate flex min-h-14 flex-col items-start justify-center rounded-xl border px-3 py-2 text-left transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                active ? "border-transparent text-obsidian" : "border-hairline text-foreground hover:border-hairline-strong",
              )}
            >
              {active && (
                <motion.span
                  layoutId={`${id}-pick`}
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 rounded-xl bg-gold"
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="text-base font-semibold tabular-nums lining-nums">
                {formatMonths(st.months, locale)}
              </span>
              <span className={cn("text-xs tabular-nums", active ? "text-obsidian/75" : "text-muted-foreground")}>
                {formatINRCompact(st.chitValue, locale)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-8">
        <figure className="flex flex-col gap-4 rounded-3xl border border-hairline bg-card/50 p-4 sm:p-6">
          <figcaption className="text-xs text-muted-foreground">{t(copy.axis)}</figcaption>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label={`${t(copy.title)} ${s.months} · ${formatINR(s.chitValue)}`}
            // pan-y: a vertical swipe over the chart still scrolls the page; a horizontal drag scrubs.
            className="w-full touch-pan-y overflow-visible text-gold-ink select-none"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              scrubFromPointer(e);
            }}
            onPointerMove={(e) => (e.buttons || e.pointerType === "mouse") && scrubFromPointer(e)}
          >
            <defs>
              <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="currentColor" stopOpacity="0.22" />
                <stop offset="1" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Recessive grid + y labels. */}
            {Y_TICKS.map((r) => (
              <g key={r}>
                <line x1={PAD.l} x2={W - PAD.r} y1={y(r)} y2={y(r)} stroke="var(--hairline)" strokeWidth="1" strokeDasharray={r === 0.7 ? "4 4" : undefined} />
                <text x={PAD.l - 8} y={y(r)} textAnchor="end" dominantBaseline="central" fill="var(--muted-foreground)" className="text-[22px] tabular-nums sm:text-[11px]">
                  {Math.round(r * 100)}%
                </text>
              </g>
            ))}
            <text x={x(2)} y={y(0.7) + 20} fill="var(--muted-foreground)" className="text-[20px] sm:text-[11px]">
              {t(copy.floor)}
            </text>

            {/* X ticks: first, every 10th month, last. */}
            {points
              .filter((p) => p.month === 1 || p.month % 10 === 0 || p.month === s.months)
              .map((p) => (
                <text key={p.month} x={x(p.month)} y={H - 8} textAnchor="middle" fill="var(--muted-foreground)" className="text-[22px] tabular-nums sm:text-[11px]">
                  {p.month}
                </text>
              ))}

            <AnimatePresence mode="wait" initial={false}>
              <motion.g key={s.months} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.12 } }}>
                <path d={area} fill={`url(#${id}-fill)`} />
                <motion.path
                  d={line}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  initial={reduce ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.9, ease }}
                />
                {/* Every month of the sheet; a surface ring keeps each point clear of the line. */}
                {points.map((p) => (
                  <circle key={p.month} cx={x(p.month)} cy={y(p.rate)} r={dotR} fill="currentColor" stroke="var(--background)" strokeWidth="1.5" />
                ))}
              </motion.g>
            </AnimatePresence>

            {/* Crosshair at the scrubbed month. */}
            <line x1={x(m)} x2={x(m)} y1={PAD.t} y2={H - PAD.b} stroke="var(--hairline-strong)" strokeWidth="1" />
            <circle cx={x(m)} cy={y(current.rate)} r="7" fill="var(--color-ember)" stroke="var(--background)" strokeWidth="2.5" />
          </svg>

          <div className="flex flex-col gap-2 px-1">
            <Slider
              value={m}
              min={1}
              max={s.months}
              step={1}
              onValueChange={(v) => setMonth(Array.isArray(v) ? v[0] : v)}
              getAriaLabel={() => t(copy.scrub)}
              getAriaValueText={() => `${t(copy.month)} ${m}: ${formatINR(current.amount)}, ${formatPercent(current.rate)}`}
              className="py-2 [&_[data-slot=slider-thumb]]:size-6 [&_[data-slot=slider-thumb]]:border-gold-ink [&_[data-slot=slider-track]]:h-1.5"
            />
            <p className="text-xs text-muted-foreground">{t(copy.scrub)}</p>
          </div>
        </figure>

        <div className="flex flex-col gap-5 rounded-3xl border border-hairline p-5 sm:p-7" aria-live="polite">
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {t(copy.month)}{" "}
              <span className="text-2xl font-semibold text-foreground tabular-nums lining-nums">{m}</span>
              <span className="tabular-nums"> / {s.months}</span>
            </p>
            <p className="text-xs text-muted-foreground">{formatINR(s.chitValue)}</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">{t(copy.payout)}</p>
            <AnimatedNumber value={current.amount} className="mt-1 block text-[clamp(2.25rem,4vw,3.25rem)] leading-none font-light tracking-[-0.02em] text-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              <AnimatedNumber value={Math.round(current.rate * 1000)} format={(n) => `${(n / 10).toFixed(1)}%`} className="font-semibold text-gold-ink" />{" "}
              {t(copy.ofGross)}
            </p>
            {/* 70% → 100% meter: where this month sits between the floor and the full value. */}
            <div aria-hidden="true" className="mt-4 h-1.5 overflow-hidden rounded-full bg-foreground/8">
              <motion.div
                className="h-full rounded-full bg-gold"
                animate={{ width: `${((current.rate - Y_MIN) / (Y_MAX - Y_MIN)) * 100}%` }}
                transition={reduce ? { duration: 0 } : { duration: 0.5, ease }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{t(copy.benchmark)}</p>
          </div>

          <dl className="flex flex-col divide-y divide-hairline border-y border-hairline text-sm">
            <BreakdownRow label={copy.breakdown.discount} value={current.discount} />
            <BreakdownRow label={copy.breakdown.commission} value={current.commission} />
            <BreakdownRow label={copy.breakdown.dividend} value={Math.round(current.dividendPerMember)} accent />
            <BreakdownRow
              label={copy.breakdown.next}
              value={Math.round(current.netInstallment)}
              note={
                <>
                  {t(copy.insteadOf)} <s>{formatINR(plan.monthlyInstallment)}</s>
                </>
              }
            />
          </dl>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current.persona}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -6, transition: { duration: 0.12 } }}
              transition={{ duration: 0.25, ease }}
              className={cn("mt-auto rounded-2xl border p-4", PERSONA_TONE[current.persona])}
            >
              <p className="font-semibold">{t(persona.title)}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t(persona.body)}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{t(copy.note)}</p>
    </section>
  );
}

function BreakdownRow({
  label,
  value,
  note,
  accent,
}: {
  label: Localized;
  value: number;
  note?: React.ReactNode;
  accent?: boolean;
}) {
  const { t } = useLocale();
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="min-w-0 text-muted-foreground">
        {t(label)}
        {note && <span className="block text-xs tabular-nums">{note}</span>}
      </dt>
      <dd className={cn("shrink-0 font-semibold", accent ? "text-gold-ink" : "text-foreground")}>
        <AnimatedNumber value={value} />
      </dd>
    </div>
  );
}
