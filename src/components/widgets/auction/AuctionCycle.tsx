"use client";

import * as React from "react";
import { Slider } from "@/components/ui/slider";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n";
import { CHIT_RULES, POPULAR_PLANS, formatINR, formatINRCompact, formatPercent, type Localized } from "@/data/panasunaData";
import { cycleSummary, simulateCycle } from "@/lib/auction";
import { AUCTION_COPY, PlanPicker } from "./shared";

const COPY = {
  takeMonth: { en: "I take the prize in month", ta: "நான் பரிசுத் தொகை பெறும் மாதம்" },
  paid: { en: "You pay in total", ta: "நீங்கள் செலுத்தும் மொத்தம்" },
  received: { en: "You receive", ta: "நீங்கள் பெறுவது" },
  gain: { en: "You come out ahead by", ta: "உங்களுக்குக் கிடைக்கும் லாபம்" },
  cost: { en: "Cost of getting the money early", ta: "முன்கூட்டியே பணம் பெறுவதற்கான செலவு" },
  chartTitle: { en: "Your result, by the month you take the prize", ta: "பரிசு பெறும் மாதத்தைப் பொறுத்து உங்கள் முடிவு" },
  borrowLegend: { en: "Borrow early (cost)", ta: "முன்கூட்டியே கடன் (செலவு)" },
  saveLegend: { en: "Save and wait (gain)", ta: "சேமித்துக் காத்திருத்தல் (லாபம்)" },
  month: { en: "Month", ta: "மாதம்" },
  table: { en: "Table view", ta: "அட்டவணைப் பார்வை" },
  assumption: {
    en: `Follows Panasuna's Structure sheet: month 1 is the company chit at 100%, then payouts rise from the 70% benchmark to 95% after the ${formatPercent(CHIT_RULES.commissionRate)} commission.`,
    ta: `பனசுனா அமைப்புத் தாளைப் பின்பற்றுகிறது: முதல் மாதம் 100% நிறுவனச் சீட்டு, பின் 70% அளவுகோலிலிருந்து ${formatPercent(CHIT_RULES.commissionRate)} கமிஷன் போக 95% வரை உயர்கிறது.`,
  },
} satisfies Record<string, Localized>;

const GOLD = "#D4AF37";
const BLUE = "#3E7FCC";

/** Bar with a 4px rounded data-end, anchored square on the zero baseline. */
function barPath(x: number, w: number, zeroY: number, y: number) {
  const r = Math.min(4, w / 2, Math.abs(zeroY - y));
  if (y < zeroY) {
    return `M${x} ${zeroY}V${y + r}Q${x} ${y} ${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${zeroY}Z`;
  }
  return `M${x} ${zeroY}V${y - r}Q${x} ${y} ${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y - r}V${zeroY}Z`;
}

/**
 * Variant B — cycle scrubber. The whole group at once: for each month you could take the prize,
 * what you pay in total versus what you receive. Shows the real trade-off (borrow early vs save
 * and wait) — the most honest answer to "is a chit good for me?", at the cost of more reading.
 */
export function AuctionCycle() {
  const { t, locale } = useLocale();
  const [plan, setPlan] = React.useState(POPULAR_PLANS[1]);
  const cycle = React.useMemo(() => simulateCycle(plan), [plan]);
  const [take, setTake] = React.useState(Math.ceil(plan.durationMonths / 2));
  const [hover, setHover] = React.useState<number | null>(null);

  const nets = cycle.map((_, i) => cycleSummary(cycle, i + 1).net);
  const summary = cycleSummary(cycle, take);

  const W = 600;
  const H = 220;
  const pad = { top: 8, bottom: 8 };
  const zeroY = pad.top + ((H - pad.top - pad.bottom) * Math.max(...nets, 0)) / (Math.max(...nets, 0) - Math.min(...nets, 0) || 1);
  const scale = (H - pad.top - pad.bottom) / (Math.max(...nets, 0) - Math.min(...nets, 0) || 1);
  const slot = W / cycle.length;
  const gap = Math.min(2, slot * 0.25);
  const active = hover ?? take;
  const activeNet = nets[active - 1];

  return (
    <div className="flex flex-col gap-6">
      <PlanPicker
        value={plan}
        onChange={(p) => {
          setPlan(p);
          setTake((m) => Math.min(m, p.durationMonths));
        }}
      />

      <figure className="flex flex-col gap-2">
        <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <span className="text-sm font-medium text-alabaster">{t(COPY.chartTitle)}</span>
          <span className="flex gap-4 text-xs text-alabaster-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-[2px]" style={{ background: BLUE }} aria-hidden="true" />
              {t(COPY.borrowLegend)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-[2px]" style={{ background: GOLD }} aria-hidden="true" />
              {t(COPY.saveLegend)}
            </span>
          </span>
        </figcaption>

        {/* Tooltip row sits above the plot so it never covers the bars. */}
        <div className="relative pt-14">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            className="h-44 w-full sm:h-56"
            role="img"
            aria-label={t(COPY.chartTitle)}
            onPointerLeave={() => setHover(null)}
          >
            <line x1={0} x2={W} y1={zeroY} y2={zeroY} stroke="rgb(248 250 252 / 0.32)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
            {cycle.map((m, i) => {
              const net = nets[i];
              const y = zeroY - net * scale;
              const x = i * slot + gap / 2;
              const isActive = m.month === active;
              const isTake = m.month === take;
              return (
                <g key={m.month}>
                  <path
                    d={barPath(x, slot - gap, zeroY, Math.abs(y - zeroY) < 1 ? zeroY - (net >= 0 ? 1 : -1) : y)}
                    fill={isTake ? "#F8FAFC" : net >= 0 ? GOLD : BLUE}
                    opacity={isActive || isTake ? 1 : 0.78}
                  />
                  {/* Full-height hit target, wider than the mark. */}
                  <rect x={i * slot} y={0} width={slot} height={H} fill="transparent" onPointerEnter={() => setHover(m.month)} onClick={() => setTake(m.month)} className="cursor-pointer" />
                </g>
              );
            })}
          </svg>

          {/* Tooltip — follows the hovered (or chosen) month; text in text tokens, mark carries identity. */}
          <div
            className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-md border border-hairline bg-emerald-900/95 px-2.5 py-1.5 text-xs whitespace-nowrap shadow-lg tabular-nums"
            style={{ left: `clamp(4.5rem, ${((active - 0.5) / cycle.length) * 100}%, calc(100% - 4.5rem))` }}
            aria-hidden="true"
          >
            <div className="text-alabaster-muted">
              {t(COPY.month)} {active} · {t(AUCTION_COPY.prize)} {formatINRCompact(cycle[active - 1].prize, locale)}
            </div>
            <div className={cn("font-semibold", activeNet >= 0 ? "text-gold" : "text-[#8FB8EA]")}>
              {activeNet >= 0 ? "+" : "−"}
              {formatINR(Math.abs(activeNet))}
            </div>
          </div>
        </div>
      </figure>

      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <label htmlFor="take-month" className="text-sm text-alabaster-muted">
            {t(COPY.takeMonth)}
          </label>
          <span className="shrink-0 font-semibold whitespace-nowrap text-alabaster tabular-nums">
            {take} / {plan.durationMonths}
          </span>
        </div>
        <Slider
          id="take-month"
          min={1}
          max={plan.durationMonths}
          step={1}
          value={take}
          onValueChange={(v) => setTake(Array.isArray(v) ? v[0] : v)}
          getAriaLabel={() => t(COPY.takeMonth)}
        />
      </div>

      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-sm text-alabaster-muted">{t(COPY.paid)}</dt>
          <dd className="text-xl font-semibold text-alabaster">
            <AnimatedNumber value={summary.totalPaid} />
          </dd>
        </div>
        <div>
          <dt className="text-sm text-alabaster-muted">{t(COPY.received)}</dt>
          <dd className="text-xl font-semibold text-alabaster">
            <AnimatedNumber value={summary.received} />
          </dd>
        </div>
        <div className="col-span-2 rounded-xl border border-hairline bg-emerald-700/30 px-4 py-3 sm:col-span-1">
          <dt className="text-sm text-alabaster-muted">{summary.net >= 0 ? t(COPY.gain) : t(COPY.cost)}</dt>
          <dd className={cn("font-[family-name:var(--font-jakarta)] text-2xl", summary.net >= 0 ? "text-gold" : "text-[#8FB8EA]")}>
            <AnimatedNumber value={Math.abs(summary.net)} />
          </dd>
        </div>
      </dl>

      <details className="text-sm">
        <summary className="cursor-pointer text-alabaster-muted">{t(COPY.table)}</summary>
        <div className="mt-2 max-h-56 overflow-auto rounded-lg border border-hairline">
          <table className="w-full text-xs tabular-nums">
            <thead className="sticky top-0 bg-emerald-900 text-alabaster-muted">
              <tr>
                <th className="px-2 py-1 text-left">{t(COPY.month)}</th>
                <th className="px-2 py-1 text-right">{t(AUCTION_COPY.prize)}</th>
                <th className="px-2 py-1 text-right">{t(AUCTION_COPY.net)}</th>
                <th className="px-2 py-1 text-right">±</th>
              </tr>
            </thead>
            <tbody>
              {cycle.map((m, i) => (
                <tr key={m.month} className="border-t border-hairline">
                  <td className="px-2 py-1">{m.month}</td>
                  <td className="px-2 py-1 text-right">{formatINR(m.prize)}</td>
                  <td className="px-2 py-1 text-right">{formatINR(m.netInstallment)}</td>
                  <td className="px-2 py-1 text-right">{nets[i] >= 0 ? "+" : "−"}{formatINR(Math.abs(nets[i]))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <p className="text-xs text-alabaster-muted">
        {t(COPY.assumption)} {t(AUCTION_COPY.illustrative)}
      </p>
    </div>
  );
}
