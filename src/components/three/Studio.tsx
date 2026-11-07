"use client";

import * as React from "react";
import { useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import type { Theme } from "@/lib/theme";

/** drei's "city" preset (Poly Haven, CC0), self-hosted so no page fetches from a third-party CDN. */
const CITY_HDR = "/hdri/potsdamer_platz_1k.hdr";

/** The HDR loads asynchronously; on-demand canvases (reduced motion) need one more frame once it lands. */
function RedrawOnLoad() {
  const invalidate = useThree((s) => s.invalidate);
  React.useEffect(() => invalidate(), [invalidate]);
  return null;
}

/**
 * Bright 24K studio in both themes (client spec 2026-10-29): the city HDR for real-world reflections,
 * a warm golden key, a front-left fill, and the warm softboxes layered into the environment.
 * `wideFill` adds a broad softbox behind the viewer: coin faces turned to the camera mirror that
 * direction, and without it they read black instead of gold (hero coin field).
 * `skyFill` adds a broad, low softbox behind the stage: coins lying flat (journey ring, auction
 * table) mirror that band of the room, and without it they read dull bronze instead of gold.
 */
/**
 * Memoised on purpose: drei's <Environment> re-bakes its cube map (six face renders + PMREM) in a
 * layout effect keyed on `children`, so every parent re-render — each step of a slider — used to
 * redo that bake. On a phone GPU that halved the frame rate while dragging. All props are plain
 * values, so the bake now runs once per theme.
 */
export const Studio = React.memo(function Studio({
  intensity = 1,
  wideFill = false,
  skyFill = false,
  theme = "dark",
}: {
  intensity?: number;
  wideFill?: boolean;
  skyFill?: boolean;
  theme?: Theme;
}) {
  return (
    <>
      <ambientLight intensity={0.2 * intensity} />
      {/* Warm golden key, high and to the right. */}
      <directionalLight position={[3, 4.5, 2.5]} intensity={2.5 * intensity} color="#FFF3D1" />
      {/* Front-left fill, so the faces turned to the viewer never fall into shadow. */}
      <directionalLight position={[-3.5, 1.5, 4]} intensity={0.9 * intensity} color="#FFF8EC" />
      <React.Suspense fallback={null}>
        <Environment files={CITY_HDR} resolution={256} environmentIntensity={theme === "light" ? 1.4 : 1.2}>
        <Lightformer form="rect" intensity={3} color="#FFE2A8" position={[0, 4, -2]} scale={[8, 2, 1]} />
        {/* Soft warm fill behind the viewer, so faces pointing at the camera reflect gold, not black. */}
        <Lightformer form="rect" intensity={1.1} color="#FFE2A8" position={[1.5, 1, 7]} target={[0, 0, 0]} scale={[7, 4, 1]} />
        {wideFill && (
          <Lightformer form="rect" intensity={0.9} color="#FFE2A8" position={[0, 0.5, 9]} target={[0, 0, 0]} scale={[22, 10, 1]} />
        )}
        {skyFill && (
          <Lightformer form="rect" intensity={0.85} color="#FFE2A8" position={[0, 3, -8]} target={[0, 0, 0]} scale={[26, 6, 1]} />
        )}
        <Lightformer form="rect" intensity={1.4} color="#F8FAFC" position={[-4, 1, 2]} rotation-y={Math.PI / 2} scale={[4, 3, 1]} />
        <Lightformer form="ring" intensity={2} color="#F59E0B" position={[4, 0.5, 2]} rotation-y={-Math.PI / 2} scale={2} />
        <Lightformer form="rect" intensity={0.6} color="#0A2A24" position={[0, -3, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} />
        </Environment>
        <RedrawOnLoad />
      </React.Suspense>
    </>
  );
});
