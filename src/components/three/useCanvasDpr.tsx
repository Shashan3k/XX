"use client";

import * as React from "react";
import { PerformanceMonitor } from "@react-three/drei";

type Dpr = number | [number, number];

/** Phones render at their native density (a Poco M7 Pro is 2.8125), up to 3×. */
const MOBILE_CAP = 3;
/** Never below 2×: under that, an FHD+/QHD AMOLED visibly smears the gold edges. */
const MOBILE_FLOOR = 2;
/** Load, hydration and the first scroll produce frame spikes that say nothing about steady-state cost. */
const WARMUP_MS = 4000;

export interface DeviceProfile {
  /** Fewer coins / sparkles. Unchanged from the original heuristic so desktop scenes are untouched. */
  lowPower: boolean;
  /** Touch-first phone or tablet layout (< 768px, or a coarse pointer under 1024px). */
  mobile: boolean;
}

function readProfile(): DeviceProfile {
  const w = window.innerWidth;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  return {
    lowPower: navigator.hardwareConcurrency <= 4 || w < 640,
    mobile: w < 768 || (coarse && w < 1024),
  };
}

/**
 * Renderer settings for a scene canvas.
 *
 * Desktop/laptop keeps exactly what it had (`desktop`, or 1× on low-core machines, and its own
 * `powerPreference`). Phones render at their native devicePixelRatio (capped at 3×) so the canvas
 * maps 1:1 onto the panel instead of being upscaled. If a phone genuinely can't hold its frame rate
 * once warmed up, drei's PerformanceMonitor may step it to 2× — never lower — and back up again when
 * it recovers. The scenes themselves stay cheap per pixel: no shadow maps (contact shadows are baked
 * once), instanced coins, and every canvas stops rendering when it's off-screen (useCanvasGate).
 */
export function useCanvasDpr(desktop: Dpr = [1, 1.75], desktopPower: WebGLPowerPreference = "high-performance") {
  const [profile] = React.useState(readProfile);
  const native = React.useMemo(() => Math.min(Math.max(window.devicePixelRatio || 1, 1), MOBILE_CAP), []);
  const floor = Math.min(native, MOBILE_FLOOR);
  const [dpr, setDpr] = React.useState<Dpr>(() => (profile.mobile ? native : profile.lowPower ? 1 : desktop));
  const [bornAt] = React.useState(() => performance.now());
  const warm = () => performance.now() - bornAt > WARMUP_MS;

  const monitor =
    profile.mobile && native > floor ? (
      // Each DPR switch reallocates the drawing buffer (a visible hitch), so only react to a sustained
      // collapse: decline below 30 fps averaged over ~2.5 s, incline again above 50.
      // No `flipflops`/`onFallback`: drei counts every healthy "incline" verdict as a flip, so a phone
      // running at a perfect 60 fps hit the fallback ~10 s after a scene appeared and was dropped to
      // the floor — the "soft after a few seconds" look on real devices.
      <PerformanceMonitor
        bounds={() => [30, 50]}
        onDecline={() => warm() && setDpr(floor)}
        onIncline={() => setDpr(native)}
      />
    ) : null;

  const gl = {
    antialias: true,
    alpha: true,
    precision: "highp",
    powerPreference: profile.mobile ? "high-performance" : desktopPower,
  } as const;

  return { dpr, gl, monitor, ...profile };
}
