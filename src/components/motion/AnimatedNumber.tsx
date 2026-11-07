"use client";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import * as React from "react";
import { animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatINR } from "@/data/panasunaData";

interface AnimatedNumberProps {
  value: number;
  format?: (n: number) => string;
  className?: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;
/** A settled change (a tap, a pick) eases in over the brand's 600 ms. */
const SETTLE_S = 0.6;
/** Changes arriving faster than this are a finger dragging a slider: track it closely instead. */
const DRAG_GAP_MS = 140;
const TRACK_S = 0.16;

/**
 * Numbers tween, they don't pop (panasuna-brand §6). Always tabular so digits don't jitter.
 *
 * The tween writes straight into the text node instead of going through React state: a calculator
 * has a dozen of these, and re-rendering each one 60 times a second while a slider is dragged is
 * what made mobile scrubbing feel sticky. While values stream in (a drag), the tween shortens so the
 * figure stays under the finger; a one-off change still gets the full, soft settle.
 */
export function AnimatedNumber({ value, format = formatINR, className }: AnimatedNumberProps) {
  const reduce = usePrefersReducedMotion();
  const ref = React.useRef<HTMLSpanElement>(null);
  const shown = React.useRef(value);
  const lastChange = React.useRef(0);
  const formatRef = React.useRef(format);
  // React only ever renders this first string; every later update is written by the effect, so a
  // parent re-render mid-tween can't snap the figure to its end value.
  const [initial] = React.useState(() => format(value));
  const target = format(value);

  React.useLayoutEffect(() => {
    formatRef.current = format;
  });

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fmt = formatRef.current;
    const now = performance.now();
    const streaming = now - lastChange.current < DRAG_GAP_MS;
    lastChange.current = now;

    if (reduce || shown.current === value) {
      shown.current = value;
      el.textContent = fmt(value);
      return;
    }
    const controls = animate(shown.current, value, {
      duration: streaming ? TRACK_S : SETTLE_S,
      ease: streaming ? "linear" : EASE,
      onUpdate: (v) => {
        shown.current = v;
        el.textContent = fmt(Math.round(v));
      },
    });
    return () => controls.stop();
    // `target` re-runs the effect when only the formatting changes (e.g. the locale).
  }, [value, target, reduce]);

  return (
    <span ref={ref} className={cn("tabular-nums lining-nums", className)} suppressHydrationWarning>
      {initial}
    </span>
  );
}
