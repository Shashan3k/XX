"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import {
  CALCULATOR,
  CHIT_DURATIONS,
  CHIT_PLANS,
  FIND_YOUR_CHIT,
  UI_STRINGS,
  formatMonths,
  type ChitDuration,
  type ChitPlan,
  type Localized,
} from "@/data/panasunaData";
import { cycleTotals, simulateCycle } from "@/lib/auction";
import { useLocale } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useEnquiry } from "@/components/enquiry/EnquiryProvider";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { BudgetControl } from "@/components/plans/BudgetControl";
import { PlanSelect } from "@/components/plans/PlanSelect";
import { Slider } from "@/components/ui/slider";

// WebGL never blocks the calculator: figures render first, the vault streams in after.
const CalculatorVault = dynamic(() => import("./CalculatorVault"), { ssr: false });

const MIN_VALUE = CHIT_PLANS[0].chitValue;
const MAX_VALUE = CHIT_PLANS[CHIT_PLANS.length - 1].chitValue;
const BUDGET_MIN = Math.min(...CHIT_PLANS.map((p) => p.monthlyInstallment));
const BUDGET_MAX = Math.max(...CHIT_PLANS.map((p) => p.monthlyInstallment));
const DEFAULT_PLAN = CHIT_PLANS.find((p) => p.popular && p.chitValue === 1_000_000) ?? CHIT_PLANS[0];

const valueFill = (v: number) => Math.log(v / MIN_VALUE) / Math.log(MAX_VALUE / MIN_VALUE);
const plain = (n: number) => String(n);
/** AnimatedNumber tweens integers, so a percentage travels as tenths: 750 → "75.0%". */
const tenthsPct = (n: number) => `${(n / 10).toFixed(1)}%`;

type DurationPref = ChitDuration | "any";

/** The largest chit whose full subscription fits the budget; the cheapest plan if none does. */
function planForBudget(budget: number, pref: DurationPref): ChitPlan {
  const pool = CHIT_PLANS.filter((p) => pref === "any" || p.durationMonths === pref);
  const fits = pool.filter((p) => p.monthlyInstallment <= budget);
  if (!fits.length) return pool.reduce((a, b) => (b.monthlyInstallment < a.monthlyInstallment ? b : a));
  return fits.reduce((a, b) =>
    b.chitValue > a.chitValue || (b.chitValue === a.chitValue && b.monthlyInstallment > a.monthlyInstallment) ? b : a,
  );
}

export function ChitCalculator() {
  const { t, locale } = useLocale();
  const theme = useTheme();
  const reduce = usePrefersReducedMotion();
  const { openEnquiry } = useEnquiry();
  const params = useSearchParams();

  const initial = CHIT_PLANS.find((p) => p.id === params.get("plan")) ?? DEFAULT_PLAN;
  const [planId, setPlanId] = React.useState(initial.id);
  const [budget, setBudget] = React.useState(initial.monthlyInstallment);
  const [pref, setPref] = React.useState<DurationPref>(params.has("plan") ? initial.durationMonths : "any");
  const [takeMonth, setTakeMonth] = React.useState(Math.ceil(initial.durationMonths / 2));

  const plan = CHIT_PLANS.find((p) => p.id === planId)!;
  const cycle = React.useMemo(() => simulateCycle(plan), [plan]);
  const month = Math.min(takeMonth, plan.durationMonths);
  const { totalDividend, averageDividend, netPaid } = cycleTotals(plan, cycle);
  const sel = cycle[month - 1];

  const selectPlan = (next: ChitPlan) => {
    setPlanId(next.id);
    // Keep the chosen month in the same place in the cycle when the duration changes.
    setTakeMonth((m) => Math.max(1, Math.round((m / plan.durationMonths) * next.durationMonths)));
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-12">
      {/* The vault: sticky beside the controls on desktop, so every change is seen as it happens. */}
      <div className="lg:sticky lg:top-32 lg:self-start">
        <figure className="relative isolate overflow-hidden rounded-3xl border border-hairline bg-[radial-gradient(ellipse_70%_60%_at_55%_45%,var(--stage-glow),var(--background)_75%)] lg:h-[calc(100svh-9rem)] lg:max-h-[46rem]">
          {/* The stage: on phones the caption flows below it (long Tamil captions would cover the scene). */}
          <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full">
            <CalculatorVault fill={valueFill(plan.chitValue)} reduce={reduce} theme={theme} />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-5 sm:p-6">
              <div>
                <p className="text-sm text-muted-foreground">{t(CALCULATOR.figures.chitValue)}</p>
                <AnimatedNumber
                  value={plan.chitValue}
                  className="text-[clamp(2.25rem,5vw,3.75rem)] leading-none font-semibold tracking-[-0.03em] text-gold-gradient"
                />
              </div>
              <p className="text-right text-sm text-muted-foreground tabular-nums">
                <AnimatedNumber value={plan.durationMonths} format={plain} className="block text-2xl font-semibold text-foreground" />
                {t(UI_STRINGS.months)}
              </p>
            </div>
          </div>
          <figcaption className="px-5 pb-5 text-xs text-muted-foreground sm:absolute sm:inset-x-0 sm:bottom-0 sm:bg-linear-to-t sm:from-background/90 sm:to-transparent sm:p-6 sm:pt-16">
            {t(CALCULATOR.vaultCaption)}
          </figcaption>
        </figure>
      </div>

      <div className="flex min-w-0 flex-col gap-8">
        <section aria-label={t(CALCULATOR.scheme)} className="flex flex-col gap-6 rounded-3xl border border-hairline bg-card/60 p-5 sm:p-7">
          <div className="flex flex-col gap-2">
            <label htmlFor="calc-scheme" className="text-sm font-semibold text-foreground">
              {t(CALCULATOR.scheme)}
            </label>
            <PlanSelect
              id="calc-scheme"
              value={planId}
              onValueChange={(id) => {
                const next = CHIT_PLANS.find((p) => p.id === id)!;
                selectPlan(next);
                setBudget(next.monthlyInstallment);
                setPref(next.durationMonths);
              }}
            />
          </div>

          <div className="border-t border-hairline pt-6">
            <BudgetControl
              value={budget}
              onChange={(n) => {
                setBudget(n);
                selectPlan(planForBudget(n, pref));
              }}
              min={BUDGET_MIN}
              max={BUDGET_MAX}
              label={CALCULATOR.budget}
              inputLabel={FIND_YOUR_CHIT.budget.inputLabel}
            />
            <p className="mt-3 text-xs text-muted-foreground">{t(CALCULATOR.budgetHint)}</p>
          </div>

          <div className="flex flex-col gap-3 border-t border-hairline pt-6">
            <span id="calc-duration" className="text-sm font-semibold text-foreground">
              {t(CALCULATOR.duration)}
            </span>
            <div role="group" aria-labelledby="calc-duration" className="flex flex-wrap gap-2">
              {(["any", ...CHIT_DURATIONS] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  aria-pressed={pref === d}
                  onClick={() => {
                    setPref(d);
                    selectPlan(planForBudget(budget, d));
                  }}
                  className="min-h-10 min-w-12 rounded-full border border-hairline px-3.5 text-sm max-lg:min-h-11 max-lg:min-w-13 text-foreground tabular-nums lining-nums transition-colors duration-150 hover:border-hairline-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-pressed:border-gold-ink aria-pressed:bg-gold/12"
                >
                  {d === "any" ? t(CALCULATOR.anyDuration) : d}
                </button>
              ))}
            </div>
          </div>
        </section>

        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-hairline bg-hairline">
          <Figure label={CALCULATOR.figures.chitValue} value={plan.chitValue} />
          <Figure label={CALCULATOR.figures.members} value={plan.durationMonths} format={plain} note={CALCULATOR.figures.membersNote} />
          <Figure label={CALCULATOR.figures.monthly} value={plan.monthlyInstallment} accent />
          <Figure label={CALCULATOR.figures.totalSubscribed} value={plan.monthlyInstallment * plan.durationMonths} />
        </dl>

        <section aria-labelledby="calc-dividends" className="flex flex-col gap-6 rounded-3xl border border-hairline p-5 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <h2 id="calc-dividends" className="font-sans text-lg font-semibold text-foreground [font-variation-settings:normal]">
              {t(CALCULATOR.figures.avgDividend)}
            </h2>
            <span className="rounded-full border border-hairline-strong px-2.5 py-0.5 text-xs font-semibold text-gold-ink">
              {t(CALCULATOR.illustrative)}
            </span>
          </div>
          <AnimatedNumber value={averageDividend} className="-mt-3 text-4xl font-semibold text-gold-ink" />

          <dl className="grid gap-4 sm:grid-cols-2">
            <SmallFigure label={CALCULATOR.figures.totalDividend} value={totalDividend} />
            <SmallFigure label={CALCULATOR.figures.netPaid} value={netPaid} />
          </dl>

          <div className="flex flex-col gap-3 border-t border-hairline pt-5">
            <div className="flex items-baseline justify-between gap-4">
              <span id="calc-month" className="text-sm text-muted-foreground">
                {t(CALCULATOR.takeMonth)}
              </span>
              <span className="text-lg font-semibold text-foreground tabular-nums">
                {month} / {plan.durationMonths}
              </span>
            </div>
            <Slider
              value={month}
              min={1}
              max={plan.durationMonths}
              onValueChange={(v) => setTakeMonth(Array.isArray(v) ? v[0] : v)}
              getAriaLabel={() => t(CALCULATOR.takeMonth)}
              getAriaValueText={() => `${month} / ${formatMonths(plan.durationMonths, locale)}`}
              className="py-2 [&_[data-slot=slider-thumb]]:size-6 [&_[data-slot=slider-thumb]]:border-gold-ink [&_[data-slot=slider-track]]:h-1.5"
            />
            <p className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <span className="text-sm text-muted-foreground">
                {t(CALCULATOR.figures.prize)} {month}
              </span>
              <AnimatedNumber value={sel.prize} className="text-2xl font-semibold text-foreground" />
            </p>

            {sel.companyChit ? (
              <div className="rounded-2xl border border-gold-ink/50 bg-gold/8 p-4" aria-live="polite">
                <p className="font-semibold text-gold-ink">{t(CALCULATOR.companyChit.title)}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t(CALCULATOR.companyChit.body)}</p>
              </div>
            ) : null}

            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline" aria-live="polite">
              <MonthFigure label={t(CALCULATOR.month.payoutPct)}>
                <AnimatedNumber value={Math.round(sel.payoutRate * 1000)} format={tenthsPct} />
              </MonthFigure>
              <MonthFigure label={t(CALCULATOR.month.discount)}>
                <AnimatedNumber value={sel.discount} />
              </MonthFigure>
              <MonthFigure label={`${t(CALCULATOR.month.dividend)} ${month}`}>
                <AnimatedNumber value={Math.round(sel.dividendPerMember)} />
              </MonthFigure>
              <MonthFigure label={`${t(CALCULATOR.month.net)} ${month}`} accent>
                <AnimatedNumber value={Math.round(sel.netInstallment)} />
              </MonthFigure>
            </dl>
          </div>

          <p className="text-xs text-muted-foreground">{t(CALCULATOR.assumptions)}</p>
        </section>

        <div>
          <MagneticButton size="xl" className="min-h-12 px-6" onClick={() => openEnquiry(plan.id)}>
            {t(CALCULATOR.cta)}
          </MagneticButton>
        </div>
      </div>
    </div>
  );
}

function Figure({
  label,
  value,
  format,
  note,
  accent,
}: {
  label: Localized;
  value: number;
  format?: (n: number) => string;
  note?: Localized;
  accent?: boolean;
}) {
  const { t } = useLocale();
  return (
    <div className="flex flex-col gap-1 bg-background p-5 sm:p-6">
      <dt className="text-sm text-muted-foreground">{t(label)}</dt>
      <dd className={cn("text-[clamp(1.4rem,3vw,1.9rem)] leading-tight font-semibold", accent ? "text-gold-ink" : "text-foreground")}>
        <AnimatedNumber value={value} format={format} />
      </dd>
      {note && <dd className="text-xs text-muted-foreground">{t(note)}</dd>}
    </div>
  );
}

function SmallFigure({ label, value }: { label: Localized; value: number }) {
  const { t } = useLocale();
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-sm text-muted-foreground">{t(label)}</dt>
      <dd className="text-xl font-semibold text-foreground">
        <AnimatedNumber value={value} />
      </dd>
    </div>
  );
}

function MonthFigure({ label, accent, children }: { label: string; accent?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 bg-background p-4">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={cn("text-lg font-semibold", accent ? "text-gold-ink" : "text-foreground")}>{children}</dd>
    </div>
  );
}
