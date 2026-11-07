"use client";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoalIcon } from "@/components/icons/GoalIcon";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n";
import { GOALS, WIZARD } from "@/data/panasunaData";
import { PlanResults, WIZARD_COPY, countPartial, resolveMatches, type WizardAnswers } from "./shared";

const EMPTY: WizardAnswers = { goal: null, budget: null, timeline: null };

/**
 * Variant A — stepped. One question per screen, progress rail, back keeps answers,
 * results before any contact form. Built for Persona B at 375px.
 */
export function WizardStepped() {
  const { t } = useLocale();
  const reduce = usePrefersReducedMotion();
  const [answers, setAnswers] = React.useState<WizardAnswers>(EMPTY);
  const [step, setStep] = React.useState(0);
  const [dir, setDir] = React.useState(1);
  const headingRef = React.useRef<HTMLHeadingElement>(null);

  const go = (next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  React.useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  const pick = <K extends keyof WizardAnswers>(key: K, value: WizardAnswers[K], nextStep: number) => {
    setAnswers((a) => ({ ...a, [key]: value }));
    window.setTimeout(() => go(nextStep), reduce ? 0 : 180);
  };

  const matches = resolveMatches(answers);
  const partial = countPartial(answers);

  const questions = [WIZARD.goal.question, WIZARD.budget.question, WIZARD.timeline.question];

  const optionClass = (selected: boolean) =>
    cn(
      "flex min-h-14 w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-[border-color,background-color] duration-150 ease-crown",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
      selected ? "border-gold bg-gold/10 text-alabaster" : "border-hairline hover:border-hairline-strong hover:bg-emerald-700/40",
    );

  const slide = {
    initial: reduce ? false : { opacity: 0, x: 24 * dir },
    animate: { opacity: 1, x: 0 },
    exit: reduce ? undefined : { opacity: 0, x: -24 * dir },
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Progress rail: three segments, the current one fills. */}
      <div className="flex items-center gap-3">
        <div className="flex flex-1 gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-emerald-700">
              <motion.span
                className="block h-full rounded-full bg-gold"
                initial={false}
                animate={{ width: step > i ? "100%" : step === i ? "35%" : "0%" }}
                transition={{ duration: reduce ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
              />
            </span>
          ))}
        </div>
        <span className="text-sm text-alabaster-muted tabular-nums">
          {step < 3 ? `${t(WIZARD_COPY.step)} ${step + 1} ${t(WIZARD_COPY.of)} 3` : t(WIZARD_COPY.resultsTitle)}
        </span>
      </div>

      <div className="relative min-h-[23rem]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={step} {...slide} className="flex flex-col gap-4">
            <h3 ref={headingRef} tabIndex={-1} className="text-xl font-semibold text-alabaster outline-none sm:text-2xl">
              {step < 3 ? t(questions[step]) : t(WIZARD_COPY.resultsTitle)}
            </h3>

            {step === 0 && (
              <div className="grid gap-2 sm:grid-cols-2">
                {GOALS.map((g) => (
                  <button key={g.id} type="button" className={optionClass(answers.goal === g.id)} aria-pressed={answers.goal === g.id} onClick={() => pick("goal", g.id, 1)}>
                    <GoalIcon id={g.id} active={answers.goal === g.id} className="size-8 shrink-0 text-gold" />
                    <span className="min-w-0">
                      <span className="block font-medium">{t(g.label)}</span>
                      <span className="block text-sm text-alabaster-muted">{t(g.description)}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-2">
                {WIZARD.budget.options.map((o) => (
                  <button key={o.id} type="button" className={optionClass(answers.budget === o.id)} aria-pressed={answers.budget === o.id} onClick={() => pick("budget", o.id, 2)}>
                    <span className="font-medium tabular-nums lining-nums">{t(o.label)}</span>
                  </button>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-alabaster-muted">{t(WIZARD.timeline.hint)}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {WIZARD.timeline.options.map((o) => (
                    <button key={o.id} type="button" className={optionClass(answers.timeline === o.id)} aria-pressed={answers.timeline === o.id} onClick={() => pick("timeline", o.id, 3)}>
                      <span className="font-medium tabular-nums lining-nums">{t(o.label)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && matches && (
              <>
                <PlanResults plans={matches.plans} exact={matches.exact} />
                <p className="text-sm text-alabaster-muted">{t(WIZARD_COPY.noContact)}</p>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-hairline pt-4">
        {step > 0 ? (
          <Button variant="ghost" onClick={() => go(step === 3 ? 2 : step - 1)}>
            <ChevronLeft />
            {t(WIZARD_COPY.back)}
          </Button>
        ) : (
          <span />
        )}
        {step === 3 ? (
          <Button
            variant="outline"
            onClick={() => {
              setAnswers(EMPTY);
              go(0);
            }}
          >
            {t(WIZARD_COPY.restart)}
          </Button>
        ) : (
          step > 0 && (
            <span className="text-sm text-alabaster-muted tabular-nums" aria-live="polite">
              {partial} {t(WIZARD_COPY.matching)}
            </span>
          )
        )}
      </div>
    </div>
  );
}
