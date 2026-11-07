"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { HERO } from "@/data/panasunaData";
import { useLocale } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { PanasunaLogo } from "@/components/brand/PanasunaLogo";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { Button } from "@/components/ui/button";
import type { HeroRig } from "./HeroScene";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// WebGL never blocks first paint: copy and CTAs render from the server, the scene streams in after.
const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

const rise = (delayMs: number): React.CSSProperties => ({
  animation: `pn-rise 1.1s var(--ease-crown) ${delayMs}ms both`,
});
const settle = (delayMs: number): React.CSSProperties => ({
  animation: `pn-settle 0.9s var(--ease-crown) ${delayMs}ms both`,
});

/**
 * Home hero: the page's one orchestrated moment (panasuna-brand §6). The section is 250svh tall with a
 * sticky stage; one scrubbed timeline drives both the DOM copy and the R3F camera via `rig`.
 */
export function Hero() {
  const { t } = useLocale();
  const theme = useTheme();
  const reduce = usePrefersReducedMotion();
  const section = React.useRef<HTMLElement>(null);
  const copy = React.useRef<HTMLDivElement>(null);
  const cue = React.useRef<HTMLDivElement>(null);
  const scrim = React.useRef<HTMLDivElement>(null);
  const rig = React.useRef<HeroRig>({ orbit: 0, fan: 0 });

  useGSAP(
    () => {
      if (reduce) return;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: section.current, start: "top top", end: "bottom bottom", scrub: 1 },
      });
      tl.to(rig.current, { orbit: 1, duration: 1, ease: "power1.inOut" }, 0)
        .to(rig.current, { fan: 1, duration: 0.8, ease: "power2.inOut" }, 0.08)
        .to(copy.current, { autoAlpha: 0, y: -72, duration: 0.3, ease: "power1.in" }, 0.03)
        .to(scrim.current, { autoAlpha: 0, duration: 0.3, ease: "power1.in" }, 0.03)
        .to(cue.current, { autoAlpha: 0, duration: 0.06 }, 0);
    },
    { scope: section, dependencies: [reduce], revertOnUpdate: true },
  );

  return (
    <section ref={section} aria-labelledby="hero-title" className="relative h-[250svh] motion-reduce:h-svh">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_30%,var(--stage-glow),var(--background)_70%)] md:bg-[radial-gradient(ellipse_55%_70%_at_70%_48%,var(--stage-glow),var(--background)_72%)]"
        />
        <HeroScene rig={rig} theme={theme} reduce={reduce} />
        {/*
          Legibility scrims. On phones the copy fills the screen, so the scene sits behind it dimmed and
          the scrim leaves with the copy — the vault takes over once the words step aside.
        */}
        <div
          ref={scrim}
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-background via-background/85 to-background/55 md:hidden"
        />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-background to-transparent max-md:hidden" />

        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-12 sm:px-8 md:landscape:justify-center md:landscape:pt-24 md:landscape:pb-0 md:portrait:pb-16">
          <div ref={copy} className="max-w-[40rem]">
            <h1
              id="hero-title"
              className="text-[clamp(2.75rem,4.5vw,4.25rem)] leading-[1.08] font-bold tracking-[-0.03em] text-foreground ta:text-[clamp(2rem,3.1vw,3rem)] ta:leading-[1.25] ta:tracking-normal"
            >
              {HERO.headlineLines.map((line, i) => (
                <span key={i} className="block overflow-hidden pb-[0.06em]">
                  <span
                    className={i === HERO.headlineLines.length - 1 ? "block text-gold-gradient sm:whitespace-nowrap" : "block sm:whitespace-nowrap"}
                    style={rise(120 + i * 110)}
                  >
                    {t(line)}
                  </span>
                </span>
              ))}
            </h1>

            <div className="mt-6 max-w-[24rem] xl:max-w-[34rem]" style={settle(520)}>
              <p className="border-l-2 border-gold-ink/70 pl-4 text-xl leading-snug font-medium tracking-[0.005em] text-foreground sm:text-2xl ta:text-lg ta:leading-relaxed ta:tracking-normal sm:ta:text-xl">
                {t(HERO.subtitle)}
              </p>
              <span aria-hidden="true" className="mt-4 block h-px w-28 bg-gradient-to-r from-gold via-emerald-500/60 to-transparent" />
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3" style={settle(640)}>
              <MagneticButton size="xl" className="min-h-12 px-6" render={<Link href={HERO.primaryCta.href} />}>
                {t(HERO.primaryCta.label)}
              </MagneticButton>
              <Button
                size="xl"
                variant="outline"
                className="min-h-12 px-6 hover:border-gold-ink dark:border-hairline-strong dark:bg-background/40 dark:backdrop-blur-sm"
                render={<Link href={HERO.secondaryCta.href} />}
              >
                {t(HERO.secondaryCta.label)}
              </Button>
            </div>

            <p className="mt-8 flex max-w-[30rem] items-center gap-3 text-sm text-foreground" style={settle(760)}>
              <span aria-hidden="true" className="shrink-0">
                <PanasunaLogo variant="seal" className="size-11 text-gold-ink" />
              </span>
              {t(HERO.security)}
            </p>
          </div>
        </div>

        <div
          ref={cue}
          aria-hidden="true"
          className="absolute right-8 bottom-8 hidden items-center gap-3 text-xs text-muted-foreground motion-reduce:hidden md:flex"
          style={settle(1100)}
        >
          <span className="relative h-10 w-px overflow-hidden bg-hairline">
            <span className="absolute inset-x-0 top-0 h-1/3 bg-gold-ink [animation:pn-cue_2.2s_var(--ease-vault)_infinite]" />
          </span>
          {t(HERO.scrollCue)}
        </div>
      </div>
    </section>
  );
}
