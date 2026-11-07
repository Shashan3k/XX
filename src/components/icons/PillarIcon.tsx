"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";
import type { WhyPillar } from "@/data/panasunaData";

/**
 * Bespoke "Why Panasuna" icons — 32 grid, 1.5px stroke, round joins, butt caps, one ember accent
 * at most (panasuna-brand §4). Each has one micro-animation tied to its meaning. `play` is a
 * counter: every increment replays it (the parent bumps it on hover, focus and first view).
 */
/** "doorstep-collection" is no longer a Why Panasuna pillar, but the discovery wizard still uses its icon. */
type PillarId = WhyPillar["id"] | "doorstep-collection";

const EASE_CROWN = [0.22, 1, 0.36, 1] as const;
const EASE_VAULT = [0.65, 0, 0.35, 1] as const;

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "butt",
  strokeLinejoin: "round",
} as const;

const EMBER = { fill: "var(--color-ember)" } as const;

const pivot = (x: number, y: number): React.CSSProperties => ({ transformBox: "view-box", transformOrigin: `${x}px ${y}px` });

/** Trusted advisor: a compass whose needle swings and settles on true north-east. */
function Advisor() {
  const needle: Variants = {
    rest: { rotate: 35 },
    play: { rotate: [35, -55, 70, 12, 44, 35], transition: { duration: 1.5, ease: EASE_CROWN } },
  };
  return (
    <>
      <circle cx="16" cy="16" r="11.5" {...STROKE} />
      <path d="M16 3.5v2.5M16 26v2.5M3.5 16h2.5M26 16h2.5" {...STROKE} />
      <motion.g variants={needle} style={pivot(16, 16)}>
        <path d="M16 8.5l2.6 7.5-2.6 7.5-2.6-7.5z" {...STROKE} />
      </motion.g>
      <circle cx="16" cy="16" r="1.1" {...EMBER} />
    </>
  );
}

/** Convenience through technology: a phone whose screen draws a rising chart; a signal dot blinks. */
function Tech() {
  const line: Variants = {
    rest: { pathLength: 1 },
    play: { pathLength: [0, 1], transition: { duration: 0.9, ease: EASE_CROWN } },
  };
  const dot: Variants = {
    rest: { scale: 1 },
    play: { scale: [0, 0, 1.6, 1], transition: { duration: 1.1, times: [0, 0.7, 0.85, 1] } },
  };
  return (
    <>
      <rect x="9" y="3.5" width="14" height="25" rx="2.5" {...STROKE} />
      <path d="M14 6.5h4" {...STROKE} strokeOpacity={0.55} />
      <motion.path d="M12 21l3-4 2.5 2 3.5-5.5" {...STROKE} variants={line} />
      <motion.circle cx="21" cy="13.5" r="1.1" {...EMBER} variants={dot} style={pivot(21, 13.5)} />
      <path d="M15 25.5h2" {...STROKE} strokeOpacity={0.55} />
      <path d="M4 12c-1.2 1.2-1.2 3.8 0 5M28 12c1.2 1.2 1.2 3.8 0 5" {...STROKE} strokeOpacity={0.55} />
    </>
  );
}

/** 100% Bank FDR security: a shield with a bank pediment; the check is drawn in, then the seal glints. */
function Shield() {
  const check: Variants = {
    rest: { pathLength: 1 },
    play: { pathLength: [0, 0, 1], transition: { duration: 0.9, times: [0, 0.25, 1], ease: EASE_CROWN } },
  };
  const seal: Variants = {
    rest: { scale: 1 },
    play: { scale: [1, 1, 1.7, 1], transition: { duration: 1.1, times: [0, 0.6, 0.78, 1], ease: EASE_VAULT } },
  };
  return (
    <>
      <path d="M16 3.5l10 3.75v8.25c0 6.1-4.2 10.6-10 13-5.8-2.4-10-6.9-10-13V7.25z" {...STROKE} />
      <path d="M11 12.5l5-2.5 5 2.5" {...STROKE} strokeOpacity={0.55} />
      <motion.path d="M11.5 17.5l3.25 3.25 6-6.5" {...STROKE} variants={check} />
      <motion.circle cx="16" cy="25.25" r="1.1" {...EMBER} variants={seal} style={pivot(16, 25.25)} />
    </>
  );
}

/** Door-to-door collection: the door swings open on its hinge. */
function Doorstep() {
  const door: Variants = {
    rest: { scaleX: 1, skewY: 0 },
    play: { scaleX: [1, 0.72, 0.72, 1], skewY: [0, -9, -9, 0], transition: { duration: 1.4, times: [0, 0.35, 0.7, 1], ease: EASE_VAULT } },
  };
  return (
    <>
      <path d="M8 27V5h16v22M4 27h24" {...STROKE} />
      <motion.g variants={door} style={pivot(9.5, 16)}>
        <path d="M9.5 6.5h13v20.5h-13z" {...STROKE} />
        <circle cx="19.5" cy="17" r="1.1" {...EMBER} />
      </motion.g>
    </>
  );
}

/** Friendly & caring staff: two hands meet in a handshake. */
function Handshake() {
  const left: Variants = {
    rest: { x: 0, y: 0 },
    play: { x: [-2.5, 0, 0, 0, 0], y: [0, 0, -1.2, 0.8, 0], transition: { duration: 0.9, ease: EASE_CROWN } },
  };
  const right: Variants = {
    rest: { x: 0, y: 0 },
    play: { x: [2.5, 0, 0, 0, 0], y: [0, 0, -1.2, 0.8, 0], transition: { duration: 0.9, ease: EASE_CROWN } },
  };
  const spark: Variants = {
    rest: { scale: 1, opacity: 1 },
    play: { scale: [0, 0, 1.6, 1], opacity: [0, 0, 1, 1], transition: { duration: 1, times: [0, 0.45, 0.7, 1] } },
  };
  return (
    <>
      <motion.g variants={left}>
        {/* Cuff, then palm reaching right with fingers wrapping under. */}
        <path d="M3 12.5h4.5v8H3" {...STROKE} />
        <path d="M7.5 13.5l4.5-1.5h3l2 1.5M7.5 19.5l4 3.5c.7.6 1.7.6 2.3-.1M11.5 19.5l3.5 3c.7.5 1.6.4 2.1-.2M14 18l3 2.5c.6.5 1.5.4 2-.2" {...STROKE} />
      </motion.g>
      <motion.g variants={right}>
        <path d="M29 12.5h-4.5v8H29" {...STROKE} />
        <path d="M24.5 13.5l-3.5-1.5c-1-.4-2-.3-2.9.3l-4.4 3.2c-.8.6-.7 1.8.2 2.2.6.3 1.3.2 1.8-.2l2.3-1.7 4.5 4M24.5 19.5l-2.5 1.5" {...STROKE} />
      </motion.g>
      <motion.circle cx="16" cy="6.5" r="1.1" {...EMBER} variants={spark} style={pivot(16, 6.5)} />
    </>
  );
}

/** Timely payment: a coin drops into the slot, the light blinks. */
function Payout() {
  const coin: Variants = {
    rest: { y: 0, opacity: 1 },
    play: { y: [0, 10, -9, 0], opacity: [1, 1, 0, 1], transition: { duration: 1.2, times: [0, 0.42, 0.43, 1], ease: EASE_CROWN } },
  };
  const light: Variants = {
    rest: { scale: 1 },
    play: { scale: [1, 1, 1.7, 1], transition: { duration: 1.2, times: [0, 0.4, 0.55, 0.8] } },
  };
  const id = React.useId().replace(/:/g, "");
  return (
    <>
      <defs>
        <clipPath id={`${id}-above-slot`}>
          <rect x="0" y="0" width="32" height="18" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-above-slot)`}>
        <motion.g variants={coin}>
          <circle cx="16" cy="10" r="4.25" {...STROKE} />
          <circle cx="16" cy="10" r="2" {...STROKE} strokeOpacity={0.55} />
        </motion.g>
      </g>
      <path d="M12 18H5v9h22v-9h-7M12 18v1.5h8V18" {...STROKE} />
      <motion.circle cx="22.5" cy="23" r="1.1" {...EMBER} variants={light} style={pivot(22.5, 23)} />
    </>
  );
}

/** Registered chit groups: a certificate with a ribbon seal; the stamp presses down and glints. */
function Registered() {
  const stamp: Variants = {
    rest: { scale: 1 },
    play: { scale: [1.6, 0.9, 1], transition: { duration: 0.8, times: [0, 0.6, 1], ease: EASE_CROWN } },
  };
  const tick: Variants = {
    rest: { pathLength: 1 },
    play: { pathLength: [0, 0, 1], transition: { duration: 1, times: [0, 0.5, 1], ease: EASE_CROWN } },
  };
  return (
    <>
      <path d="M6 4.5h20v15.5H6zM10 9h12M10 13h7" {...STROKE} />
      <motion.g variants={stamp} style={pivot(21, 20)}>
        <circle cx="21" cy="20" r="4.75" {...STROKE} />
        <motion.path d="M18.8 20l1.6 1.6 2.9-3.2" {...STROKE} variants={tick} />
      </motion.g>
      <path d="M18.5 24.2l-1 4.3 3.5-1.7 3.5 1.7-1-4.3" {...STROKE} />
      <circle cx="9" cy="17" r="1.1" {...EMBER} />
    </>
  );
}

const ICONS: Record<PillarId, () => React.JSX.Element> = {
  "timely-payment": Payout,
  "tech-convenience": Tech,
  "fdr-security": Shield,
  "trusted-advisor": Advisor,
  "customer-centric": Handshake,
  "registered-groups": Registered,
  "doorstep-collection": Doorstep,
};

export function PillarIcon({ id, play = 0, className }: { id: PillarId; play?: number; className?: string }) {
  const Icon = ICONS[id];
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      {/* Remounting on each `play` replays the keyframes from rest. */}
      <motion.g key={play} initial="rest" animate={play > 0 ? "play" : "rest"}>
        <Icon />
      </motion.g>
    </svg>
  );
}
