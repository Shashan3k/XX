"use client";

import * as React from "react";
import { motion, useInView } from "framer-motion";
import { COMPARE_TOOLS } from "@/data/panasunaData";
import { useLocale } from "@/lib/i18n";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const copy = COMPARE_TOOLS.mantra;
const EASE = [0.22, 1, 0.36, 1] as const;

/** Save → Borrow → Pay climbs; Buy now → Pay later goes round in circles. */
export function MantraBand() {
  const { t } = useLocale();
  const reduce = usePrefersReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.4 });
  const draw = reduce || seen;

  return (
    <div ref={ref} className="grid overflow-hidden rounded-3xl border border-hairline md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <div className="flex flex-col gap-6 bg-card/60 p-6 sm:p-8">
        <p className="text-sm text-muted-foreground">{t(copy.lead)}</p>
        <p className="text-[clamp(1.6rem,3.4vw,2.6rem)] leading-none font-light tracking-[0.02em] text-gold-ink ta:text-[clamp(1.3rem,2.6vw,1.9rem)] ta:leading-snug ta:tracking-normal">
          {t(copy.chit)}
        </p>
        <svg viewBox="0 0 600 150" aria-hidden="true" className="h-auto w-full overflow-visible">
          <path d="M40 130 C 150 130 190 80 300 80 S 450 26 560 26" fill="none" stroke="var(--hairline)" strokeWidth="2" />
          <motion.path
            d="M40 130 C 150 130 190 80 300 80 S 450 26 560 26"
            fill="none"
            stroke="var(--gold-ink)"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={false}
            animate={{ pathLength: draw ? 1 : 0 }}
            transition={{ duration: reduce ? 0 : 1.4, ease: EASE }}
          />
          {[
            [40, 130],
            [300, 80],
            [560, 26],
          ].map(([cx, cy], i) => (
            <motion.circle
              key={i}
              cx={cx}
              cy={cy}
              r="9"
              fill="var(--gold-ink)"
              stroke="var(--background)"
              strokeWidth="4"
              initial={false}
              animate={{ scale: draw ? 1 : 0, opacity: draw ? 1 : 0 }}
              transition={{ duration: reduce ? 0 : 0.4, delay: reduce ? 0 : 0.25 + i * 0.45, ease: EASE }}
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
            />
          ))}
        </svg>
        <ol className="grid grid-cols-3 gap-3">
          {copy.steps.map((step, i) => (
            <li key={i} className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gold-ink tabular-nums">0{i + 1}</span>
              <span className="font-semibold text-foreground">{t(step.word)}</span>
              <span className="text-sm text-muted-foreground">{t(step.body)}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-col gap-5 border-t border-hairline p-6 sm:p-8 md:border-t-0 md:border-l">
        <p className="text-sm text-muted-foreground">{t(copy.instead)}</p>
        <p className="text-[clamp(1.2rem,2.2vw,1.6rem)] leading-tight font-light tracking-[0.02em] text-muted-foreground line-through decoration-1 ta:tracking-normal">
          {t(copy.other)}
        </p>
        <div className="flex items-center gap-5">
          {/* The vicious cycle: a marker that never gets anywhere. */}
          <svg viewBox="0 0 120 120" aria-hidden="true" className="size-24 shrink-0 text-muted-foreground sm:size-28">
            <circle cx="60" cy="60" r="44" fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.5" strokeDasharray="4 6" />
            <g className="origin-center motion-safe:[animation:spin_7s_linear_infinite]" style={{ transformBox: "view-box" }}>
              <path d="M60 10 l9 6 -9 6z" fill="currentColor" />
            </g>
            <text x="60" y="66" textAnchor="middle" fontSize="18" fill="currentColor" className="tabular-nums">
              ∞
            </text>
          </svg>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">{t(copy.trapLabel)}</p>
            <ol className="mt-2 flex flex-col gap-1.5 text-sm text-muted-foreground">
              {copy.trap.map((step, i) => (
                <li key={i} className={i === copy.trap.length - 1 ? "font-semibold text-foreground tabular-nums" : undefined}>
                  {t(step)}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
