"use client";

import * as React from "react";
import { flushSync } from "react-dom";
import { motion } from "framer-motion";
import { SITE_CHROME } from "@/data/panasunaData";
import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type Theme = "dark" | "light";

/** Same key as THEME_SCRIPT in app/layout.tsx. */
const STORAGE_KEY = "pn-theme";

const listeners = new Set<() => void>();

function readTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Private mode: the choice simply doesn't persist.
  }
  listeners.forEach((cb) => cb());
}

/** The <html> class is the store; the server always renders the brand default, dark. */
export function useTheme(): Theme {
  return React.useSyncExternalStore<Theme>(subscribe, readTheme, () => "dark");
}

/** Switches theme with a circular reveal from `origin` where View Transitions exist. */
export function setTheme(next: Theme, origin?: { x: number; y: number }) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!origin || reduce || !document.startViewTransition) {
    applyTheme(next);
    return;
  }
  const transition = document.startViewTransition(() => flushSync(() => applyTheme(next)));
  transition.ready.then(() => {
    const radius = Math.hypot(Math.max(origin.x, innerWidth - origin.x), Math.max(origin.y, innerHeight - origin.y));
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${origin.x}px ${origin.y}px)`, `circle(${radius}px at ${origin.x}px ${origin.y}px)`] },
      { duration: 650, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" },
    );
  });
}

const RAYS = Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4);

/** Sun ⇄ crescent drawn on one circle: a mask slides in to carve the crescent, rays retract. */
function SunMoon({ dark }: { dark: boolean }) {
  const id = React.useId().replace(/:/g, "");
  const spring = { type: "spring", stiffness: 260, damping: 22 } as const;
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
      <mask id={`${id}-m`}>
        <rect width="24" height="24" fill="white" />
        <motion.circle initial={false} animate={dark ? { cx: 16.5, cy: 7.5 } : { cx: 30, cy: -6 }} transition={spring} r="6.5" fill="black" />
      </mask>
      <motion.circle
        cx="12"
        cy="12"
        initial={false}
        animate={{ r: dark ? 7.5 : 4.6 }}
        transition={spring}
        fill="currentColor"
        mask={`url(#${id}-m)`}
      />
      <motion.g
        initial={false}
        animate={dark ? { opacity: 0, scale: 0.5, rotate: -45 } : { opacity: 1, scale: 1, rotate: 0 }}
        transition={spring}
        style={{ transformOrigin: "12px 12px" }}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        {RAYS.map((a) => (
          <line key={a} x1={12 + Math.cos(a) * 7.4} y1={12 + Math.sin(a) * 7.4} x2={12 + Math.cos(a) * 9.6} y2={12 + Math.sin(a) * 9.6} />
        ))}
      </motion.g>
    </svg>
  );
}

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useTheme();
  const { t } = useLocale();
  const next: Theme = theme === "dark" ? "light" : "dark";
  const label = t(next === "light" ? SITE_CHROME.theme.toLight : SITE_CHROME.theme.toDark);

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setTheme(next, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }}
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-full border border-hairline text-gold-ink transition-colors duration-150 hover:border-hairline-strong hover:bg-accent/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className,
      )}
    >
      <SunMoon dark={theme === "dark"} />
    </button>
  );
}
