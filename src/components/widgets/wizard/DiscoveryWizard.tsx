"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import {
  CHIT_TERMS,
  FIND_YOUR_CHIT,
  GOALS,
  UI_STRINGS,
  countDiscoverable,
  discoverPlans,
  formatINR,
  formatMonths,
  formatYears,
  navHref,
  type ChitDuration,
  type ChitPlan,
  type GoalId,
  type Localized,
} from "@/data/panasunaData";
import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useEnquiry } from "@/components/enquiry/EnquiryProvider";
import { pageScroll } from "@/components/providers/SmoothScroll";
import { GoalIcon } from "@/components/icons/GoalIcon";
import { PillarIcon } from "@/components/icons/PillarIcon";
import { PanasunaLogo } from "@/components/brand/PanasunaLogo";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { BudgetControl, budgetFraction } from "@/components/plans/BudgetControl";
import { Button } from "@/components/ui/button";
import { DiscoveryDial } from "./DiscoveryDial";

const copy = FIND_YOUR_CHIT;
const { min, max } = copy.budget;
const DEFAULT_BUDGET = 10_000;
const ease = [0.22, 1, 0.36, 1] as const;
const plain = (n: number) => String(n);
const matching = (n: number) => (n === 1 ? copy.summary.matchingOne : copy.summary.matching);

/**
 * "Find your chit" (home section 4). Evolved from design-system Wizard A (stepped): one question per
 * screen, back keeps answers, results before any contact form. The budget is now an amount and the
 * durations are Panasuna's real ones, so results are exact plans rather than bands.
 */
export function DiscoveryWizard() {
  const { t, locale } = useLocale();
  const reduce = usePrefersReducedMotion();
  const { openEnquiry } = useEnquiry();

  const [goal, setGoal] = React.useState<GoalId | null>(null);
  const [monthly, setMonthly] = React.useState(DEFAULT_BUDGET);
  const [budgetSet, setBudgetSet] = React.useState(false);
  const [duration, setDuration] = React.useState<ChitDuration | null>(null);
  const [step, setStep] = React.useState(0);
  const [dir, setDir] = React.useState(1);
  const heading = React.useRef<HTMLHeadingElement>(null);
  const root = React.useRef<HTMLDivElement>(null);
  const moved = React.useRef(false);

  const go = (next: number) => {
    moved.current = true;
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  // Move focus to the new question for keyboard and screen-reader users, but never on first load.
  React.useEffect(() => {
    if (!moved.current) return;
    heading.current?.focus({ preventScroll: true });
    // Steps differ in height; if the new question starts above the fold, bring the wizard back up.
    const el = root.current;
    if (el && el.getBoundingClientRect().top < 0) pageScroll.to(el);
  }, [step]);

  const advance = (next: number) => window.setTimeout(() => go(next), reduce ? 0 : 220);

  const answers = { goal, monthly: budgetSet || step > 1 ? monthly : null, duration };
  const count = countDiscoverable(answers);
  const result = goal && duration ? discoverPlans(goal, monthly, duration) : null;
  const questions = [copy.questions.goal, copy.questions.budget, copy.questions.duration];
  const progress = step >= 3 ? 1 : step / 3 + (step === 1 && budgetSet ? 1 / 6 : 0);

  const restart = () => {
    setGoal(null);
    setMonthly(DEFAULT_BUDGET);
    setBudgetSet(false);
    setDuration(null);
    go(0);
  };

  const option = (selected: boolean) =>
    cn(
      "flex min-h-14 w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-[border-color,background-color] duration-150 ease-crown",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
      selected ? "border-gold-ink bg-gold/10" : "border-hairline hover:border-hairline-strong hover:bg-card",
    );

  return (
    <div ref={root} className="grid overflow-hidden rounded-3xl border border-hairline bg-card/60 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <div className="flex min-w-0 flex-col gap-6 p-5 sm:p-8 lg:p-10">
        {/* Progress: one rail that fills continuously, with a notch per question. */}
        <div className="flex items-center gap-4">
          <div className="relative h-1.5 min-w-16 flex-1 overflow-hidden rounded-full bg-hairline" aria-hidden="true">
            <motion.div
              className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-gold-ink"
              initial={false}
              animate={{ scaleX: Math.max(progress, 0.04) }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 140, damping: 22 }}
            />
            {[1, 2].map((i) => (
              <span key={i} className="absolute inset-y-0 w-0.5 bg-card" style={{ left: `${(i / 3) * 100}%` }} />
            ))}
          </div>
          <span className="min-w-0 text-right text-sm text-muted-foreground tabular-nums">
            {step < 3 ? `${t(copy.step)} ${step + 1} ${t(copy.of)} 3` : t(copy.results.title)}
          </span>
        </div>

        <div className="relative min-h-[26rem]">
          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <motion.div
              key={step}
              initial={reduce ? false : { opacity: 0, x: 28 * dir }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: -28 * dir }}
              transition={{ duration: 0.32, ease }}
              className="flex flex-col gap-5"
            >
              <h3 ref={heading} tabIndex={-1} className="text-xl font-semibold text-foreground outline-none sm:text-2xl">
                {step < 3 ? t(questions[step]) : t(copy.results.title)}
              </h3>

              {step === 0 && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {GOALS.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      aria-pressed={goal === g.id}
                      className={cn(option(goal === g.id), g.id === "other" && "sm:col-span-2")}
                      onClick={() => {
                        setGoal(g.id);
                        advance(1);
                      }}
                    >
                      <GoalIcon id={g.id} active={goal === g.id} className="size-9 shrink-0 text-gold-ink" />
                      <span className="min-w-0">
                        <span className="block font-semibold text-foreground">{t(g.label)}</span>
                        <span className="block text-sm text-muted-foreground">{t(g.description)}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {step === 1 && (
                <>
                  <BudgetControl
                    value={monthly}
                    onChange={(n) => {
                      setMonthly(n);
                      setBudgetSet(true);
                    }}
                    min={min}
                    max={max}
                    presets={copy.budget.presets}
                    label={copy.budget.sliderLabel}
                    inputLabel={copy.budget.inputLabel}
                    presetLabel={copy.questions.budget}
                  />
                  <p className="text-sm text-muted-foreground">{t(copy.budget.hint)}</p>
                  <div>
                    <MagneticButton size="lg" className="min-h-11 px-6" onClick={() => go(2)}>
                      {t(copy.next)}
                    </MagneticButton>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <p className="text-sm text-muted-foreground">{t(copy.duration.hint)}</p>
                  {CHIT_TERMS.map((group) => (
                  <div key={group.id} className="flex flex-col gap-2">
                    <p className="flex items-center gap-2 text-xs font-semibold">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5",
                          group.id === "short" ? "bg-gold/15 text-gold-ink" : "bg-foreground/8 text-foreground",
                        )}
                      >
                        {t(group.label)}
                      </span>
                      <span className="font-normal text-muted-foreground tabular-nums">{t(group.range)}</span>
                    </p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {group.durations.map((d) => {
                      const n = countDiscoverable({ goal, monthly, duration: d });
                      return (
                        <button
                          key={d}
                          type="button"
                          aria-pressed={duration === d}
                          className={cn(option(duration === d), "flex-col items-start gap-0.5")}
                          onClick={() => {
                            setDuration(d);
                            advance(3);
                          }}
                        >
                          <span className="text-2xl leading-tight font-semibold text-foreground tabular-nums lining-nums">
                            {d}{" "}
                            <span className="ms-0.5 text-sm font-normal text-muted-foreground">{t(UI_STRINGS.months)}</span>
                          </span>
                          <span className="text-xs text-muted-foreground tabular-nums">{formatYears(d, locale)}</span>
                          <span className={cn("mt-1 text-xs tabular-nums", n ? "text-gold-ink" : "text-muted-foreground")}>
                            {n} {t(matching(n))}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  </div>
                  ))}
                </>
              )}

              {step === 3 && result && (
                <Results plans={result.plans} match={result.match} exactCount={result.exactCount} onEnquire={openEnquiry} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-hairline pt-4">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => go(step - 1)}>
              <ChevronLeft />
              {t(copy.back)}
            </Button>
          ) : (
            <span />
          )}
          {step === 3 ? (
            <Button variant="outline" onClick={restart}>
              {t(copy.restart)}
            </Button>
          ) : (
            <span className="text-sm text-muted-foreground tabular-nums lg:hidden" aria-live="polite">
              {count} {t(matching(count))}
            </span>
          )}
        </div>
      </div>

      {/* The instrument: answers so far, drawn. Hidden on phones, where the footer carries the live count. */}
      <aside
        aria-label={t(copy.summary.title)}
        className="hidden flex-col gap-6 border-l border-hairline bg-[radial-gradient(ellipse_at_50%_35%,var(--stage-glow),transparent_70%)] p-10 lg:flex"
      >
        <p className="text-sm font-semibold text-foreground">{t(copy.summary.title)}</p>
        <div className="mx-auto aspect-square w-full max-w-[19rem]">
          <DiscoveryDial goal={goal} budget={answers.monthly === null ? null : budgetFraction(monthly, min, max)} duration={duration} />
        </div>
        <dl className="grid gap-3 text-sm">
          <SummaryRow label={copy.questions.goal} value={goal ? t(GOALS.find((g) => g.id === goal)!.label) : null} />
          <SummaryRow
            label={copy.budget.sliderLabel}
            value={answers.monthly === null ? null : `${t(copy.summary.upTo)} ${formatINR(monthly)}${t(UI_STRINGS.perMonth)}`}
          />
          <SummaryRow label={UI_STRINGS.duration} value={duration ? formatMonths(duration, locale) : null} />
        </dl>
        <p className="mt-auto flex items-baseline gap-2 border-t border-hairline pt-4" aria-live="polite">
          <AnimatedNumber value={count} format={plain} className="text-4xl font-semibold text-gold-ink" />
          <span className="text-sm text-muted-foreground">{t(matching(count))}</span>
        </p>
      </aside>
    </div>
  );
}

function SummaryRow({ label, value }: { label: Localized; value: string | null }) {
  const { t } = useLocale();
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4">
      <dt className="truncate text-muted-foreground">{t(label)}</dt>
      <dd className={cn("text-right tabular-nums lining-nums", value ? "font-semibold text-foreground" : "text-muted-foreground")}>
        {value ?? t(copy.summary.pending)}
      </dd>
    </div>
  );
}

function Results({
  plans,
  match,
  exactCount,
  onEnquire,
}: {
  plans: ChitPlan[];
  match: keyof typeof copy.results.match;
  exactCount: number;
  onEnquire: (planId: string) => void;
}) {
  const { t, locale } = useLocale();
  const reduce = usePrefersReducedMotion();
  const shown = plans.slice(0, 3);

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-muted-foreground">{t(copy.results.match[match])}</p>
      <ol className="flex flex-col gap-3">
        {shown.map((plan, i) => (
          <motion.li
            key={plan.id}
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease, delay: reduce ? 0 : 0.08 + i * 0.09 }}
            className={cn(
              "flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5",
              i === 0 ? "border-hairline-strong bg-background/60" : "border-hairline",
            )}
          >
            <div className="min-w-0">
              <p className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold">
                {i === 0 && <span className="text-gold-ink">{t(copy.results.bestMatch)}</span>}
                {i > 0 && i === exactCount && <span className="text-muted-foreground">{t(copy.results.alternative)}</span>}
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 font-medium",
                    plan.term === "short" ? "bg-gold/15 text-gold-ink" : "bg-foreground/8 text-foreground",
                  )}
                >
                  {t(CHIT_TERMS.find((c) => c.id === plan.term)!.label)}
                </span>
              </p>
              <dl className="grid grid-cols-3 gap-x-4 gap-y-1 sm:gap-x-6">
                <PlanFigure label={UI_STRINGS.monthlyInstallment} big={i === 0}>
                  {formatINR(plan.monthlyInstallment)}
                </PlanFigure>
                <PlanFigure label={UI_STRINGS.chitValue} big={i === 0}>
                  {formatINR(plan.chitValue)}
                </PlanFigure>
                <PlanFigure label={UI_STRINGS.duration} big={i === 0}>
                  {formatMonths(plan.durationMonths, locale)}
                </PlanFigure>
              </dl>
            </div>
            <Button
              variant={i === 0 ? "default" : "outline"}
              className="shrink-0"
              onClick={() => onEnquire(plan.id)}
            >
              {t(copy.results.cta)}
            </Button>
          </motion.li>
        ))}
      </ol>

      <ul className="grid gap-3 sm:grid-cols-2">
        {copy.results.terms.map((term) => (
          <li key={term.id} className="flex gap-3">
            <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full border border-hairline text-gold-ink">
              {term.id === "fdr" ? (
                <PanasunaLogo variant="seal" className="size-6" />
              ) : (
                <PillarIcon id="doorstep-collection" play={0} className="size-5" />
              )}
            </span>
            <span className="text-sm">
              <span className="block font-semibold text-foreground">{t(term.label)}</span>
              <span className="block text-muted-foreground">{t(term.body)}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3 border-t border-hairline pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">{t(copy.results.disclaimer)}</p>
          <p className="text-xs text-muted-foreground">{t(UI_STRINGS.installmentNote)}</p>
        </div>
        <Link
          href={navHref("plans")}
          className="shrink-0 text-sm font-semibold text-gold-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
        >
          {t(copy.results.seeAll)}
        </Link>
      </div>
    </div>
  );
}

function PlanFigure({ label, big, children }: { label: Localized; big: boolean; children: React.ReactNode }) {
  const { t } = useLocale();
  return (
    <div className="flex min-w-0 flex-col">
      <dt className="text-xs text-muted-foreground">{t(label)}</dt>
      <dd className={cn("font-semibold text-foreground tabular-nums lining-nums", big ? "text-lg sm:text-xl" : "text-base")}>
        {children}
      </dd>
    </div>
  );
}
