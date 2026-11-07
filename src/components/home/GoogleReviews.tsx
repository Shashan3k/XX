"use client";

import * as React from "react";
import { ExternalLink, Pause, Play } from "lucide-react";
import { CUSTOMERS_SECTION, GOOGLE_REVIEWS, GOOGLE_REVIEWS_SECTION, type GoogleReview } from "@/data/panasunaData";
import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const copy = GOOGLE_REVIEWS_SECTION;
/** Draft (unverified) reviews never reach production; see GoogleReview.draft. */
const SHOW_DRAFTS = process.env.NODE_ENV !== "production";
const REVIEWS = GOOGLE_REVIEWS.filter((r) => !r.draft || SHOW_DRAFTS);
const HAS_DRAFTS = REVIEWS.some((r) => r.draft);
/** Each marquee copy holds at least this many cards, so a short list still fills a wide screen without a gap. */
const MIN_CARDS_PER_COPY = 8;

/** Five gold stars, `filled` of them solid. Bespoke 5-point star on a 20 grid. */
function Stars({ filled, className }: { filled: number; className?: string }) {
  return (
    <span className={cn("inline-flex shrink-0 gap-0.5", className)} aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="inline-block size-4">
          <path
            d="M10 1.8l2.47 5.3 5.8.68-4.28 3.97 1.13 5.73L10 14.6l-5.12 2.88 1.13-5.73L1.73 7.78l5.8-.68z"
            fill={i < filled ? "var(--color-gold)" : "none"}
            stroke="var(--color-gold)"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </span>
  );
}

/**
 * Home §9, below the business marquee: the Google rating badge and an endless review marquee, built like the
 * customer one above (two identical copies, one aria-hidden, sliding by exactly one copy so the loop has no
 * seam). It pauses on hover and focus, has a pause button (WCAG 2.2.2), and stands still under reduced motion.
 */
export function GoogleReviews() {
  const { t } = useLocale();
  const [paused, setPaused] = React.useState(false);

  return (
    <section aria-labelledby="google-reviews-title" className="mt-20 flex flex-col gap-8 md:mt-24">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 sm:flex-row sm:items-end sm:justify-between sm:px-8">
        <div className="flex flex-col gap-3">
          <h3 id="google-reviews-title" className="text-2xl font-semibold text-foreground sm:text-3xl">
            {t(copy.title)}
          </h3>
          <p className="inline-flex items-center gap-3 self-start rounded-full border border-hairline-strong bg-card/50 py-1.5 pr-4 pl-2">
            <span className="grid size-8 place-items-center rounded-full bg-gold text-sm font-bold text-obsidian tabular-nums">{copy.rating}</span>
            <Stars filled={5} />
            <span className="text-sm font-semibold text-foreground tabular-nums">{t(copy.ratingLabel)}</span>
          </p>
        </div>
        <a
          href={copy.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-gold-ink hover:underline focus-visible:outline-2 focus-visible:outline-ring sm:self-auto"
        >
          {t(copy.readAll)}
          <ExternalLink aria-hidden="true" className="size-3.5" />
        </a>
      </div>

      {HAS_DRAFTS && (
        <p role="note" className="mx-auto w-full max-w-7xl rounded-xl border border-dashed border-ember/60 px-4 py-2 text-sm text-foreground">
          {t(copy.draftNotice)}
        </p>
      )}

      {REVIEWS.length > 0 && (
        <>
          <div
            className="group/reviews relative [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] motion-reduce:[mask-image:none]"
            data-paused={paused || undefined}
          >
            <div className="flex w-max py-2 motion-safe:animate-[pn-marquee_70s_linear_infinite] group-hover/reviews:[animation-play-state:paused] group-focus-within/reviews:[animation-play-state:paused] group-data-paused/reviews:[animation-play-state:paused] motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center">
              <ReviewList label={t(copy.title)} />
              <ReviewList hidden className="motion-reduce:hidden" />
            </div>
          </div>
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 motion-reduce:hidden">
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-pressed={paused}
              className="inline-flex items-center gap-2 rounded-full border border-hairline px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-hairline-strong hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
            >
              {paused ? <Play aria-hidden="true" className="size-3.5" /> : <Pause aria-hidden="true" className="size-3.5" />}
              {t(paused ? CUSTOMERS_SECTION.play : CUSTOMERS_SECTION.pause)}
            </button>
          </div>
        </>
      )}
    </section>
  );
}

function ReviewList({ label, hidden = false, className }: { label?: string; hidden?: boolean; className?: string }) {
  const reps = Math.max(1, Math.ceil(MIN_CARDS_PER_COPY / REVIEWS.length));
  const cards = Array.from({ length: reps }, (_, rep) => REVIEWS.map((r) => ({ r, rep }))).flat();
  return (
    <ul
      aria-label={label}
      aria-hidden={hidden || undefined}
      className={cn("flex shrink-0 gap-4 pr-4 motion-reduce:w-full motion-reduce:shrink motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:px-4", className)}
    >
      {cards.map(({ r, rep }) => (
        <li
          key={`${r.id}-${rep}`}
          // Repeats exist only to fill the loop; assistive tech reads each review once.
          aria-hidden={rep > 0 || undefined}
          className={cn(
            "flex w-[17rem] shrink-0 flex-col gap-4 rounded-3xl border border-hairline bg-card/50 p-5 transition-colors duration-150 hover:border-hairline-strong sm:w-[20rem] sm:p-6",
            rep > 0 && "motion-reduce:hidden",
          )}
        >
          <ReviewCard review={r} />
        </li>
      ))}
    </ul>
  );
}

function ReviewCard({ review }: { review: GoogleReview }) {
  const { t } = useLocale();
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Stars filled={review.rating} />
        <span className="sr-only">{review.rating} / 5</span>
        <span className="rounded-full border border-hairline px-2.5 py-0.5 text-xs text-muted-foreground">{t(copy.topics[review.topic])}</span>
      </div>
      <blockquote className="flex-1 leading-relaxed text-foreground">
        <p>“{t(review.text)}”</p>
      </blockquote>
      <footer className="flex items-center gap-3 border-t border-hairline pt-4">
        <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full border border-gold-ink/50 text-sm font-semibold text-gold-ink">
          {t(review.reviewer).charAt(0)}
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold text-foreground">{t(review.reviewer)}</span>
          <span className="text-xs text-muted-foreground">{t(copy.subscriberTag)}</span>
        </span>
      </footer>
    </>
  );
}
