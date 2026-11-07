"use client";

import Link from "next/link";
import { RESOURCES_PAGE } from "@/data/panasunaData";
import { useLocale } from "@/lib/i18n";

/** /resources: the three interactive tools, as plain links. */
export function ResourceTools() {
  const { t } = useLocale();
  return (
    <section aria-labelledby="tools-title" className="flex flex-col gap-8 border-t border-hairline pt-16">
      <h2
        id="tools-title"
        className="text-[clamp(2rem,4vw,3.4rem)] leading-[1.08] tracking-[-0.01em] text-foreground ta:text-[clamp(1.7rem,3vw,2.6rem)] ta:leading-[1.4] ta:tracking-normal"
      >
        {t(RESOURCES_PAGE.toolsTitle)}
      </h2>
      <ul className="grid gap-px overflow-hidden rounded-3xl border border-hairline bg-hairline md:grid-cols-3">
        {RESOURCES_PAGE.tools.map((tool) => (
          <li key={tool.href} className="flex bg-background">
            <Link
              href={tool.href}
              className="group flex w-full flex-col gap-3 p-6 transition-colors hover:bg-card/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:p-8"
            >
              <span className="text-xl font-semibold text-foreground group-hover:text-gold-ink">{t(tool.title)}</span>
              <span className="leading-relaxed text-muted-foreground">{t(tool.body)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
