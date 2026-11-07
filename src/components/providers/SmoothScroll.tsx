"use client";

import * as React from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLocale } from "@/lib/i18n";

gsap.registerPlugin(ScrollTrigger);

/** Height of the scrolled header bar; anchor jumps land below it. */
export const HEADER_OFFSET = 80;

let lenis: Lenis | null = null;

/** Imperative handle for overlays (menus, dialogs) that must freeze the page underneath. */
export const pageScroll = {
  lock() {
    lenis?.stop();
  },
  unlock() {
    lenis?.start();
  },
  /** Bring an element to the top of the viewport, below the header (smoothly when Lenis runs). */
  to(el: HTMLElement) {
    if (lenis) lenis.scrollTo(el, { offset: -HEADER_OFFSET - 16 });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET - 16 });
  },
  /** Scroll to an absolute position, e.g. a point inside a pinned ScrollTrigger range. */
  toY(y: number) {
    if (lenis) lenis.scrollTo(y, { duration: 1.2 });
    else window.scrollTo({ top: y, behavior: "instant" });
  },
};

/**
 * Global scroll engine (panasuna-brand §5.6): Lenis on the GSAP ticker drives every ScrollTrigger,
 * so scrubbed 3D and DOM timelines read the same smoothed position. Native scroll under reduced motion.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale();

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const instance = new Lenis({ lerp: 0.1, anchors: { offset: -HEADER_OFFSET } });
    lenis = instance;
    instance.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Web fonts change line wraps, and with them every trigger's start and end.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    // <html> is `h-full`, so Lenis's own observer on it never fires as the page grows. Without this, pin
    // spacers (the How-chits-work journey adds ~4 screens) and late content leave Lenis clamped to the old
    // height: the wheel and trackpad stop mid-page while the scrollbar still works.
    const remeasure = () => instance.resize();
    const bodyObserver = new ResizeObserver(remeasure);
    bodyObserver.observe(document.body);
    ScrollTrigger.addEventListener("refresh", remeasure);

    return () => {
      bodyObserver.disconnect();
      ScrollTrigger.removeEventListener("refresh", remeasure);
      gsap.ticker.remove(tick);
      instance.destroy();
      lenis = null;
    };
  }, []);

  React.useEffect(() => {
    // Tamil runs 20–35% longer, so section heights move when the language flips.
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [locale]);

  return children;
}
