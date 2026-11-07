"use client";

import Link from "next/link";
import {
  CHIT_PLANS,
  POPULAR_PLANS,
  POPULAR_SECTION,
  UI_STRINGS,
  formatINR,
  formatMonths,
  navHref,
  type ChitPlan,
} from "@/data/panasunaData";
import { useLocale } from "@/lib/i18n";
import { useEnquiry } from "@/components/enquiry/EnquiryProvider";
import { CrownCoinBadge } from "@/components/brand/CrownCoinBadge";
import { Button } from "@/components/ui/button";

const MIN_VALUE = CHIT_PLANS[0].chitValue;
const MAX_VALUE = CHIT_PLANS[CHIT_PLANS.length - 1].chitValue;

/** Where a chit value sits between the smallest and largest plan, on a log scale (the vault's fill level). */
const fill = (v: number) => Math.log(v / MIN_VALUE) / Math.log(MAX_VALUE / MIN_VALUE);

function PopularPlanCard({ plan }: { plan: ChitPlan }) {
  const { t, locale } = useLocale();
  const { openEnquiry } = useEnquiry();
  const level = fill(plan.chitValue);

  return (
    <article className="group/plan relative flex flex-col overflow-hidden rounded-2xl border border-hairline bg-card/70 p-6 transition-[translate,border-color] duration-150 ease-crown hover:-translate-y-1 hover:border-hairline-strong focus-within:border-hairline-strong">
      {/* Vault level: a gold meter at the card's edge, filled by the chit's size among all plans. */}
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-hairline">
        <span className="absolute inset-x-0 bottom-0 bg-gold-ink" style={{ height: `${Math.round(level * 100)}%` }} />
      </span>

      <div className="flex items-start justify-between gap-4">
        <p className="flex items-baseline gap-1 text-foreground">
          <span className="text-[2rem] leading-none font-semibold tabular-nums lining-nums">{formatINR(plan.monthlyInstallment)}</span>
          <span className="text-sm text-muted-foreground">{t(UI_STRINGS.perMonth)}</span>
        </p>
        <CrownCoinBadge className="size-11" />
      </div>

      <p className="mt-6 text-sm text-muted-foreground">{t(POPULAR_SECTION.becomes)}</p>
      <p className="text-[2.4rem] leading-tight font-semibold tracking-[-0.03em] text-gold-gradient tabular-nums lining-nums">
        {formatINR(plan.chitValue)}
      </p>
      <p className="mt-1 text-sm text-foreground tabular-nums">
        {t(POPULAR_SECTION.over)} {formatMonths(plan.durationMonths, locale)}
      </p>

      <Button variant="outline" className="mt-8 w-full border-hairline-strong" onClick={() => openEnquiry(plan.id)}>
        {t(POPULAR_SECTION.cta)}
      </Button>
    </article>
  );
}

export function PopularPlans() {
  const { t } = useLocale();
  return (
    <section id="popular-plans" aria-labelledby="popular-title" className="scroll-mt-20 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2
              id="popular-title"
              className="text-[clamp(2.25rem,4.6vw,3.9rem)] leading-[1.06] tracking-[-0.01em] text-foreground ta:text-[clamp(1.85rem,3.4vw,2.9rem)] ta:leading-[1.4] ta:tracking-normal"
            >
              {t(POPULAR_SECTION.title)}
            </h2>
            <p className="mt-4 text-muted-foreground tabular-nums">{t(POPULAR_SECTION.lead)}</p>
          </div>
          <Link
            href={navHref("plans")}
            className="shrink-0 text-sm font-semibold text-gold-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
          >
            {t(POPULAR_SECTION.seeAll)}
          </Link>
        </header>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {POPULAR_PLANS.map((plan) => (
            <PopularPlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
}
