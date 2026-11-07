"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n";
import { UI_STRINGS, formatINR, formatINRCompact, type ChitPlan } from "@/data/panasunaData";

export function PlanCard({ plan, className, onJoin }: { plan: ChitPlan; className?: string; onJoin?: (plan: ChitPlan) => void }) {
  const { t, locale } = useLocale();
  return (
    <Card
      className={cn(
        "gap-4 p-5 transition-[translate,border-color] duration-150 ease-crown hover:-translate-y-1 hover:border-hairline-strong",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-alabaster-muted">{t(UI_STRINGS.chitValue)}</p>
          <p className="font-[family-name:var(--font-jakarta)] text-3xl text-alabaster tabular-nums lining-nums">
            {formatINRCompact(plan.chitValue, locale)}
          </p>
        </div>
        {plan.popular && <Badge className="border-gold/40 bg-gold/12 text-gold">{t(UI_STRINGS.popular)}</Badge>}
      </div>
      <dl className="grid grid-cols-2 gap-3 border-t border-hairline pt-4 text-sm">
        <div>
          <dt className="text-alabaster-muted">{t(UI_STRINGS.monthlyInstallment)}</dt>
          <dd className="text-lg font-semibold text-gold tabular-nums lining-nums">{formatINR(plan.monthlyInstallment)}</dd>
        </div>
        <div>
          <dt className="text-alabaster-muted">{t(UI_STRINGS.duration)}</dt>
          <dd className="text-lg font-semibold text-alabaster tabular-nums lining-nums">
            {plan.durationMonths} {t(UI_STRINGS.months)}
          </dd>
        </div>
      </dl>
      {onJoin && (
        <Button variant="outline" className="w-full" onClick={() => onJoin(plan)}>
          {t(UI_STRINGS.joinNow)}
        </Button>
      )}
    </Card>
  );
}
