"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, LocateFixed, Minus, Navigation, Plus } from "lucide-react";
import { COMPANY, CONTACT, CONTACT_PAGE } from "@/data/panasunaData";
import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { mulberry32 } from "@/components/three/coins";

const copy = CONTACT_PAGE.map;

// viewBox units. The office sits on the gold street; the view centres on it at pan (0, 0).
const W = 800;
const H = 520;
const PIN = { x: 430, y: 252 };
const ZOOMS = [1, 1.5, 2.25, 3.25] as const;
const PAN_LIMIT = 260;
const STEP = 60;

const ROADS = [
  "M-60 118 C 200 142 420 88 860 128",
  "M-60 424 C 260 382 520 446 860 402",
  "M118 -60 C 164 200 108 362 152 580",
  "M648 -60 C 612 180 684 330 640 580",
];
const LANES = [
  "M252 118 L272 432",
  "M356 100 L340 434",
  "M472 96 L500 440",
  "M566 108 L584 420",
  "M136 204 C 300 192 500 172 652 160",
  "M140 360 C 300 350 500 330 650 318",
  "M300 160 C 320 230 300 300 330 380",
  "M520 140 C 540 210 520 290 540 360",
];
const STREET = "M196 336 C 296 294 360 262 430 252 S 560 222 668 196";

/** Deterministic "buildings": faint plots between the lanes, so the map has texture without inventing landmarks. */
const PLOTS = (() => {
  const rand = mulberry32(636001);
  return Array.from({ length: 46 }, () => ({
    x: 150 + rand() * 500,
    y: 130 + rand() * 280,
    w: 14 + rand() * 26,
    h: 10 + rand() * 18,
    r: (rand() - 0.5) * 24,
  })).filter((p) => Math.hypot(p.x - PIN.x, p.y - PIN.y) > 34);
})();

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** /contact: a stylised (not to scale) map of the Salem head office. Drag, arrow keys, or the buttons. */
export function SalemMap({ className }: { className?: string }) {
  const { t, locale } = useLocale();
  const reduce = usePrefersReducedMotion();
  const svg = React.useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = React.useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [dragging, setDragging] = React.useState(false);
  const [card, setCard] = React.useState(true);
  const [copied, setCopied] = React.useState(false);
  const drag = React.useRef<{
    x: number;
    y: number;
    px: number;
    py: number;
  } | null>(null);

  const z = ZOOMS[zoom];
  const move = (dx: number, dy: number) =>
    setPan((p) => ({
      x: clamp(p.x + dx, -PAN_LIMIT, PAN_LIMIT),
      y: clamp(p.y + dy, -PAN_LIMIT, PAN_LIMIT),
    }));

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if ((e.target as Element).closest("[data-pin]")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (!d || !svg.current) return;
    const unit = W / svg.current.getBoundingClientRect().width;
    setPan({
      x: clamp(d.px + (e.clientX - d.x) * unit, -PAN_LIMIT, PAN_LIMIT),
      y: clamp(d.py + (e.clientY - d.y) * unit, -PAN_LIMIT, PAN_LIMIT),
    });
  };
  const endDrag = () => {
    drag.current = null;
    setDragging(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const keys: Record<string, () => void> = {
      ArrowLeft: () => move(STEP, 0),
      ArrowRight: () => move(-STEP, 0),
      ArrowUp: () => move(0, STEP),
      ArrowDown: () => move(0, -STEP),
      "+": () => setZoom((v) => Math.min(ZOOMS.length - 1, v + 1)),
      "=": () => setZoom((v) => Math.min(ZOOMS.length - 1, v + 1)),
      "-": () => setZoom((v) => Math.max(0, v - 1)),
    };
    const run = keys[e.key];
    if (!run) return;
    e.preventDefault();
    run();
  };

  const recenter = () => {
    setPan({ x: 0, y: 0 });
    setZoom(1);
    setCard(true);
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(`${COMPANY.legalName}, ${CONTACT.addressOneLine.en}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const transform = `translate(${W / 2 + pan.x}px, ${H / 2 + pan.y}px) scale(${z}) translate(${-PIN.x}px, ${-PIN.y}px)`;
  const address = CONTACT.address[locale];

  return (
    <figure className={cn("flex flex-col gap-2", className)}>
      <div className="relative isolate overflow-hidden rounded-3xl border border-hairline bg-card/50">
        <svg
          ref={svg}
          viewBox={`0 0 ${W} ${H}`}
          role="application"
          aria-roledescription="map"
          aria-label={`${t(copy.label)}. ${t(copy.hint)}`}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className={cn(
            "block aspect-[8/5.2] w-full touch-none select-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
            dragging ? "cursor-grabbing" : "cursor-grab",
          )}
        >
          <defs>
            <pattern id="map-dots" width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" fill="var(--hairline)" />
            </pattern>
          </defs>
          <rect x={-W} y={-H} width={W * 3} height={H * 3} fill="url(#map-dots)" />
          <g
            style={{
              transform,
              transformOrigin: "0 0",
              transition: dragging || reduce ? "none" : "transform 420ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {PLOTS.map((p, i) => (
              <rect
                key={i}
                x={p.x}
                y={p.y}
                width={p.w}
                height={p.h}
                rx="2"
                transform={`rotate(${p.r.toFixed(1)} ${p.x.toFixed(1)} ${p.y.toFixed(1)})`}
                fill="var(--hairline)"
                opacity="0.55"
              />
            ))}
            {ROADS.map((d, i) => (
              <path key={i} d={d} fill="none" stroke="var(--hairline-strong)" strokeWidth={7 / z + 3} strokeLinecap="round" opacity="0.6" />
            ))}
            {LANES.map((d, i) => (
              <path key={i} d={d} fill="none" stroke="var(--hairline-strong)" strokeWidth={2.2} strokeLinecap="round" opacity="0.7" />
            ))}
            <path id="chinna-kadai" d={STREET} fill="none" stroke="var(--gold-ink)" strokeWidth={4} strokeLinecap="round" />
            <text
              dy="-9"
              fill="var(--gold-ink)"
              style={{
                font: "600 11px var(--font-dm-sans), var(--font-noto-sans-tamil)",
              }}
            >
              <textPath href="#chinna-kadai" startOffset="8%">
                {t(copy.street)}
              </textPath>
            </text>

            {/* The office pin, counter-scaled so it stays the same size at every zoom. */}
            <g transform={`translate(${PIN.x} ${PIN.y}) scale(${1 / z})`}>
              {!reduce && (
                <circle
                  r="18"
                  fill="none"
                  stroke="var(--gold-ink)"
                  strokeWidth="1.5"
                  className="origin-center [animation:pn-ping_2.4s_cubic-bezier(0,0,0.2,1)_infinite]"
                  style={{ transformBox: "fill-box" }}
                />
              )}
              <g
                data-pin
                role="button"
                tabIndex={0}
                aria-expanded={card}
                aria-label={`${COMPANY.legalName}, ${CONTACT.addressOneLine[locale]}`}
                onClick={() => setCard((c) => !c)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setCard((c) => !c);
                  }
                }}
                className="cursor-pointer outline-none [&:focus-visible_.pin-ring]:stroke-[3]"
              >
                <circle r="22" fill="transparent" />
                <path
                  d="M0 0 C -4 -8 -12 -13 -12 -22 a12 12 0 0 1 24 0 c0 9 -8 14 -12 22z"
                  fill="var(--color-gold)"
                  stroke="var(--background)"
                  strokeWidth="2"
                />
                <circle className="pin-ring" cy="-22" r="4.5" fill="var(--color-obsidian)" stroke="var(--color-obsidian)" />
              </g>
            </g>
          </g>

          {/* Compass rose, fixed to the frame. */}
          <g transform="translate(40 52)" aria-hidden="true">
            <circle r="18" fill="none" stroke="var(--hairline-strong)" />
            <path d="M0 -14 L4 0 L0 14 L-4 0z" fill="none" stroke="var(--gold-ink)" strokeWidth="1.2" />
            <path d="M0 -14 L4 0 L-4 0z" fill="var(--gold-ink)" />
            <text y="-22" textAnchor="middle" fill="var(--muted-foreground)" style={{ font: "600 10px var(--font-dm-sans)" }}>
              N
            </text>
          </g>
        </svg>

        <div className="absolute top-3 right-3 flex flex-col overflow-hidden rounded-xl border border-hairline bg-background/80 backdrop-blur-sm">
          {[
            {
              label: copy.zoomIn,
              icon: Plus,
              run: () => setZoom((v) => Math.min(ZOOMS.length - 1, v + 1)),
              off: zoom === ZOOMS.length - 1,
            },
            {
              label: copy.zoomOut,
              icon: Minus,
              run: () => setZoom((v) => Math.max(0, v - 1)),
              off: zoom === 0,
            },
            {
              label: copy.recenter,
              icon: LocateFixed,
              run: recenter,
              off: false,
            },
          ].map(({ label, icon: Icon, run, off }) => (
            <button
              key={label.en}
              type="button"
              onClick={run}
              disabled={off}
              aria-label={t(label)}
              title={t(label)}
              className="grid size-10 max-lg:size-11 place-items-center border-b border-hairline text-foreground last:border-b-0 hover:bg-gold/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring disabled:opacity-40"
            >
              <Icon aria-hidden="true" className="size-4" />
            </button>
          ))}
        </div>

        <AnimatePresence>
          {card && (
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: 8 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="m-3 rounded-2xl border border-hairline-strong bg-background/90 p-4 shadow-lg/10 backdrop-blur-md sm:absolute sm:bottom-0 sm:left-0 sm:max-w-xs"
            >
              <p className="text-sm font-semibold text-foreground">{t(copy.office)}</p>
              <address className="mt-1 text-sm leading-relaxed text-muted-foreground not-italic tabular-nums">
                {address.line1}, {address.line2}
                <br />
                {address.city} – {address.pin}
              </address>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={copy.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1.5 text-sm max-lg:min-h-11 font-semibold text-obsidian hover:bg-gold/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <Navigation aria-hidden="true" className="size-3.5" />
                  {t(copy.directions)}
                </a>
                <button
                  type="button"
                  onClick={copyAddress}
                  className="inline-flex items-center gap-1.5 rounded-full border border-hairline-strong px-3 py-1.5 text-sm max-lg:min-h-11 font-semibold text-foreground hover:border-gold-ink focus-visible:outline-2 focus-visible:outline-ring"
                >
                  {copied ? <Check aria-hidden="true" className="size-3.5" /> : <Copy aria-hidden="true" className="size-3.5" />}
                  {t(copied ? copy.copied : copy.copy)}
                </button>
              </div>
              <span className="sr-only" aria-live="polite">
                {copied ? t(copy.copied) : ""}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <figcaption className="text-xs text-muted-foreground">
        {t(copy.note)} {t(copy.hint)}
      </figcaption>
    </figure>
  );
}
