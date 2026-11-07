"use client";

import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Sparkles, useGLTF } from "@react-three/drei";
import { HERO } from "@/data/panasunaData";
import { useLocale } from "@/lib/i18n";
import type { Theme } from "@/lib/theme";
import { PanasunaLogo } from "@/components/brand/PanasunaLogo";
import { LoadBoundary } from "@/components/three/LoadBoundary";
import { ModelFallback } from "@/components/three/fallbacks";
import {
  COIN_FILE,
  VAULT_FILE,
  mulberry32,
  smoothstep,
  useGltfCoinParts,
  useProceduralCoinParts,
  type CoinPart,
} from "@/components/three/coins";
import { Studio } from "@/components/three/Studio";
import { useVaultModel } from "@/components/three/houseMaterials";
import { useCanvasDpr } from "@/components/three/useCanvasDpr";


/** Scrubbed by the hero's GSAP timeline (0 → 1). Read every frame; never React state. */
export interface HeroRig {
  /** Camera orbit from the 3/4 establishing shot into the vault rings. */
  orbit: number;
  /** Crown coins fanning out from their orbit around the vault. */
  fan: number;
}

interface HeroSceneProps {
  rig: React.RefObject<HeroRig>;
  theme: Theme;
  reduce: boolean;
}

// ─── Camera choreography ───────────────────────────────────────────────────────

const TARGET_FROM = new THREE.Vector3(0, 0.02, 0);
const TARGET_TO = new THREE.Vector3(-0.22, 0.14, 0.12); // the gold door slot of Home_Core
const AZIMUTH = [0.62, -0.74] as const; // ~35° right of front → ~42° left: a 77° orbit
const ELEVATION = [0.3, 0.06] as const; // drops to ring level
const DIVE = 0.47; // closing distance as a fraction of the establishing distance
const COMPOSITION = { width: 3.2, height: 1.9 }; // vault + rings, scene units

/** Distance that fits the vault into the free half of a wide hero, or the upper band of a tall one. */
function framingDistance(aspect: number, fov: number) {
  const t = Math.tan(THREE.MathUtils.degToRad(fov / 2));
  const wide = aspect >= 1;
  const byWidth = COMPOSITION.width / 2 / ((wide ? 0.5 : 0.82) * t * aspect);
  const byHeight = COMPOSITION.height / 2 / ((wide ? 0.5 : 0.34) * t);
  return Math.max(byWidth, byHeight);
}

function CameraRig({ rig, reduce }: { rig: React.RefObject<HeroRig>; reduce: boolean }) {
  const size = useThree((s) => s.size);
  const pointer = React.useRef({ x: 0, y: 0 });
  const parallax = React.useRef({ x: 0, y: 0 });
  const target = React.useRef(new THREE.Vector3());

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
    // Three.js objects are mutated per frame by design; read them from the frame state, not render scope.
    const camera = state.camera as THREE.PerspectiveCamera;
    const tgt = target.current;
    const o = reduce ? 0 : rig.current.orbit;
    const aspect = size.width / size.height;
    const fov = aspect >= 1 ? 32 : 40;
    const p = parallax.current;
    p.x = THREE.MathUtils.damp(p.x, pointer.current.x, 2.5, dt);
    p.y = THREE.MathUtils.damp(p.y, pointer.current.y, 2.5, dt);
    const idle = reduce ? 0 : Math.sin(state.clock.elapsedTime * 0.12) * 0.03;

    const radius = framingDistance(aspect, fov) * THREE.MathUtils.lerp(1, DIVE, o);
    const az = THREE.MathUtils.lerp(AZIMUTH[0], AZIMUTH[1], o) + p.x * 0.08 * (1 - 0.5 * o) + idle;
    const el = THREE.MathUtils.lerp(ELEVATION[0], ELEVATION[1], o) + p.y * 0.045;
    tgt.lerpVectors(TARGET_FROM, TARGET_TO, o);

    camera.fov = fov;
    camera.position.set(
      tgt.x + radius * Math.cos(el) * Math.sin(az),
      tgt.y + radius * Math.sin(el),
      tgt.z + radius * Math.cos(el) * Math.cos(az),
    );
    camera.lookAt(tgt);

    // Off-centre framing beside the copy (behind its upper half on phones), released as the camera dives in.
    const hold = 1 - smoothstep(0, 0.55, o);
    // Squarer windows leave the headline column a larger share of the width, so the scene slides further right.
    const ox = aspect >= 1 ? -(0.26 + THREE.MathUtils.clamp((1.6 - aspect) * 0.15, 0, 0.05)) * size.width * hold : 0;
    // Tall windows seat the scene in the band above the copy, so the headline never crosses it.
    const oy = aspect >= 1 ? 0 : (aspect < 0.6 ? 0.26 : 0.2) * size.height * hold;
    camera.setViewOffset(size.width, size.height, ox, oy, size.width, size.height);
  });

  return null;
}

// ─── Vault (architectural-home-vault.glb) ──────────────────────────────────────

function Vault({ rig, reduce, theme }: { rig: React.RefObject<HeroRig>; reduce: boolean; theme: Theme }) {
  const scene = useVaultModel(theme);
  const rings = React.useRef<{ outer?: THREE.Object3D; inner?: THREE.Object3D }>({});

  React.useEffect(() => {
    rings.current = { outer: scene.getObjectByName("Ring_Outer"), inner: scene.getObjectByName("Ring_Inner") };
  }, [scene]);

  useFrame((state) => {
    const { outer, inner } = rings.current;
    if (!outer || !inner) return;
    const t = reduce ? 0 : state.clock.elapsedTime;
    const o = reduce ? 0 : rig.current.orbit;
    // Milestone rings precess in opposite directions; scrolling winds them further.
    outer.rotation.y = t * 0.12 + o * Math.PI * 0.9;
    inner.rotation.y = -t * 0.17 - o * Math.PI * 1.25;
  });

  return <primitive object={scene} />;
}

// ─── Crown coins: one InstancedMesh per coin part, shared instance matrices ───

function seedCoins(count: number) {
  const rand = mulberry32(1975);
  return Array.from({ length: count }, (_, i) => {
    const a0 = (i / count) * Math.PI * 2 + (rand() - 0.5) * 0.4;
    return {
      // Orbit: a tight belt hugging the rings, so no coin strays back across the headline column.
      a0,
      r0: 1.55 + rand() * 0.4,
      y0: -0.2 + rand() * 1.25,
      // Fan: swept forward and spread into a tall spiral the camera flies through.
      a1: a0 + 0.7 + rand() * 0.5,
      r1: 3.0 + rand() * 2.1,
      y1: (rand() - 0.38) * 3.1,
      scale: 0.15 + rand() * 0.08,
      tiltX: (rand() - 0.5) * 1.1,
      tiltZ: (rand() - 0.5) * 0.7,
      spin: (0.35 + rand() * 0.45) * (rand() > 0.5 ? 1 : -1),
      phase: rand() * Math.PI * 2,
      delay: rand() * 0.25,
    };
  });
}

const UP = new THREE.Vector3(0, 1, 0);

function CoinField({ parts, count, rig, reduce }: { parts: CoinPart[]; count: number; rig: React.RefObject<HeroRig>; reduce: boolean }) {
  const meshes = React.useRef<(THREE.InstancedMesh | null)[]>([]);
  const coins = React.useMemo(() => seedCoins(count), [count]);
  const tmp = React.useMemo(
    () => ({
      pos: new THREE.Vector3(),
      scale: new THREE.Vector3(),
      euler: new THREE.Euler(),
      idle: new THREE.Quaternion(),
      face: new THREE.Quaternion(),
      q: new THREE.Quaternion(),
      look: new THREE.Matrix4(),
      coin: new THREE.Matrix4(),
      m: new THREE.Matrix4(),
    }),
    [],
  );

  useFrame((state) => {
    const t = reduce ? 0 : state.clock.elapsedTime;
    const fan = reduce ? 0 : rig.current.fan;
    const { pos, scale, euler, idle, face, q, look, coin, m } = tmp;

    coins.forEach((c, i) => {
      const f = smoothstep(c.delay, c.delay + 0.75, fan);
      const a = THREE.MathUtils.lerp(c.a0, c.a1, f) + t * 0.06;
      const r = THREE.MathUtils.lerp(c.r0, c.r1, f);
      const bob = Math.sin(t * 0.9 + c.phase) * 0.06;
      pos.set(Math.cos(a) * r, THREE.MathUtils.lerp(c.y0, c.y1, f) + bob, Math.sin(a) * r);

      // Idle tumble (gold glints off the milled edge) → turn the embossed crown to the camera.
      euler.set(c.tiltX, c.phase + t * c.spin, c.tiltZ);
      idle.setFromEuler(euler);
      look.lookAt(state.camera.position, pos, UP);
      face.setFromRotationMatrix(look);
      q.slerpQuaternions(idle, face, f * 0.85);

      coin.compose(pos, q, scale.setScalar(c.scale * (1 + f * 0.35)));
      parts.forEach((part, j) => {
        m.multiplyMatrices(coin, part.matrix);
        meshes.current[j]?.setMatrixAt(i, m);
      });
    });
    meshes.current.forEach((mesh) => {
      if (mesh) mesh.instanceMatrix.needsUpdate = true;
    });
  });

  return (
    <>
      {parts.map((part, j) => (
        <instancedMesh
          key={j}
          ref={(el) => {
            meshes.current[j] = el;
          }}
          args={[part.geometry, part.material, count]}
          frustumCulled={false}
        />
      ))}
    </>
  );
}

function GltfCoins(props: Omit<React.ComponentProps<typeof CoinField>, "parts">) {
  return <CoinField parts={useGltfCoinParts()} {...props} />;
}

function ProceduralCoins(props: Omit<React.ComponentProps<typeof CoinField>, "parts">) {
  return <CoinField parts={useProceduralCoinParts()} {...props} />;
}

// ─── Scene ─────────────────────────────────────────────────────────────────────

/** Shown where WebGL is unavailable: the seal, placed where the vault would sit. */
function StaticArt() {
  return (
    <div className="grid h-full place-items-center md:justify-end md:pr-[12%] max-md:items-end max-md:pb-[14%]">
      <PanasunaLogo variant="seal" className="size-56 opacity-40 md:size-80" />
    </div>
  );
}

export default function HeroScene({ rig, theme, reduce }: HeroSceneProps) {
  const { t } = useLocale();
  const wrap = React.useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = React.useState(true);
  const { dpr, gl, monitor, lowPower } = useCanvasDpr();
  const coinCount = lowPower ? 8 : 14;
  const dark = theme === "dark";
  // Memoised element: drei's ContactShadows keeps its "render once" counter in a plain local, so every
  // parent re-render (each slider step) re-ran the shadow pass. Now it renders once per theme.
  const shadows = React.useMemo(() => <ContactShadows position={[0, -0.72, 0]} scale={6} blur={2.6} far={0.6} frames={1} opacity={dark ? 0.6 : 0.3} color="#051311" />, [dark]);

  // Pause the render loop once the hero has scrolled away (panasuna-brand §5.6).
  React.useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const fallbackScene = (
    <>
      <ModelFallback id="home" />
      <ProceduralCoins count={coinCount} rig={rig} reduce={reduce} />
    </>
  );

  return (
    <div ref={wrap} role="img" aria-label={t(HERO.sceneLabel)} className="absolute inset-0">
      <Canvas
        frameloop={!onScreen ? "never" : reduce ? "demand" : "always"}
        dpr={dpr}
        gl={gl}
        camera={{ fov: 32, near: 0.1, far: 60, position: [4, 2, 6] }}
        fallback={<StaticArt />}
        style={{ pointerEvents: "none" }}
      >
        {monitor}
        <Studio intensity={dark ? 1 : 1.1} wideFill theme={theme} />
        <CameraRig rig={rig} reduce={reduce} />
        <LoadBoundary fallback={fallbackScene}>
          <React.Suspense fallback={fallbackScene}>
            <Vault rig={rig} reduce={reduce} theme={theme} />
            <GltfCoins count={coinCount} rig={rig} reduce={reduce} />
            {/* Rendered once, after the vault resolves: grounds the plinth without a per-frame shadow pass. */}
            {shadows}
          </React.Suspense>
        </LoadBoundary>
        <Sparkles
          count={lowPower ? 40 : 80}
          scale={[9, 5, 9]}
          size={2}
          speed={reduce ? 0 : 0.3}
          noise={0.6}
          opacity={dark ? 0.55 : 0.45}
          color={dark ? "#D4AF37" : "#8A6A12"}
        />
      </Canvas>
    </div>
  );
}

useGLTF.preload(COIN_FILE);
useGLTF.preload(VAULT_FILE);
