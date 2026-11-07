"use client";

import * as React from "react";
import { LANGUAGE_TOGGLE, LANGUAGE_TOGGLE_SHORT, LOCALES, type Locale, type Localized } from "@/data/panasunaData";
import { cn } from "@/lib/utils";

const COOKIE = "pn-locale";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: <T>(value: Localized<T>) => T;
}

const LocaleContext = React.createContext<{ setLocale: (locale: Locale) => void } | null>(null);

const listeners = new Set<() => void>();

function readCookie(): Locale {
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=(en|ta)`));
  return (match?.[1] as Locale | undefined) ?? "en";
}

const serverLocale = (): Locale => "en";

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** The cookie is the store; the server snapshot is always English. */
function useStoredLocale(): Locale {
  return React.useSyncExternalStore<Locale>(subscribe, readCookie, serverLocale);
}

/**
 * Client-side locale. Kept out of the server render so routes stay in the static shell
 * (cacheComponents); the stored choice is applied on mount and mirrored to <html lang>.
 */
export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useStoredLocale();

  React.useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = React.useCallback((next: Locale) => {
    document.cookie = `${COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    listeners.forEach((cb) => cb());
  }, []);

  const value = React.useMemo(() => ({ setLocale }), [setLocale]);

  return <LocaleContext value={value}>{children}</LocaleContext>;
}

/**
 * Each consumer reads the store itself rather than taking the locale from context: a Suspense
 * boundary that hydrates after the provider has switched to Tamil (e.g. the calculator, behind
 * useSearchParams) must still hydrate with the server snapshot, or React reports a text mismatch.
 */
export function useLocale(): LocaleContextValue {
  const ctx = React.use(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside <LocaleProvider>");
  const locale = useStoredLocale();
  const { setLocale } = ctx;
  return React.useMemo<LocaleContextValue>(() => ({ locale, setLocale, t: (v) => v[locale] }), [locale, setLocale]);
}

/** `English | தமிழ்`. `compact` (`EN | தமிழ்`) fits the 375px header, so the switch is never buried in a menu. */
export function LanguageToggle({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { locale, setLocale } = useLocale();
  return (
    <div
      role="group"
      aria-label="Language / மொழி"
      className={cn("inline-flex shrink-0 rounded-full border border-hairline p-0.5 text-sm", className)}
    >
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-label={compact ? LANGUAGE_TOGGLE[l] : undefined}
          aria-pressed={locale === l}
          onClick={() => setLocale(l)}
          className={cn(
            "touch-target relative min-h-9 rounded-full text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring aria-pressed:bg-gold aria-pressed:font-medium aria-pressed:text-obsidian",
            compact ? "px-2.5" : "px-3.5",
          )}
        >
          {compact ? LANGUAGE_TOGGLE_SHORT[l] : LANGUAGE_TOGGLE[l]}
        </button>
      ))}
    </div>
  );
}
