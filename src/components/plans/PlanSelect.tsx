"use client";

import * as React from "react";
import { CHIT_PLANS, ENQUIRY, PLAN_FILTERS, UI_STRINGS, formatINR, formatMonths, type ChitPlan, type Locale } from "@/data/panasunaData";
import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Select, SelectGroup, SelectGroupLabel, SelectItem, SelectPopup, SelectTrigger, SelectValue } from "@/components/ui/select";

/** "₹3,00,000 · 50 months · ₹6,000/mo": one line that names a scheme unambiguously. */
export function planLabel(plan: ChitPlan, locale: Locale): string {
  return `${formatINR(plan.chitValue)} · ${formatMonths(plan.durationMonths, locale)} · ${formatINR(plan.monthlyInstallment)}${UI_STRINGS.perMonth[locale]}`;
}

const BANDS = PLAN_FILTERS.filter((f) => f.id !== "all");

/** Every real scheme, grouped by the catalogue's value bands. */
export function PlanSelect({
  value,
  onValueChange,
  id,
  invalid,
  className,
  "aria-describedby": describedBy,
  ref,
}: {
  value: string | null;
  onValueChange: (id: string) => void;
  id?: string;
  invalid?: boolean;
  className?: string;
  "aria-describedby"?: string;
  /** The trigger button, so a form can move focus here when the scheme is missing. */
  ref?: React.Ref<HTMLButtonElement>;
}) {
  const { t, locale } = useLocale();
  const items = React.useMemo(() => Object.fromEntries(CHIT_PLANS.map((p) => [p.id, planLabel(p, locale)])), [locale]);

  return (
    <Select value={value} onValueChange={(v) => v && onValueChange(v as string)} items={items}>
      <SelectTrigger
        ref={ref}
        id={id}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        size="lg"
        className={cn("tabular-nums lining-nums", className)}
      >
        <SelectValue placeholder={t(ENQUIRY.choosePlan)} />
      </SelectTrigger>
      <SelectPopup data-lenis-prevent>
        {BANDS.map((band) => (
          <SelectGroup key={band.id}>
            <SelectGroupLabel className="tabular-nums">{t(band.label)}</SelectGroupLabel>
            {CHIT_PLANS.filter((p) => p.valueBand === band.id).map((p) => (
              <SelectItem key={p.id} value={p.id} className="tabular-nums lining-nums">
                {items[p.id]}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectPopup>
    </Select>
  );
}
