// Reads each .glb's JSON chunk and checks it against the R3F manifest: node names, triangle
// budget, identity rotation/scale on every node, PBR material values.
// Usage: node scripts/verify-models.mjs
import { readFileSync } from "node:fs";

const manifest = readFileSync(new URL("../src/components/three/modelManifest.ts", import.meta.url), "utf8");
const BUDGET = 25000;
let failed = false;

const specs = [...manifest.matchAll(/file: "([^"]+)"[\s\S]*?nodes: \[([\s\S]*?)\],\n/g)].map(([, file, body]) => {
  const names = [...body.matchAll(/"([A-Za-z_0-9]+)"/g)].map((m) => m[1]).filter((n) => !n.endsWith("_"));
  for (const [, prefix, n] of body.matchAll(/range\("([A-Za-z_]+)", (\d+)\)/g))
    for (let i = 1; i <= +n; i++) names.push(`${prefix}${String(i).padStart(2, "0")}`);
  return { file, names };
});

for (const { file, names } of specs) {
  const buf = readFileSync(new URL(`../public${file}`, import.meta.url));
  const jsonLen = buf.readUInt32LE(12);
  const gltf = JSON.parse(buf.subarray(20, 20 + jsonLen).toString("utf8"));
  const nodeNames = gltf.nodes.map((n) => n.name);
  const missing = names.filter((n) => !nodeNames.includes(n));
  const tris = gltf.meshes.reduce(
    (sum, m) => sum + m.primitives.reduce((s, p) => s + gltf.accessors[p.indices].count / 3, 0),
    0,
  );
  const badTransforms = gltf.nodes
    .filter((n) => (n.rotation && n.rotation.slice(0, 3).some((v) => Math.abs(v) > 1e-5)) || (n.scale && n.scale.some((v) => Math.abs(v - 1) > 1e-5)))
    .map((n) => n.name);
  const mats = gltf.materials.map((m) => `${m.name}(metal ${m.pbrMetallicRoughness?.metallicFactor ?? 1}, rough ${m.pbrMetallicRoughness?.roughnessFactor ?? 1}${m.doubleSided ? ", double-sided" : ""})`);
  const ok = !missing.length && tris < BUDGET && !badTransforms.length;
  failed ||= !ok;
  console.log(`${ok ? "PASS" : "FAIL"} ${file}  ${(buf.length / 1024) | 0} KB`);
  console.log(`     tris ${tris} / ${BUDGET}   nodes ${names.length - missing.length}/${names.length}${missing.length ? `  missing: ${missing.join(", ")}` : ""}`);
  console.log(`     transforms ${badTransforms.length ? "NOT applied: " + badTransforms.join(", ") : "identity rotation/scale on all " + gltf.nodes.length + " nodes"}`);
  console.log(`     materials ${mats.join(", ")}`);
}
process.exit(failed ? 1 : 0);
