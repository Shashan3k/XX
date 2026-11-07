"use client";

import * as React from "react";
import { TRUST_SECTION } from "@/data/panasunaData";
import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { PanasunaLogo } from "@/components/brand/PanasunaLogo";

const { engine } = TRUST_SECTION;

const C = 160;
const ringRadius = (i: number) => 58 + i * 23;
/** Each layer's node sits at its own angle, so the dial reads as interlocking orbits. */
const nodeAngle = (i: number) => ((-38 + i * 61) * Math.PI) / 180;

/** Concentric vault rings, innermost = the 100% FDR deposit. The active layer glows and turns. */
function EngineDial({ active }: { active: number }) {
  const { t } = useLocale();
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[22rem]">
      <svg viewBox="0 0 320 320" aria-hidden="true" className="absolute inset-0 size-full text-gold-ink">
        {engine.layers.map((layer, i) => {
          const r = ringRadius(i);
          const on = i === active;
          const nx = C + r * Math.sin(nodeAngle(i));
          const ny = C - r * Math.cos(nodeAngle(i));
          return (
            <g key={layer.id}>
              <circle
                cx={C}
                cy={C}
                r={r}
                fill="none"
                stroke={on ? "currentColor" : "var(--hairline-strong)"}
                strokeWidth={on ? 2 : 1}
                className="transition-[stroke,stroke-width] duration-300"
              />
              {on && (
                <circle
                  cx={C}
                  cy={C}
                  r={r}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={`${r * 0.9} ${r * 2 * Math.PI}`}
                  opacity={0.35}
                  className="origin-center [transform-box:view-box] [animation:spin_14s_linear_infinite]"
                />
              )}
              <circle
                cx={nx}
                cy={ny}
                r={on ? 5 : 3.2}
                fill={on ? "var(--color-ember)" : "var(--background)"}
                stroke={on ? "none" : "currentColor"}
                strokeWidth="1.25"
                className="transition-all duration-300"
              />
            </g>
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <PanasunaLogo variant="mark" className="size-9" />
        <p className="mt-1 max-w-[6.5rem] text-sm font-semibold text-foreground">{t(engine.centre)}</p>
      </div>
    </div>
  );
}

export function TrustEnginePanel() {
  const { t } = useLocale();
  const [active, setActive] = React.useState(0);

  return (
    <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
      <div className="order-2 flex flex-col gap-6 lg:order-1">
        <div>
          <h3 className="text-2xl font-semibold text-foreground sm:text-3xl">{t(engine.title)}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{t(engine.hint)}</p>
        </div>
        <ul className="flex flex-col gap-2">
          {engine.layers.map((layer, i) => (
            <li key={layer.id}>
              <button
                type="button"
                aria-pressed={active === i}
                onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                className={cn(
                  "flex w-full gap-4 rounded-xl border p-4 text-left transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-ring",
                  active === i ? "border-hairline-strong bg-card" : "border-transparent hover:bg-card/60",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-1.5 size-2.5 shrink-0 rounded-full border transition-colors",
                    active === i ? "border-transparent bg-ember" : "border-gold-ink",
                  )}
                />
                <span className="flex flex-col gap-1">
                  <span className="font-semibold text-foreground">{t(layer.name)}</span>
                  <span className="text-sm text-muted-foreground">{t(layer.body)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="order-1 lg:order-2">
        <EngineDial active={active} />
      </div>
    </div>
  );
}
