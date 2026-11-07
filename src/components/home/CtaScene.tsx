"use client";

import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import type { Theme } from "@/lib/theme";
import { useVaultModel } from "@/components/three/houseMaterials";
import { LoadBoundary } from "@/components/three/LoadBoundary";
import { ModelFallback } from "@/components/three/fallbacks";
import { Studio } from "@/components/three/Studio";
import { useCanvasGate } from "@/components/three/useCanvasGate";
import { COIN_FILE, VAULT_FILE, mulberry32, useGltfCoinParts, useProceduralCoinParts, type CoinPart } from "@/components/three/coins";
import { useCanvasDpr } from "@/components/three/useCanvasDpr";

interface Props {
  reduce: boolean;
}

/** The vault turns slowly, its milestone rings drift, and the whole thing leans toward the pointer. */
function Vault({ reduce, theme }: Props & { theme: Theme }) {
  const model = useVaultModel(theme);
  const group = React.useRef<THREE.Group>(null);
  const rings = React.useMemo(() => ["Ring_Outer", "Ring_Inner"].map((n) => model.getObjectByName(n)), [model]);
  const pointer = React.useRef({ x: 0, y: 0 });

  // The canvas ignores pointer events (the CTA sits on top), so follow the mouse from the window.
  React.useEffect(() => {
    if (reduce) return;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.current = { x: (e.clientX / window.innerWidth) * 2 - 1, y: -((e.clientY / window.innerHeight) * 2 - 1) };
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [reduce]);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g || reduce) return;
    const t = state.clock.elapsedTime;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, -0.5 + Math.sin(t * 0.12) * 0.35 + pointer.current.x * 0.25, 2, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, 0.08 - pointer.current.y * 0.08, 2, dt);
    g.position.setY(Math.sin(t * 0.6) * 0.05);
    rings.forEach((ring, i) => ring?.rotateZ(dt * (i ? -0.12 : 0.08)));
  });

  return (
    <group ref={group} rotation={[0.08, -0.5, 0]}>
      <primitive object={model} />
    </group>
  );
}

const COINS = 9;

/** A loose ring of crown coins orbiting the vault, each tumbling on its own axis. */
function Orbit({ parts, reduce }: Props & { parts: CoinPart[] }) {
  const meshes = React.useRef<(THREE.InstancedMesh | null)[]>([]);
  const coins = React.useMemo(() => {
    const rand = mulberry32(2026);
    return Array.from({ length: COINS }, (_, i) => ({
      a: (i / COINS) * Math.PI * 2,
      r: 2.1 + rand() * 0.5,
      y: -0.3 + rand() * 1.1,
      s: 0.12 + rand() * 0.06,
      spin: 0.3 + rand() * 0.5,
      tilt: (rand() - 0.5) * 0.8,
    }));
  }, []);
  const tmp = React.useMemo(() => ({ pos: new THREE.Vector3(), q: new THREE.Quaternion(), e: new THREE.Euler(), s: new THREE.Vector3(), coin: new THREE.Matrix4(), m: new THREE.Matrix4() }), []);

  useFrame((state) => {
    const t = reduce ? 0 : state.clock.elapsedTime;
    const { pos, q, e, s, coin, m } = tmp;
    coins.forEach((c, i) => {
      const a = c.a + t * 0.07;
      pos.set(Math.cos(a) * c.r, c.y + Math.sin(t * 0.8 + c.a) * 0.06, Math.sin(a) * c.r * 0.6);
      e.set(c.tilt, t * c.spin + c.a, 0);
      q.setFromEuler(e);
      coin.compose(pos, q, s.setScalar(c.s));
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
          args={[part.geometry, part.material, COINS]}
          frustumCulled={false}
        />
      ))}
    </>
  );
}

function GltfOrbit(props: Props) {
  return <Orbit parts={useGltfCoinParts()} {...props} />;
}

function ProceduralOrbit(props: Props) {
  return <Orbit parts={useProceduralCoinParts()} {...props} />;
}

/** Home §11 background. Decorative only: the CTA reads the same without it. */
export default function CtaScene({ reduce, theme }: Props & { theme: Theme }) {
  const wrap = React.useRef<HTMLDivElement>(null);
  const { mounted, frameloop } = useCanvasGate(wrap, reduce);
  const { dpr, gl, monitor } = useCanvasDpr([1, 1.5], "low-power");

  return (
    <div ref={wrap} aria-hidden="true" className="absolute inset-0">
      {mounted && (
        <Canvas
          frameloop={frameloop}
          dpr={dpr}
          gl={gl}
          camera={{ fov: 30, near: 0.1, far: 40, position: [0, 0.9, 8.4] }}
          style={{ pointerEvents: "none" }}
        >
          {monitor}
          <Studio intensity={theme === "dark" ? 0.9 : 1.05} theme={theme} />
          <LoadBoundary fallback={<ModelFallback id="home" />}>
            <React.Suspense fallback={<ModelFallback id="home" />}>
              <Vault reduce={reduce} theme={theme} />
            </React.Suspense>
          </LoadBoundary>
          <LoadBoundary fallback={<ProceduralOrbit reduce={reduce} />}>
            <React.Suspense fallback={<ProceduralOrbit reduce={reduce} />}>
              <GltfOrbit reduce={reduce} />
            </React.Suspense>
          </LoadBoundary>
        </Canvas>
      )}
    </div>
  );
}

useGLTF.preload(VAULT_FILE);
useGLTF.preload(COIN_FILE);
