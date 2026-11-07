"use client";

import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, useGLTF } from "@react-three/drei";
import { CALCULATOR } from "@/data/panasunaData";
import { useLocale } from "@/lib/i18n";
import type { Theme } from "@/lib/theme";
import { useVaultModel } from "@/components/three/houseMaterials";
import { PanasunaLogo } from "@/components/brand/PanasunaLogo";
import { LoadBoundary } from "@/components/three/LoadBoundary";
import { ModelFallback } from "@/components/three/fallbacks";
import { Studio } from "@/components/three/Studio";
import {
  COIN_FILE,
  VAULT_FILE,
  mulberry32,
  useGltfCoinParts,
  useProceduralCoinParts,
  type CoinPart,
} from "@/components/three/coins";
import { useCanvasDpr } from "@/components/three/useCanvasDpr";

interface VaultProps {
  /** 0 → 1: where the chit value sits between ₹40,000 and ₹1,00,00,000 (log scale). */
  fill: number;
  reduce: boolean;
}

// ─── Coin stacks on the plinth beside Home_Core ────────────────────────────────

const PLINTH_TOP = -0.5;
const COIN_SCALE = 0.165;
const COIN_PITCH = 0.034; // stacked height per coin (thickness + a hair of air)
const COLUMNS: readonly [number, number][] = [
  [0.6, 0.12],
  [0.45, 0.55],
  [0.98, 0.05],
  [0.55, -0.32],
  [0.86, 0.5],
  [0.93, -0.4],
];
const PER_COLUMN = 14;
export const MAX_COINS = COLUMNS.length * PER_COLUMN;
const MIN_COINS = 3;

/** How many coins a given fill shows: 3 for the ₹40,000 entry scheme, all 84 for ₹1 crore. */
export const coinsFor = (fill: number) => Math.round(MIN_COINS + fill * (MAX_COINS - MIN_COINS));

function seedStacks() {
  const rand = mulberry32(1975);
  return Array.from({ length: MAX_COINS }, (_, i) => {
    const [x, z] = COLUMNS[i % COLUMNS.length];
    const level = Math.floor(i / COLUMNS.length);
    return {
      x: x + (rand() - 0.5) * 0.025,
      z: z + (rand() - 0.5) * 0.025,
      y: PLINTH_TOP + COIN_PITCH / 2 + level * COIN_PITCH,
      spin: rand() * Math.PI * 2,
      wobble: (rand() - 0.5) * 0.05,
    };
  });
}

const FLAT = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);

function CoinStacks({ parts, fill, reduce }: VaultProps & { parts: CoinPart[] }) {
  const meshes = React.useRef<(THREE.InstancedMesh | null)[]>([]);
  const coins = React.useMemo(() => seedStacks(), []);
  const level = React.useRef(reduce ? coinsFor(fill) : 0);
  const tmp = React.useMemo(
    () => ({
      pos: new THREE.Vector3(),
      scale: new THREE.Vector3(),
      q: new THREE.Quaternion(),
      turn: new THREE.Quaternion(),
      euler: new THREE.Euler(),
      coin: new THREE.Matrix4(),
      m: new THREE.Matrix4(),
    }),
    [],
  );

  useFrame((_, dt) => {
    const target = coinsFor(fill);
    // Coins pour in (or lift out) one after another rather than all at once.
    level.current = reduce ? target : THREE.MathUtils.damp(level.current, target, 2.6, Math.min(dt, 0.05));
    const { pos, scale, q, turn, euler, coin, m } = tmp;

    coins.forEach((c, i) => {
      const p = THREE.MathUtils.clamp(level.current - i, 0, 1);
      const drop = 1 - p;
      pos.set(c.x, c.y + drop * drop * 0.9, c.z);
      euler.set(c.wobble + drop * 0.6, c.spin + drop * 2.4, 0);
      turn.setFromEuler(euler);
      q.multiplyQuaternions(turn, FLAT);
      coin.compose(pos, q, scale.setScalar(p > 0.001 ? COIN_SCALE : 0));
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
          args={[part.geometry, part.material, MAX_COINS]}
          frustumCulled={false}
        />
      ))}
    </>
  );
}

function GltfStacks(props: VaultProps) {
  return <CoinStacks parts={useGltfCoinParts(1.4)} {...props} />;
}

function ProceduralStacks(props: VaultProps) {
  return <CoinStacks parts={useProceduralCoinParts()} {...props} />;
}

// ─── Vault: rings turn faster as the chit grows ─────────────────────────────────

const RING_SPEED = [0.08, 1.15] as const; // rad/s at ₹40,000 → ₹1 crore

function Vault({ fill, reduce, theme }: VaultProps & { theme: Theme }) {
  const vault = useVaultModel(theme);
  const parts = React.useRef<{ outer?: THREE.Object3D; inner?: THREE.Object3D }>({});
  const speed = React.useRef<number>(RING_SPEED[0]);
  const angle = React.useRef(0);

  React.useEffect(() => {
    // The calculator draws its own, value-driven coin stacks in place of the baked six-coin stack.
    const stack = vault.getObjectByName("Coin_Stack");
    if (stack) stack.visible = false;
    parts.current = { outer: vault.getObjectByName("Ring_Outer"), inner: vault.getObjectByName("Ring_Inner") };
  }, [vault]);

  useFrame((_, dt) => {
    const { outer, inner } = parts.current;
    if (!outer || !inner) return;
    const target = THREE.MathUtils.lerp(RING_SPEED[0], RING_SPEED[1], fill);
    speed.current = THREE.MathUtils.damp(speed.current, target, 1.8, Math.min(dt, 0.05));
    if (!reduce) angle.current += speed.current * Math.min(dt, 0.05);
    outer.rotation.y = angle.current;
    inner.rotation.y = -angle.current * 1.4;
  });

  return <primitive object={vault} />;
}

// ─── Camera: a fixed three-quarter view with a little mouse parallax ───────────

const PHONE_RADIUS = 7.2;
const PHONE_LOOK_Y = 0.1;

function CameraRig({ reduce }: { reduce: boolean }) {
  const size = useThree((s) => s.size);
  const pointer = React.useRef({ x: 0, y: 0 });
  const look = React.useRef(new THREE.Vector3(0.12, -0.05, 0));

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
    // Fit the 3.1-unit-wide rings in narrow frames too. Phones (a short 4:3 card under a figure and
    // above a caption) step back and aim a touch higher, so the vault sits in the clear middle band.
    const phone = size.width < 640 && aspect >= 1;
    const radius = aspect < 1 ? 7.4 : phone ? PHONE_RADIUS : 5.6;
    look.current.y = phone ? PHONE_LOOK_Y : -0.05;
    const az = 0.62 + pointer.current.x * 0.12;
    const el = 0.36 + pointer.current.y * 0.05;
    const p = camera.position;
    const k = reduce ? 1 : 1 - Math.exp(-3 * dt);
    p.x += (radius * Math.cos(el) * Math.sin(az) - p.x) * k;
    p.y += (radius * Math.sin(el) - p.y) * k;
    p.z += (radius * Math.cos(el) * Math.cos(az) - p.z) * k;
    camera.lookAt(look.current);
  });

  return null;
}

/** Re-render on demand when the value changes under reduced motion (no running loop). */
function InvalidateOn({ fill }: { fill: number }) {
  const invalidate = useThree((s) => s.invalidate);
  React.useEffect(() => {
    invalidate();
  }, [fill, invalidate]);
  return null;
}

export default function CalculatorVault({ fill, reduce, theme }: VaultProps & { theme: Theme }) {
  const { t } = useLocale();
  const wrap = React.useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = React.useState(true);
  const { dpr, gl, monitor } = useCanvasDpr();
  const dark = theme === "dark";
  // Memoised element: drei's ContactShadows keeps its "render once" counter in a plain local, so every
  // parent re-render (each slider step) re-ran the shadow pass. Now it renders once per theme.
  const shadows = React.useMemo(() => <ContactShadows position={[0, -0.72, 0]} scale={6} blur={2.6} far={0.6} frames={1} opacity={dark ? 0.6 : 0.3} color="#051311" />, [dark]);

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
      <ProceduralStacks fill={fill} reduce={reduce} />
    </>
  );

  return (
    <div ref={wrap} role="img" aria-label={t(CALCULATOR.sceneLabel)} className="absolute inset-0">
      <Canvas
        frameloop={!onScreen ? "never" : reduce ? "demand" : "always"}
        dpr={dpr}
        gl={gl}
        camera={{ fov: 30, near: 0.1, far: 50, position: [3.4, 2, 4.4] }}
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
        <InvalidateOn fill={fill} />
        <LoadBoundary fallback={fallbackScene}>
          <React.Suspense fallback={fallbackScene}>
            <Vault fill={fill} reduce={reduce} theme={theme} />
            <GltfStacks fill={fill} reduce={reduce} />
            {shadows}
          </React.Suspense>
        </LoadBoundary>
      </Canvas>
    </div>
  );
}

useGLTF.preload(COIN_FILE);
useGLTF.preload(VAULT_FILE);
