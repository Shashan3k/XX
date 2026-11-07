"use client";

import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { HOW_CHITS_WORK } from "@/data/panasunaData";
import { useLocale } from "@/lib/i18n";
import type { Theme } from "@/lib/theme";
import { useVaultModel } from "@/components/three/houseMaterials";
import { PanasunaLogo } from "@/components/brand/PanasunaLogo";
import { LoadBoundary } from "@/components/three/LoadBoundary";
import { ModelFallback } from "@/components/three/fallbacks";
import { MODELS, type ModelSpec } from "@/components/three/modelManifest";
import { withJadeStone } from "@/components/three/brandStone";
import { isolatedClone } from "@/components/three/isolate";
import { Studio } from "@/components/three/Studio";
import { COIN_FILE, VAULT_FILE, useGltfCoinParts, useProceduralCoinParts, type CoinPart } from "@/components/three/coins";
import { PODIUM_FILE, findPodiumParts, poseGavel, tiltBeam, type PodiumParts } from "@/components/three/podiumRig";
import { useCanvasGate } from "@/components/three/useCanvasGate";
import {
  CALENDAR_AT,
  COIN_INSTANCES,
  PODIUM_AT,
  VAULT_AT,
  auctionBeat,
  cameraPose,
  coinPose,
  dividendBeat,
  pulseAt,
  stationVisible,
  vaultBeat,
  type JourneyRig,
} from "./choreography";
import { useCanvasDpr } from "@/components/three/useCanvasDpr";

const CALENDAR_FILE = MODELS.find((m) => m.id === "calendar")!.file;

interface SceneProps {
  rig: React.RefObject<JourneyRig>;
  reduce: boolean;
}

/** Each station clones its GLB: the hero and calculator hold the cached originals in other canvases. */
function useClone(file: string) {
  const { scene } = useGLTF(file);
  return React.useMemo(() => withJadeStone(isolatedClone(scene)), [scene]);
}

// ─── Camera ─────────────────────────────────────────────────────────────────────

function CameraRig({ rig, offset }: { rig: React.RefObject<JourneyRig>; offset: boolean }) {
  const size = useThree((s) => s.size);
  const target = React.useRef(new THREE.Vector3());

  useFrame((state) => {
    const camera = state.camera as THREE.PerspectiveCamera;
    const aspect = size.width / size.height;
    // Shots are composed for the desktop frame, where the cards take the left 40%. A full-frame canvas
    // (phones, the reduced-motion column) can come closer; a portrait one has to step back.
    const fit = offset ? 1 : aspect < 0.9 ? 1.2 : aspect < 1.3 ? 0.84 : 0.8;
    cameraPose(rig.current.progress, fit, camera.position, target.current);
    camera.lookAt(target.current);
    // Beside the stage cards (desktop), frame the scene in the free right-hand side.
    const ox = offset && aspect >= 1.2 ? -0.19 * size.width : 0;
    camera.setViewOffset(size.width, size.height, ox, 0, size.width, size.height);
  });

  return null;
}

// ─── Members: instanced crown coins ─────────────────────────────────────────────

function Members({ parts, rig, reduce }: SceneProps & { parts: CoinPart[] }) {
  const meshes = React.useRef<(THREE.InstancedMesh | null)[]>([]);
  const tmp = React.useMemo(
    () => ({ pose: { pos: new THREE.Vector3(), quat: new THREE.Quaternion(), scale: 1 }, s: new THREE.Vector3(), coin: new THREE.Matrix4(), m: new THREE.Matrix4() }),
    [],
  );

  useFrame((state) => {
    const time = reduce ? 0 : state.clock.elapsedTime;
    const { pose, s, coin, m } = tmp;
    for (let i = 0; i < COIN_INSTANCES; i++) {
      coinPose(i, rig.current, time, pose);
      coin.compose(pose.pos, pose.quat, s.setScalar(Math.max(pose.scale, 0.0001)));
      parts.forEach((part, j) => {
        m.multiplyMatrices(coin, part.matrix);
        meshes.current[j]?.setMatrixAt(i, m);
      });
    }
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
          args={[part.geometry, part.material, COIN_INSTANCES]}
          frustumCulled={false}
        />
      ))}
    </>
  );
}

function GltfMembers(props: SceneProps) {
  return <Members parts={useGltfCoinParts(1.6)} {...props} />;
}

function ProceduralMembers(props: SceneProps) {
  return <Members parts={useProceduralCoinParts()} {...props} />;
}

// ─── Stage 2: the chit calendar ─────────────────────────────────────────────────

function Calendar({ rig }: SceneProps) {
  const calendar = useClone(CALENDAR_FILE);
  const root = React.useRef<THREE.Group>(null);
  const tokens = React.useRef<{ node: THREE.Object3D; angle: number }[]>([]);
  const ring = React.useRef<THREE.Object3D | undefined>(undefined);

  React.useEffect(() => {
    tokens.current = Array.from({ length: 12 }, (_, k) => ({
      node: calendar.getObjectByName(`Month_Token_${String(k + 1).padStart(2, "0")}`),
      angle: Math.PI / 2 - (k * Math.PI) / 6,
    })).filter((t): t is { node: THREE.Object3D; angle: number } => !!t.node);
    ring.current = calendar.getObjectByName("Cycle_Ring");
  }, [calendar]);

  useFrame(() => {
    const p = rig.current.progress;
    if (root.current) root.current.visible = stationVisible.calendar(p);
    // Each month token steps forward as the payment pulse passes it.
    tokens.current.forEach(({ node, angle }) => {
      const pop = pulseAt(angle, p, 0.05);
      node.position.z = 0.058 + 0.24 * pop;
      node.scale.setScalar(1 + 0.3 * pop);
    });
    if (ring.current) ring.current.rotation.z = -p * 0.3;
  });

  return (
    <group ref={root} position={CALENDAR_AT}>
      <primitive object={calendar} />
    </group>
  );
}

// ─── Stages 3–4: the auction podium ─────────────────────────────────────────────

function Podium({ rig }: SceneProps) {
  const podium = useClone(PODIUM_FILE);
  const root = React.useRef<THREE.Group>(null);
  const parts = React.useRef<PodiumParts>({ coins: [] });
  const homes = React.useRef<THREE.Vector3[]>([]);

  React.useEffect(() => {
    parts.current = findPodiumParts(podium);
    homes.current = parts.current.coins.map((c) => c.position.clone());
  }, [podium]);

  useFrame(() => {
    const p = rig.current.progress;
    if (root.current) root.current.visible = stationVisible.podium(p);
    const { tilt, strike } = auctionBeat(p);
    tiltBeam(parts.current, tilt);
    poseGavel(parts.current, strike);

    const { ring, coins } = dividendBeat(p);
    const r = parts.current.ring;
    if (r) {
      r.scale.setScalar(1 + 0.56 * ring);
      r.position.y = -0.695 - 0.12 * ring;
    }
    parts.current.coins.forEach((coin, i) => {
      const home = homes.current[i];
      if (!home) return;
      coin.position.set(home.x * (1 + 0.62 * coins), home.y - 0.16 * coins, home.z * (1 + 0.62 * coins));
      coin.scale.setScalar(Math.max(1 - coins, 0.0001));
    });
  });

  return (
    <group ref={root} position={PODIUM_AT}>
      <primitive object={podium} />
    </group>
  );
}

// ─── Stage 5: the vault, and the FDR shield that locks in front of it ──────────

function Vault({ rig, reduce, theme }: SceneProps & { theme: Theme }) {
  const vault = useVaultModel(theme);
  const root = React.useRef<THREE.Group>(null);
  const rings = React.useRef<{ outer?: THREE.Object3D; inner?: THREE.Object3D }>({});

  React.useEffect(() => {
    rings.current = { outer: vault.getObjectByName("Ring_Outer"), inner: vault.getObjectByName("Ring_Inner") };
  }, [vault]);

  useFrame((state) => {
    const p = rig.current.progress;
    if (root.current) root.current.visible = stationVisible.vault(p);
    const { outer, inner } = rings.current;
    if (!outer || !inner) return;
    const { lock } = vaultBeat(p);
    // Free-spinning until the lock winds them down to rest, aligned.
    const free = p * 4 + (reduce ? 0 : state.clock.elapsedTime * 0.35);
    outer.rotation.y = (1 - lock) * free;
    inner.rotation.y = -(1 - lock) * free * 1.4;
  });

  return (
    <group ref={root} position={VAULT_AT}>
      <primitive object={vault} />
    </group>
  );
}

const SHIELD_PARTS = ["Shield_FDR", "Shield_Rim", "Shield_Crown"] as const;
const SHIELD_REST = new THREE.Vector3(VAULT_AT.x + 1.55, 0.05, 0.8);

function Shield({ rig }: SceneProps) {
  const { scene } = useGLTF(CALENDAR_FILE);
  const group = React.useRef<THREE.Group>(null);
  const shield = React.useMemo(() => {
    const g = new THREE.Group();
    SHIELD_PARTS.forEach((name) => {
      const part = scene.getObjectByName(name);
      if (part) g.add(isolatedClone(part));
    });
    return g;
  }, [scene]);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const { shieldVisible, shieldDrop, shieldTurn, shieldAz } = vaultBeat(rig.current.progress);
    g.visible = shieldVisible;
    g.position.set(SHIELD_REST.x, SHIELD_REST.y + 2.8 * (1 - shieldDrop), SHIELD_REST.z);
    g.rotation.y = THREE.MathUtils.lerp(shieldAz + 1.9, shieldAz, shieldTurn);
  });

  return (
    <group ref={group} scale={0.62}>
      <primitive object={shield} />
    </group>
  );
}

function Station({ id, at, children }: { id: ModelSpec["id"]; at: THREE.Vector3; children: React.ReactNode }) {
  const fallback = (
    <group position={at}>
      <ModelFallback id={id} />
    </group>
  );
  return (
    <LoadBoundary fallback={fallback}>
      <React.Suspense fallback={fallback}>{children}</React.Suspense>
    </LoadBoundary>
  );
}

/** Under reduced motion the canvas only draws on demand: redraw when the visible stage changes. */
function InvalidateOn({ token }: { token: string }) {
  const invalidate = useThree((s) => s.invalidate);
  React.useEffect(() => {
    invalidate();
  }, [token, invalidate]);
  return null;
}

export default function JourneyScene({
  rig,
  reduce,
  theme,
  offset,
  stage,
}: SceneProps & { theme: Theme; offset: boolean; stage: number }) {
  const { t } = useLocale();
  const wrap = React.useRef<HTMLDivElement>(null);
  const { mounted, frameloop } = useCanvasGate(wrap, reduce);
  const { dpr, gl, monitor } = useCanvasDpr();

  return (
    <div ref={wrap} role="img" aria-label={t(HOW_CHITS_WORK.sceneLabel)} className="absolute inset-0">
      {mounted && (
        <Canvas
          frameloop={frameloop}
          dpr={dpr}
          gl={gl}
          camera={{ fov: 32, near: 0.1, far: 80, position: [3, 5, 7] }}
          fallback={
            <div className="grid h-full place-items-center">
              <PanasunaLogo variant="seal" className="size-40 opacity-40" />
            </div>
          }
          style={{ pointerEvents: "none" }}
        >
          {monitor}
          <Studio intensity={theme === "dark" ? 1 : 1.1} wideFill skyFill theme={theme} />
          <CameraRig rig={rig} offset={offset} />
          <InvalidateOn token={`${stage}|${offset}|${theme}`} />
          <LoadBoundary fallback={<ProceduralMembers rig={rig} reduce={reduce} />}>
            <React.Suspense fallback={<ProceduralMembers rig={rig} reduce={reduce} />}>
              <GltfMembers rig={rig} reduce={reduce} />
            </React.Suspense>
          </LoadBoundary>
          <Station id="calendar" at={CALENDAR_AT}>
            <Calendar rig={rig} reduce={reduce} />
          </Station>
          <Station id="auction" at={PODIUM_AT}>
            <Podium rig={rig} reduce={reduce} />
          </Station>
          <Station id="home" at={VAULT_AT}>
            <Vault rig={rig} reduce={reduce} theme={theme} />
            <Shield rig={rig} reduce={reduce} />
          </Station>
        </Canvas>
      )}
    </div>
  );
}

useGLTF.preload(COIN_FILE);
useGLTF.preload(CALENDAR_FILE);
useGLTF.preload(PODIUM_FILE);
useGLTF.preload(VAULT_FILE);
