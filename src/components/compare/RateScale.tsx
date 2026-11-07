"use client";

import * as React from "react";
import Link from "next/link";
import { COMPARE_TOOLS, COMPARISONS, formatRate, navHref, type Comparison } from "@/data/panasunaData";
import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const copy = COMPARE_TOOLS.rates;
const MAX = 45;
const TICKS = [0, 10, 20, 30, 40];
/** Panasuna's own bar leads each group: what the saver gains, and what the early bidder pays. */
const GROUPS = [
  { label: copy.earn, chit: copy.chitEarn, ids: ["fixed-deposit", "recurring-deposit"] },
  { label: copy.cost, chit: copy.chitCost, ids: ["bank-loan", "credit-card"] },
] as const;

const pos = (n: number) => `${(n / MAX) * 100}%`;

/**
 * Indicative Indian rates on one 0–45% axis (dataviz: one neutral mark colour, the active row in gold; ranges
 * are 4px-rounded bars). Panasuna's two chit bars are always gold, so the eye lands on them first.
 * Every row also prints its rate and its one-line catch, so nothing depends on reading the geometry.
 * Hover only previews a row inside the chart; a click (or Enter/Space) selects it in the matrix above,
 * so resting the mouse on the chart while scrolling never swaps the comparison someone chose.
 */
export function RateScale({ active, onActivate }: { active: Comparison["id"]; onActivate: (id: Comparison["id"]) => void }) {
  const { t, locale } = useLocale();
  const [preview, setPreview] = React.useState<Comparison["id"] | null>(null);
  const lit = preview ?? active;

  return (
    <figure className="flex flex-col gap-6 rounded-3xl border border-hairline p-5 sm:p-7">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <span className="font-semibold text-foreground">{t(copy.title)}</span>
        <span className="text-xs text-muted-foreground">{t(copy.axis)}</span>
      </figcaption>

      {GROUPS.map((group) => (
        <div key={group.ids[0]} className="flex flex-col gap-3">
          <p className="text-xs font-semibold text-muted-foreground">{t(group.label)}</p>
          <ul className="flex flex-col gap-2" onMouseLeave={() => setPreview(null)}>
            <li>
              <div
                title={t(group.chit.note)}
                className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 rounded-lg border border-gold-ink/40 bg-gold/5 px-2 py-2 sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)_5.5rem]"
              >
                <span className="text-sm font-semibold text-gold-ink max-sm:order-1 max-sm:leading-tight">{t(group.chit.label)}</span>
                <span aria-hidden="true" className="relative h-3 max-sm:order-3 max-sm:col-span-2">
                  {TICKS.map((tick) => (
                    <span key={tick} className="absolute inset-y-[-6px] w-px bg-hairline" style={{ left: pos(tick) }} />
                  ))}
                  <span
                    className="absolute inset-y-0.5 rounded-[4px] bg-gold-ink"
                    style={{ left: pos(group.chit.min), width: pos(group.chit.max - group.chit.min) }}
                  />
                </span>
                <span className="text-right text-sm font-semibold text-foreground tabular-nums max-sm:order-2">{formatRate(group.chit, locale)}</span>
                <span className="col-span-2 text-xs text-muted-foreground max-sm:order-4 sm:col-span-3">{t(group.chit.note)}</span>
              </div>
            </li>
            {group.ids.map((id) => {
              const c = COMPARISONS.find((x) => x.id === id)!;
              const rate = c.rate!;
              const on = lit === id;
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => onActivate(id)}
                    onMouseEnter={() => setPreview(id)}
                    aria-pressed={active === id}
                    title={rate.note ? t(rate.note) : undefined}
                    className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 rounded-lg px-2 py-2 text-left max-lg:min-h-11 transition-colors duration-150 hover:bg-foreground/4 focus-visible:outline-2 focus-visible:outline-ring sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)_5.5rem]"
                  >
                    <span className={cn("text-sm max-sm:order-1 max-sm:leading-tight", on ? "font-semibold text-foreground" : "text-muted-foreground")}>{t(c.instrument)}</span>
                    <span aria-hidden="true" className="relative h-3 max-sm:order-3 max-sm:col-span-2">
                      {/* Recessive grid at the ticks. */}
                      {TICKS.map((tick) => (
                        <span key={tick} className="absolute inset-y-[-6px] w-px bg-hairline" style={{ left: pos(tick) }} />
                      ))}
                      {rate.min !== undefined ? (
                        <span
                          className={cn("absolute inset-y-0.5 rounded-[4px] transition-colors duration-200", on ? "bg-foreground" : "bg-foreground/40")}
                          style={{ left: pos(rate.min), width: pos(rate.max - rate.min) }}
                        />
                      ) : (
                        <>
                          {!rate.approx && (
                            <span
                              className="absolute top-1/2 h-0 -translate-y-1/2 border-t border-dashed border-foreground/35"
                              style={{ left: 0, width: pos(rate.max) }}
                            />
                          )}
                          <span
                            className={cn(
                              "absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-background transition-colors duration-200",
                              on ? "bg-foreground" : "bg-foreground/60",
                            )}
                            style={{ left: pos(rate.max) }}
                          />
                        </>
                      )}
                    </span>
                    <span className={cn("text-right text-sm tabular-nums max-sm:order-2", on ? "font-semibold text-foreground" : "text-muted-foreground")}>
                      {formatRate(rate, locale)}
                    </span>
                    {rate.note && <span className="col-span-2 text-xs text-muted-foreground max-sm:order-4 sm:col-span-3">{t(rate.note)}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      <div aria-hidden="true" className="grid grid-cols-1 gap-3 px-2 sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)_5.5rem]">
        <span className="max-sm:hidden" />
        <span className="relative h-4 text-xs text-muted-foreground tabular-nums">
          {TICKS.map((tick) => (
            <span key={tick} className="absolute -translate-x-1/2" style={{ left: pos(tick) }}>
              {tick}%
            </span>
          ))}
        </span>
        <span className="max-sm:hidden" />
      </div>

      <div className="flex flex-col gap-2 border-t border-hairline pt-5 text-sm">
        <p className="text-foreground">{t(copy.chitNote)}</p>
        <Link
          href={`${navHref("auction")}#simulator`}
          className="self-start font-semibold text-gold-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
        >
          {t(copy.chitLink)}
        </Link>
        <p className="text-xs text-muted-foreground">{t(copy.caveat)}</p>
      </div>
    </figure>
  );
}
