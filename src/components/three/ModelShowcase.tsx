"use client";

import * as React from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { Bounds, OrbitControls, PerspectiveCamera, View, useGLTF } from "@react-three/drei";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useLocale } from "@/lib/i18n";
import { MODELS, TRIANGLE_BUDGET, type ModelSpec } from "./modelManifest";
import { ModelFallback } from "./fallbacks";
import { LoadBoundary } from "./LoadBoundary";
import { Studio } from "./Studio";
import { isolatedClone } from "./isolate";

type Mode = "material" | "wireframe" | "normals";

interface Stats {
  status: "loading" | "loaded" | "missing";
  triangles: number;
  present: string[];
  transformsOk: string[];
  bytes: number | null;
}

const wireMaterial = new THREE.MeshBasicMaterial({ color: "#D4AF37", wireframe: true });
const normalMaterial = new THREE.MeshNormalMaterial();

function LoadedModel({ spec, mode, onStats }: { spec: ModelSpec; mode: Mode; onStats: (s: Partial<Stats>) => void }) {
  const { scene: cached, nodes } = useGLTF(spec.file);
  // Inspect a private clone: the cached original is shared with every other scene on the site, so
  // swapping its materials (wireframe/normals) or letting R3F hide it here would leak everywhere.
  const scene = React.useMemo(() => isolatedClone(cached), [cached]);

  React.useEffect(() => {
    let triangles = 0;
    scene.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        const g = o.geometry as THREE.BufferGeometry;
        triangles += g.index ? g.index.count / 3 : g.attributes.position.count / 3;
      }
    });
    const present = spec.nodes.filter((n) => nodes[n]);
    const transformsOk = present.filter((n) => {
      const o = nodes[n];
      const q = o.quaternion;
      const identityRot = Math.abs(q.x) + Math.abs(q.y) + Math.abs(q.z) < 1e-5;
      const unitScale = Math.abs(o.scale.x - 1) + Math.abs(o.scale.y - 1) + Math.abs(o.scale.z - 1) < 1e-5;
      return identityRot && unitScale;
    });
    onStats({ status: "loaded", triangles, present, transformsOk });
  }, [scene, nodes, spec, onStats]);

  React.useEffect(() => {
    scene.traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return;
      o.userData.original ??= o.material;
      o.material = mode === "material" ? o.userData.original : mode === "wireframe" ? wireMaterial : normalMaterial;
    });
  }, [scene, mode]);

  return <primitive object={scene} />;
}

function ModelCard({ spec }: { spec: ModelSpec }) {
  const { t, locale } = useLocale();
  const [track, setTrack] = React.useState<HTMLDivElement | null>(null);
  const [mode, setMode] = React.useState<Mode>("material");
  const [stats, setStats] = React.useState<Stats>({ status: "loading", triangles: 0, present: [], transformsOk: [], bytes: null });
  const reduce = usePrefersReducedMotion();

  const onStats = React.useCallback((s: Partial<Stats>) => setStats((prev) => ({ ...prev, ...s })), []);

  React.useEffect(() => {
    // GET (served from the HTTP cache after useGLTF) — dev servers omit content-length on HEAD.
    fetch(spec.file)
      .then((r) => (r.ok ? r.arrayBuffer() : null))
      .then((buf) => onStats({ bytes: buf?.byteLength ?? null }))
      .catch(() => onStats({ bytes: null }));
  }, [spec.file, onStats]);

  const allNodes = stats.present.length === spec.nodes.length;
  const allTransforms = stats.transformsOk.length === stats.present.length && stats.present.length > 0;
  const underBudget = stats.triangles > 0 && stats.triangles < TRIANGLE_BUDGET;
  const nf = new Intl.NumberFormat("en-IN");

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 p-5 pb-0">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-alabaster">{t(spec.title)}</h3>
          <p className="text-sm text-alabaster-muted">{t(spec.concept)}</p>
        </div>
        <Badge
          variant={stats.status === "loaded" ? "success" : stats.status === "missing" ? "error" : "outline"}
          className="shrink-0"
        >
          {stats.status === "loaded" ? (locale === "ta" ? "ஏற்றப்பட்டது" : "GLB loaded") : stats.status === "missing" ? (locale === "ta" ? "கோப்பு இல்லை" : "File missing — fallback") : locale === "ta" ? "ஏற்றுகிறது" : "Loading — fallback"}
        </Badge>
      </div>

      {/* Outside <Canvas>, drei's View renders and tracks its own div — so the View *is* the viewport. */}
      <View
        ref={(el) => setTrack(el as HTMLDivElement | null)}
        index={MODELS.indexOf(spec) + 1}
        className="relative mx-5 mt-4 h-72 touch-none rounded-xl border border-hairline [background:radial-gradient(ellipse_at_50%_35%,#0e3129,#051311_70%)] sm:h-80"
      >
        <PerspectiveCamera makeDefault position={spec.camera} fov={35} />
        {track && (
          <OrbitControls makeDefault domElement={track} enablePan={false} autoRotate={!reduce} autoRotateSpeed={0.8} minDistance={2} maxDistance={9} />
        )}
        <Studio />
        {/* Frame each asset from its own bounding sphere rather than hand-tuned camera distances. */}
        <Bounds fit clip observe margin={1.2}>
          <LoadBoundary fallback={<ModelFallback id={spec.id} />} onError={() => onStats({ status: "missing" })}>
            <React.Suspense fallback={<ModelFallback id={spec.id} />}>
              <LoadedModel spec={spec} mode={mode} onStats={onStats} />
            </React.Suspense>
          </LoadBoundary>
        </Bounds>
      </View>

      <div className="flex flex-col gap-4 p-5">
        <ToggleGroup
          value={[mode]}
          onValueChange={(v) => v[0] && setMode(v[0] as Mode)}
          variant="outline"
          size="sm"
          aria-label="Inspection mode"
        >
          <ToggleGroupItem value="material">Material</ToggleGroupItem>
          <ToggleGroupItem value="wireframe">Wireframe</ToggleGroupItem>
          <ToggleGroupItem value="normals">Normals</ToggleGroupItem>
        </ToggleGroup>

        <dl className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <dt className="text-alabaster-muted">Triangles</dt>
            <dd className={cn("font-semibold tabular-nums", underBudget ? "text-alabaster" : "text-danger")}>
              {stats.triangles ? nf.format(stats.triangles) : "—"}
              <span className="font-normal text-alabaster-muted"> / {nf.format(TRIANGLE_BUDGET)}</span>
            </dd>
          </div>
          <div>
            <dt className="text-alabaster-muted">Named nodes</dt>
            <dd className={cn("font-semibold tabular-nums", allNodes ? "text-alabaster" : "text-danger")}>
              {stats.present.length} / {spec.nodes.length}
            </dd>
          </div>
          <div>
            <dt className="text-alabaster-muted">File</dt>
            <dd className="font-semibold tabular-nums text-alabaster">{stats.bytes ? `${Math.round(stats.bytes / 1024)} KB` : "—"}</dd>
          </div>
        </dl>

        <details className="group rounded-lg border border-hairline px-3 py-2 text-sm">
          <summary className="flex cursor-pointer items-center justify-between gap-2 text-alabaster-muted marker:content-none">
            <span>Node verification</span>
            <span className={cn("tabular-nums", allNodes && allTransforms ? "text-success-foreground" : "text-alabaster-muted")}>
              {stats.status === "loaded" ? (allNodes && allTransforms ? "All pass" : "Check failures") : "Pending"}
            </span>
          </summary>
          <ul className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
            {spec.nodes.map((n) => {
              const ok = stats.present.includes(n);
              const tOk = stats.transformsOk.includes(n);
              return (
                <li key={n} className="flex items-center justify-between gap-2 font-mono text-xs">
                  <span className={ok ? "text-alabaster" : "text-danger"}>{n}</span>
                  <span className={ok && tOk ? "text-success-foreground" : "text-danger"}>
                    {stats.status !== "loaded" ? "…" : !ok ? "missing" : !tOk ? "transform" : spec.pivots.includes(n) ? "pivot · ok" : "ok"}
                  </span>
                </li>
              );
            })}
          </ul>
        </details>
      </div>
    </Card>
  );
}

/** One shared WebGL canvas for all five models (panasuna-brand §5.6: ≤ 2 live canvases per page). */
export default function ModelShowcase() {
  const container = React.useRef<HTMLDivElement>(null!);
  return (
    <div ref={container} className="relative">
      <div className="grid gap-6 lg:grid-cols-2">
        {MODELS.map((spec) => (
          <ModelCard key={spec.id} spec={spec} />
        ))}
      </div>
      <Canvas
        eventSource={container}
        eventPrefix="client"
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
        style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1 }}
      >
        <View.Port />
      </Canvas>
    </div>
  );
}

MODELS.forEach((m) => useGLTF.preload(m.file));
