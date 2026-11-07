"use client";

import * as React from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

const MAX_TILT = 7; // degrees
const SPRING = { stiffness: 260, damping: 22 };

/**
 * 3D tilt toward the pointer with a gold glare that follows it, plus the brand hover lift (4px,
 * stronger hairline, no shadow bloom — panasuna-brand §6). Mouse only; off under reduced motion.
 * Children can float forward with `translateZ(...)`: the card preserves 3D, so nothing here may set
 * `isolation`, `overflow` or `opacity` < 1 on it (each would flatten the depth).
 */
export function TiltCard({
  className,
  children,
  onHoverStart,
  ...props
}: Omit<React.ComponentProps<typeof motion.div>, "children"> & { children: React.ReactNode; onHoverStart?: () => void }) {
  const reduce = usePrefersReducedMotion();
  const rotateX = useSpring(0, SPRING);
  const rotateY = useSpring(0, SPRING);
  const lift = useSpring(0, SPRING);
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const glare = useMotionTemplate`radial-gradient(28rem circle at ${gx}% ${gy}%, var(--tilt-glare), transparent 62%)`;

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    rotateX.set((0.5 - py) * 2 * MAX_TILT);
    rotateY.set((px - 0.5) * 2 * MAX_TILT);
    gx.set(px * 100);
    gy.set(py * 100);
  }

  function onPointerEnter(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    if (!reduce) lift.set(-4);
    onHoverStart?.();
  }

  function reset() {
    rotateX.set(0);
    rotateY.set(0);
    lift.set(0);
  }

  return (
    <motion.div
      {...props}
      onPointerMove={onPointerMove}
      onPointerEnter={onPointerEnter}
      onPointerLeave={reset}
      style={{ rotateX, rotateY, y: lift, transformPerspective: 1000, transformStyle: "preserve-3d" }}
      className={cn(
        "group/tilt relative rounded-2xl border border-hairline transition-colors duration-150 hover:border-hairline-strong",
        className,
      )}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/tilt:opacity-100"
        style={{ background: glare }}
      />
      {children}
    </motion.div>
  );
}
