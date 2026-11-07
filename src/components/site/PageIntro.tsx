"use client";

import type { Localized } from "@/data/panasunaData";
import { useLocale } from "@/lib/i18n";

/** Inner-page opening: the page's h1 and lead, set clear of the fixed header. */
export function PageIntro({
  title,
  lead,
  badge,
  id = "page-title",
}: {
  title: Localized;
  lead: Localized;
  /** Optional highlight pill above the title. */
  badge?: Localized;
  id?: string;
}) {
  const { t } = useLocale();
  return (
    <header className="grid gap-6 pt-32 pb-10 md:pt-40 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
      {badge && (
        <p className="-mb-2 inline-flex items-center gap-2 self-start justify-self-start rounded-full border border-gold-ink/40 px-4 py-1.5 text-sm font-semibold text-gold-ink tabular-nums lg:col-span-2">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-ember motion-safe:animate-pulse" />
          {t(badge)}
        </p>
      )}
      <h1
        id={id}
        className="text-[clamp(2.5rem,5.4vw,4.5rem)] leading-[1.04] tracking-[-0.015em] text-foreground ta:text-[clamp(2rem,4vw,3.4rem)] ta:leading-[1.35] ta:tracking-normal"
      >
        {t(title)}
      </h1>
      <p className="text-muted-foreground tabular-nums lg:pb-2">{t(lead)}</p>
    </header>
  );
}
