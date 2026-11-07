"use client";

import * as React from "react";
import { Pause, Play } from "lucide-react";
import { CUSTOMERS, CUSTOMERS_SECTION, INDUSTRIES, type Customer } from "@/data/panasunaData";
import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { IndustryIcon } from "@/components/icons/IndustryIcon";
import { GoogleReviews } from "@/components/home/GoogleReviews";

const copy = CUSTOMERS_SECTION;

/**
 * Home §9: the eight customer businesses from the old site in an endless marquee. The list renders
 * twice (the copy is aria-hidden) and slides by exactly one copy, so the loop has no seam. It pauses
 * on hover and focus, has a pause button (WCAG 2.2.2), and stands still under reduced motion.
 */
export function CustomersSection() {
  const { t } = useLocale();
  const [paused, setPaused] = React.useState(false);

  return (
    <section id="customers" aria-labelledby="customers-title" className="scroll-mt-20 overflow-hidden border-t border-hairline py-24 md:py-32">
      <header className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
        <h2
          id="customers-title"
          className="text-[clamp(2.25rem,4.6vw,3.9rem)] leading-[1.06] tracking-[-0.01em] text-foreground ta:text-[clamp(1.85rem,3.4vw,2.9rem)] ta:leading-[1.4] ta:tracking-normal"
        >
          {t(copy.title)}
        </h2>
        <p className="text-muted-foreground lg:pb-2">{t(copy.lead)}</p>
      </header>

      <div
        className="group/marquee relative mt-14 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] motion-reduce:[mask-image:none]"
        data-paused={paused || undefined}
      >
        <div className="flex w-max motion-safe:animate-[pn-marquee_48s_linear_infinite] group-hover/marquee:[animation-play-state:paused] group-focus-within/marquee:[animation-play-state:paused] group-data-paused/marquee:[animation-play-state:paused] motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center">
          <CustomerList label={t(copy.listLabel)} />
          <CustomerList hidden className="motion-reduce:hidden" />
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-6 px-4 sm:px-8 md:flex-row md:items-end md:justify-between">
        <figure className="max-w-2xl">
          <blockquote className="text-lg leading-relaxed text-foreground">
            <p>“{t(copy.quote)}”</p>
          </blockquote>
          <figcaption className="mt-2 text-sm text-muted-foreground">— {t(copy.quoteBy)}</figcaption>
        </figure>
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-pressed={paused}
          className="inline-flex items-center gap-2 self-start rounded-full border border-hairline px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-hairline-strong hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring motion-reduce:hidden md:self-auto"
        >
          {paused ? <Play aria-hidden="true" className="size-3.5" /> : <Pause aria-hidden="true" className="size-3.5" />}
          {t(paused ? copy.play : copy.pause)}
        </button>
      </div>

      <GoogleReviews />
    </section>
  );
}

function CustomerList({ label, hidden = false, className }: { label?: string; hidden?: boolean; className?: string }) {
  return (
    <ul
      aria-label={label}
      aria-hidden={hidden || undefined}
      className={cn("flex shrink-0 gap-4 pr-4 motion-reduce:w-full motion-reduce:shrink motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:px-4", className)}
    >
      {CUSTOMERS.map((c) => (
        <CustomerCard key={c.id} customer={c} />
      ))}
    </ul>
  );
}

function CustomerCard({ customer }: { customer: Customer }) {
  const { t } = useLocale();
  return (
    <li className="flex w-[17rem] shrink-0 flex-col gap-5 rounded-3xl border border-hairline bg-card/40 p-5 transition-colors duration-[160ms] hover:border-hairline-strong sm:w-[19rem] sm:p-6"
    >
      <span className="inline-flex items-center gap-2 self-start rounded-full border border-hairline-strong py-1 pr-3 pl-1.5 text-xs font-semibold text-gold-ink">
        <IndustryIcon id={customer.industry} className="size-5" />
        {t(INDUSTRIES[customer.industry])}
      </span>
      <span className="flex flex-col gap-1">
        <span className="text-lg leading-snug font-semibold text-foreground">{t(customer.business)}</span>
        <span className="text-sm text-muted-foreground">{t(customer.name)}</span>
      </span>
    </li>
  );
}
