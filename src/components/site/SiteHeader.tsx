"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Menu } from "lucide-react";
import { CONTACT, NAV, SITE_CHROME } from "@/data/panasunaData";
import { LanguageToggle, useLocale } from "@/lib/i18n";
import { ThemeToggle } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { PanasunaLogo } from "@/components/brand/PanasunaLogo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetPopup, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { pageScroll } from "@/components/providers/SmoothScroll";

// ─── Scroll phase: "top" (transparent), "down" (frosted, utility row tucked), "up" (frosted, all shown) ──

type Phase = "top" | "down" | "up";
const TOP_ZONE = 24;
const phaseListeners = new Set<() => void>();
let phase: Phase = "top";
let lastY = 0;

function onScroll() {
  const y = window.scrollY;
  const next: Phase = y < TOP_ZONE ? "top" : y > lastY + 4 ? "down" : y < lastY - 4 ? "up" : phase;
  lastY = y;
  if (next !== phase) {
    phase = next;
    phaseListeners.forEach((cb) => cb());
  }
}

function subscribePhase(cb: () => void) {
  if (phaseListeners.size === 0) {
    lastY = window.scrollY;
    phase = lastY < TOP_ZONE ? "top" : "down";
    window.addEventListener("scroll", onScroll, { passive: true });
  }
  phaseListeners.add(cb);
  return () => {
    phaseListeners.delete(cb);
    if (phaseListeners.size === 0) window.removeEventListener("scroll", onScroll);
  };
}

function useScrollPhase(): Phase {
  return React.useSyncExternalStore<Phase>(subscribePhase, () => phase, () => "top");
}

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function SiteHeader() {
  const { t, locale } = useLocale();
  const pathname = usePathname();
  const scrollPhase = useScrollPhase();
  const header = React.useRef<HTMLElement>(null);
  const nav = React.useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = React.useState(false);

  /*
   * Collapse the inline nav into the menu whenever it doesn't fit: Tamil labels are ~35% wider, so a
   * fixed breakpoint would either overflow in Tamil or hide the nav needlessly in English.
   * Writes `data-compact` on the header (no React state, no extra render).
   */
  React.useEffect(() => {
    const measure = () => {
      const h = header.current;
      const n = nav.current;
      if (!h || !n) return;
      h.setAttribute("data-compact", "measure");
      const list = n.firstElementChild as HTMLElement | null;
      const overflow = !!list && n.clientWidth > 0 && list.scrollWidth > n.clientWidth + 1;
      h.setAttribute("data-compact", String(overflow));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (header.current) ro.observe(header.current);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [locale]);

  // Base UI only reports user-initiated open changes, so scroll locking follows every path here.
  const toggleMenu = (open: boolean) => {
    setMenuOpen(open);
    if (open) pageScroll.lock();
    else pageScroll.unlock();
  };

  const frosted = scrollPhase !== "top";
  const utilityOpen = scrollPhase !== "down";

  return (
    <header ref={header} data-compact="false" className="group/header fixed inset-x-0 top-0 z-50">
      <a
        href="#main"
        className="sr-only z-[60] rounded-md bg-gold px-4 py-2 font-medium text-obsidian focus:not-sr-only focus:absolute focus:top-3 focus:left-3"
      >
        {t(SITE_CHROME.skipToContent)}
      </a>

      {/* Utility row (md+): heritage line, phones, language, theme. Tucks away while scrolling down. */}
      <div
        className={cn(
          "hidden transition-[grid-template-rows,opacity] duration-300 ease-crown md:grid",
          utilityOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          frosted && "bg-background/80 backdrop-blur-xl",
        )}
        inert={!utilityOpen}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="mx-auto flex h-11 max-w-7xl items-center justify-end gap-6 px-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-5">
              <p className="hidden items-center gap-1.5 lg:flex">
                <span>{t(SITE_CHROME.callUs)}</span>
                {CONTACT.phones.map((p, i) => (
                  <React.Fragment key={p.id}>
                    {i > 0 && <span aria-hidden="true">·</span>}
                    <a href={`tel:${p.tel}`} className="tabular-nums transition-colors hover:text-gold-ink">
                      {p.display}
                    </a>
                  </React.Fragment>
                ))}
              </p>
              <LanguageToggle className="text-[0.8125rem] [&_button]:min-h-8" />
              <ThemeToggle className="size-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Main bar: transparent over the hero, frosted obsidian / alabaster glass once scrolled. */}
      <div
        className={cn(
          "border-b transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 ease-crown",
          frosted
            ? "border-hairline bg-background/72 shadow-[0_12px_32px_-24px_rgb(5_19_17/0.6)] backdrop-blur-xl backdrop-saturate-150 max-lg:bg-background/85 max-lg:backdrop-blur-md"
            : "border-transparent bg-transparent",
        )}
      >
        <div
          className={cn(
            "mx-auto flex max-w-7xl items-center gap-4 px-4 transition-[height] duration-300 ease-crown sm:px-8 xl:gap-8 ta:max-w-[84rem] ta:xl:gap-3",
            frosted ? "h-[4.5rem]" : "h-[4.5rem] md:h-24",
          )}
        >
          <Link href="/" className="shrink-0 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
            <PanasunaLogo variant="lockup" animated className="h-11 text-[1.75rem] md:h-14 md:text-[2.25rem]" title={t(SITE_CHROME.homeLink)} />
          </Link>

          <nav
            ref={nav}
            aria-label={t(SITE_CHROME.primaryNav)}
            className="hidden min-w-0 flex-1 justify-center lg:flex group-data-[compact=true]/header:hidden"
          >
            <ul className="flex items-center gap-0.5 ta:gap-0">
              {NAV.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className="relative block rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors duration-150 ta:px-2.5 ta:text-[13px] after:absolute after:inset-x-3 ta:after:inset-x-2.5 after:bottom-1 after:h-px after:origin-center after:scale-x-0 after:bg-gold-ink after:transition-transform after:duration-300 after:ease-crown hover:text-foreground hover:after:scale-x-100 focus-visible:outline-2 focus-visible:outline-ring aria-[current=page]:text-foreground aria-[current=page]:after:scale-x-100"
                    >
                      {t(item.label)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <LanguageToggle compact className="md:hidden" />

            <Sheet open={menuOpen} onOpenChange={toggleMenu}>
              <SheetTrigger
                aria-label={t(SITE_CHROME.openMenu)}
                className="touch-target relative grid size-10 place-items-center rounded-full border border-hairline text-foreground transition-colors hover:border-hairline-strong focus-visible:outline-2 focus-visible:outline-ring lg:hidden group-data-[compact=true]/header:grid"
              >
                <Menu className="size-5" />
              </SheetTrigger>
              <MobileMenu pathname={pathname} onNavigate={() => toggleMenu(false)} />
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

function MobileMenu({ pathname, onNavigate }: { pathname: string; onNavigate: () => void }) {
  const { t } = useLocale();
  return (
    <SheetPopup
      side="right"
      data-lenis-prevent
      className="border-hairline"
      closeProps={{ "aria-label": t(SITE_CHROME.closeMenu) }}
    >
      <div className="flex h-full flex-col gap-6 overflow-y-auto px-6 pt-5 pb-8">
        <div className="flex items-center gap-3 pr-10">
          <PanasunaLogo variant="mark" className="size-8" />
          <SheetTitle className="font-sans text-base font-semibold">{t(SITE_CHROME.menuTitle)}</SheetTitle>
        </div>

        <nav aria-label={t(SITE_CHROME.primaryNav)}>
          <ul className="flex flex-col">
            {NAV.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.id} className="border-b border-hairline">
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className="flex min-h-13 items-center justify-between gap-3 py-2 text-lg font-medium text-foreground transition-colors hover:text-gold-ink aria-[current=page]:text-gold-ink"
                  >
                    {t(item.label)}
                    <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-gold-ink" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <Button size="xl" className="w-full tabular-nums" render={<a href={`tel:${CONTACT.phones[0].tel}`} />}>
          {t(SITE_CHROME.callUs)} {CONTACT.phones[0].display}
        </Button>

        <div className="flex items-center justify-between gap-3">
          <LanguageToggle />
          <ThemeToggle />
        </div>

        <div className="mt-auto flex flex-col gap-1 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">{t(SITE_CHROME.callUs)}</p>
          {CONTACT.phones.map((p) => (
            <a key={p.id} href={`tel:${p.tel}`} className="tabular-nums hover:text-gold-ink">
              {t(p.label)} · {p.display}
            </a>
          ))}
          <p className="mt-2">{t(CONTACT.addressOneLine)}</p>
        </div>
      </div>
    </SheetPopup>
  );
}
