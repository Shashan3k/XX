"use client";

import * as React from "react";

/**
 * Keeps WebGL off the page until it's needed (panasuna-brand §5.6: at most two live canvases).
 * `mounted` turns on once the element comes within about a viewport of the screen and stays on, so
 * the GLBs are parsed before the visitor arrives; `frameloop` is "never" whenever it's off-screen.
 */
export function useCanvasGate(ref: React.RefObject<HTMLElement | null>, reduce: boolean) {
  const [near, setNear] = React.useState(false);
  const [onScreen, setOnScreen] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const approach = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "100% 0px" });
    const visible = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
    approach.observe(el);
    visible.observe(el);
    return () => {
      approach.disconnect();
      visible.disconnect();
    };
  }, [ref]);

  const frameloop: "never" | "demand" | "always" = !onScreen ? "never" : reduce ? "demand" : "always";
  return { mounted: near, frameloop };
}
