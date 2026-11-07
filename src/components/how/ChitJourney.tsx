"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  CHIT_PLANS,
  HOW_CHITS_WORK,
  UI_STRINGS,
  formatINR,
  formatMonths,
  formatPercent,
  navHref,
  type JourneyFactKey,
  type JourneyStage,
  type Locale,
} from "@/data/panasunaData";
import { MAX_DISCOUNT_RATE, auctionOutcome } from "@/lib/auction";
import { useLocale } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { pageScroll } from "@/components/providers/SmoothScroll";
import { LAST_STAGE, STAGE_COUNT, poseFor, stageAt, travel, type JourneyRig } from "./choreography";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// WebGL never blocks the story: every stage card renders from the server, the scene streams in after.
const JourneyScene = dynamic(() => import("./JourneyScene"), { ssr: false });

const copy = HOW_CHITS_WORK;
const PLAN = CHIT_PLANS.find((p) => p.id === copy.examplePlanId) ?? CHIT_PLANS[0];
const OUTCOME = auctionOutcome(PLAN, copy.exampleDiscountRate);

/** Every figure on the cards, from the example plan and the auction arithmetic. */
function factValues(locale: Locale): Record<JourneyFactKey, string> {
  const total = PLAN.monthlyInstallment * PLAN.durationMonths;
  return {
    members: String(PLAN.durationMonths),
    monthly: formatINR(PLAN.monthlyInstallment),
    pool: formatINR(total),
    duration: formatMonths(PLAN.durationMonths, locale),
    beforeDividends: formatINR(total),
    discount: `${formatINR(OUTCOME.discount)} · ${formatPercent(copy.exampleDiscountRate)}`,
    cap: `${formatINR(PLAN.chitValue * MAX_DISCOUNT_RATE)} · ${formatPercent(MAX_DISCOUNT_RATE)}`,
    commission: formatINR(OUTCOME.commission),
    dividendPool: formatINR(OUTCOME.dividendPool),
    share: formatINR(OUTCOME.dividendPerMember),
    next: formatINR(OUTCOME.netInstallment),
    prize: formatINR(OUTCOME.prize),
    security: formatINR(PLAN.chitValue),
  };
}

const DESKTOP = "(min-width: 1024px)";

function subscribeDesktop(cb: () => void) {
  const mq = window.matchMedia(DESKTOP);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/**
 * Home §6 and /how-chits-work. Three layouts from one markup:
 * - desktop: the stage is pinned and the cards travel sideways while the camera trucks along the world;
 * - below 1024px: a vertical timeline under a sticky scene;
 * - reduced motion (desktop): two columns, the scene cuts to each stage as its card comes into view.
 */
export function ChitJourney() {
  const { t, locale } = useLocale();
  const theme = useTheme();
  const reduce = usePrefersReducedMotion();
  const desktop = React.useSyncExternalStore(subscribeDesktop, () => window.matchMedia(DESKTOP).matches, () => false);
  const root = React.useRef<HTMLDivElement>(null);
  const pin = React.useRef<HTMLDivElement>(null);
  const track = React.useRef<HTMLOListElement>(null);
  const rail = React.useRef<HTMLSpanElement>(null);
  const trigger = React.useRef<ScrollTrigger | null>(null);
  const rig = React.useRef<JourneyRig>({ progress: 0, assemble: 0 });
  const [active, setActive] = React.useState(0);
  const values = factValues(locale);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      // matchMedia only runs the callback when at least one condition matches, so name both widths.
      mm.add({ desktop: DESKTOP, narrow: "(max-width: 1023.98px)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
        const { desktop: wide, reduce: still } = ctx.conditions as { desktop: boolean; reduce: boolean };
        const cards = gsap.utils.toArray<HTMLElement>("[data-stage-card]", root.current);
        const show = (p: number) => {
          const next = stageAt(p);
          setActive((a) => (a === next ? a : next));
        };

        if (still) {
          rig.current = { progress: poseFor(0), assemble: 1 };
          return;
        }

        if (wide) {
          pin.current?.setAttribute("data-pinned", "");
          // The coins gather while the section scrolls up into view.
          gsap.fromTo(
            rig.current,
            { assemble: 0 },
            { assemble: 1, ease: "none", scrollTrigger: { trigger: pin.current, start: "top bottom", end: "top top", scrub: 1 } },
          );
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: pin.current,
              start: "top top",
              end: () => `+=${window.innerHeight * 4.4}`,
              pin: true,
              scrub: 1,
              invalidateOnRefresh: true,
            },
            onUpdate: () => {
              const p = rig.current.progress;
              // Cards hold while the camera holds, and slide while it travels.
              const { k, f } = travel(p);
              if (track.current) track.current.style.transform = `translate3d(${-(k + f) * (100 / STAGE_COUNT)}%,0,0)`;
              cards.forEach((card, i) => {
                card.style.opacity = String(1 - Math.min(1, Math.abs(i - (k + f)) * 1.4));
              });
              show(p);
            },
          });
          tl.fromTo(rig.current, { progress: 0 }, { progress: LAST_STAGE, duration: LAST_STAGE, ease: "none" });
          trigger.current = tl.scrollTrigger ?? null;
          return () => {
            pin.current?.removeAttribute("data-pinned");
            if (track.current) track.current.style.transform = "";
            cards.forEach((card) => (card.style.opacity = ""));
            trigger.current = null;
          };
        }

        // Phones and tablets: a vertical timeline. Stage k is "on" once its title clears the sticky scene.
        gsap.fromTo(
          rig.current,
          { assemble: 0 },
          { assemble: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "top 20%", scrub: 1 } },
        );
        const tl = gsap.timeline({
          scrollTrigger: { trigger: track.current, start: "top 90%", end: "bottom 90%", scrub: 1 },
          onUpdate: () => show(rig.current.progress),
        });
        tl.fromTo(rig.current, { progress: 0 }, { progress: LAST_STAGE, duration: LAST_STAGE, ease: "none" }, 0.5)
          .fromTo(rail.current, { scaleY: 0 }, { scaleY: 1, duration: STAGE_COUNT, ease: "none" }, 0);
      });
    },
    { scope: root, dependencies: [], revertOnUpdate: true },
  );

  // Reduced motion: no scrubbing. The scene cuts to whichever stage card is in view.
  React.useEffect(() => {
    if (!reduce) return;
    const cards = Array.from(root.current?.querySelectorAll<HTMLElement>("[data-stage-card]") ?? []);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const k = cards.indexOf(e.target as HTMLElement);
          rig.current = { progress: poseFor(k), assemble: 1 };
          setActive(k);
        });
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [reduce]);

  const jumpTo = (k: number) => {
    const st = trigger.current;
    if (!st) return;
    pageScroll.toY(st.start + (poseFor(k) / LAST_STAGE) * (st.end - st.start));
  };

  return (
    <div ref={root}>
      <div
        ref={pin}
        className={cn(
          "relative",
          "lg:motion-safe:h-svh lg:motion-safe:overflow-x-auto lg:motion-safe:data-pinned:overflow-hidden",
          "lg:motion-reduce:mx-auto lg:motion-reduce:grid lg:motion-reduce:max-w-7xl lg:motion-reduce:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:motion-reduce:gap-12 lg:motion-reduce:px-8",
        )}
      >
        <div
          className={cn(
            "overflow-hidden bg-[radial-gradient(ellipse_70%_65%_at_62%_50%,var(--stage-glow),var(--background)_75%)]",
            "max-lg:sticky max-lg:top-16 max-lg:z-10 max-lg:h-[42svh] max-lg:border-y max-lg:border-hairline",
            "lg:motion-safe:absolute lg:motion-safe:inset-0",
            "lg:motion-reduce:sticky lg:motion-reduce:top-24 lg:motion-reduce:col-start-2 lg:motion-reduce:row-start-1 lg:motion-reduce:h-[calc(100svh-8rem)] lg:motion-reduce:rounded-3xl lg:motion-reduce:border lg:motion-reduce:border-hairline",
          )}
        >
          <JourneyScene rig={rig} reduce={reduce} theme={theme} offset={desktop && !reduce} stage={active} />
          <p className="pointer-events-none absolute top-3 left-4 rounded-full border border-hairline bg-background/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm tabular-nums lg:hidden">
            {t(copy.stage)} {active + 1} / {STAGE_COUNT}
          </p>
        </div>

        <ol
          ref={track}
          aria-label={t(copy.stagesLabel)}
          className={cn(
            "relative",
            "max-lg:mx-auto max-lg:max-w-2xl max-lg:px-4 max-lg:pt-10 sm:max-lg:px-8",
            "lg:motion-safe:flex lg:motion-safe:h-full lg:motion-safe:w-[500%] lg:motion-safe:will-change-transform",
            "lg:motion-reduce:col-start-1 lg:motion-reduce:row-start-1 lg:motion-reduce:py-[20svh]",
          )}
        >
          {/* The vertical rail (phones and tablets): hairline track with a gold fill scrubbed by scroll. */}
          <span aria-hidden="true" className="absolute top-10 bottom-0 left-9 w-px bg-hairline sm:left-13 lg:hidden">
            <span ref={rail} className="absolute inset-0 origin-top bg-gold-ink" />
          </span>
          {copy.stages.map((stage, i) => (
            <li
              key={stage.id}
              className={cn(
                "relative",
                "max-lg:min-h-[62svh] max-lg:pb-16 max-lg:pl-12",
                "lg:motion-safe:flex lg:motion-safe:h-full lg:motion-safe:w-1/5 lg:motion-safe:items-center",
                "lg:motion-reduce:flex lg:motion-reduce:min-h-[70svh] lg:motion-reduce:items-center",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "absolute top-0 left-0 grid size-10 place-items-center rounded-full border bg-background text-sm font-semibold tabular-nums transition-colors duration-300 lg:hidden",
                  i <= active ? "border-gold-ink text-gold-ink" : "border-hairline-strong text-muted-foreground",
                )}
              >
                {i + 1}
              </span>
              <div className="w-full lg:motion-safe:mx-auto lg:motion-safe:max-w-7xl lg:motion-safe:px-8 lg:motion-safe:pt-16">
                <StageCard stage={stage} index={i} values={values} />
              </div>
            </li>
          ))}
        </ol>

        {/* Desktop stage dots: progress at a glance, and a way to jump straight to a stage. */}
        <nav
          aria-label={t(copy.stagesLabel)}
          className="absolute inset-x-0 bottom-8 hidden lg:motion-safe:block"
        >
          <div className="mx-auto flex max-w-7xl items-center gap-6 px-8">
            <ol className="flex items-center gap-2">
              {copy.stages.map((stage, i) => (
                <li key={stage.id}>
                  <button
                    type="button"
                    onClick={() => jumpTo(i)}
                    aria-current={active === i ? "step" : undefined}
                    aria-label={`${t(copy.stage)} ${i + 1}: ${t(stage.title)}`}
                    className={cn(
                      "grid h-9 min-w-9 place-items-center rounded-full border px-3 text-sm font-semibold tabular-nums transition-[color,background-color,border-color] duration-200",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                      active === i
                        ? "border-gold-ink bg-gold/15 text-gold-ink"
                        : "border-hairline bg-background/60 text-muted-foreground backdrop-blur-sm hover:border-hairline-strong hover:text-foreground",
                    )}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
            </ol>
            <p className="text-xs text-muted-foreground">{t(copy.scrollHint)}</p>
          </div>
        </nav>
      </div>

      <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-4 px-4 sm:px-8 md:flex-row md:items-center md:justify-between">
        <p className="max-w-xl text-sm text-muted-foreground tabular-nums">
          <span className="font-semibold text-foreground">{t(copy.example)}:</span> {formatINR(PLAN.chitValue)} ·{" "}
          {formatMonths(PLAN.durationMonths, locale)} · {formatINR(PLAN.monthlyInstallment)}
          {t(UI_STRINGS.perMonth)}. {t(copy.exampleNote)}
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
          <Link href={`${navHref("auction")}#simulator`} className="text-gold-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring">
            {t(copy.tryIt.simulator)}
          </Link>
          <Link
            href={`${navHref("calculator")}?plan=${PLAN.id}`}
            className="text-gold-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
          >
            {t(copy.tryIt.calculator)}
          </Link>
        </div>
      </div>
    </div>
  );
}

function StageCard({ stage, index, values }: { stage: JourneyStage; index: number; values: Record<JourneyFactKey, string> }) {
  const { t } = useLocale();
  return (
    <article
      data-stage-card
      aria-labelledby={`journey-${stage.id}`}
      className="rounded-3xl border border-hairline bg-card/80 p-6 backdrop-blur-md sm:p-8 lg:max-w-[31rem]"
    >
      <p className="text-sm font-semibold text-gold-ink tabular-nums">
        {t(copy.stage)} {index + 1} / {STAGE_COUNT}
      </p>
      <h3
        id={`journey-${stage.id}`}
        className="mt-3 text-[clamp(1.65rem,2.6vw,2.25rem)] leading-[1.12] tracking-[-0.01em] text-foreground ta:text-[clamp(1.35rem,2vw,1.75rem)] ta:leading-[1.4] ta:tracking-normal"
      >
        {t(stage.title)}
      </h3>
      <p className="mt-4 text-[0.95rem] leading-relaxed text-muted-foreground">{t(stage.body)}</p>

      {stage.id === "pay" && (
        <div className="mt-5">
          <p className="text-xs text-muted-foreground">{t(copy.collection)}</p>
          <p className="mt-2 inline-flex rounded-full border border-gold-ink/50 px-3 py-1 text-sm font-medium text-foreground">
            {t(copy.monthlyOnly)}
          </p>
        </div>
      )}

      <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-hairline pt-5">
        {stage.facts.map((fact) => (
          <div key={fact.key} className="min-w-0">
            {/* Tamil compounds can outrun half a phone-width card; let them break rather than overflow. */}
            <dt className="text-xs [overflow-wrap:anywhere] text-muted-foreground">{t(fact.label)}</dt>
            <dd className="mt-1 text-lg font-semibold text-foreground tabular-nums lining-nums">{values[fact.key]}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
