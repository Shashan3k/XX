"use client";

import Link from "next/link";
import { CONTACT, CONTACT_PAGE, DISCLOSURES, FOOTER, NAV, SITE_CHROME, navHref } from "@/data/panasunaData";
import { useLocale } from "@/lib/i18n";
import { PanasunaLogo } from "@/components/brand/PanasunaLogo";

const SHORT = ["act", "security", "not-deposit", "dividends"];

const LINK = "text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring";

/** §12: every page's footer. Address, click-to-call, the site map and the key disclosures. */
export function SiteFooter() {
  const { t, locale } = useLocale();
  const address = CONTACT.address[locale];

  return (
    <footer className="border-t border-hairline bg-card/30">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 pt-16 pb-10 sm:px-8 md:grid-cols-2 lg:grid-cols-[minmax(0,4fr)_minmax(0,2fr)_minmax(0,3fr)_minmax(0,3fr)] lg:gap-10">
        <div className="flex flex-col gap-5">
          <Link href="/" className="self-start rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
            <PanasunaLogo variant="lockup" className="h-11 text-[1.9rem]" title={t(SITE_CHROME.homeLink)} />
          </Link>
          <p className="max-w-xs text-lg leading-snug text-foreground">{t(FOOTER.tagline)}</p>
          <p className="text-sm text-muted-foreground tabular-nums">{t(SITE_CHROME.established)}</p>
        </div>

        <nav aria-label={t(FOOTER.explore)}>
          <h2 className="font-sans text-sm font-semibold text-foreground">{t(FOOTER.explore)}</h2>
          <ul className="mt-4 flex flex-col gap-2 text-sm">
            {NAV.filter((n) => n.id !== "home").map((n) => (
              <li key={n.id}>
                <Link href={n.href} className={LINK}>
                  {t(n.label)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-sans text-sm font-semibold text-foreground">{t(FOOTER.visit)}</h2>
          <address className="mt-4 text-sm leading-relaxed text-muted-foreground not-italic tabular-nums">
            {address.line1}
            <br />
            {address.line2}
            <br />
            {address.city} – {address.pin}
            <br />
            {address.state}
          </address>
          <a href={CONTACT_PAGE.map.href} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-semibold text-gold-ink hover:underline focus-visible:outline-2 focus-visible:outline-ring">
            {t(CONTACT_PAGE.map.directions)}
          </a>
        </div>

        <div>
          <h2 className="font-sans text-sm font-semibold text-foreground">{t(FOOTER.call)}</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {CONTACT.phones.map((p) => (
              <li key={p.id} className="flex flex-col">
                <span className="text-xs text-muted-foreground">{t(p.label)}</span>
                <a href={`tel:${p.tel}`} className="text-lg font-light text-foreground tabular-nums hover:text-gold-ink focus-visible:outline-2 focus-visible:outline-ring">
                  {p.display}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex flex-col gap-4 border-t border-hairline py-8">
          <ul className="grid gap-x-10 gap-y-2 text-xs leading-relaxed text-muted-foreground md:grid-cols-2">
            {DISCLOSURES.filter((d) => SHORT.includes(d.id)).map((d) => (
              <li key={d.id}>{t(d.text)}</li>
            ))}
          </ul>
          <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>{t(FOOTER.rights)}</p>
            <Link href={`${navHref("contact")}#disclosures`} className="font-semibold text-gold-ink hover:underline focus-visible:outline-2 focus-visible:outline-ring">
              {t(FOOTER.disclosures)}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
