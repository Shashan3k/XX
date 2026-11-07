"use client";

import * as React from "react";
import { useLocale } from "@/lib/i18n";
import { GOALS, WIZARD, type BudgetBandId, type GoalId, type Localized, type TimelineId } from "@/data/panasunaData";
import { PlanResults, resolveMatches, type WizardAnswers } from "./shared";

/**
 * Sentence frames per language. Tamil puts the verb last and would need case suffixes on the
 * goal label, so its frame names the goal as a separate clause instead of inflecting it.
 */
const FRAME: Localized<readonly (string | "goal" | "budget" | "timeline")[]> = {
  en: ["I'm saving for", "goal", "and can set aside", "budget", "a month for", "timeline", "."],
  ta: ["என் இலக்கு", "goal", ". மாதம்", "budget", "ஒதுக்கி,", "timeline", "சேமிக்க விரும்புகிறேன்."],
};

function InlineSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { id: string; text: string }[];
}) {
  const current = options.find((o) => o.id === value)?.text ?? "";
  return (
    <span className="relative inline-grid align-baseline">
      {/* Visible text sizes the control; the native select sits on top for real mobile pickers. */}
      <span aria-hidden="true" className="col-start-1 row-start-1 border-b-2 border-gold pb-0.5 text-gold whitespace-nowrap tabular-nums lining-nums">
        {current}
        <svg viewBox="0 0 12 12" className="ml-1 inline size-[0.45em] align-middle" aria-hidden="true">
          <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </span>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="col-start-1 row-start-1 w-full cursor-pointer appearance-none bg-transparent text-transparent opacity-0 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-gold"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id} className="bg-emerald-900 text-alabaster">
            {o.text}
          </option>
        ))}
      </select>
    </span>
  );
}

/**
 * Variant B — sentence builder. All three answers live in one editable sentence with
 * live results underneath. Fastest for confident users; denser on a 375px screen.
 */
export function WizardSentence() {
  const { t, locale } = useLocale();
  const [answers, setAnswers] = React.useState<WizardAnswers>({ goal: "vehicle", budget: "5k-15k", timeline: "2-3y" });
  const matches = resolveMatches(answers);

  const slots = {
    goal: (
      <InlineSelect
        key="goal"
        label={t(WIZARD.goal.question)}
        value={answers.goal!}
        onChange={(v) => setAnswers((a) => ({ ...a, goal: v as GoalId }))}
        options={GOALS.map((g) => ({ id: g.id, text: t(g.label).toLowerCase() }))}
      />
    ),
    budget: (
      <InlineSelect
        key="budget"
        label={t(WIZARD.budget.question)}
        value={answers.budget!}
        onChange={(v) => setAnswers((a) => ({ ...a, budget: v as BudgetBandId }))}
        options={WIZARD.budget.options.map((o) => ({ id: o.id, text: t(o.label) }))}
      />
    ),
    timeline: (
      <InlineSelect
        key="timeline"
        label={t(WIZARD.timeline.question)}
        value={answers.timeline!}
        onChange={(v) => setAnswers((a) => ({ ...a, timeline: v as TimelineId }))}
        options={WIZARD.timeline.options.map((o) => ({ id: o.id, text: t(o.label).toLowerCase() }))}
      />
    ),
  };

  return (
    <div className="flex flex-col gap-6">
      <p className="text-2xl leading-[1.7] text-alabaster sm:text-3xl" style={{ fontFamily: locale === "ta" ? "var(--font-display-ta)" : "var(--font-display)" }}>
        {FRAME[locale].map((part, i, all) => {
          const space = all[i + 1]?.startsWith(".") ? "" : " ";
          return (
            <React.Fragment key={i}>
              {part === "goal" || part === "budget" || part === "timeline" ? slots[part] : part}
              {space}
            </React.Fragment>
          );
        })}
      </p>
      {matches && <PlanResults plans={matches.plans} exact={matches.exact} />}
    </div>
  );
}
