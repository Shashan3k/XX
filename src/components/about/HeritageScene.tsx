"use client";

import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import type { Theme } from "@/lib/theme";
import { PanasunaLogo } from "@/components/brand/PanasunaLogo";
import { LoadBoundary } from "@/components/three/LoadBoundary";
import { MODELS } from "@/components/three/modelManifest";
import { Studio } from "@/components/three/Studio";
import { useCanvasGate } from "@/components/three/useCanvasGate";
import { isolatedClone } from "@/components/three/isolate";
import { smoothstep } from "@/components/three/coins";
import { useCanvasDpr } from "@/components/three/useCanvasDpr";

const HERITAGE_FILE = MODELS.find((m) => m.id === "heritage")!.file;

/** 0 → 1 across the timeline. Read in useFrame, never stored in React state. */
export interface HeritageRig {
  progress: number;
}

interface SceneProps {
  rig: React.RefObject<HeritageRig>;
  reduce: boolean;
}

// ─── Dimensions of panasuna-heritage-1975.glb (scripts/blender/heritage_1975.py) ─

export const YEARS = 50;
const DECADES = 5;
const HALF_HEIGHT = 1.37; // the export is centred; lift by this to stand the plinth on y = 0
const PLINTH_TOP = 0.2;
const STRATUM_H = 0.32;
const MONOLITH_TOP = PLINTH_TOP + DECADES * STRATUM_H;
const TOTAL_HEIGHT = 2 * HALF_HEIGHT;
const DROP = 1.4;
const CROWN_AT = 0.9; // progress at which the crest arrives

const ease = (t: number) => 1 - (1 - t) ** 3;
const easeOutBack = (t: number) => 1 + 2.2 * (t - 1) ** 3 + 1.2 * (t - 1) ** 2;
const clamp01 = (t: number) => THREE.MathUtils.clamp(t, 0, 1);

/** Years built at a given progress; the last tenth is the crowning beat. */
const builtAt = (p: number) => clamp01(p / CROWN_AT) * YEARS;

// ─── Parts: the same structure from the GLB or from the procedural stand-in ───

interface HeritageParts {
  model: THREE.Object3D;
  ticks: THREE.Object3D[];
  strata: THREE.Object3D[];
  capstone: THREE.Object3D | null;
  crest: THREE.Object3D | null;
  rest: Map<THREE.Object3D, THREE.Vector3>;
}

const pad = (n: number) => String(n).padStart(2, "0");

function collect(model: THREE.Object3D): HeritageParts {
  const find = (name: string) => model.getObjectByName(name) ?? null;
  const ticks = Array.from({ length: YEARS }, (_, i) => find(`Heritage_Year_${pad(i + 1)}`)).filter((o): o is THREE.Object3D => !!o);
  const strata = Array.from({ length: DECADES }, (_, d) => find(`Heritage_Decade_${pad(d + 1)}`)).filter((o): o is THREE.Object3D => !!o);
  const capstone = find("Heritage_Capstone");
  const crest = find("Heritage_Crest");
  const rest = new Map<THREE.Object3D, THREE.Vector3>();
  [...ticks, ...strata, capstone, crest].forEach((o) => o && rest.set(o, o.position.clone()));
  return { model, ticks, strata, capstone, crest, rest };
}

function useGltfParts(): HeritageParts {
  const { scene } = useGLTF(HERITAGE_FILE);
  return React.useMemo(() => {
    const model = isolatedClone(scene, (m) => {
      // Faces turned to the camera mirror the dark room; lift the gold's reflections a little.
      const c = (m as THREE.MeshStandardMaterial).clone();
      if (c.metalness > 0.5) c.envMapIntensity = 1.8;
      return c;
    });
    return collect(model);
  }, [scene]);
}

/** Procedural stand-in (panasuna-brand §5.6): same node names and pivots as the export. */
function useProceduralParts(): HeritageParts {
  return React.useMemo(() => {
    const gold = new THREE.MeshPhysicalMaterial({ color: "#D4AF37", metalness: 0.92, roughness: 0.22 });
    const obsidian = new THREE.MeshPhysicalMaterial({ color: "#051311", roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.03 });
    const model = new THREE.Group();
    const base = -HALF_HEIGHT;
    const add = (name: string, geometry: THREE.BufferGeometry, material: THREE.Material, y: number, x = 0, z = 0) => {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = name;
      mesh.position.set(x, y, z);
      model.add(mesh);
    };
    add("Heritage_Plinth", new THREE.CylinderGeometry(0.85, 1, 0.2, 48).translate(0, 0.1, 0), obsidian, base);
    for (let i = 0; i < YEARS; i++) {
      const a = -Math.PI / 2 - (2 * Math.PI * i) / YEARS;
      const h = (i + 1) % 10 === 0 ? 0.12 : 0.05;
      const geo = new THREE.BoxGeometry(0.07, h, 0.024).translate(0, h / 2, 0).rotateY(-a);
      add(`Heritage_Year_${pad(i + 1)}`, geo, gold, base + 0.12, 0.9 * Math.cos(a), -0.9 * Math.sin(a));
    }
    for (let d = 0; d < DECADES; d++) {
      add(
        `Heritage_Decade_${pad(d + 1)}`,
        new THREE.BoxGeometry(0.6 - d * 0.028, STRATUM_H - 0.02, 0.4 - d * 0.02).translate(0, 0.15, 0),
        obsidian,
        base + PLINTH_TOP + d * STRATUM_H,
      );
    }
    add("Heritage_Capstone", new THREE.BoxGeometry(0.53, 0.06, 0.37).translate(0, 0.03, 0), gold, base + MONOLITH_TOP);
    add("Heritage_Crest", new THREE.TorusGeometry(0.4, 0.03, 12, 64), gold, base + 2.31);
    return collect(model);
  }, []);
}

// ─── The build-up ─────────────────────────────────────────────────────────────

const Y_AXIS = new THREE.Vector3(0, 1, 0);
const HIDDEN = 0.0001;

function Monolith({ parts, rig, reduce }: SceneProps & { parts: HeritageParts }) {
  useFrame((state) => {
    const p = reduce ? 1 : rig.current.progress;
    const t = reduce ? 0 : state.clock.elapsedTime;
    const built = builtAt(p);
    const at = (o: THREE.Object3D) => parts.rest.get(o)!;

    // One gold tick per year rises from a stub; unbuilt years stay as a faint track.
    parts.ticks.forEach((tick, i) => {
      tick.scale.set(1, 0.14 + 0.86 * ease(clamp01(built - i)), 1);
    });

    // A stratum drops into place as each decade begins.
    parts.strata.forEach((stratum, d) => {
      const land = clamp01((built - d * 10) / 2.5);
      const fall = 1 - ease(land);
      const rest = at(stratum);
      stratum.position.set(rest.x, rest.y + fall * DROP, rest.z);
      stratum.rotation.set(0, fall * 0.7, 0);
      stratum.scale.setScalar(land > 0 ? 0.7 + 0.3 * ease(land) : HIDDEN);
    });

    if (parts.capstone) {
      const land = clamp01((built - (YEARS - 2)) / 2);
      const rest = at(parts.capstone);
      parts.capstone.position.set(rest.x, rest.y + (1 - ease(land)) * DROP * 0.6, rest.z);
      parts.capstone.scale.setScalar(land > 0 ? 0.6 + 0.4 * ease(land) : HIDDEN);
    }

    // The crest crowns the finished monolith, then sways slowly.
    if (parts.crest) {
      const arrive = smoothstep(CROWN_AT - 0.02, 1, p);
      const rest = at(parts.crest);
      parts.crest.position.set(rest.x, rest.y + (1 - arrive) * 0.9 + Math.sin(t * 1.1) * 0.02 * arrive, rest.z);
      parts.crest.setRotationFromAxisAngle(Y_AXIS, (1 - arrive) * 2.8 + Math.sin(t * 0.5) * 0.3);
      parts.crest.scale.setScalar(arrive > 0 ? Math.max(HIDDEN, easeOutBack(arrive)) : HIDDEN);
    }
  });

  return (
    <group position={[0, HALF_HEIGHT, 0]}>
      <primitive object={parts.model} />
    </group>
  );
}

function GltfMonolith(props: SceneProps) {
  return <Monolith parts={useGltfParts()} {...props} />;
}

function ProceduralMonolith(props: SceneProps) {
  return <Monolith parts={useProceduralParts()} {...props} />;
}

/**
 * The camera climbs with the monolith and makes one full turn over the fifty years, ending on the
 * front (where the decade studs are); at the end it pulls back to frame all five decades and the
 * crest. Portrait panels (the desktop sticky column) sit further out so the plinth never crops.
 */
function CameraRig({ rig, reduce }: SceneProps) {
  const camera = useThree((s) => s.camera);
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));
  const target = React.useMemo(() => new THREE.Vector3(), []);
  const pointer = React.useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    if (reduce) return;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.current = { x: (e.clientX / window.innerWidth) * 2 - 1, y: (e.clientY / window.innerHeight) * 2 - 1 };
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [reduce]);

  useFrame(() => {
    const p = reduce ? 1 : rig.current.progress;
    const top = PLINTH_TOP + (builtAt(p) / YEARS) * (MONOLITH_TOP - PLINTH_TOP);
    const out = smoothstep(0.8, 1, p);
    const fit = aspect < 0.9 ? 1.15 : aspect > 1.6 ? 0.92 : 1;
    target.set(0, THREE.MathUtils.lerp(Math.max(0.55, top - 0.25), TOTAL_HEIGHT * 0.52, out), 0);
    const r = THREE.MathUtils.lerp(5.4, 6.9, out) * fit;
    const az = 0.35 + p * Math.PI * 1.9 + pointer.current.x * 0.12;
    const el = THREE.MathUtils.lerp(0.34, 0.16, out) - pointer.current.y * 0.05;
    camera.position.set(target.x + Math.sin(az) * Math.cos(el) * r, target.y + Math.sin(el) * r, target.z + Math.cos(az) * Math.cos(el) * r);
    camera.lookAt(target);
  });
  return null;
}

function InvalidateOn({ token }: { token: string }) {
  const invalidate = useThree((s) => s.invalidate);
  React.useEffect(() => {
    invalidate();
  }, [token, invalidate]);
  return null;
}

export default function HeritageScene({ rig, reduce, theme, chapter }: SceneProps & { theme: Theme; chapter: number }) {
  const wrap = React.useRef<HTMLDivElement>(null);
  const { mounted, frameloop } = useCanvasGate(wrap, reduce);
  const { dpr, gl, monitor } = useCanvasDpr();

  return (
    <div ref={wrap} className="absolute inset-0">
      {mounted && (
        <Canvas
          frameloop={frameloop}
          dpr={dpr}
          gl={gl}
          camera={{ fov: 30, near: 0.1, far: 60, position: [3, 2, 5] }}
          fallback={
            <div className="grid h-full place-items-center">
              <PanasunaLogo variant="seal" className="size-40 opacity-40" />
            </div>
          }
          style={{ pointerEvents: "none" }}
        >
          {monitor}
          <Studio intensity={theme === "dark" ? 1.05 : 1.15} wideFill theme={theme} />
          <CameraRig rig={rig} reduce={reduce} />
          <InvalidateOn token={`${chapter}|${theme}`} />
          <LoadBoundary fallback={<ProceduralMonolith rig={rig} reduce={reduce} />}>
            <React.Suspense fallback={<ProceduralMonolith rig={rig} reduce={reduce} />}>
              <GltfMonolith rig={rig} reduce={reduce} />
            </React.Suspense>
          </LoadBoundary>
        </Canvas>
      )}
    </div>
  );
}

useGLTF.preload(HERITAGE_FILE);
