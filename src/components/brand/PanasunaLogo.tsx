"use client";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import * as React from "react";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  BAND_FACETS,
  CENTRE_GEM,
  CROWN_BAND,
  CROWN_BODY,
  PEAK_TIPS,
  VIEWBOX,
  diamondPath,
  polygonPath,
} from "./crownGeometry";

type Variant = "mark" | "lockup" | "seal";

interface PanasunaLogoProps {
  variant?: Variant;
  /** Plays the assemble sequence once on mount (skipped under reduced motion). */
  animated?: boolean;
  className?: string;
  title?: string;
}

const EASE_CROWN = [0.22, 1, 0.36, 1] as const;

const bodyV: Variants = {
  hidden: { pathLength: 0, fillOpacity: 0 },
  shown: {
    pathLength: 1,
    fillOpacity: 1,
    transition: {
      pathLength: { duration: 0.9, ease: EASE_CROWN },
      fillOpacity: { delay: 0.6, duration: 0.4 },
    },
  },
};

const bandV: Variants = {
  hidden: { pathLength: 0, fillOpacity: 0 },
  shown: {
    pathLength: 1,
    fillOpacity: 1,
    transition: { pathLength: { duration: 0.6, ease: EASE_CROWN }, fillOpacity: { delay: 0.35, duration: 0.3 } },
  },
};

const tipV: Variants = {
  hidden: { y: 6, opacity: 0 },
  shown: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: { delay: 0.75 + i * 0.06, duration: 0.5, ease: EASE_CROWN },
  }),
};

const sheenV: Variants = {
  hidden: { x: -60 },
  shown: { x: 60, transition: { delay: 1.25, duration: 0.9, ease: [0.65, 0, 0.35, 1] } },
};

/** The crown drawing itself — identical geometry to the coin emboss in panasuna-crown-coin.glb. */
function Crown({ play, idPrefix }: { play: boolean; idPrefix: string }) {
  const initial = play ? "hidden" : false;
  const cutouts = [...BAND_FACETS.map(diamondPath), diamondPath(CENTRE_GEM)].join("");

  return (
    <>
      <defs>
        <mask id={`${idPrefix}-cut`} maskUnits="userSpaceOnUse">
          <rect x="-10" y="-10" width="70" height="70" fill="white" />
          <path d={cutouts} fill="black" />
        </mask>
        <linearGradient id={`${idPrefix}-sheen`} x1="0" x2="1" y1="0" y2="0.35">
          <stop offset="0.35" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.65" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${idPrefix}-clip`}>
          <path d={polygonPath(CROWN_BODY) + polygonPath(CROWN_BAND) + PEAK_TIPS.map(diamondPath).join("")} />
        </clipPath>
      </defs>

      <g mask={`url(#${idPrefix}-cut)`} fill="currentColor" stroke="currentColor" strokeWidth={0.6} strokeLinejoin="miter">
        <motion.path d={polygonPath(CROWN_BODY)} variants={bodyV} initial={initial} animate="shown" />
        <motion.path d={polygonPath(CROWN_BAND)} variants={bandV} initial={initial} animate="shown" />
      </g>
      {PEAK_TIPS.map((tip, i) => (
        <motion.path
          key={i}
          d={diamondPath(tip)}
          fill="currentColor"
          custom={i}
          variants={tipV}
          initial={initial}
          animate="shown"
        />
      ))}
      {play && (
        <g clipPath={`url(#${idPrefix}-clip)`} aria-hidden="true">
          <motion.rect
            x="-12"
            y="-4"
            width="72"
            height="50"
            fill={`url(#${idPrefix}-sheen)`}
            variants={sheenV}
            initial="hidden"
            animate="shown"
          />
        </g>
      )}
    </>
  );
}

export function PanasunaLogo({ variant = "mark", animated = false, className, title }: PanasunaLogoProps) {
  const reduce = usePrefersReducedMotion();
  const play = animated && !reduce;
  const id = React.useId().replace(/:/g, "");
  const label = title ?? "Panasuna Chits (P) Ltd.";

  if (variant === "seal") {
    return (
      <svg viewBox="-6 -8.5 60 60" role="img" aria-label={label} className={cn("text-gold", className)}>
        <circle cx="24" cy="21.5" r="28.5" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="24" cy="21.5" r="26.2" fill="none" stroke="currentColor" strokeWidth="0.35" opacity="0.6" />
        <g transform="translate(24 21.5) scale(0.62) translate(-24 -21.5)">
          <Crown key={play ? "anim" : "static"} play={play} idPrefix={id} />
        </g>
        <text
          x="24"
          y="45.5"
          textAnchor="middle"
          fill="currentColor"
          style={{ font: "600 4.2px var(--font-dm-sans)", letterSpacing: "0.12em", fontVariantNumeric: "lining-nums tabular-nums" }}
        >
          1975
        </text>
      </svg>
    );
  }

  const mark = (
    <svg
      viewBox={VIEWBOX}
      role={variant === "mark" ? "img" : undefined}
      aria-label={variant === "mark" ? label : undefined}
      aria-hidden={variant === "lockup" ? true : undefined}
      className={cn("text-gold", variant === "mark" && className, variant === "lockup" && "h-full w-auto shrink-0")}
    >
      <Crown key={play ? "anim" : "static"} play={play} idPrefix={id} />
    </svg>
  );

  if (variant === "mark") return mark;

  return (
    <span role="img" aria-label={label} className={cn("inline-flex items-center gap-[0.28em] text-gold", className)}>
      {mark}
      <span className="flex flex-col leading-none">
        <span className="font-[family-name:var(--font-jakarta)] text-[1em] tracking-[0.01em] text-foreground">Panasuna</span>
        <span className="mt-[0.26em] text-[0.42em] font-semibold tracking-[0.01em] whitespace-nowrap text-gold-ink tabular-nums">Chits (P) Ltd. · Est. 1975</span>
      </span>
    </span>
  );
}
