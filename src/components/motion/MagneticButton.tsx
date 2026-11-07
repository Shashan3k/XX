"use client";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import * as React from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Button, type ButtonProps } from "@/components/ui/button";

const MAX_PULL = 6;

/** Primary CTAs only. 6px max pull, spring 300/20, off on touch and reduced motion. */
export function MagneticButton(props: ButtonProps) {
  const reduce = usePrefersReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 300, damping: 20 });
  const y = useSpring(useMotionValue(0), { stiffness: 300, damping: 20 });

  function onPointerMove(e: React.PointerEvent<HTMLSpanElement>) {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    x.set(Math.max(-1, Math.min(1, dx)) * MAX_PULL);
    y.set(Math.max(-1, Math.min(1, dy)) * MAX_PULL);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.span
      className="-m-2 inline-flex max-w-[calc(100%+1rem)] min-w-0 p-2"
      style={{ x, y }}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
    >
      <Button {...props} />
    </motion.span>
  );
}
