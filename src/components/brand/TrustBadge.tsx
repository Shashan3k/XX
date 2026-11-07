"use client";

import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n";
import { TRUST_FACTS, type TrustFact } from "@/data/panasunaData";

/** Stat-led trust seal. Facts come from TRUST_FACTS — never hardcoded. */
export function TrustBadge({ id, className }: { id: TrustFact["id"]; className?: string }) {
  const { t } = useLocale();
  const fact = TRUST_FACTS.find((f) => f.id === id)!;
  return (
    <div
      className={cn(
        "relative flex items-center gap-4 rounded-2xl border border-hairline bg-emerald-900/60 py-3 pr-5 pl-3",
        className,
      )}
    >
      <div className="grid size-16 shrink-0 place-items-center rounded-full border border-hairline-strong [background:radial-gradient(circle_at_30%_25%,rgb(212_175_55/0.22),transparent_65%)]">
        <span className={cn("font-[family-name:var(--font-jakarta)] text-gold tabular-nums lining-nums", fact.stat.length > 4 ? "text-base" : fact.stat.length > 3 ? "text-lg" : "text-xl")}>
          {fact.stat}
        </span>
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-alabaster">{t(fact.title)}</p>
        <p className="text-sm text-alabaster-muted">{t(fact.body)}</p>
      </div>
    </div>
  );
}
