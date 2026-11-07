"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ABOUT_PAGE, QUOTES, type Localized, type Quote } from "@/data/panasunaData";
import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const copy = ABOUT_PAGE.philosophies;

const H2 =
  "text-[clamp(2rem,4vw,3.4rem)] leading-[1.08] tracking-[-0.01em] text-foreground ta:text-[clamp(1.7rem,3vw,2.6rem)] ta:leading-[1.4] ta:tracking-normal";

/** /about: the mission as one large statement, with the vision and values beside it. */
export function Purpose() {
  const { t } = useLocale();
  const { purpose } = ABOUT_PAGE;
  return (
    <section aria-labelledby="purpose-title" className="grid gap-12 border-t border-hairline pt-16 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
      <div className="flex flex-col gap-6">
        <p className="text-sm font-semibold text-gold-ink">{t(purpose.title)}</p>
        <h2
          id="purpose-title"
          className="text-[clamp(3rem,8vw,6.5rem)] leading-[0.98] tracking-[-0.02em] text-foreground ta:text-[clamp(2.2rem,5.4vw,4.2rem)] ta:leading-[1.3] ta:tracking-normal"
        >
          {t(purpose.motto)}
        </h2>
        <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">{t(purpose.mission.body)}</p>
      </div>
      <dl className="flex flex-col gap-px self-end overflow-hidden rounded-3xl border border-hairline bg-hairline">
        {[purpose.vision, purpose.values].map((block, i) => (
          <div key={i} className="bg-background p-6 sm:p-8">
            <dt className="font-semibold text-foreground">{t(block.title)}</dt>
            <dd className="mt-2 leading-relaxed text-muted-foreground">{t(block.body)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/**
 * Two editorial spreads. The theme word sits behind the headline quote as an outline, and the two
 * layers drift against each other on scroll (static under reduced motion).
 */
export function Philosophies() {
  const { t } = useLocale();
  const root = React.useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-spread]", root.current).forEach((spread, i) => {
          const dir = i % 2 === 0 ? -1 : 1;
          const scroll = { trigger: spread, start: "top bottom", end: "bottom top", scrub: true };
          gsap.fromTo(spread.querySelector("[data-drift=word]"), { xPercent: -8 * dir }, { xPercent: 8 * dir, ease: "none", scrollTrigger: scroll });
          gsap.fromTo(spread.querySelector("[data-drift=quote]"), { y: 40 }, { y: -40, ease: "none", scrollTrigger: scroll });
        });
      });
    },
    { scope: root },
  );

  const buffett = QUOTES.buffett.quotes.filter((q) => !q.doubtful);
  const gandhi = QUOTES.gandhi.quotes.filter((q) => !q.doubtful);

  return (
    <section ref={root} aria-labelledby="philosophies-title" className="flex flex-col gap-20 md:gap-28">
      <h2 id="philosophies-title" className={H2}>
        {t(copy.title)}
      </h2>
      <Spread
        theme={copy.buffett.theme}
        author={QUOTES.buffett.author}
        headline={buffett.find((q) => q.id === copy.buffett.headline)!}
        rest={buffett.filter((q) => q.id !== copy.buffett.headline)}
      />
      <Spread
        theme={copy.gandhi.theme}
        author={QUOTES.gandhi.author}
        headline={gandhi.find((q) => q.id === copy.gandhi.headline)!}
        rest={gandhi.filter((q) => q.id !== copy.gandhi.headline)}
        flip
      />
    </section>
  );
}

function Spread({ theme, author, headline, rest, flip = false }: { theme: Localized; author: Localized; headline: Quote; rest: readonly Quote[]; flip?: boolean }) {
  const { t } = useLocale();
  return (
    <article data-spread className="flex flex-col gap-10">
      <div className="relative isolate overflow-hidden py-6 md:py-10">
        <p
          data-drift="word"
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-y-0 -z-10 flex items-center text-[clamp(5rem,17vw,15rem)] leading-none whitespace-nowrap text-transparent select-none [-webkit-text-stroke:1px_var(--hairline)] [font-family:var(--font-display)] ta:text-[clamp(3.5rem,11vw,9rem)]",
            flip ? "right-0" : "left-0",
          )}
        >
          {t(theme)}
        </p>
        <figure data-drift="quote" className={cn("flex max-w-4xl flex-col gap-5", flip && "ml-auto text-right")}>
          <p className="text-sm font-semibold text-gold-ink">{t(theme)}</p>
          <blockquote className="text-[clamp(2rem,4.4vw,3.6rem)] leading-[1.12] tracking-[-0.01em] text-foreground [font-family:var(--font-display)] ta:text-[clamp(1.45rem,3vw,2.4rem)] ta:leading-[1.45] ta:tracking-normal">
            <p>“{t(headline.text)}”</p>
          </blockquote>
          <figcaption className="text-muted-foreground">— {t(author)}</figcaption>
        </figure>
      </div>
      <ul className="grid gap-px overflow-hidden rounded-3xl border border-hairline bg-hairline sm:grid-cols-2">
        {rest.map((q) => (
          <li key={q.id} className="flex flex-col gap-2 bg-background p-6">
            {q.topic && <span className="text-sm font-semibold text-gold-ink">{t(q.topic)}</span>}
            <q className="leading-relaxed text-foreground">{t(q.text)}</q>
          </li>
        ))}
      </ul>
    </article>
  );
}
