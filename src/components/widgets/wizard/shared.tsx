"use client";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { AnimatePresence, motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/lib/i18n";
import {
  CHIT_PLANS,
  UI_STRINGS,
  WIZARD,
  matchPlans,
  formatINR,
  formatINRCompact,
  type BudgetBandId,
  type ChitPlan,
  type GoalId,
  type Localized,
  type TimelineId,
} from "@/data/panasunaData";

export interface WizardAnswers {
  goal: GoalId | null;
  budget: BudgetBandId | null;
  timeline: TimelineId | null;
}

export const WIZARD_COPY = {
  title: { en: "Find your chit", ta: "உங்கள் சீட்டைக் கண்டறியுங்கள்" },
  step: { en: "Question", ta: "கேள்வி" },
  of: { en: "of", ta: "/" },
  back: { en: "Back", ta: "பின்செல்" },
  restart: { en: "Change answers", ta: "பதில்களை மாற்று" },
  resultsTitle: { en: "Plans that fit", ta: "உங்களுக்குப் பொருந்தும் திட்டங்கள்" },
  bestMatch: { en: "Best match", ta: "மிகப் பொருத்தமானது" },
  matching: { en: "plans match so far", ta: "திட்டங்கள் இதுவரை பொருந்துகின்றன" },
  relaxed: {
    en: "No plan matches all three answers, so these are the closest.",
    ta: "மூன்று பதில்களுக்கும் முழுமையாகப் பொருந்தும் திட்டம் இல்லை; நெருக்கமானவை இவை.",
  },
  noContact: {
    en: "No phone number needed to see these.",
    ta: "இவற்றைப் பார்க்க தொலைபேசி எண் தேவையில்லை.",
  },
} satisfies Record<string, Localized>;

/** Ranked results: first card is the hero, the rest are compact rows. */
export function PlanResults({ plans, exact, max = 3 }: { plans: ChitPlan[]; exact: boolean; max?: number }) {
  const { t, locale } = useLocale();
  const reduce = usePrefersReducedMotion();
  const shown = plans.slice(0, max);

  return (
    <div className="flex flex-col gap-3">
      {!exact && <p className="text-sm text-alabaster-muted">{t(WIZARD_COPY.relaxed)}</p>}
      <ol className="flex flex-col gap-2">
        <AnimatePresence initial={false} mode="popLayout">
          {shown.map((plan, i) => (
            <motion.li
              key={plan.id}
              layout={!reduce}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className={
                i === 0
                  ? "rounded-xl border border-hairline-strong bg-emerald-700/50 p-4"
                  : "rounded-xl border border-hairline px-4 py-3"
              }
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="flex items-center gap-2">
                  <span className={`font-[family-name:var(--font-jakarta)] tabular-nums lining-nums text-alabaster ${i === 0 ? "text-2xl" : "text-lg"}`}>
                    {formatINRCompact(plan.chitValue, locale)}
                  </span>
                  <span className="text-sm text-alabaster-muted tabular-nums">
                    · {plan.durationMonths} {t(UI_STRINGS.months)}
                  </span>
                </span>
                <span className="font-semibold text-gold tabular-nums lining-nums">
                  {formatINR(plan.monthlyInstallment)}
                  <span className="text-sm font-normal text-alabaster-muted">/{locale === "ta" ? "மாதம்" : "mo"}</span>
                </span>
              </div>
              {(i === 0 || plan.popular) && (
                <div className="mt-2 flex gap-2">
                  {i === 0 && <Badge className="border-gold/40 bg-gold/12 text-gold">{t(WIZARD_COPY.bestMatch)}</Badge>}
                  {plan.popular && <Badge variant="outline">{t(UI_STRINGS.popular)}</Badge>}
                </div>
              )}
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>
      <p className="text-xs text-alabaster-muted">{t(UI_STRINGS.installmentNote)}</p>
    </div>
  );
}

/** matchPlans plus whether the result is an exact three-way match (or a relaxed fallback). */
export function resolveMatches(answers: WizardAnswers): { plans: ChitPlan[]; exact: boolean } | null {
  const { goal, budget, timeline } = answers;
  if (!goal || !budget || !timeline) return null;
  const plans = matchPlans(goal, budget, timeline);
  const band = WIZARD.budget.options.find((o) => o.id === budget)!;
  const durations = WIZARD.timeline.options.find((o) => o.id === timeline)!.durations;
  const exact = plans.every(
    (p) => p.monthlyInstallment >= band.min && p.monthlyInstallment <= band.max && durations.includes(p.durationMonths),
  );
  return { plans, exact };
}

/** How many plans satisfy the answers given so far (for live "N plans match" feedback). */
export function countPartial(answers: WizardAnswers): number {
  return CHIT_PLANS.filter((p) => {
    if (answers.goal && !p.goals.includes(answers.goal)) return false;
    if (answers.budget) {
      const band = WIZARD.budget.options.find((o) => o.id === answers.budget)!;
      if (p.monthlyInstallment < band.min || p.monthlyInstallment > band.max) return false;
    }
    if (answers.timeline) {
      const d = WIZARD.timeline.options.find((o) => o.id === answers.timeline)!.durations;
      if (!d.includes(p.durationMonths)) return false;
    }
    return true;
  }).length;
}
