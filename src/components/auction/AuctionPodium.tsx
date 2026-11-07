"use client";

import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, useGLTF } from "@react-three/drei";
import { AUCTION_SIMULATOR } from "@/data/panasunaData";
import { useLocale } from "@/lib/i18n";
import type { Theme } from "@/lib/theme";
import { PanasunaLogo } from "@/components/brand/PanasunaLogo";
import { LoadBoundary } from "@/components/three/LoadBoundary";
import { ModelFallback } from "@/components/three/fallbacks";
import { PODIUM_FILE, findPodiumParts, poseGavel, tiltBeam, type PodiumParts } from "@/components/three/podiumRig";
import { JADE_LIGHT, withJadeStone } from "@/components/three/brandStone";
import { isolatedClone } from "@/components/three/isolate";
import { Studio } from "@/components/three/Studio";
import { smoothstep } from "@/components/three/coins";
import { useCanvasGate } from "@/components/three/useCanvasGate";
import { useCanvasDpr } from "@/components/three/useCanvasDpr";

/** Where the gross chit amount goes, as fractions that sum to 1. */
export interface PodiumSplit {
  payout: number;
  commission: number;
  pool: number;
}

interface PodiumProps {
  split: PodiumSplit;
  /** 0 → 1: the discount between the commission floor and the 40% ceiling. */
  level: number;
  /** Increments each time a bid is committed; the gavel strikes once per change. */
  strike: number;
  reduce: boolean;
}

// ─── Podium (auction-gavel-podium.glb) ─────────────────────────────────────────

const STRIKE_S = 0.55;

function Podium({ split, level, strike, reduce }: PodiumProps) {
  const { scene } = useGLTF(PODIUM_FILE);
  const podium = React.useMemo(() => {
    const clone = withJadeStone(isolatedClone(scene));
    // Upright dividend coins face away from the key light; lift their reflections (own material copies).
    clone.traverse((o) => {
      if (o instanceof THREE.Mesh && o.name.startsWith("Dividend_Coin")) {
        (o.material as THREE.MeshStandardMaterial).envMapIntensity = 2.4;
      }
    });
    return clone;
  }, [scene]);
  const parts = React.useRef<PodiumParts>({ coins: [] });
  const motion = React.useRef({ beam: 0, coin: 0, strikeAt: -1, lastStrike: strike });

  React.useEffect(() => {
    parts.current = findPodiumParts(podium);
  }, [podium]);

  useFrame((state, dt) => {
    const { ring, coins } = parts.current;
    const m = motion.current;
    const step = Math.min(dt, 0.05);
    // The beam weighs what the bidder keeps against what goes back to the group: it levels as the discount grows.
    const beamTarget = (2 * split.payout - 1) * 0.3;
    m.beam = reduce ? beamTarget : THREE.MathUtils.damp(m.beam, beamTarget, 4, step);
    m.coin = reduce ? level : THREE.MathUtils.damp(m.coin, level, 3, step);

    tiltBeam(parts.current, m.beam);

    const t = state.clock.elapsedTime;
    if (strike !== m.lastStrike) {
      m.lastStrike = strike;
      if (!reduce) m.strikeAt = t;
    }
    poseGavel(parts.current, m.strikeAt < 0 ? 1 : (t - m.strikeAt) / STRIKE_S);

    // Dividend coins grow with each subscriber's share and turn slowly on their ring.
    const grow = 0.55 + m.coin * 0.95;
    coins.forEach((coin, i) => {
      coin.scale.setScalar(grow);
      coin.position.y = -0.585 + (grow - 1) * 0.09 + (reduce ? 0 : Math.sin(t * 1.4 + i * 0.8) * 0.02 * m.coin);
    });
    if (ring && !reduce) ring.rotation.y = t * 0.08;
  });

  return <primitive object={podium} />;
}

// ─── Share ring: 100 tiles, each 1% of the gross chit amount ───────────────────

const TILES = 100;
const RING_R = 1.86;
const RING_Y = -0.86;
const RING_END = 0.5; // radians in XZ; the camera sits at about 1.0

function ShareRing({ split, reduce, theme }: { split: PodiumSplit; reduce: boolean; theme: Theme }) {
  const solid = React.useRef<THREE.InstancedMesh>(null);
  const gold = React.useRef<THREE.InstancedMesh>(null);
  // Boundaries (in tiles) where commission and the dividend pool begin, damped so the change sweeps round.
  const edge = React.useRef<{ commission: number; pool: number } | null>(null);
  // Long side radial, with a gap between neighbours so each 1% reads as its own tile.
  const geometry = React.useMemo(() => new THREE.BoxGeometry(0.24, 0.05, 0.075), []);
  const materials = React.useMemo(
    () => ({
      // A touch of warm self-light: seen from above, bare metal tiles mirror the dark floor and read brown.
      gold: new THREE.MeshPhysicalMaterial({
        color: "#D4AF37",
        metalness: 0.9,
        roughness: 0.28,
        envMapIntensity: 2,
        emissive: "#8A6A12",
        emissiveIntensity: 0.45,
      }),
      // Payout tiles read as "the foreground": light jade on emerald, obsidian on ivory.
      solid:
        theme === "dark"
          ? new THREE.MeshPhysicalMaterial({ color: JADE_LIGHT, metalness: 0.05, roughness: 0.45, envMapIntensity: 0.5 })
          : new THREE.MeshPhysicalMaterial({ color: "#051311", metalness: 0, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.03 }),
    }),
    [theme],
  );
  const tmp = React.useMemo(() => ({ o: new THREE.Object3D() }), []);

  useFrame((_, dt) => {
    const commissionAt = Math.round(split.payout * TILES);
    const poolAt = commissionAt + Math.round(split.commission * TILES);
    const e = (edge.current ??= { commission: commissionAt, pool: poolAt });
    const k = reduce ? 1 : 1 - Math.exp(-5 * Math.min(dt, 0.05));
    e.commission += (commissionAt - e.commission) * k;
    e.pool += (poolAt - e.pool) * k;

    const { o } = tmp;
    for (let i = 0; i < TILES; i++) {
      const x = i + 0.5;
      const g = smoothstep(e.pool - 0.6, e.pool + 0.6, x);
      const fee = smoothstep(e.commission - 0.6, e.commission + 0.6, x) * (1 - g);
      // The ring ends just right of the camera and runs backwards, so the gold arc grows toward the viewer.
      const a = RING_END - ((i + 0.5) / TILES) * Math.PI * 2;
      // Each tile hops as the boundary passes it, like a split-flap.
      const hop = Math.sin(g * Math.PI) * 0.09;
      o.position.set(Math.cos(a) * RING_R, RING_Y + 0.025 + hop, Math.sin(a) * RING_R);
      o.rotation.set(0, -a, 0);
      o.scale.set(1, 1 - fee * 0.7, 1 - fee * 0.55);
      o.scale.multiplyScalar(1 - g || 0.0001);
      o.updateMatrix();
      solid.current?.setMatrixAt(i, o.matrix);
      o.scale.set(1, 1, 1).multiplyScalar(g || 0.0001);
      o.position.setY(o.position.y + 0.012);
      o.updateMatrix();
      gold.current?.setMatrixAt(i, o.matrix);
    }
    if (solid.current) solid.current.instanceMatrix.needsUpdate = true;
    if (gold.current) gold.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={solid} args={[geometry, materials.solid, TILES]} frustumCulled={false} />
      <instancedMesh ref={gold} args={[geometry, materials.gold, TILES]} frustumCulled={false} />
    </>
  );
}

// ─── Camera and pointer tilt ───────────────────────────────────────────────────

const LOOK = new THREE.Vector3(0, -0.15, 0);
/** Phones: the 4:3 card is short and carries text top and bottom, so aim higher and step back. */
const PHONE_LOOK = new THREE.Vector3(0, -0.2, 0);
const PHONE_RADIUS = 10;

function CameraRig({ reduce }: { reduce: boolean }) {
  const size = useThree((s) => s.size);
  const pointer = React.useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce]);

  useFrame((state, dt) => {
    const camera = state.camera as THREE.PerspectiveCamera;
    const aspect = size.width / size.height;
    // The 3.8-unit share ring has to fit narrow frames too.
    const phone = size.width < 640 && aspect >= 1;
    const radius = aspect < 1 ? 10.2 : phone ? PHONE_RADIUS : aspect < 1.25 ? 8.4 : 7.3;
    const look = phone ? PHONE_LOOK : LOOK;
    const az = 0.55 + pointer.current.x * 0.16;
    const el = 0.46 + pointer.current.y * 0.06;
    const p = camera.position;
    const k = reduce ? 1 : 1 - Math.exp(-3 * dt);
    p.x += (radius * Math.cos(el) * Math.sin(az) - p.x) * k;
    p.y += (look.y + radius * Math.sin(el) - p.y) * k;
    p.z += (radius * Math.cos(el) * Math.cos(az) - p.z) * k;
    camera.lookAt(look);
  });

  return null;
}

/** Re-render on demand when the bid changes under reduced motion (no running loop). */
function InvalidateOn({ token }: { token: string }) {
  const invalidate = useThree((s) => s.invalidate);
  React.useEffect(() => {
    invalidate();
  }, [token, invalidate]);
  return null;
}

export default function AuctionPodium({ split, level, strike, reduce, theme }: PodiumProps & { theme: Theme }) {
  const { t } = useLocale();
  const wrap = React.useRef<HTMLDivElement>(null);
  const { mounted, frameloop } = useCanvasGate(wrap, reduce);
  const { dpr, gl, monitor } = useCanvasDpr();
  const dark = theme === "dark";
  // Memoised element: drei's ContactShadows keeps its "render once" counter in a plain local, so every
  // parent re-render (each slider step) re-ran the shadow pass. Now it renders once per theme.
  const shadows = React.useMemo(() => <ContactShadows position={[0, -0.9, 0]} scale={7} blur={2.4} far={0.8} frames={1} opacity={dark ? 0.55 : 0.28} color="#051311" />, [dark]);

  return (
    <div ref={wrap} role="img" aria-label={t(AUCTION_SIMULATOR.sceneLabel)} className="absolute inset-0">
      {mounted && (
        <Canvas
          frameloop={frameloop}
          dpr={dpr}
          gl={gl}
          camera={{ fov: 30, near: 0.1, far: 60, position: [3.6, 3.2, 5.6] }}
          fallback={
            <div className="grid h-full place-items-center">
              <PanasunaLogo variant="seal" className="size-40 opacity-40" />
            </div>
          }
          style={{ pointerEvents: "none" }}
        >
          {monitor}
          <Studio intensity={dark ? 1 : 1.1} wideFill theme={theme} />
          <CameraRig reduce={reduce} />
          <InvalidateOn token={`${split.payout}|${level}|${strike}|${theme}`} />
          <ShareRing split={split} reduce={reduce} theme={theme} />
          <LoadBoundary fallback={<ModelFallback id="auction" />}>
            <React.Suspense fallback={<ModelFallback id="auction" />}>
              <Podium split={split} level={level} strike={strike} reduce={reduce} />
            </React.Suspense>
          </LoadBoundary>
          {shadows}
        </Canvas>
      )}
    </div>
  );
}

useGLTF.preload(PODIUM_FILE);
