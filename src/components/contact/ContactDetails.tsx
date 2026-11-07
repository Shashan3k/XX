"use client";

import { CONTACT, CONTACT_PAGE } from "@/data/panasunaData";
import { useLocale } from "@/lib/i18n";
import { PanasunaLogo } from "@/components/brand/PanasunaLogo";

/** /contact beside the map: the head office, and both numbers as call buttons (mobile first). */
export function ContactDetails() {
  const { t, locale } = useLocale();
  const address = CONTACT.address[locale];
  return (
    <section aria-labelledby="touch-title" className="flex flex-col gap-8 rounded-3xl border border-hairline bg-card/40 p-6 sm:p-8">
      <div className="flex items-center gap-4">
        <PanasunaLogo variant="seal" className="size-12 shrink-0 text-gold-ink" />
        <h2 id="touch-title" className="font-sans text-2xl font-semibold text-foreground">
          {t(CONTACT_PAGE.getInTouch)}
        </h2>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gold-ink">{t(CONTACT_PAGE.address)}</h3>
        <address className="mt-2 text-lg leading-relaxed text-foreground not-italic tabular-nums">
          {address.line1}
          <br />
          {address.line2}
          <br />
          {address.city} – {address.pin}, {address.state}
        </address>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gold-ink">{t(CONTACT_PAGE.phones)}</h3>
        <ul className="mt-3 flex flex-col gap-2">
          {CONTACT.phones.map((p) => (
            <li key={p.id}>
              <a
                href={`tel:${p.tel}`}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-hairline px-4 py-3 transition-colors hover:border-gold-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <span className="flex flex-col">
                  <span className="text-xs text-muted-foreground">{t(p.label)}</span>
                  <span className="text-xl font-light tracking-[-0.01em] text-foreground tabular-nums">{p.display}</span>
                </span>
                <span className="rounded-full bg-gold px-3 py-1 text-sm font-semibold text-obsidian">{t(CONTACT_PAGE.call)}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
