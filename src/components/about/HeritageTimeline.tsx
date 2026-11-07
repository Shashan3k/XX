"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ABOUT_PAGE, type HeritageChapter } from "@/data/panasunaData";
import { useLocale } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { HeritageRig } from "./HeritageScene";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const HeritageScene = dynamic(() => import("./HeritageScene"), { ssr: false });

const copy = ABOUT_PAGE.timeline;
const LAST = copy.chapters.length - 1;

const H2 =
  "text-[clamp(2rem,4vw,3.4rem)] leading-[1.08] tracking-[-0.01em] text-foreground ta:text-[clamp(1.7rem,3vw,2.6rem)] ta:leading-[1.4] ta:tracking-normal";

/**
 * /about: fifty years as a scroll-built column of crown coins. The chapters scroll past a sticky
 * scene (beside it on desktop, above it on phones); scroll position scrubs `rig.progress` 0 → 1.
 * Reduced motion shows the finished column and no scrubbing.
 */
export function HeritageTimeline() {
  const { t } = useLocale();
  const theme = useTheme();
  const reduce = usePrefersReducedMotion();
  const root = React.useRef<HTMLDivElement>(null);
  const list = React.useRef<HTMLOListElement>(null);
  const rail = React.useRef<HTMLSpanElement>(null);
  const rig = React.useRef<HeritageRig>({ progress: 0 });
  const [active, setActive] = React.useState(0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" }, (ctx) => {
        const { still } = ctx.conditions as { still: boolean };
        if (still) {
          rig.current.progress = 1;
          return;
        }
        gsap.fromTo(
          rig.current,
          { progress: 0 },
          {
            progress: 1,
            ease: "none",
            scrollTrigger: {
              trigger: list.current,
              start: "top 55%",
              end: "bottom 90%",
              scrub: 1,
              onUpdate: (st) => {
                const next = Math.min(LAST, Math.round(st.progress * LAST));
                setActive((a) => (a === next ? a : next));
              },
            },
          },
        );
        gsap.fromTo(rail.current, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: list.current, start: "top 55%", end: "bottom 90%", scrub: true } });
      });
    },
    { scope: root, dependencies: [] },
  );

  // Reduced motion: the overlay label still follows the chapter in view.
  React.useEffect(() => {
    if (!reduce) return;
    const items = Array.from(list.current?.querySelectorAll<HTMLElement>("[data-chapter]") ?? []);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(items.indexOf(e.target as HTMLElement))),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [reduce]);

  const current = copy.chapters[active];

  return (
    <section aria-labelledby="heritage-title" className="pb-24 md:pb-32">
      <header className="mx-auto max-w-7xl px-4 sm:px-8">
        <h2 id="heritage-title" className={H2}>
          {t(copy.title)}
        </h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">{t(copy.lead)}</p>
      </header>

      <div ref={root} className="relative mt-12 lg:mx-auto lg:grid lg:max-w-7xl lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:gap-12 lg:px-8">
        <div
          role="img"
          aria-label={t(copy.sceneLabel)}
          className={cn(
            "overflow-hidden bg-[radial-gradient(ellipse_60%_60%_at_50%_45%,var(--stage-glow),var(--background)_75%)]",
            "sticky top-16 z-10 h-[40svh] border-y border-hairline",
            "lg:top-24 lg:h-[calc(100svh-8rem)] lg:rounded-3xl lg:border",
          )}
        >
          <HeritageScene rig={rig} reduce={reduce} theme={theme} chapter={active} />
          <p
            aria-hidden="true"
            className="pointer-events-none absolute bottom-4 left-4 flex items-baseline gap-2 rounded-full border border-hairline bg-background/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm lg:bottom-6 lg:left-6 lg:text-sm"
          >
            {current.year && <span className="font-semibold text-gold-ink tabular-nums">{current.year}</span>}
            <span>{t(current.marker)}</span>
          </p>
        </div>

        <ol ref={list} className="relative mx-auto max-w-2xl px-4 pt-12 sm:px-8 lg:max-w-none lg:px-0 lg:py-[18svh]">
          <span aria-hidden="true" className="absolute top-12 bottom-0 left-[1.4rem] w-px bg-hairline sm:left-[2.4rem] lg:top-[18svh] lg:bottom-[18svh] lg:left-[0.4rem]">
            <span ref={rail} className="absolute inset-0 origin-top bg-gold-ink motion-reduce:scale-y-100" />
          </span>
          {copy.chapters.map((chapter, i) => (
            <Chapter key={chapter.id} chapter={chapter} on={i <= active} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function Chapter({ chapter, on }: { chapter: HeritageChapter; on: boolean }) {
  const { t } = useLocale();
  return (
    <li data-chapter className="relative pb-20 pl-10 last:pb-4 lg:flex lg:min-h-[62svh] lg:flex-col lg:justify-center lg:pb-0 lg:pl-12">
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-2 left-[0.15rem] size-3.5 rounded-full border-2 bg-background transition-colors duration-300 lg:top-auto lg:-left-[0.05rem]",
          on ? "border-gold-ink bg-gold-ink" : "border-hairline-strong",
        )}
      />
      {chapter.year ? (
        // Bodoni is reserved for the heritage numerals (panasuna-brand §3).
        <p className="font-[family-name:var(--font-jakarta)] text-[clamp(3rem,6vw,5rem)] leading-none font-medium text-gold-ink tabular-nums lining-nums">{chapter.year}</p>
      ) : (
        <p className="text-sm font-semibold text-gold-ink">{t(chapter.marker)}</p>
      )}
      <h3 className="mt-4 text-[clamp(1.4rem,2.2vw,1.9rem)] leading-tight text-foreground ta:text-[clamp(1.2rem,1.8vw,1.55rem)] ta:leading-snug">
        {t(chapter.title)}
      </h3>
      <p className="mt-3 max-w-xl leading-relaxed text-muted-foreground tabular-nums">{t(chapter.body)}</p>
    </li>
  );
}
