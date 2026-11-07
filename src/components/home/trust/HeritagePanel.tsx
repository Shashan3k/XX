"use client";

import { motion } from "framer-motion";
import { ESTABLISHED_YEAR, HERITAGE_SPAN, OPERATING_YEAR, TRUST_SECTION } from "@/data/panasunaData";
import { useLocale } from "@/lib/i18n";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { PanasunaLogo } from "@/components/brand/PanasunaLogo";

const { heritage } = TRUST_SECTION;

// Dial geometry: 300° of arc from 1975 (lower left) clockwise to 2026, still running (lower right).
const C = 160;
const SPAN_YEARS = OPERATING_YEAR - ESTABLISHED_YEAR;
const HEADLINE_YEARS = 50;
const START_DEG = 210;
const SWEEP_DEG = 300;
const YEARS = Array.from({ length: SPAN_YEARS + 1 }, (_, i) => ESTABLISHED_YEAR + i);


const angleOf = (year: number) => ((START_DEG + ((year - ESTABLISHED_YEAR) / SPAN_YEARS) * SWEEP_DEG) * Math.PI) / 180;
const at = (year: number, r: number) => [C + r * Math.sin(angleOf(year)), C - r * Math.cos(angleOf(year))] as const;
const round = (n: number) => Math.round(n * 100) / 100;

function arcPath(r: number) {
  const [x0, y0] = at(ESTABLISHED_YEAR, r);
  const [x1, y1] = at(ESTABLISHED_YEAR + SPAN_YEARS, r);
  return `M${round(x0)} ${round(y0)}A${r} ${r} 0 1 1 ${round(x1)} ${round(y1)}`;
}

/** Fifty-plus years as a dial: one tick per year, a label per decade, the gold arc sweeping 1975 → 2026. */
function DecadeDial() {
  const { t } = useLocale();
  const reduce = usePrefersReducedMotion();
  const [endX, endY] = at(ESTABLISHED_YEAR + SPAN_YEARS, 140);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[22rem]">
      <svg viewBox="0 0 320 320" aria-hidden="true" className="absolute inset-0 size-full text-gold-ink">
        <path d={arcPath(140)} fill="none" stroke="var(--hairline)" strokeWidth="1" />
        <motion.path
          d={arcPath(140)}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        />
        {YEARS.map((y) => {
          const decade = (y - ESTABLISHED_YEAR) % 10 === 0;
          const [x0, y0] = at(y, decade ? 120 : 126);
          const [x1, y1] = at(y, 132);
          return (
            <line
              key={y}
              x1={round(x0)}
              y1={round(y0)}
              x2={round(x1)}
              y2={round(y1)}
              stroke={decade ? "currentColor" : "var(--hairline-strong)"}
              strokeWidth={decade ? 1.5 : 1}
            />
          );
        })}
        {YEARS.filter((y) => (y - ESTABLISHED_YEAR) % 10 === 0).map((y) => {
          const [x, yy] = at(y, 104);
          return (
            <text
              key={y}
              x={round(x)}
              y={round(yy)}
              textAnchor="middle"
              dominantBaseline="central"
              fill="var(--muted-foreground)"
              style={{ font: "500 11px var(--font-dm-sans)", fontVariantNumeric: "tabular-nums lining-nums" }}
            >
              {y}
            </text>
          );
        })}
        <motion.circle
          cx={round(endX)}
          cy={round(endY)}
          r="4.5"
          fill="var(--color-ember)"
          initial={reduce ? false : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.8, type: "spring", stiffness: 300, damping: 14 }}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <PanasunaLogo variant="mark" className="size-10" />
        <p className="mt-1 font-[family-name:var(--font-jakarta)] text-6xl leading-none text-foreground tabular-nums lining-nums">
          {HEADLINE_YEARS}
          {/* Bodoni's "+" is a hairline that vanishes; set it in Manrope (same as COMPANY.yearsOfTrust "50+"). */}
          <span className="ml-1 align-top font-sans text-3xl font-light text-gold-ink">+</span>
        </p>
        <p className="mt-2 max-w-[9rem] text-sm text-muted-foreground">{t(heritage.dialCaption)}</p>
      </div>
    </div>
  );
}

export function HeritagePanel() {
  const { t } = useLocale();
  return (
    <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
      <DecadeDial />
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <p className="inline-flex items-center gap-2 self-start rounded-full border border-gold-ink/40 px-4 py-1.5 text-sm font-semibold text-gold-ink tabular-nums">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-ember motion-safe:animate-pulse" />
            {t(HERITAGE_SPAN.label)}
          </p>
          <h3 className="text-2xl font-semibold text-foreground sm:text-3xl">{t(heritage.title)}</h3>
          <p className="font-medium text-foreground">{t(HERITAGE_SPAN.note)}</p>
        </div>
        <dl className="grid gap-px overflow-hidden rounded-xl border border-hairline bg-hairline sm:grid-cols-3">
          {heritage.facts.map((f, i) => (
            <div key={i} className="bg-background p-4">
              <dt className="text-sm text-muted-foreground">{t(f.label)}</dt>
              <dd className="mt-1 font-medium text-foreground tabular-nums">{t(f.value)}</dd>
            </div>
          ))}
        </dl>
        <blockquote className="border-l-2 border-gold-ink pl-4">
          <p className="text-sm text-muted-foreground">{t(heritage.mission.title)}</p>
          <p className="mt-1 text-foreground">{t(heritage.mission.body)}</p>
        </blockquote>
      </div>
    </div>
  );
}
