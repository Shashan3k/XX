"use client";

import * as React from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { COMPARE_TOOLS, COMPARISONS, formatRate, type Comparison } from "@/data/panasunaData";
import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { PanasunaLogo } from "@/components/brand/PanasunaLogo";
import { MantraBand } from "./MantraBand";
import { RateScale } from "./RateScale";

const copy = COMPARE_TOOLS;
const EASE = [0.22, 1, 0.36, 1] as const;

/** /how-chits-work: the six legacy comparisons as a selectable matrix, led by the SAVE – BORROW – PAY mantra. */
export function CompareTools() {
  const { t, locale } = useLocale();
  const reduce = usePrefersReducedMotion();
  const [active, setActive] = React.useState<Comparison["id"]>("credit-card");
  const tabs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const current = COMPARISONS.find((c) => c.id === active)!;
  const id = React.useId();

  // Roving focus (WAI-ARIA tabs): arrows move and select, Home/End jump to the ends.
  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const last = COMPARISONS.length - 1;
    const next =
      e.key === "ArrowDown" || e.key === "ArrowRight"
        ? (i + 1) % COMPARISONS.length
        : e.key === "ArrowUp" || e.key === "ArrowLeft"
          ? (i - 1 + COMPARISONS.length) % COMPARISONS.length
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? last
              : null;
    if (next === null) return;
    e.preventDefault();
    setActive(COMPARISONS[next].id);
    tabs.current[next]?.focus();
  };

  const rateText = (c: Comparison) => formatRate(c.rate, locale) ?? t(copy.marketLinked);

  return (
    <div className="flex flex-col gap-10">
      <MantraBand />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-10">
        <LayoutGroup id={id}>
          <div
            role="tablist"
            aria-label={t(copy.matrixLabel)}
            className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0"
          >
            {COMPARISONS.map((c, i) => {
              const on = c.id === active;
              return (
                <button
                  key={c.id}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`${id}-tab-${c.id}`}
                  aria-selected={on}
                  aria-controls={`${id}-panel`}
                  tabIndex={on ? 0 : -1}
                  onClick={() => setActive(c.id)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                  className={cn(
                    "relative isolate flex shrink-0 snap-start flex-col items-start gap-1 rounded-2xl border px-4 py-3 text-left transition-colors duration-150",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    "lg:flex-row lg:items-center lg:justify-between lg:gap-4",
                    on ? "border-hairline-strong" : "border-hairline hover:border-hairline-strong",
                  )}
                >
                  {on && (
                    <motion.span
                      layoutId="compare-active"
                      aria-hidden="true"
                      className="absolute inset-0 -z-10 rounded-2xl bg-gold/10"
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 36 }}
                    />
                  )}
                  {on && (
                    <motion.span
                      layoutId="compare-rule"
                      aria-hidden="true"
                      className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-gold-ink lg:inset-x-auto lg:inset-y-3 lg:left-0 lg:h-auto lg:w-0.5"
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 36 }}
                    />
                  )}
                  <span className="flex flex-col">
                    <span className={cn("text-sm font-semibold", on ? "text-foreground" : "text-muted-foreground")}>{t(c.instrument)}</span>
                    <span className="text-xs text-muted-foreground">{t(copy.uses[c.use])}</span>
                  </span>
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-xs whitespace-nowrap tabular-nums",
                      on ? "border-gold-ink text-gold-ink" : "border-hairline text-muted-foreground",
                    )}
                  >
                    {rateText(c)}
                  </span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>

        <div
          role="tabpanel"
          id={`${id}-panel`}
          aria-labelledby={`${id}-tab-${active}`}
          tabIndex={0}
          className="min-w-0 rounded-3xl border border-hairline focus-visible:outline-2 focus-visible:outline-ring"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: 0.2, ease: EASE }}
              className="flex flex-col"
            >
              <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-hairline p-5 sm:p-7">
                <h3 className="text-[clamp(1.5rem,2.6vw,2rem)] leading-tight text-foreground ta:text-[clamp(1.25rem,2vw,1.6rem)] ta:leading-snug">
                  {t(current.title)}
                </h3>
                {current.rate && (
                  <p className="text-sm text-muted-foreground tabular-nums">
                    {t(current.rate.label)} <span className="font-semibold text-foreground">{formatRate(current.rate, locale)}</span>
                  </p>
                )}
              </header>

              {current.mantra && (
                <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-hairline px-5 py-4 sm:px-7">
                  <span className="font-semibold tracking-[0.04em] text-gold-ink ta:tracking-normal">{t(current.mantra.chit)}</span>
                  <span className="text-sm text-muted-foreground">{t(copy.mantra.instead)}</span>
                  <span className="text-sm tracking-[0.04em] text-muted-foreground line-through ta:tracking-normal">{t(current.mantra.other)}</span>
                </p>
              )}

              <div className="grid md:grid-cols-2">
                <Column
                  title={t(copy.chit)}
                  points={current.chit[locale]}
                  tone="chit"
                  icon={<PanasunaLogo variant="seal" className="size-7 text-gold-ink" />}
                  reduce={reduce}
                />
                <Column
                  title={t(current.instrument)}
                  points={current.other[locale]}
                  tone="other"
                  reduce={reduce}
                  className="border-t border-hairline md:border-t-0 md:border-l"
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <RateScale active={active} onActivate={setActive} />
    </div>
  );
}

function Column({
  title,
  points,
  tone,
  icon,
  reduce,
  className,
}: {
  title: string;
  points: readonly string[];
  tone: "chit" | "other";
  icon?: React.ReactNode;
  reduce: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 p-5 sm:p-7", tone === "chit" && "bg-gold/5", className)}>
      <p className={cn("flex items-center gap-2 text-sm font-semibold", tone === "chit" ? "text-gold-ink" : "text-muted-foreground")}>
        {icon}
        {title}
      </p>
      <ul className="flex flex-col gap-3">
        {points.map((point, i) => (
          <motion.li
            key={i}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: reduce ? 0 : 0.06 + i * 0.05, ease: EASE }}
            className="flex gap-3 text-[0.95rem] leading-relaxed tabular-nums"
          >
            {tone === "chit" ? (
              <svg viewBox="0 0 16 16" aria-hidden="true" className="mt-1 size-4 shrink-0 text-gold-ink">
                <path d="M3 8.5 6.5 12 13 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <span aria-hidden="true" className="mt-[0.7rem] h-px w-3 shrink-0 bg-muted-foreground" />
            )}
            <span className={tone === "chit" ? "text-foreground" : "text-muted-foreground"}>{point}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
