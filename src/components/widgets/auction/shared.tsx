"use client";

import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n";
import { CHIT_RULES, POPULAR_PLANS, UI_STRINGS, formatINRCompact, formatPercent, type ChitPlan, type Localized } from "@/data/panasunaData";

export const AUCTION_COPY = {
  plan: { en: "Plan", ta: "திட்டம்" },
  discount: { en: "Winning bid (discount)", ta: "வெற்றி ஏலம் (தள்ளுபடி)" },
  prize: { en: "Winner receives", ta: "வெற்றியாளர் பெறுவது" },
  commission: {
    en: `Foreman's commission (${formatPercent(CHIT_RULES.commissionRate)})`,
    ta: `நிறுவனக் கமிஷன் (${formatPercent(CHIT_RULES.commissionRate)})`,
  },
  dividend: { en: "Dividend to each member", ta: "ஒவ்வொரு உறுப்பினருக்கும் ஈவுத்தொகை" },
  pool: { en: "Dividend pool", ta: "ஈவுத்தொகைத் தொகுப்பு" },
  net: { en: "Everyone pays this month", ta: "இந்த மாதம் அனைவரும் செலுத்துவது" },
  instead: { en: "instead of", ta: "என்பதற்குப் பதிலாக" },
  illustrative: {
    en: "Illustration only. Actual bids vary each month; commission and discount caps follow the Chit Funds Act, 1982.",
    ta: "விளக்கத்திற்காக மட்டும். உண்மையான ஏலம் மாதந்தோறும் மாறுபடும்; கமிஷன் மற்றும் தள்ளுபடி வரம்புகள் சீட்டு நிதிச் சட்டம், 1982-இன்படி.",
  },
} satisfies Record<string, Localized>;

/** Popular plans as a segmented picker — the plans people actually ask about. */
export function PlanPicker({
  value,
  onChange,
  plans = POPULAR_PLANS,
}: {
  value: ChitPlan;
  onChange: (p: ChitPlan) => void;
  plans?: readonly ChitPlan[];
}) {
  const { t, locale } = useLocale();
  return (
    <div role="radiogroup" aria-label={t(AUCTION_COPY.plan)} className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
      {plans.map((p) => {
        const on = p.id === value.id;
        return (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(p)}
            className={cn(
              "flex min-h-12 flex-col items-start rounded-lg border px-3 py-1.5 text-left transition-colors duration-150 tabular-nums lining-nums",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
              on ? "border-gold bg-gold/10" : "border-hairline hover:border-hairline-strong",
            )}
          >
            <span className={cn("text-sm font-semibold", on ? "text-gold" : "text-alabaster")}>{formatINRCompact(p.chitValue, locale)}</span>
            <span className="text-xs text-alabaster-muted">
              {p.durationMonths} {t(UI_STRINGS.months)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
