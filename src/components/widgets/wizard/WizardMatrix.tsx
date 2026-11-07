"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n";
import {
  CHIT_DURATIONS,
  CHIT_PLANS,
  GOALS,
  UI_STRINGS,
  WIZARD,
  formatINR,
  formatINRCompact,
  type ChitPlan,
  type Localized,
} from "@/data/panasunaData";
import { resolveMatches, type WizardAnswers } from "./shared";

const COPY = {
  axisValue: { en: "Chit value", ta: "சீட்டுத் தொகை" },
  axisMonths: { en: "Months", ta: "மாதங்கள்" },
  matches: { en: "matching plans lit", ta: "பொருந்தும் திட்டங்கள் ஒளிர்கின்றன" },
  pickCell: { en: "Tap a lit cell for details.", ta: "விவரங்களுக்கு ஒளிரும் கட்டத்தைத் தொடுங்கள்." },
} satisfies Record<string, Localized>;

function Chips<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T | null;
  options: { id: T; label: string }[];
  onChange: (v: T | null) => void;
}) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-2">
      <legend className="mb-2 text-sm text-alabaster-muted">{label}</legend>
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={value === o.id}
            onClick={() => onChange(value === o.id ? null : o.id)}
            className={cn(
              "min-h-10 shrink-0 rounded-full border px-3.5 text-sm whitespace-nowrap transition-colors duration-150 tabular-nums",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
              value === o.id ? "border-gold bg-gold text-obsidian" : "border-hairline text-alabaster-muted hover:border-hairline-strong hover:text-alabaster",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * Variant C — plan matrix. Every one of the 29 plans is visible at once on a value × duration
 * grid; answers light up the fits. Maximum transparency, highest cognitive load.
 */
export function WizardMatrix() {
  const { t, locale } = useLocale();
  const [answers, setAnswers] = React.useState<WizardAnswers>({ goal: null, budget: null, timeline: null });
  const [selected, setSelected] = React.useState<ChitPlan | null>(null);

  const values = React.useMemo(() => [...new Set(CHIT_PLANS.map((p) => p.chitValue))].sort((a, b) => a - b), []);
  const byKey = React.useMemo(() => new Map(CHIT_PLANS.map((p) => [`${p.chitValue}-${p.durationMonths}`, p])), []);

  const lit = React.useMemo(() => {
    const set = new Set<string>();
    for (const p of CHIT_PLANS) {
      if (answers.goal && !p.goals.includes(answers.goal)) continue;
      if (answers.budget) {
        const b = WIZARD.budget.options.find((o) => o.id === answers.budget)!;
        if (p.monthlyInstallment < b.min || p.monthlyInstallment > b.max) continue;
      }
      if (answers.timeline) {
        const d = WIZARD.timeline.options.find((o) => o.id === answers.timeline)!.durations;
        if (!d.includes(p.durationMonths)) continue;
      }
      set.add(p.id);
    }
    return set;
  }, [answers]);

  const best = resolveMatches(answers)?.plans[0];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4">
        <Chips label={t(WIZARD.goal.question)} value={answers.goal} options={GOALS.map((g) => ({ id: g.id, label: t(g.label) }))} onChange={(goal) => setAnswers((a) => ({ ...a, goal }))} />
        <Chips label={t(WIZARD.budget.question)} value={answers.budget} options={WIZARD.budget.options.map((o) => ({ id: o.id, label: t(o.label) }))} onChange={(budget) => setAnswers((a) => ({ ...a, budget }))} />
        <Chips label={t(WIZARD.timeline.question)} value={answers.timeline} options={WIZARD.timeline.options.map((o) => ({ id: o.id, label: t(o.label) }))} onChange={(timeline) => setAnswers((a) => ({ ...a, timeline }))} />
      </div>

      <p className="text-sm text-alabaster-muted tabular-nums" aria-live="polite">
        {lit.size} / {CHIT_PLANS.length} {t(COPY.matches)}. {t(COPY.pickCell)}
      </p>

      <div className="overflow-x-auto rounded-xl border border-hairline">
        <table className="w-full min-w-[22rem] border-collapse text-xs tabular-nums lining-nums sm:text-sm">
          <caption className="sr-only">
            {t(COPY.axisValue)} × {t(COPY.axisMonths)}
          </caption>
          <thead>
            <tr className="text-alabaster-muted">
              <th scope="col" className="sticky left-0 bg-emerald-900 px-2 py-2 text-left font-medium">
                ₹ \ {t(COPY.axisMonths)}
              </th>
              {CHIT_DURATIONS.map((d) => (
                <th key={d} scope="col" className="px-1 py-2 font-medium">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {values.map((v) => (
              <tr key={v} className="border-t border-hairline">
                <th scope="row" className="sticky left-0 bg-emerald-900 px-2 py-1.5 text-left font-medium text-alabaster">
                  {formatINRCompact(v, "en")}
                </th>
                {CHIT_DURATIONS.map((d) => {
                  const p = byKey.get(`${v}-${d}`);
                  if (!p) return <td key={d} className="px-1 py-1.5 text-center text-alabaster-muted/40">·</td>;
                  const on = lit.has(p.id);
                  const isSel = selected?.id === p.id;
                  return (
                    <td key={d} className="p-0.5 text-center">
                      <button
                        type="button"
                        onClick={() => setSelected(p)}
                        aria-pressed={isSel}
                        aria-label={`${formatINR(p.chitValue)}, ${d} ${t(UI_STRINGS.months)}, ${formatINR(p.monthlyInstallment)}`}
                        className={cn(
                          "min-h-9 w-full rounded-md px-1 transition-colors duration-150",
                          "focus-visible:outline-2 focus-visible:outline-gold",
                          on ? "bg-gold/18 text-gold" : "text-alabaster-muted/50",
                          isSel && "bg-gold text-obsidian",
                          best?.id === p.id && !isSel && "ring-1 ring-gold",
                        )}
                      >
                        {formatINRCompact(p.monthlyInstallment, "en")}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="flex flex-wrap items-baseline justify-between gap-3 rounded-xl border border-hairline-strong bg-emerald-700/40 px-4 py-3">
          <span className="font-[family-name:var(--font-jakarta)] text-xl text-alabaster tabular-nums">
            {formatINRCompact(selected.chitValue, locale)} · {selected.durationMonths} {t(UI_STRINGS.months)}
          </span>
          <span className="font-semibold text-gold tabular-nums">{formatINR(selected.monthlyInstallment)}</span>
        </div>
      )}
    </div>
  );
}
