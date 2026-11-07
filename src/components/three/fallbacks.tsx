"use client";

import type { ModelSpec } from "./modelManifest";

/** Same PBR values as the Blender PN_* materials, so a fallback never looks like a different brand. */
export function GoldMaterial() {
  return <meshPhysicalMaterial color="#D4AF37" metalness={0.92} roughness={0.22} />;
}

export function ObsidianMaterial() {
  return <meshPhysicalMaterial color="#051311" metalness={0} roughness={0.08} clearcoat={1} clearcoatRoughness={0.03} />;
}

/** Stands in for the plinths, which render as jade stone (three/brandStone.ts), not alabaster. */
export function AlabasterMaterial() {
  return <meshPhysicalMaterial color="#0E3F32" metalness={0.05} roughness={0.5} />;
}

function CoinFallback() {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.87, 0.87, 0.12, 64]} />
        <GoldMaterial />
      </mesh>
      <mesh>
        <torusGeometry args={[0.92, 0.07, 16, 96]} />
        <GoldMaterial />
      </mesh>
    </group>
  );
}

function HomeFallback() {
  return (
    <group>
      <mesh position={[0, -0.6, 0]}>
        <boxGeometry args={[2.2, 0.2, 1.5]} />
        <AlabasterMaterial />
      </mesh>
      <mesh position={[-0.25, -0.1, 0]}>
        <boxGeometry args={[0.9, 0.8, 0.8]} />
        <ObsidianMaterial />
      </mesh>
      <mesh position={[-0.25, 0.5, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.66, 0.45, 4]} />
        <ObsidianMaterial />
      </mesh>
      <mesh rotation={[Math.PI / 2 - 0.3, 0, 0]}>
        <torusGeometry args={[1.5, 0.022, 8, 96]} />
        <GoldMaterial />
      </mesh>
    </group>
  );
}

function CalendarFallback() {
  return (
    <group>
      <mesh>
        <torusGeometry args={[1.52, 0.2, 12, 96]} />
        <ObsidianMaterial />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        return (
          <mesh key={i} position={[1.525 * Math.sin(a), 1.525 * Math.cos(a), 0.12]}>
            <boxGeometry args={[0.32, 0.32, 0.1]} />
            <GoldMaterial />
          </mesh>
        );
      })}
    </group>
  );
}

function AuctionFallback() {
  return (
    <group position={[0, -0.6, 0]}>
      <mesh>
        <cylinderGeometry args={[1.1, 1.25, 0.36, 6]} />
        <ObsidianMaterial />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 1.3, 12]} />
        <GoldMaterial />
      </mesh>
      <mesh position={[0, 1.45, 0]}>
        <boxGeometry args={[1.44, 0.045, 0.045]} />
        <GoldMaterial />
      </mesh>
    </group>
  );
}

/** Same footprint as panasuna-heritage-1975.glb (2.74 tall, centred): plinth, five strata, crest. */
function HeritageFallback() {
  return (
    <group position={[0, -1.37, 0]}>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.9, 1, 0.2, 48]} />
        <ObsidianMaterial />
      </mesh>
      <mesh position={[0, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.9, 0.02, 8, 64]} />
        <GoldMaterial />
      </mesh>
      {Array.from({ length: 5 }, (_, d) => (
        <mesh key={d} position={[0, 0.36 + d * 0.32, 0]}>
          <boxGeometry args={[0.6 - d * 0.03, 0.3, 0.4 - d * 0.02]} />
          <ObsidianMaterial />
        </mesh>
      ))}
      <mesh position={[0, 2.31, 0]}>
        <torusGeometry args={[0.4, 0.03, 12, 64]} />
        <GoldMaterial />
      </mesh>
    </group>
  );
}

const FALLBACKS: Record<ModelSpec["id"], () => React.JSX.Element> = {
  coin: CoinFallback,
  home: HomeFallback,
  calendar: CalendarFallback,
  auction: AuctionFallback,
  heritage: HeritageFallback,
};

/** Procedural stand-in shown while a .glb loads (CLAUDE.md §5.4). */
export function ModelFallback({ id }: { id: ModelSpec["id"] }) {
  const Fallback = FALLBACKS[id];
  return <Fallback />;
}
