"use client";

import * as React from "react";
import { PanasunaLogo } from "@/components/brand/PanasunaLogo";
import { TrustBadge } from "@/components/brand/TrustBadge";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { PlanCard } from "@/components/widgets/PlanCard";
import { useLocale } from "@/lib/i18n";
import { HERO, POPULAR_PLANS, UI_STRINGS, WHY_PANASUNA, formatINR } from "@/data/panasunaData";
import { Section } from "./Section";

const TOKENS = [
  { name: "obsidian", hex: "#051311", role: "Page background", text: "#F8FAFC" },
  { name: "emerald-900", hex: "#0A2A24", role: "Raised surfaces", text: "#F8FAFC" },
  { name: "emerald-700", hex: "#123D34", role: "Hover, active tab", text: "#F8FAFC" },
  { name: "ink-navy", hex: "#0A192F", role: "Secondary band only", text: "#F8FAFC" },
  { name: "gold", hex: "#D4AF37", role: "Crown, key numerals, focus", text: "#051311" },
  { name: "gold-deep", hex: "#8A6A12", role: "Gold text on alabaster", text: "#F8FAFC" },
  { name: "ember", hex: "#F59E0B", role: "Glints only, < 2% of screen", text: "#051311" },
  { name: "alabaster", hex: "#F8FAFC", role: "Text on dark, light bands", text: "#051311" },
] as const;

const CONTRAST = [
  { pair: "Gold on obsidian", fg: "#D4AF37", bg: "#051311", ratio: "9.0:1", ok: true },
  { pair: "Alabaster on obsidian", fg: "#F8FAFC", bg: "#051311", ratio: "18:1", ok: true },
  { pair: "Gold-deep on alabaster", fg: "#8A6A12", bg: "#F8FAFC", ratio: "4.8:1", ok: true },
  { pair: "Gold on alabaster", fg: "#D4AF37", bg: "#F8FAFC", ratio: "2.0:1", ok: false },
];

export function BrandArtboard() {
  const { t, locale } = useLocale();
  const [replay, setReplay] = React.useState(0);
  const [installment, setInstallment] = React.useState(25_000);

  return (
    <div className="flex flex-col gap-16">
      <Section title="Crown emblem" note="Geometry is shared with the coin emboss in panasuna-crown-coin.glb via crown.json — the logo and the 3D coin are the same drawing.">
        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="relative flex min-h-64 flex-col items-center justify-center gap-4 rounded-2xl border border-hairline bg-[radial-gradient(ellipse_at_50%_30%,#0e3129,#051311_70%)] p-8">
            <PanasunaLogo key={replay} variant="mark" animated className="w-40" />
            <Button variant="ghost" size="sm" onClick={() => setReplay((n) => n + 1)}>
              Replay assemble
            </Button>
          </div>
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-hairline p-8">
            <PanasunaLogo variant="seal" className="w-36" />
            <span className="text-xs text-alabaster-muted">Seal · favicon</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-alabaster p-8 text-gold-deep">
            <PanasunaLogo variant="mark" className="w-24 text-gold-deep" />
            <span className="text-xs text-obsidian/70">On alabaster: gold-deep</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-10 rounded-2xl border border-hairline px-6 py-8">
          <PanasunaLogo variant="lockup" className="h-14 text-[2.6rem]" />
          <PanasunaLogo variant="lockup" className="h-9 text-[1.6rem]" />
        </div>
      </Section>

      <Section title="Colour tokens" note="Every token is a CSS variable in globals.css and a Tailwind colour. No raw hex in components.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TOKENS.map((tk) => (
            <div key={tk.name} className="overflow-hidden rounded-xl border border-hairline">
              <div className="flex h-20 items-end p-3" style={{ background: tk.hex, color: tk.text }}>
                <span className="text-sm font-semibold">{tk.name}</span>
              </div>
              <div className="flex flex-col gap-0.5 p-3 text-xs">
                <span className="font-mono text-alabaster">{tk.hex}</span>
                <span className="text-alabaster-muted">{tk.role}</span>
              </div>
            </div>
          ))}
        </div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {CONTRAST.map((c) => (
            <li key={c.pair} className="flex items-center gap-3 rounded-lg border border-hairline px-3 py-2 text-sm">
              <span className="grid size-9 shrink-0 place-items-center rounded-md font-semibold" style={{ background: c.bg, color: c.fg }}>
                Aa
              </span>
              <span className="flex-1 text-alabaster">{c.pair}</span>
              <span className={`tabular-nums ${c.ok ? "text-success-foreground" : "text-danger"}`}>
                {c.ratio} {c.ok ? "AA" : "Fail — never use"}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Typography" note="Bodoni Moda + Noto Serif Tamil for display (32px and up only). Manrope + Noto Sans Tamil for body. Tamil body line-height 1.75.">
        <div className="grid gap-8 lg:grid-cols-2">
          {(["en", "ta"] as const).map((l) => (
            <div key={l} lang={l} className="flex min-w-0 flex-col gap-4 rounded-2xl border border-hairline p-5 sm:p-6">
              <span className="text-xs text-alabaster-muted">{l === "en" ? "English" : "தமிழ்"}</span>
              <p className={l === "ta" ? "text-[2rem] leading-snug text-alabaster sm:text-5xl lg:text-6xl" : "text-4xl leading-tight text-alabaster sm:text-6xl"} style={{ fontFamily: l === "ta" ? "var(--font-display-ta)" : "var(--font-display)" }}>
                {HERO.headline[l]}
              </p>
              <p className={l === "ta" ? "text-2xl leading-snug text-gold sm:text-3xl" : "text-3xl text-gold"} style={{ fontFamily: l === "ta" ? "var(--font-display-ta)" : "var(--font-display)" }}>
                {HERO.subtitle[l]}
              </p>
              <p className="text-lg font-semibold text-alabaster">{WHY_PANASUNA[3].title[l]}</p>
              <p className="max-w-prose text-base text-alabaster-muted" style={{ lineHeight: l === "ta" ? 1.75 : 1.6 }}>
                {WHY_PANASUNA[3].body[l]}
              </p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-8 rounded-2xl border border-hairline p-6">
          <div>
            <p className="mb-2 text-xs text-alabaster-muted">Tabular figures — widths must match</p>
            <p className="font-[family-name:var(--font-dm-sans)] text-4xl leading-tight font-semibold text-alabaster tabular-nums lining-nums">
              <span className="block">{formatINR(111111)}</span>
              <span className="block">{formatINR(888888)}</span>
            </p>
          </div>
          <div>
            <p className="mb-2 text-xs text-alabaster-muted">Display numerals</p>
            <p className="font-[family-name:var(--font-jakarta)] text-5xl text-gold tabular-nums lining-nums">{formatINR(1_00_00_000)}</p>
          </div>
        </div>
      </Section>

      <Section title="Trust badges" note="Stat-led seals built from TRUST_FACTS — the copy and numbers can't drift from the data file.">
        <div className="grid gap-3 md:grid-cols-2">
          <TrustBadge id="heritage" />
          <TrustBadge id="fdr-security" />
        </div>
      </Section>

      <Section title="Controls" note="Coss UI (Base UI) primitives, rethemed through shadcn variables. Magnetic pull on the primary CTA only.">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-5 rounded-2xl border border-hairline p-6">
            <div className="flex flex-wrap items-center gap-3">
              <MagneticButton size="lg">{t(UI_STRINGS.joinNow)}</MagneticButton>
              <Button size="lg" variant="outline">
                {locale === "ta" ? "ஆலோசகருடன் பேசுங்கள்" : "Talk to an advisor"}
              </Button>
              <Button size="lg" variant="ghost">
                {locale === "ta" ? "திட்டங்களைப் பார்க்க" : "See all plans"}
              </Button>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between">
                <label htmlFor="ds-slider" className="text-sm text-alabaster-muted">
                  {t(UI_STRINGS.monthlyInstallment)}
                </label>
                <AnimatedNumber value={installment} className="text-2xl font-semibold text-gold" />
              </div>
              <Slider
                id="ds-slider"
                min={1000}
                max={500000}
                step={1000}
                value={installment}
                onValueChange={(v) => setInstallment(Array.isArray(v) ? v[0] : v)}
                getAriaLabel={() => t(UI_STRINGS.monthlyInstallment)}
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {POPULAR_PLANS.slice(0, 2).map((p) => (
              <PlanCard key={p.id} plan={p} onJoin={() => {}} />
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}
