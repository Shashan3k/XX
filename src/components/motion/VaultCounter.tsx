"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Two turns of 0–9 per wheel, so every digit spins at least once before it settles. */
const CELLS = 20;

/**
 * A combination-dial counter: each digit wheel spins and settles in turn as it scrolls into view.
 * The server renders the final figure (correct with JS off); GSAP only animates `--roll` from 0 to it.
 * Screen readers get the plain value. Tabular figures keep every wheel the same width.
 */
export function VaultCounter({
  value,
  prefix = "",
  suffix = "",
  className,
}: {
  value: number;
  /** Static text before the wheels, e.g. "15 – " for a range. */
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const root = React.useRef<HTMLSpanElement>(null);
  const reduce = usePrefersReducedMotion();
  const digits = String(value).split("").map(Number);

  useGSAP(
    () => {
      if (reduce) return;
      // fromTo with the target read from data-roll: a `from` would read the end value back from the
      // inline style, which a StrictMode re-run has already set to 0.
      gsap.fromTo(
        "[data-wheel]",
        { "--roll": 0 },
        {
          "--roll": (_: number, el: HTMLElement) => Number(el.dataset.roll),
          duration: 2,
          ease: "expo.out",
          stagger: 0.14,
          scrollTrigger: {
            trigger: root.current,
            start: "top 88%",
            once: true,
          },
        },
      );
    },
    { scope: root, dependencies: [reduce, value], revertOnUpdate: true },
  );

  return (
    <span
      ref={root}
      className={cn(
        "inline-flex items-baseline tabular-nums lining-nums [--cell:1.08em]",
        className,
      )}
    >
      <span className="sr-only">
        {prefix}
        {value}
        {suffix}
      </span>
      <span aria-hidden="true" className="inline-flex">
        {prefix && <span className="mr-[0.08em] leading-(--cell) whitespace-pre">{prefix}</span>}
        {digits.map((d, i) => (
          <span
            key={i}
            className="relative inline-block h-(--cell) overflow-hidden"
          >
            <span
              data-wheel
              data-roll={CELLS / 2 + d}
              className="flex flex-col will-change-transform"
              // The settled position is the var() fallback, not an inline --roll: GSAP's cleanup removes
              // the property it animated, and React wouldn't put it back.
              style={{ transform: `translateY(calc(var(--roll, ${CELLS / 2 + d}) * var(--cell) * -1))` }}
            >
              {Array.from({ length: CELLS }, (_, k) => (
                <span key={k} className="block h-(--cell) leading-(--cell)">
                  {k % 10}
                </span>
              ))}
            </span>
          </span>
        ))}
        {suffix && (
          <span className="ml-[0.04em] leading-(--cell) opacity-80">
            {suffix}
          </span>
        )}
      </span>
    </span>
  );
}
