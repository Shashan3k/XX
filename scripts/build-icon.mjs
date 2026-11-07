// Writes src/app/icon.svg (favicon) from the shared crown geometry.
import { readFileSync, writeFileSync } from "node:fs";
const c = JSON.parse(readFileSync(new URL("../src/components/brand/crown.json", import.meta.url)));
const poly = (pts) => `M${pts.map(([x, y]) => `${x} ${y}`).join("L")}Z`;
const dia = ({ c: [x, y], r }) => `M${x} ${y - r}L${x + r} ${y}L${x} ${y + r}L${x - r} ${y}Z`;
const cut = [...c.facets, c.gem].map(dia).join("");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -6.5 56 56">
<rect x="-4" y="-6.5" width="56" height="56" rx="12" fill="#051311"/>
<mask id="m"><rect x="-4" y="-6.5" width="56" height="56" fill="#fff"/><path d="${cut}" fill="#000"/></mask>
<g fill="#D4AF37" mask="url(#m)"><path d="${poly(c.body)}"/><path d="${poly(c.band)}"/></g>
<path fill="#D4AF37" d="${c.tips.map(dia).join("")}"/>
</svg>
`;
writeFileSync(new URL("../src/app/icon.svg", import.meta.url), svg);
console.log("wrote src/app/icon.svg");
