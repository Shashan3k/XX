"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { CHIT_DURATIONS, type GoalId } from "@/data/panasunaData";
import { GOAL_ICON_PATHS } from "@/components/icons/GoalIcon";
import { PanasunaLogo } from "@/components/brand/PanasunaLogo";

const C = 160;
const MONTH_TICKS = CHIT_DURATIONS[CHIT_DURATIONS.length - 1]; // 60
const TICK_R = 140;
const BUDGET_R = 116;
const START = -150; // degrees from 12 o'clock; both meters sweep 300°
const SWEEP = 300;

const polar = (r: number, deg: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  // Rounded: server and browser trig can differ in the last digit, which breaks hydration.
  const round = (n: number) => Math.round(n * 100) / 100;
  return [round(C + r * Math.cos(a)), round(C + r * Math.sin(a))] as const;
};

function arc(r: number, from: number, to: number) {
  const [x0, y0] = polar(r, from);
  const [x1, y1] = polar(r, to);
  return `M${x0} ${y0}A${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${x1} ${y1}`;
}

/**
 * The wizard's answers as one instrument: the goal is drawn in the centre, the budget fills the
 * inner arc (log scale, as on the slider), and the duration lights one tick per month on the outer
 * dial. It reads the same way the vault rings do on the hero.
 */
export function DiscoveryDial({
  goal,
  budget,
  duration,
}: {
  goal: GoalId | null;
  /** 0–1 on the slider's log scale, or null if unanswered. */
  budget: number | null;
  duration: number | null;
}) {
  const reduce = usePrefersReducedMotion();
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <svg viewBox="0 0 320 320" aria-hidden="true" className="size-full overflow-visible text-gold-ink">
      {/* Outer dial: 60 month ticks, lit up to the chosen duration; the six real durations are long ticks. */}
      {Array.from({ length: MONTH_TICKS }, (_, i) => {
        const month = i + 1;
        const deg = START + (SWEEP * i) / (MONTH_TICKS - 1);
        const major = (CHIT_DURATIONS as readonly number[]).includes(month);
        const [x0, y0] = polar(TICK_R - (major ? 9 : 4), deg);
        const [x1, y1] = polar(TICK_R + (major ? 3 : 0), deg);
        const lit = duration !== null && month <= duration;
        return (
          <line
            key={i}
            x1={x0}
            y1={y0}
            x2={x1}
            y2={y1}
            stroke={lit ? "currentColor" : "var(--hairline-strong)"}
            strokeWidth={major ? 2 : 1.25}
            strokeLinecap="round"
            style={{ transition: `stroke 240ms ${reduce ? 0 : i * 9}ms` }}
          />
        );
      })}
      {CHIT_DURATIONS.map((d) => {
        const [x, y] = polar(TICK_R + 15, START + (SWEEP * (d - 1)) / (MONTH_TICKS - 1));
        return (
          <text
            key={d}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            className="tabular-nums"
            fontSize="10"
            fill={duration === d ? "currentColor" : "var(--muted-foreground)"}
            fontWeight={duration === d ? 700 : 400}
          >
            {d}
          </text>
        );
      })}

      {/* Inner meter: monthly budget. */}
      <path d={arc(BUDGET_R, START, START + SWEEP)} fill="none" stroke="var(--hairline)" strokeWidth="6" strokeLinecap="round" />
      <motion.path
        d={arc(BUDGET_R, START, START + SWEEP)}
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        initial={false}
        animate={{ pathLength: budget ?? 0, opacity: budget === null ? 0 : 1 }}
        transition={{ duration: reduce ? 0 : 0.5, ease }}
      />
      {budget !== null && (
        <motion.circle
          r="6"
          fill="var(--color-ember)"
          initial={false}
          animate={{
            cx: polar(BUDGET_R, START + SWEEP * budget)[0],
            cy: polar(BUDGET_R, START + SWEEP * budget)[1],
          }}
          transition={{ duration: reduce ? 0 : 0.5, ease }}
        />
      )}

      <circle cx={C} cy={C} r="88" fill="var(--card)" stroke="var(--hairline)" />

      {/* Centre: the goal, drawn on each time it changes; the crown until one is chosen. */}
      <AnimatePresence mode="wait" initial={false}>
        {goal ? (
          <motion.g
            key={goal}
            transform={`translate(${C - 64} ${C - 64}) scale(4)`}
            initial={{ opacity: reduce ? 1 : 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.15 } }}
          >
            <motion.path
              d={GOAL_ICON_PATHS[goal].stroke}
              fill="none"
              stroke="currentColor"
              strokeWidth={0.55}
              strokeLinejoin="round"
              initial={{ pathLength: reduce ? 1 : 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: reduce ? 0 : 1.1, ease }}
            />
            <motion.g
              fill="var(--color-ember)"
              stroke="var(--color-ember)"
              strokeWidth={0.55}
              initial={{ opacity: reduce ? 1 : 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: reduce ? 0 : 0.8, duration: 0.3 }}
            >
              {GOAL_ICON_PATHS[goal].accent}
            </motion.g>
          </motion.g>
        ) : (
          <motion.g key="crown" initial={false} exit={{ opacity: 0 }}>
            <foreignObject x={C - 36} y={C - 36} width="72" height="72">
              <PanasunaLogo variant="mark" className="size-full opacity-60" />
            </foreignObject>
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}
