"use client";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { motion } from "framer-motion";
import type { GoalId } from "@/data/panasunaData";

/**
 * Bespoke goal icons — 32 grid, 1.5px stroke, round joins, one ember accent max
 * (panasuna-brand §4). The accent animates once when `active` turns on.
 */
export const GOAL_ICON_PATHS: Record<GoalId, { stroke: string; accent: React.JSX.Element }> = {
  business: {
    // Shopfront with awning and a raised shutter.
    stroke: "M5 13h22M6 13l2-6h16l2 6M6 13v13h20V13M10 26v-7h6v7M19 19h4v3h-4zM6 13c0 1.7 1.3 3 3 3s3-1.3 3-3c0 1.7 1.3 3 3 3s3-1.3 3-3c0 1.7 1.3 3 3 3s3-1.3 3-3",
    accent: <circle cx="21" cy="20.5" r="0.9" />,
  },
  home: {
    // Gable home echoing Home_Core in the 3D vault.
    stroke: "M5 15L16 6l11 9M8 13v13h16V13M14 26v-6h4v6",
    accent: <rect x="15" y="10.5" width="2" height="2" rx="0.3" />,
  },
  vehicle: {
    // Side profile: cabin, wheels, ground line.
    stroke: "M4 21v-4l3-1 3-5h10l4 5 4 1v4h-3M10 21h9M4 21h2M3 25h26",
    accent: (
      <>
        <circle cx="8.5" cy="21.5" r="2.2" fill="none" />
        <circle cx="21.5" cy="21.5" r="2.2" fill="none" />
      </>
    ),
  },
  savings: {
    // Coin stack beside a single rising coin.
    stroke: "M5 24c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5M5 20c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5M5 16c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5M5 16v8M17 16v8M5 16c0-1.4 2.7-2.5 6-2.5s6 1.1 6 2.5",
    accent: <circle cx="24" cy="9" r="3.5" fill="none" />,
  },
  other: {
    // Open calendar ring: life's milestones, scheduled.
    stroke: "M6 9h20v17H6zM6 14h20M11 6v5M21 6v5M10 18h3M15 18h3M20 18h3M10 22h3M15 22h3",
    accent: <rect x="20" y="21" width="3" height="2.5" rx="0.4" />,
  },
};

export function GoalIcon({ id, active = false, className }: { id: GoalId; active?: boolean; className?: string }) {
  const reduce = usePrefersReducedMotion();
  const { stroke, accent } = GOAL_ICON_PATHS[id];
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <path d={stroke} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="butt" strokeLinejoin="round" />
      <motion.g
        fill="var(--color-ember)"
        stroke="var(--color-ember)"
        strokeWidth={1.5}
        initial={false}
        animate={active && !reduce ? { scale: [1, 1.35, 1], opacity: 1 } : { scale: 1, opacity: active ? 1 : 0.55 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      >
        {accent}
      </motion.g>
    </svg>
  );
}
