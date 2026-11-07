"use client";

import dynamic from "next/dynamic";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { PanasunaLogo } from "@/components/brand/PanasunaLogo";
import { LanguageToggle } from "@/lib/i18n";
import { BrandArtboard } from "./BrandArtboard";
import { WidgetsArtboard } from "./WidgetsArtboard";
import { Section } from "./Section";

const ModelShowcase = dynamic(() => import("@/components/three/ModelShowcase"), {
  ssr: false,
  loading: () => <div className="h-[40rem] animate-pulse rounded-2xl border border-hairline bg-emerald-900/40" />,
});

const BOARDS = [
  { id: "brand", label: "1 · Brand" },
  { id: "models", label: "2 · 3D assets" },
  { id: "widgets", label: "3 · Widgets" },
] as const;

/** The internal review board stays on the brand's dark theme whatever the site theme is. */
export function DesignSystem() {
  return (
    <Tabs defaultValue="brand" className="dark min-h-screen gap-0 bg-background text-foreground [color-scheme:dark]">
      <header className="sticky top-0 z-20 border-b border-hairline bg-obsidian/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 sm:px-8">
          <div className="flex items-center gap-4">
            <PanasunaLogo variant="lockup" className="h-9 text-[1.55rem]" />
            <span className="hidden text-sm text-alabaster-muted md:inline">Design system</span>
          </div>
          <LanguageToggle />
          <TabsList className="w-full overflow-x-auto [scrollbar-width:none] sm:w-auto">
            {BOARDS.map((b) => (
              <TabsTab key={b.id} value={b.id} className="min-h-10 px-3 text-muted-foreground sm:px-4">
                {b.label}
              </TabsTab>
            ))}
          </TabsList>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-8">
        <TabsPanel value="brand">
          <BrandArtboard />
        </TabsPanel>
        <TabsPanel value="models">
          <Section
            title="Blender-exported assets"
            note="Modelled through Blender MCP (scripts/blender/*.py) and exported to public/models. Each view checks its triangle budget, named nodes and applied transforms against modelManifest.ts. Drag to orbit."
          >
            <ModelShowcase />
          </Section>
        </TabsPanel>
        <TabsPanel value="widgets">
          <WidgetsArtboard />
        </TabsPanel>
      </main>
    </Tabs>
  );
}
