"use client";

import * as React from "react";
import { formatINR, type Localized } from "@/data/panasunaData";
import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

const STEPS = 1000;

/** Round to a step a person would type: ₹500 under ₹10k, ₹1,000 under ₹1 L, ₹5,000 above. */
export function niceAmount(n: number): number {
  const step = n < 10_000 ? 500 : n < 100_000 ? 1_000 : 5_000;
  return Math.round(n / step) * step;
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/**
 * ₹2,000 to ₹5,00,000 is a 250× range, so the slider is logarithmic: each stretch of the track
 * covers the same *ratio*, and ₹5,000 vs ₹10,000 is as easy to hit as ₹2 L vs ₹4 L.
 */
function toPosition(amount: number, min: number, max: number) {
  return Math.round((Math.log(clamp(amount, min, max) / min) / Math.log(max / min)) * STEPS);
}
function fromPosition(pos: number, min: number, max: number) {
  return clamp(niceAmount(min * Math.pow(max / min, pos / STEPS)), min, max);
}

/** Fraction of the range on the same log scale (for dials and meters). */
export function budgetFraction(amount: number, min: number, max: number) {
  return toPosition(amount, min, max) / STEPS;
}

export function BudgetControl({
  value,
  onChange,
  min,
  max,
  presets,
  label,
  inputLabel,
  presetLabel,
  className,
}: {
  value: number;
  onChange: (amount: number) => void;
  min: number;
  max: number;
  presets?: readonly number[];
  label: Localized;
  inputLabel: Localized;
  /** Accessible name for the preset group. */
  presetLabel?: Localized;
  className?: string;
}) {
  const { t } = useLocale();
  const id = React.useId();
  // The typed field keeps its own draft so "1,2" mid-typing isn't reformatted under the cursor.
  const [draft, setDraft] = React.useState<string | null>(null);

  const commitDraft = () => {
    if (draft === null) return;
    const n = Number(draft.replace(/\D/g, ""));
    if (n > 0) onChange(clamp(n, min, max));
    setDraft(null);
  };

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
        <span id={`${id}-label`} className="text-sm text-muted-foreground">
          {t(label)}
        </span>
        <output
          htmlFor={`${id}-input`}
          aria-live="polite"
          className="text-[2.5rem] leading-none font-light tracking-[-0.02em] text-foreground tabular-nums lining-nums sm:text-5xl"
        >
          {formatINR(value)}
        </output>
      </div>

      <div className="flex flex-col gap-2">
        <Slider
          value={toPosition(value, min, max)}
          min={0}
          max={STEPS}
          onValueChange={(v) => onChange(fromPosition(Array.isArray(v) ? v[0] : v, min, max))}
          getAriaLabel={() => t(label)}
          getAriaValueText={() => formatINR(value)}
          className="py-2 [&_[data-slot=slider-thumb]]:size-6 [&_[data-slot=slider-thumb]]:border-gold-ink [&_[data-slot=slider-track]]:h-1.5"
        />
        <div aria-hidden="true" className="flex justify-between text-xs text-muted-foreground tabular-nums lining-nums">
          <span>{formatINR(min)}</span>
          <span>{formatINR(max)}</span>
        </div>
      </div>

      {presets && (
        <div role="group" aria-label={presetLabel ? t(presetLabel) : undefined} className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={value === p}
              onClick={() => onChange(p)}
              className="min-h-11 rounded-full border border-hairline px-4 text-sm text-foreground tabular-nums lining-nums transition-colors duration-150 hover:border-hairline-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-pressed:border-gold-ink aria-pressed:bg-gold/12"
            >
              {formatINR(p)}
            </button>
          ))}
        </div>
      )}

      <label htmlFor={`${id}-input`} className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
        {t(inputLabel)}
        <span className="relative inline-flex w-40 items-center rounded-lg border border-input bg-background focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/24 dark:bg-input/32">
          <span aria-hidden="true" className="ps-3 text-foreground">
            ₹
          </span>
          <input
            id={`${id}-input`}
            inputMode="numeric"
            autoComplete="off"
            value={draft ?? value.toLocaleString("en-IN")}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitDraft}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), commitDraft())}
            className="h-11 w-full min-w-0 bg-transparent px-2 text-base text-foreground tabular-nums lining-nums outline-none"
          />
        </span>
      </label>
    </div>
  );
}
