"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { ArrowDownWideNarrow, ArrowUpNarrowWide, Search, X } from "lucide-react";
import {
  CATALOG,
  CHIT_PLANS,
  CHIT_TERMS,
  PLAN_FILTERS,
  PLAN_SCHEMES,
  PLAN_SORTS,
  UI_STRINGS,
  formatINR,
  formatMonths,
  navHref,
  planSearchText,
  type ChitPlan,
  type ChitTerm,
  type PlanSortId,
  type ValueBand,
} from "@/data/panasunaData";
import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useEnquiry } from "@/components/enquiry/EnquiryProvider";
import { CrownCoinBadge } from "@/components/brand/CrownCoinBadge";
import { PanasunaLogo } from "@/components/brand/PanasunaLogo";
import { Button } from "@/components/ui/button";
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from "@/components/ui/select";

type FilterId = "all" | ValueBand;
type TermId = "all" | ChitTerm;
type Order = "asc" | "desc";

const SEARCH_INDEX = new Map(CHIT_PLANS.map((p) => [p.id, planSearchText(p)]));
const ease = [0.22, 1, 0.36, 1] as const;

const UNITS: readonly [RegExp, (n: number, p: ChitPlan) => boolean][] = [
  // "50 months", "50mo", "50 மாதங்கள்" → exactly that duration.
  [/(\d+)\s*(?:months?|mo|மாத\S*)/, (n, p) => p.durationMonths === n],
  // "3 lakh", "3l", "1.5 L", "3 லட்சம்" → that chit value (or monthly subscription).
  [/(\d+(?:\.\d+)?)\s*(?:lakhs?|l|லட்சம்)(?=\s|$)/, (n, p) => p.chitValue === n * 1e5 || p.monthlyInstallment === n * 1e5],
  [/(\d+(?:\.\d+)?)\s*(?:crores?|cr|கோடி)(?=\s|$)/, (n, p) => p.chitValue === n * 1e7],
];

/**
 * Live search. Units are understood ("50 months", "3 lakh"); a bare number matches the start of a
 * plan's chit value, subscription or duration ("3,00,000" and "300000" alike); words match the text.
 */
function matches(plan: ChitPlan, query: string) {
  let q = query.toLowerCase().replace(/₹/g, "").replace(/(\d),(?=\d)/g, "$1");
  for (const [re, test] of UNITS) {
    let m: RegExpMatchArray | null;
    while ((m = q.match(re))) {
      if (!test(Number(m[1]), plan)) return false;
      q = q.replace(m[0], " ");
    }
  }
  const text = SEARCH_INDEX.get(plan.id)!;
  return q
    .split(/\s+/)
    .filter(Boolean)
    .every((tok) =>
      /^\d+$/.test(tok)
        ? [plan.chitValue, plan.monthlyInstallment, plan.durationMonths].some((v) => String(v).startsWith(tok))
        : text.includes(tok),
    );
}

export function PlanCatalog() {
  const { t } = useLocale();
  const reduce = usePrefersReducedMotion();
  const [term, setTerm] = React.useState<TermId>("all");
  const [filter, setFilter] = React.useState<FilterId>("all");
  const [sort, setSort] = React.useState<PlanSortId>("chitValue");
  const [order, setOrder] = React.useState<Order>("asc");
  const [query, setQuery] = React.useState("");
  const deferredQuery = React.useDeferredValue(query);
  const searchId = React.useId();

  const counts = React.useMemo(
    () =>
      Object.fromEntries(
        PLAN_FILTERS.map((f) => [
          f.id,
          CHIT_PLANS.filter((p) => (term === "all" || p.term === term) && (f.id === "all" || p.valueBand === f.id) && matches(p, deferredQuery)).length,
        ]),
      ) as Record<FilterId, number>,
    [term, deferredQuery],
  );

  const termCounts = React.useMemo(
    () =>
      Object.fromEntries(
        (["all", ...CHIT_TERMS.map((c) => c.id)] as TermId[]).map((id) => [
          id,
          CHIT_PLANS.filter((p) => (id === "all" || p.term === id) && (filter === "all" || p.valueBand === filter) && matches(p, deferredQuery)).length,
        ]),
      ) as Record<TermId, number>,
    [filter, deferredQuery],
  );

  const plans = React.useMemo(() => {
    const dir = order === "asc" ? 1 : -1;
    return CHIT_PLANS.filter(
      (p) => (term === "all" || p.term === term) && (filter === "all" || p.valueBand === filter) && matches(p, deferredQuery),
    ).sort(
      (a, b) =>
        dir * (a[sort] - b[sort]) ||
        // Stable, sensible tie-breaks: value, then duration.
        a.chitValue - b.chitValue ||
        a.durationMonths - b.durationMonths,
    );
  }, [term, filter, sort, order, deferredQuery]);

  const sortItems = Object.fromEntries(PLAN_SORTS.map((s) => [s.id, t(s.label)]));

  return (
    <div className="flex flex-col gap-8">
      <p className="-mt-2 inline-flex items-center gap-2 self-start rounded-full border border-gold-ink/40 px-4 py-1.5 text-sm font-semibold text-gold-ink tabular-nums">
        <PanasunaLogo variant="mark" className="size-5" />
        {t(CATALOG.badge)}
      </p>

      {/* Controls: sticky under the header so the filters stay at hand through all 57 cards. */}
      <div className="sticky top-16 z-20 -mx-4 border-y border-hairline bg-background/80 px-4 py-4 backdrop-blur-xl backdrop-saturate-150 max-lg:bg-background/90 max-lg:backdrop-blur-md sm:-mx-8 sm:px-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:gap-4">
          <div
            role="group"
            aria-label={t(CATALOG.termLabel)}
            className="grid shrink-0 grid-cols-3 rounded-full border border-hairline p-1 sm:inline-grid sm:self-start"
          >
            {(["all", ...CHIT_TERMS.map((c) => c.id)] as TermId[]).map((id) => {
              const active = term === id;
              const meta = CHIT_TERMS.find((c) => c.id === id);
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setTerm(id)}
                  title={meta ? t(meta.range) : undefined}
                  className={cn(
                    "relative isolate flex min-h-9 max-lg:min-h-11 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-semibold whitespace-nowrap tabular-nums transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:px-4",
                    active ? "text-background" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="catalog-term"
                      aria-hidden="true"
                      className="absolute inset-0 -z-10 rounded-full bg-foreground"
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  {meta ? t(meta.label) : t(CATALOG.allTerms)}
                  <span className={cn("text-xs font-medium", active ? "text-background/70" : "text-muted-foreground")}>{termCounts[id]}</span>
                </button>
              );
            })}
          </div>
          <div role="group" aria-label={t(CATALOG.filterLabel)} className="no-scrollbar -mx-1 flex min-w-0 gap-1 overflow-x-auto px-1">
            {PLAN_FILTERS.map((f) => {
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "relative isolate flex min-h-10 max-lg:min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold whitespace-nowrap tabular-nums lining-nums transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    active ? "text-obsidian" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="catalog-filter"
                      aria-hidden="true"
                      className="absolute inset-0 -z-10 rounded-full bg-gold"
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  {t(f.label)}
                  <span className={cn("text-xs font-medium", active ? "text-obsidian/70" : "text-muted-foreground")}>{counts[f.id]}</span>
                </button>
              );
            })}
          </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label htmlFor={searchId} className="sr-only">
              {t(CATALOG.searchLabel)}
            </label>
            <span className="relative flex min-w-0 items-center rounded-lg border border-input bg-background focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/24 sm:w-80 dark:bg-input/32">
              <Search aria-hidden="true" className="ms-3 size-4 shrink-0 text-muted-foreground" />
              <input
                id={searchId}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t(CATALOG.searchPlaceholder)}
                className="h-10 w-full min-w-0 bg-transparent px-2.5 text-base text-foreground tabular-nums outline-none placeholder:text-muted-foreground/80 sm:text-sm [&::-webkit-search-cancel-button]:appearance-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label={t(CATALOG.clearSearch)}
                  className="me-1 grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <X className="size-4" />
                </button>
              )}
            </span>

            <div className="flex items-center gap-2">
              <span className="shrink-0 text-sm text-muted-foreground">{t(UI_STRINGS.sortBy)}</span>
              <Select value={sort} onValueChange={(v) => v && setSort(v as PlanSortId)} items={sortItems}>
                <SelectTrigger size="lg" className="min-w-0 flex-1 sm:w-48 sm:flex-none" aria-label={t(UI_STRINGS.sortBy)}>
                  <SelectValue />
                </SelectTrigger>
                <SelectPopup>
                  {PLAN_SORTS.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {t(s.label)}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>
              <Button
                variant="outline"
                size="lg"
                className="shrink-0"
                onClick={() => setOrder((o) => (o === "asc" ? "desc" : "asc"))}
                aria-label={`${t(CATALOG.order)}: ${t(order === "asc" ? UI_STRINGS.ascending : UI_STRINGS.descending)}`}
              >
                {order === "asc" ? <ArrowUpNarrowWide /> : <ArrowDownWideNarrow />}
                <span className="max-sm:sr-only">{t(order === "asc" ? UI_STRINGS.ascending : UI_STRINGS.descending)}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
        {plans.length} {t(CATALOG.showing)}
      </p>

      <LayoutGroup>
        <motion.ul layout={!reduce} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {plans.map((plan) => (
              <motion.li
                key={plan.id}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0, scale: 0.96, transition: { duration: 0.18 } }}
                transition={{ duration: 0.4, ease }}
              >
                <CatalogCard plan={plan} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </LayoutGroup>

      {plans.length === 0 && (
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-hairline-strong p-8">
          <p className="text-foreground">{t(CATALOG.empty)}</p>
          <Button variant="outline" onClick={() => setQuery("")}>
            {t(CATALOG.clearSearch)}
          </Button>
        </div>
      )}

      <p className="text-xs text-muted-foreground">{t(UI_STRINGS.installmentNote)}</p>
    </div>
  );
}

function CatalogCard({ plan }: { plan: ChitPlan }) {
  const { t, locale } = useLocale();
  const { openEnquiry } = useEnquiry();

  return (
    <article className="flex h-full flex-col rounded-2xl border border-hairline bg-card/70 p-5 transition-[translate,border-color] duration-150 ease-crown hover:-translate-y-1 hover:border-hairline-strong focus-within:border-hairline-strong">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{t(UI_STRINGS.chitValue)}</p>
          <p className="text-[1.9rem] leading-tight font-light tracking-[-0.02em] text-foreground tabular-nums lining-nums">
            {formatINR(plan.chitValue)}
          </p>
        </div>
        {plan.popular && <CrownCoinBadge className="size-9" />}
      </div>

      <p className="mt-2 flex flex-wrap gap-2">
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-semibold",
            plan.term === "short" ? "bg-gold/15 text-gold-ink" : "bg-foreground/8 text-foreground",
          )}
        >
          {t(CHIT_TERMS.find((c) => c.id === plan.term)!.label)}
        </span>
        {plan.popular && (
          <span className="rounded-full border border-hairline-strong px-2.5 py-0.5 text-xs font-semibold text-gold-ink">{t(UI_STRINGS.popular)}</span>
        )}
        {plan.scheme && (
          <span className="rounded-full border border-hairline px-2.5 py-0.5 text-xs font-semibold text-foreground">{t(PLAN_SCHEMES[plan.scheme])}</span>
        )}
        {plan.activeGroups !== null && (
          <span className="rounded-full border border-hairline px-2.5 py-0.5 text-xs text-muted-foreground tabular-nums">
            {CATALOG.activeGroups[locale](plan.activeGroups)}
          </span>
        )}
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-hairline pt-4 text-sm">
        <div>
          <dt className="text-muted-foreground">{t(UI_STRINGS.monthlyInstallment)}</dt>
          <dd className="text-lg font-semibold text-gold-ink tabular-nums lining-nums">{formatINR(plan.monthlyInstallment)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t(UI_STRINGS.duration)}</dt>
          <dd className="text-lg font-semibold text-foreground tabular-nums lining-nums">{formatMonths(plan.durationMonths, locale)}</dd>
        </div>
      </dl>

      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        <Button className="flex-1" onClick={() => openEnquiry(plan.id)}>
          {t(UI_STRINGS.joinNow)}
        </Button>
        <Button variant="ghost" render={<Link href={`${navHref("calculator")}?plan=${plan.id}`} />}>
          {t(CATALOG.calculate)}
        </Button>
      </div>
    </article>
  );
}
