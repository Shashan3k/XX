/**
 * Panasuna Chits (P) Ltd. — structured site content (English + Tamil).
 *
 * Source of truth: `old_UI.md` (text and figures only — no legacy image URLs).
 * Spelling and grammar from the old site have been corrected.
 *
 * Conventions:
 * - Anything marked `editorial` is new copy or mapping that did not exist on the old site.
 * - Anything marked `VERIFY` needs confirmation from the client before launch.
 * - Tamil (`ta`) copy is a first draft and must be reviewed by a native Tamil editor before launch.
 * - All money is stored as whole rupees (number). Format with `formatINR` / `formatINRCompact`
 *   and always render with `tabular-nums`.
 */

// ─── Core types ────────────────────────────────────────────────────────────────

export type Locale = "en" | "ta";
export const LOCALES: readonly Locale[] = ["en", "ta"];

export type Localized<T = string> = Record<Locale, T>;

// ─── Formatting helpers ───────────────────────────────────────────────────────

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** ₹1,00,00,000 — Indian digit grouping. Tamil UI also uses these digits. */
export function formatINR(amount: number): string {
  return inrFormatter.format(amount);
}

/** ₹3 L / ₹1 Cr / ₹40K (en) — ₹3 லட்சம் / ₹1 கோடி / ₹40 ஆயிரம் (ta). */
export function formatINRCompact(amount: number, locale: Locale = "en"): string {
  const units =
    locale === "ta"
      ? { cr: " கோடி", l: " லட்சம்", k: " ஆயிரம்" }
      : { cr: " Cr", l: " L", k: "K" };
  const trim = (n: number) =>
    Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");
  if (amount >= 1e7) return `₹${trim(amount / 1e7)}${units.cr}`;
  if (amount >= 1e5) return `₹${trim(amount / 1e5)}${units.l}`;
  if (amount >= 1e3) return `₹${trim(amount / 1e3)}${units.k}`;
  return `₹${amount}`;
}

/** 0.05 → "5%", 0.125 → "12.5%". */
export function formatPercent(rate: number): string {
  return `${Number((rate * 100).toFixed(1))}%`;
}

// ─── Chit rules (every simulator and calculator reads these) ──────────────────

/**
 * VERIFY: Panasuna's actual foreman's commission. 5% was the cap under the Chit Funds Act, 1982; the
 * Chit Funds (Amendment) Act, 2019 raised it to 7%. Shown on screen as "assumed" until confirmed.
 * Client revision (Nov 2026): the maximum discount cap is 40%, the ceiling the Act allows, so a prized
 * subscriber always receives at least 60% of the gross chit value. The `Structure` sheet payouts below
 * (70% early-month benchmark → 95% at maturity) sit inside that cap.
 */
export const CHIT_RULES = { commissionRate: 0.05, maxDiscountRate: 0.4 } as const;
const COMMISSION_PCT = formatPercent(CHIT_RULES.commissionRate);
const MAX_DISCOUNT_PCT = formatPercent(CHIT_RULES.maxDiscountRate);

// ─── Company & contact ────────────────────────────────────────────────────────

export const ESTABLISHED_YEAR = 1975;
/** Client revision: celebrate uninterrupted service from 1975 into 2026, and still running. */
export const OPERATING_YEAR = 2026;
export const HERITAGE_SPAN = {
  label: { en: `${ESTABLISHED_YEAR} – ${OPERATING_YEAR} & continuing strong`, ta: `${ESTABLISHED_YEAR} – ${OPERATING_YEAR}, தொடர்ந்து வலுவாக` } as Localized,
  note: {
    en: `50+ years of uninterrupted service since ${ESTABLISHED_YEAR}, into ${OPERATING_YEAR} and still running.`,
    ta: `${ESTABLISHED_YEAR} முதல் ${OPERATING_YEAR} வரை, 50+ ஆண்டுகள் இடைவிடாத சேவை; இன்றும் தொடர்கிறது.`,
  } as Localized,
};

export const COMPANY = {
  legalName: "Panasuna Chits (P) Ltd.",
  name: { en: "Panasuna Chits (P) Ltd.", ta: "பனசுனா சிட்ஸ் (பி) லிமிடெட்" } as Localized, // VERIFY: Tamil spelling of the brand
  shortName: { en: "Panasuna", ta: "பனசுனா" } as Localized,
  established: ESTABLISHED_YEAR,
  headquarters: { en: "Salem, Tamil Nadu", ta: "சேலம், தமிழ்நாடு" } as Localized,
  yearsOfTrust: { en: "50+ years of trust", ta: "50+ ஆண்டுகால நம்பிக்கை" } as Localized,
  website: "www.panasunachits.com",
} as const;

export interface PhoneNumber {
  id: "mobile" | "landline";
  label: Localized;
  display: string;
  /** E.164 for `tel:` links. */
  tel: string;
}

export const CONTACT = {
  address: {
    en: {
      line1: "419/151-A",
      line2: "Chinna Kadai Street",
      city: "Salem",
      pin: "636 001",
      state: "Tamil Nadu",
    },
    ta: {
      line1: "419/151-A",
      line2: "சின்னக்கடை வீதி",
      city: "சேலம்",
      pin: "636 001",
      state: "தமிழ்நாடு",
    },
  } as Localized<{ line1: string; line2: string; city: string; pin: string; state: string }>,
  /** Single-line form, as published on the old site. */
  addressOneLine: {
    en: "419/151-A, Chinna Kadai Street, Salem - 636 001",
    ta: "419/151-A, சின்னக்கடை வீதி, சேலம் - 636 001",
  } as Localized,
  /** Client revision: mobile first, then the one office landline. No other numbers anywhere. */
  phones: [
    { id: "mobile", label: { en: "Primary mobile", ta: "முதன்மைக் கைபேசி" }, display: "9842360611", tel: "+919842360611" },
    { id: "landline", label: { en: "Office landline", ta: "அலுவலகத் தொலைபேசி" }, display: "0427-2260611", tel: "+914272260611" },
  ] as readonly PhoneNumber[],
  /** VERIFY: the old site hid the email behind Cloudflare obfuscation — copy it from the live site. */
  email: null as string | null,
  website: "https://www.panasunachits.com",
} as const;

/** "9842360611 · 0427-2260611" — the one way every page writes the numbers out. */
export const PHONE_LINE = CONTACT.phones.map((p) => p.display).join(" · ");

// ─── Navigation (new routes, with legacy paths for redirects) ─────────────────

export interface NavItem {
  id: string;
  label: Localized;
  href: string;
  /** Old-site URLs that should 301 to `href`. */
  legacyPaths?: readonly string[];
}

/**
 * editorial: header IA requested by the client. The old Why us / Our team pages fold into About us,
 * and About chit funds into How chits work.
 */
export const NAV: readonly NavItem[] = [
  { id: "home", label: { en: "Home", ta: "முகப்பு" }, href: "/" },
  { id: "about", label: { en: "About us", ta: "எங்களைப் பற்றி" }, href: "/about", legacyPaths: ["/aboutus.php", "/whyus.php", "/ourteam.php"] },
  { id: "plans", label: { en: "Chit plans", ta: "சீட்டுத் திட்டங்கள்" }, href: "/chit-plans", legacyPaths: ["/chitplan.php"] },
  { id: "calculator", label: { en: "Calculator", ta: "கணிப்பான்" }, href: "/calculator" },
  { id: "auction", label: { en: "Auction process", ta: "ஏல நடைமுறை" }, href: "/auction-process" },
  { id: "how-chits-work", label: { en: "How chits work", ta: "சீட்டு இயங்கும் விதம்" }, href: "/how-chits-work", legacyPaths: ["/aboutchitfund.php"] },
  { id: "resources", label: { en: "Resources", ta: "தகவல் மையம்" }, href: "/resources" },
  { id: "contact", label: { en: "Contact", ta: "தொடர்புக்கு" }, href: "/contact" },
];

export function navHref(id: NavItem["id"]): string {
  return NAV.find((n) => n.id === id)?.href ?? "/";
}

/** Header chrome and accessibility labels. */
export const SITE_CHROME = {
  skipToContent: { en: "Skip to main content", ta: "முதன்மை உள்ளடக்கத்திற்குச் செல்ல" } as Localized,
  primaryNav: { en: "Main", ta: "முதன்மை" } as Localized,
  homeLink: { en: "Panasuna Chits home", ta: "பனசுனா சிட்ஸ் முகப்பு" } as Localized,
  openMenu: { en: "Open menu", ta: "மெனுவைத் திற" } as Localized,
  closeMenu: { en: "Close menu", ta: "மெனுவை மூடு" } as Localized,
  menuTitle: { en: "Menu", ta: "மெனு" } as Localized,
  established: { en: `Est. ${ESTABLISHED_YEAR} · Salem, Tamil Nadu`, ta: `${ESTABLISHED_YEAR} முதல் · சேலம், தமிழ்நாடு` } as Localized,
  callUs: { en: "Call us", ta: "அழைக்க" } as Localized,
  theme: {
    toLight: { en: "Switch to light theme", ta: "வெளிர் தோற்றத்திற்கு மாற்று" } as Localized,
    toDark: { en: "Switch to dark theme", ta: "இருண்ட தோற்றத்திற்கு மாற்று" } as Localized,
  },
};

export const LANGUAGE_TOGGLE: Localized = { en: "English", ta: "தமிழ்" };
export const LANGUAGE_TOGGLE_SHORT: Localized = { en: "EN", ta: "தமிழ்" };

// ─── Goals (editorial mapping — not on the old site) ──────────────────────────

export type GoalId = "business" | "home" | "vehicle" | "savings" | "other";

export interface ChitGoal {
  id: GoalId;
  label: Localized;
  description: Localized;
  /** Bespoke animated SVG icon id. */
  icon: string;
}

export const GOALS: readonly ChitGoal[] = [
  {
    id: "business",
    label: { en: "Business expansion", ta: "தொழில் விரிவாக்கம்" },
    description: {
      en: "Working capital, stock, machinery or a new branch.",
      ta: "நடைமுறை மூலதனம், சரக்கு இருப்பு, இயந்திரங்கள் அல்லது புதிய கிளை.",
    },
    icon: "goal-business",
  },
  {
    id: "home",
    label: { en: "Home or property", ta: "வீடு அல்லது சொத்து" },
    description: {
      en: "A plot, a new home, or a renovation.",
      ta: "மனை, புதிய வீடு அல்லது வீட்டுப் புதுப்பிப்பு.",
    },
    icon: "goal-home",
  },
  {
    id: "vehicle",
    label: { en: "Vehicle purchase", ta: "வாகனம் வாங்குதல்" },
    description: {
      en: "A two-wheeler, a car, or a commercial vehicle.",
      ta: "இருசக்கர வாகனம், கார் அல்லது வணிக வாகனம்.",
    },
    icon: "goal-vehicle",
  },
  {
    id: "savings",
    label: { en: "Planned savings", ta: "திட்டமிட்ட சேமிப்பு" },
    description: {
      en: "Build a disciplined monthly saving habit.",
      ta: "ஒழுங்கான மாதாந்திரச் சேமிப்புப் பழக்கத்தை உருவாக்குங்கள்.",
    },
    icon: "goal-savings",
  },
  {
    id: "other",
    label: { en: "Other financial needs", ta: "பிற நிதித் தேவைகள்" },
    description: {
      en: "Education, weddings, medical costs and life's other milestones.",
      ta: "கல்வி, திருமணம், மருத்துவச் செலவுகள் மற்றும் வாழ்க்கையின் பிற முக்கியத் தருணங்கள்.",
    },
    icon: "goal-other",
  },
];

const LAKH = 100_000;

/** editorial: goal mapping by chit value. Tune thresholds here, not per plan. */
function goalsFor(chitValue: number): GoalId[] {
  const goals: GoalId[] = [];
  if (chitValue >= 5 * LAKH) goals.push("business");
  if (chitValue >= 9 * LAKH) goals.push("home");
  if (chitValue >= 1 * LAKH && chitValue <= 10 * LAKH) goals.push("vehicle");
  if (chitValue <= 6 * LAKH) goals.push("savings");
  // Education, weddings and medical needs come at every size, so "other" is never narrowed.
  goals.push("other");
  return goals;
}

// ─── Chit plans ───────────────────────────────────────────────────────────────

export const CHIT_DURATIONS = [15, 20, 25, 30, 40, 50, 60] as const;
export type ChitDuration = (typeof CHIT_DURATIONS)[number];

/** Client master chart: Short Term is 15–30 months, Long Term is 40–60 months. */
export type ChitTerm = "short" | "long";
export const SHORT_TERM_MAX_MONTHS = 30;
export function termFor(months: number): ChitTerm {
  return months <= SHORT_TERM_MAX_MONTHS ? "short" : "long";
}
export const CHIT_TERMS: readonly { id: ChitTerm; label: Localized; range: Localized; durations: readonly ChitDuration[] }[] = [
  {
    id: "short",
    label: { en: "Short term", ta: "குறுகிய காலம்" },
    range: { en: "15, 20, 25, 30 months", ta: "15, 20, 25, 30 மாதங்கள்" },
    durations: [15, 20, 25, 30],
  },
  {
    id: "long",
    label: { en: "Long term", ta: "நீண்ட காலம்" },
    range: { en: "40, 50, 60 months", ta: "40, 50, 60 மாதங்கள்" },
    durations: [40, 50, 60],
  },
];

/** Matches the old site's value filter buttons. */
export type ValueBand = "under-2l" | "2l-to-5l" | "over-5l";

/** Special schemes the client named explicitly; shown as a badge on the plan card. */
export type PlanScheme = "1l-30m" | "5l-20m" | "express";

export const PLAN_SCHEMES: Record<PlanScheme, Localized> = {
  "1l-30m": { en: "1L × 30m scheme", ta: "1L × 30 மாதத் திட்டம்" },
  "5l-20m": { en: "5L × 20m scheme", ta: "5L × 20 மாதத் திட்டம்" },
  express: { en: "Express corporate group", ta: "விரைவு நிறுவனக் குழு" },
};

export interface ChitPlan {
  id: string;
  chitValue: number;
  durationMonths: ChitDuration;
  /** Full monthly subscription before any auction dividend is deducted, as published by the client. */
  monthlyInstallment: number;
  term: ChitTerm;
  /** Groups running now, where the client's Excel sheet counts them; null when not stated. */
  activeGroups: number | null;
  scheme: PlanScheme | null;
  valueBand: ValueBand;
  goals: readonly GoalId[];
  popular: boolean;
}

function bandFor(chitValue: number): ValueBand {
  if (chitValue < 2 * LAKH) return "under-2l";
  if (chitValue <= 5 * LAKH) return "2l-to-5l";
  return "over-5l";
}

const POPULAR_PLAN_IDS = new Set([
  "cv-300000-25m", // ₹12,000/mo
  "cv-300000-50m", // ₹6,000/mo
  "cv-1000000-40m", // ₹25,000/mo
  "cv-2500000-50m", // ₹50,000/mo
]);

// [chitValue, months, monthlyInstallment, activeGroups | null, scheme | null]
type PlanRow = readonly [number, ChitDuration, number, number | null, PlanScheme | null];

/**
 * The 57-scheme master catalogue (client revision, Nov 2026): the Excel `Sheet1` groups, the Short Term /
 * Long Term master chart, and the explicit 5L × 20m and 1L × 30m additions. Every plan starts at ₹1,00,000
 * (the ₹90,000 entry plan was withdrawn). Installments are the client's published figures (1L × 30m is
 * ₹3,333, not ₹3,333.33).
 */
const MASTER_ROWS: readonly PlanRow[] = [
  [100_000, 20, 5_000, 1, null],
  [100_000, 25, 4_000, 5, null],
  [100_000, 30, 3_333, null, "1l-30m"],
  [100_000, 40, 2_500, 10, null],
  [100_000, 50, 2_000, 2, null],
  [120_000, 30, 4_000, null, null],
  [120_000, 60, 2_000, null, null],
  [150_000, 20, 7_500, 5, null],
  [150_000, 25, 6_000, 6, null],
  [150_000, 30, 5_000, 6, null],
  [150_000, 40, 3_750, 1, null],
  [150_000, 50, 3_000, 1, null],
  [150_000, 60, 2_500, 3, null],
  [180_000, 60, 3_000, 1, null],
  [200_000, 20, 10_000, 2, null],
  [200_000, 25, 8_000, 1, null],
  [200_000, 40, 5_000, 2, null],
  [250_000, 25, 10_000, null, null],
  [300_000, 20, 15_000, null, null],
  [300_000, 25, 12_000, 3, null],
  [300_000, 30, 10_000, 3, null],
  [300_000, 40, 7_500, 1, null],
  [300_000, 50, 6_000, 1, null],
  [300_000, 60, 5_000, null, null],
  [400_000, 20, 20_000, null, null],
  [400_000, 25, 16_000, null, null],
  [450_000, 30, 15_000, 4, null],
  [450_000, 60, 7_500, 1, null],
  [500_000, 20, 25_000, null, "5l-20m"],
  [500_000, 25, 20_000, 1, null],
  [500_000, 50, 10_000, null, null],
  [600_000, 30, 20_000, null, null],
  [600_000, 40, 15_000, 1, null],
  [600_000, 60, 10_000, 5, null],
  [750_000, 30, 25_000, 2, null],
  [900_000, 30, 30_000, 2, null],
  [900_000, 60, 15_000, 4, null],
  [1_000_000, 40, 25_000, 1, null],
  [1_200_000, 40, 30_000, 1, null],
  [1_500_000, 15, 100_000, 1, "express"],
  [1_500_000, 30, 50_000, null, null],
  [1_500_000, 50, 30_000, 1, null],
  [1_600_000, 40, 40_000, null, null],
  [2_000_000, 40, 50_000, null, null],
  [2_500_000, 20, 125_000, 1, null],
  [2_500_000, 25, 100_000, 1, null],
  [2_500_000, 50, 50_000, null, null],
  [3_000_000, 25, 120_000, 1, null],
  [3_000_000, 30, 100_000, 1, "1l-30m"],
  [3_000_000, 60, 50_000, null, null],
  [5_000_000, 25, 200_000, null, null],
  [5_000_000, 50, 100_000, 1, null],
  [6_000_000, 40, 150_000, 1, null],
  [6_000_000, 60, 100_000, null, null],
  [7_500_000, 60, 125_000, 1, null],
  [10_000_000, 20, 500_000, 1, "5l-20m"],
  [10_000_000, 50, 200_000, 1, null],
];

function toPlan([chitValue, durationMonths, monthlyInstallment, activeGroups, scheme]: PlanRow): ChitPlan {
  const id = `cv-${chitValue}-${durationMonths}m`;
  return {
    id,
    chitValue,
    durationMonths,
    monthlyInstallment,
    term: termFor(durationMonths),
    activeGroups,
    scheme,
    valueBand: bandFor(chitValue),
    goals: goalsFor(chitValue),
    popular: POPULAR_PLAN_IDS.has(id),
  };
}

/** All 57 master-catalogue schemes, sorted by chit value then duration. */
export const CHIT_PLANS: readonly ChitPlan[] = MASTER_ROWS.map(toPlan).sort(
  (a, b) => a.chitValue - b.chitValue || a.durationMonths - b.durationMonths,
);

/** The headline the client asked for: 57 schemes plus every running group, rounded to "100+". */
export const PLAN_COUNT_HEADLINE = 100;
export const PLAN_COUNT_LABEL: Localized = {
  en: "Chit fund plans & active groups",
  ta: "சீட்டுத் திட்டங்கள் & நடப்புக் குழுக்கள்",
};
export const PLAN_COUNT_BADGE: Localized = {
  en: `${PLAN_COUNT_HEADLINE}+ Chit Fund Plans & Active Groups`,
  ta: `${PLAN_COUNT_HEADLINE}+ சீட்டுத் திட்டங்கள் & நடப்புக் குழுக்கள்`,
};

export const POPULAR_PLANS: readonly ChitPlan[] = CHIT_PLANS.filter((p) => p.popular).sort(
  (a, b) => a.monthlyInstallment - b.monthlyInstallment,
);

export function getPlansByGoal(goal: GoalId): ChitPlan[] {
  return CHIT_PLANS.filter((p) => p.goals.includes(goal));
}

export const PLAN_FILTERS: readonly { id: "all" | ValueBand; label: Localized }[] = [
  { id: "all", label: { en: "All", ta: "அனைத்தும்" } },
  { id: "under-2l", label: { en: "Under ₹2,00,000", ta: "₹2,00,000-க்குக் கீழ்" } },
  { id: "2l-to-5l", label: { en: "₹2,00,000 – ₹5,00,000", ta: "₹2,00,000 – ₹5,00,000" } },
  { id: "over-5l", label: { en: "Above ₹5,00,000", ta: "₹5,00,000-க்கு மேல்" } },
];

export const PLAN_SORTS: readonly { id: "chitValue" | "durationMonths" | "monthlyInstallment"; label: Localized }[] = [
  { id: "chitValue", label: { en: "Chit value", ta: "சீட்டுத் தொகை" } },
  { id: "durationMonths", label: { en: "Duration", ta: "காலம்" } },
  { id: "monthlyInstallment", label: { en: "Monthly subscription", ta: "மாதச் சந்தா" } },
];

// ─── "Find your chit" wizard (editorial) ──────────────────────────────────────

export type BudgetBandId = "up-to-5k" | "5k-15k" | "15k-50k" | "above-50k";
export type TimelineId = "up-to-2y" | "2-3y" | "3-4y" | "4-5y";

export const WIZARD = {
  goal: {
    question: { en: "What are you saving for?", ta: "எதற்காகச் சேமிக்கிறீர்கள்?" } as Localized,
  },
  budget: {
    question: { en: "How much can you set aside each month?", ta: "மாதந்தோறும் எவ்வளவு ஒதுக்க முடியும்?" } as Localized,
    options: [
      { id: "up-to-5k", min: 0, max: 5_000, label: { en: "Up to ₹5,000", ta: "₹5,000 வரை" } },
      { id: "5k-15k", min: 5_001, max: 15_000, label: { en: "₹5,000 – ₹15,000", ta: "₹5,000 – ₹15,000" } },
      { id: "15k-50k", min: 15_001, max: 50_000, label: { en: "₹15,000 – ₹50,000", ta: "₹15,000 – ₹50,000" } },
      { id: "above-50k", min: 50_001, max: Infinity, label: { en: "Above ₹50,000", ta: "₹50,000-க்கு மேல்" } },
    ] as readonly { id: BudgetBandId; min: number; max: number; label: Localized }[],
  },
  timeline: {
    question: { en: "How long would you like to save?", ta: "எத்தனை காலம் சேமிக்க விரும்புகிறீர்கள்?" } as Localized,
    hint: {
      en: "You can bid for the money earlier — this only sets how long you pay.",
      ta: "முன்னதாகவே ஏலம் கேட்டுத் தொகையைப் பெறலாம் — இது தவணை செலுத்தும் காலத்தை மட்டுமே குறிக்கிறது.",
    } as Localized,
    options: [
      { id: "up-to-2y", durations: [15, 20, 25], label: { en: "Up to 2 years", ta: "2 ஆண்டுகள் வரை" } },
      { id: "2-3y", durations: [30], label: { en: "2–3 years", ta: "2–3 ஆண்டுகள்" } },
      { id: "3-4y", durations: [40], label: { en: "3–4 years", ta: "3–4 ஆண்டுகள்" } },
      { id: "4-5y", durations: [50, 60], label: { en: "4–5 years", ta: "4–5 ஆண்டுகள்" } },
    ] as readonly { id: TimelineId; durations: readonly ChitDuration[]; label: Localized }[],
  },
} as const;

/** Exact matches first; relaxes timeline, then budget, so the wizard never returns empty. */
export function matchPlans(goal: GoalId, budget: BudgetBandId, timeline: TimelineId): ChitPlan[] {
  const band = WIZARD.budget.options.find((o) => o.id === budget)!;
  const durations = WIZARD.timeline.options.find((o) => o.id === timeline)!.durations;
  const byGoal = getPlansByGoal(goal);
  const inBudget = byGoal.filter((p) => p.monthlyInstallment >= band.min && p.monthlyInstallment <= band.max);
  const exact = inBudget.filter((p) => durations.includes(p.durationMonths));
  if (exact.length) return exact;
  if (inBudget.length) return inBudget;
  const target = Number.isFinite(band.max) ? band.max : band.min;
  return [...byGoal].sort(
    (a, b) => Math.abs(a.monthlyInstallment - target) - Math.abs(b.monthlyInstallment - target),
  );
}

// ─── "Find your chit": home section 4 (an amount, not a band; real durations only) ─

/** The slider's range. The cheapest real plan is ₹2,000/mo; the dearest ₹5,00,000/mo (₹1 Cr over 20 months). */
export const BUDGET_RANGE = { min: 2_000, max: 500_000 } as const;

export function formatMonths(months: number, locale: Locale): string {
  return locale === "ta" ? `${months} மாதங்கள்` : `${months} months`;
}

/** "about 4 years" style helper for durations; one decimal only when it isn't whole. */
export function formatYears(months: number, locale: Locale): string {
  const y = months / 12;
  const n = Number.isInteger(y) ? String(y) : y.toFixed(1);
  return locale === "ta" ? `சுமார் ${n} ஆண்டுகள்` : `about ${n} years`;
}

export const FIND_YOUR_CHIT = {
  title: { en: "Flexible Financial Planning.", ta: "நெகிழ்வான நிதித் திட்டமிடல்." } as Localized,
  lead: {
    en: "Answer three questions: what you are saving for, what you can set aside, and for how long. You will see the real Panasuna plans that fit, with no phone number asked.",
    ta: "மூன்று கேள்விகளுக்குப் பதில் சொல்லுங்கள்: எதற்காகச் சேமிக்கிறீர்கள், எவ்வளவு ஒதுக்க முடியும், எத்தனை காலம். உங்களுக்குப் பொருந்தும் உண்மையான பனசுனா திட்டங்களைக் காண்பீர்கள்; தொலைபேசி எண் கேட்கப்படாது.",
  } as Localized,
  questions: {
    goal: { en: "What is your primary goal?", ta: "உங்கள் முதன்மை இலக்கு என்ன?" } as Localized,
    budget: { en: "What monthly subscription are you comfortable with?", ta: "மாதந்தோறும் எவ்வளவு சந்தா செலுத்த வசதியாக இருக்கும்?" } as Localized,
    duration: { en: "What duration are you considering?", ta: "எத்தனை மாத காலத்தைக் கருதுகிறீர்கள்?" } as Localized,
  },
  step: { en: "Question", ta: "கேள்வி" } as Localized,
  of: { en: "of", ta: "/" } as Localized,
  next: { en: "Continue", ta: "தொடர்க" } as Localized,
  back: { en: "Back", ta: "பின்செல்" } as Localized,
  restart: { en: "Start again", ta: "மீண்டும் தொடங்கு" } as Localized,
  budget: {
    ...BUDGET_RANGE,
    /** Quick picks; each is the ceiling ("up to") the visitor is comfortable with. */
    presets: [5_000, 10_000, 25_000, 50_000, 100_000] as readonly number[],
    sliderLabel: { en: "Monthly subscription", ta: "மாதச் சந்தா" } as Localized,
    inputLabel: { en: "Or type an amount", ta: "அல்லது தொகையை உள்ளிடுங்கள்" } as Localized,
    hint: {
      en: "We show plans at or below this amount.",
      ta: "இந்தத் தொகைக்குச் சமமான அல்லது குறைவான திட்டங்களைக் காட்டுவோம்.",
    } as Localized,
  },
  duration: {
    options: CHIT_DURATIONS,
    hint: {
      en: "You can bid for the chit amount earlier. This only sets how many months you subscribe.",
      ta: "சீட்டுத் தொகையை முன்னதாகவே ஏலம் கேட்டுப் பெறலாம். இது சந்தா செலுத்தும் மாதங்களின் எண்ணிக்கையை மட்டுமே குறிக்கிறது.",
    } as Localized,
  },
  summary: {
    title: { en: "Your chit so far", ta: "இதுவரை உங்கள் சீட்டு" } as Localized,
    pending: { en: "Not answered yet", ta: "இன்னும் பதிலளிக்கவில்லை" } as Localized,
    upTo: { en: "Up to", ta: "அதிகபட்சம்" } as Localized,
    matching: { en: "real plans match", ta: "உண்மையான திட்டங்கள் பொருந்துகின்றன" } as Localized,
    matchingOne: { en: "real plan matches", ta: "உண்மையான திட்டம் பொருந்துகிறது" } as Localized,
  },
  results: {
    title: { en: "Plans that fit", ta: "உங்களுக்குப் பொருந்தும் திட்டங்கள்" } as Localized,
    bestMatch: { en: "Best match", ta: "மிகப் பொருத்தமானது" } as Localized,
    alternative: { en: "Also within your budget", ta: "உங்கள் வரவுக்குள் மேலும்" } as Localized,
    match: {
      exact: {
        en: "The best match fits all three answers.",
        ta: "மிகப் பொருத்தமான திட்டம் உங்கள் மூன்று பதில்களுக்கும் பொருந்துகிறது.",
      },
      "nearby-duration": {
        en: "No plan fits that exact duration within your budget, so these are the nearest durations.",
        ta: "உங்கள் வரவுக்குள் அந்தக் காலத்திற்கான திட்டம் இல்லை; அருகிலுள்ள காலத் திட்டங்கள் இவை.",
      },
      "over-budget": {
        en: "No plan for this goal fits that budget, so these are the closest above it.",
        ta: "இந்த இலக்கிற்கு அந்த வரவுக்குள் திட்டம் இல்லை; அதற்குச் சற்று மேலான நெருக்கமான திட்டங்கள் இவை.",
      },
    } as Record<DiscoveryMatch, Localized>,
    terms: [
      {
        id: "fdr",
        label: { en: "100% Bank FDR security", ta: "100% வங்கி வைப்புப் பாதுகாப்பு" },
        body: {
          en: "The full chit value is held as a Fixed Deposit in a Scheduled Bank.",
          ta: "முழுச் சீட்டுத் தொகையும் ஒரு அட்டவணை வங்கியில் நிலை வைப்பாக வைக்கப்படுகிறது.",
        },
      },
      {
        id: "doorstep",
        label: { en: "Disciplined monthly collection", ta: "ஒழுங்கான மாத வசூல்" },
        body: {
          en: "One fixed monthly installment, collected at your door by our team.",
          ta: "ஒரே நிலையான மாதத் தவணை; எங்கள் குழு உங்கள் வீட்டு வாசலிலேயே பெற்றுக்கொள்கிறது.",
        },
      },
    ] as readonly { id: "fdr" | "doorstep"; label: Localized; body: Localized }[],
    disclaimer: {
      en: "This is a plan discovery tool, not a credit or investment suitability assessment.",
      ta: "இது திட்டங்களைக் கண்டறியும் கருவி மட்டுமே; கடன் தகுதி அல்லது முதலீட்டுப் பொருத்த மதிப்பீடு அல்ல.",
    } as Localized,
    cta: { en: "Request more information", ta: "மேலும் விவரம் கோருங்கள்" } as Localized,
    seeAll: { en: "Compare all plans", ta: "அனைத்துத் திட்டங்களையும் ஒப்பிடுங்கள்" } as Localized,
  },
};

export type DiscoveryMatch = "exact" | "nearby-duration" | "over-budget";

export interface DiscoveryAnswers {
  goal: GoalId | null;
  monthly: number | null;
  duration: ChitDuration | null;
}

/**
 * Plans for the "Find your chit" wizard. Budget is a ceiling: within it, the plan that uses the most
 * of it ranks first. Relaxes duration, then budget, so it never returns empty.
 */
export function discoverPlans(
  goal: GoalId,
  monthly: number,
  duration: ChitDuration,
): { plans: ChitPlan[]; match: DiscoveryMatch; exactCount: number } {
  const byGoal = getPlansByGoal(goal);
  const affordable = byGoal.filter((p) => p.monthlyInstallment <= monthly);
  const byNearestDuration = (a: ChitPlan, b: ChitPlan) =>
    Math.abs(a.durationMonths - duration) - Math.abs(b.durationMonths - duration) ||
    b.monthlyInstallment - a.monthlyInstallment;
  const exact = affordable.filter((p) => p.durationMonths === duration);
  if (exact.length) {
    // Exact matches first, then the rest of the budget's plans as alternatives.
    const rest = affordable.filter((p) => p.durationMonths !== duration).sort(byNearestDuration);
    const plans = [...exact.sort((a, b) => b.monthlyInstallment - a.monthlyInstallment), ...rest];
    return { plans, match: "exact", exactCount: exact.length };
  }
  if (affordable.length) {
    return { plans: affordable.sort(byNearestDuration), match: "nearby-duration", exactCount: 0 };
  }
  const plans = byGoal.sort(
    (a, b) =>
      a.monthlyInstallment - b.monthlyInstallment ||
      Math.abs(a.durationMonths - duration) - Math.abs(b.durationMonths - duration),
  );
  return { plans, match: "over-budget", exactCount: 0 };
}

/** Live "N real plans match" count for whichever answers are given so far. */
export function countDiscoverable({ goal, monthly, duration }: DiscoveryAnswers): number {
  return CHIT_PLANS.filter(
    (p) =>
      (!goal || p.goals.includes(goal)) &&
      (monthly === null || p.monthlyInstallment <= monthly) &&
      (duration === null || p.durationMonths === duration),
  ).length;
}

// ─── Popular plans (home section 5) and the catalogue (/chit-plans) ────────────

export const POPULAR_SECTION = {
  title: { en: "Popular chit plans.", ta: "பிரபலமான சீட்டுத் திட்டங்கள்." } as Localized,
  lead: {
    en: "From ₹6,000 a month to a ₹25,00,000 chit, chosen from 100+ plans and active groups. Every one is backed 100% by a Bank FDR.",
    ta: "மாதம் ₹6,000 முதல் ₹25,00,000 சீட்டு வரை, 100+ திட்டங்கள் & நடப்புக் குழுக்களிலிருந்து. ஒவ்வொன்றும் 100% வங்கி வைப்பால் பாதுகாக்கப்படுகிறது.",
  } as Localized,
  becomes: { en: "becomes a chit of", ta: "சேரும் சீட்டுத் தொகை" } as Localized,
  over: { en: "over", ta: "காலம்" } as Localized,
  cta: FIND_YOUR_CHIT.results.cta,
  seeAll: {
    en: `See all ${CHIT_PLANS.length} plans`,
    ta: `அனைத்து ${CHIT_PLANS.length} திட்டங்களையும் பாருங்கள்`,
  } as Localized,
};

export type PlanSortId = (typeof PLAN_SORTS)[number]["id"];

export const CATALOG = {
  title: { en: "Every Panasuna chit plan.", ta: "அனைத்துப் பனசுனா சீட்டுத் திட்டங்களும்." } as Localized,
  lead: {
    en: `${MASTER_ROWS.length} schemes from our master catalogue, ${formatINR(MASTER_ROWS[0][0])} to ${formatINR(10_000_000)}, across ${PLAN_COUNT_HEADLINE}+ plans and active groups. Pick short or long term, filter by chit value, or search by amount.`,
    ta: `எங்கள் முதன்மைப் பட்டியலின் ${MASTER_ROWS.length} திட்டங்கள், ${formatINR(MASTER_ROWS[0][0])} முதல் ${formatINR(10_000_000)} வரை; ${PLAN_COUNT_HEADLINE}+ திட்டங்கள் & நடப்புக் குழுக்கள். குறுகிய அல்லது நீண்ட காலத்தைத் தேர்ந்தெடுங்கள், சீட்டுத் தொகையால் வடிகட்டுங்கள், அல்லது தொகையைத் தேடுங்கள்.`,
  } as Localized,
  filterLabel: { en: "Chit value", ta: "சீட்டுத் தொகை" } as Localized,
  searchLabel: { en: "Search plans", ta: "திட்டங்களைத் தேடுங்கள்" } as Localized,
  searchPlaceholder: { en: "Amount or months, e.g. 3,00,000 or 50", ta: "தொகை அல்லது மாதங்கள், எ.கா. 3,00,000 அல்லது 50" } as Localized,
  clearSearch: { en: "Clear search", ta: "தேடலை அழி" } as Localized,
  order: { en: "Order", ta: "வரிசை" } as Localized,
  showing: { en: "plans", ta: "திட்டங்கள்" } as Localized,
  empty: {
    en: "No plan matches that search. Try an amount like 5,00,000 or a duration like 30.",
    ta: "அந்தத் தேடலுக்குப் பொருந்தும் திட்டம் இல்லை. 5,00,000 போன்ற தொகையையோ 30 போன்ற காலத்தையோ முயலுங்கள்.",
  } as Localized,
  badge: PLAN_COUNT_BADGE,
  termLabel: { en: "Term", ta: "காலவகை" } as Localized,
  allTerms: { en: "All terms", ta: "அனைத்தும்" } as Localized,
  activeGroups: {
    en: (n: number) => (n === 1 ? "Active group" : `${n} active groups`),
    ta: (n: number) => (n === 1 ? "நடப்புக் குழு" : `${n} நடப்புக் குழுக்கள்`),
  },
  calculate: { en: "Calculate", ta: "கணக்கிடு" } as Localized,
};

/** Tokens a visitor might type for a plan: "300000", "3,00,000", "3l", "3 lakh", "50", "6000". */
export function planSearchText(plan: ChitPlan): string {
  const lakhs = plan.chitValue / LAKH;
  return [
    plan.chitValue,
    formatINR(plan.chitValue),
    `${lakhs}l`,
    `${lakhs} lakh`,
    `${lakhs} லட்சம்`,
    plan.chitValue >= 100 * LAKH ? `${plan.chitValue / (100 * LAKH)} crore` : "",
    plan.monthlyInstallment,
    formatINR(plan.monthlyInstallment),
    `${plan.durationMonths} months`,
    `${plan.durationMonths} மாதங்கள்`,
  ]
    .join(" ")
    .toLowerCase();
}

// ─── Calculator (/calculator) ──────────────────────────────────────────────────

export const CALCULATOR = {
  sceneLabel: {
    en: "3D home vault: gold coin stacks rise beside the home as the chit value grows.",
    ta: "3D வீட்டுப் பெட்டகம்: சீட்டுத் தொகை உயர உயர வீட்டின் அருகே தங்க நாணய அடுக்குகள் உயர்கின்றன.",
  } as Localized,
  title: { en: "See what a chit adds up to.", ta: "ஒரு சீட்டு எவ்வளவாகிறது என்று பாருங்கள்." } as Localized,
  lead: {
    en: "Choose any Panasuna scheme, or slide your monthly budget and we will pick the largest plan it covers. Every figure updates as you go.",
    ta: "எந்தப் பனசுனா திட்டத்தையும் தேர்ந்தெடுங்கள், அல்லது உங்கள் மாத வரவை நகர்த்துங்கள்; அது அடங்கும் மிகப் பெரிய திட்டத்தைத் தேர்ந்தெடுப்போம். ஒவ்வொரு எண்ணும் உடனுக்குடன் மாறும்.",
  } as Localized,
  scheme: { en: "Chit scheme", ta: "சீட்டுத் திட்டம்" } as Localized,
  budget: { en: "Monthly budget", ta: "மாத வரவு" } as Localized,
  duration: { en: "Duration", ta: "காலம்" } as Localized,
  anyDuration: { en: "Any", ta: "ஏதேனும்" } as Localized,
  budgetHint: {
    en: "The largest plan whose full monthly subscription fits this budget.",
    ta: "முழு மாதச் சந்தா இந்த வரவுக்குள் அடங்கும் மிகப் பெரிய திட்டம்.",
  } as Localized,
  figures: {
    chitValue: { en: "Gross chit value", ta: "மொத்தச் சீட்டுத் தொகை" } as Localized,
    members: { en: "Members in the group", ta: "குழு உறுப்பினர்கள்" } as Localized,
    membersNote: { en: "One member per month of the chit", ta: "சீட்டின் ஒவ்வொரு மாதத்திற்கும் ஒரு உறுப்பினர்" } as Localized,
    monthly: { en: "Monthly subscription", ta: "மாதச் சந்தா" } as Localized,
    totalSubscribed: { en: "Total subscription, before dividends", ta: "ஈவுத்தொகைக்கு முந்தைய மொத்தச் சந்தா" } as Localized,
    avgDividend: { en: "Average dividend per month", ta: "சராசரி மாத ஈவுத்தொகை" } as Localized,
    totalDividend: { en: "Dividends over the chit", ta: "சீட்டுக் காலத்தில் மொத்த ஈவுத்தொகை" } as Localized,
    netPaid: { en: "What you would actually pay", ta: "நீங்கள் உண்மையில் செலுத்துவது" } as Localized,
    prize: { en: "Chit amount if you take it in month", ta: "இந்த மாதத்தில் எடுத்தால் கிடைக்கும் தொகை" } as Localized,
  },
  takeMonth: { en: "Month you take the chit", ta: "சீட்டை எடுக்கும் மாதம்" } as Localized,
  illustrative: { en: "Illustrative", ta: "எடுத்துக்காட்டு" } as Localized,
  month: {
    payoutPct: { en: "Payout, % of chit value", ta: "பரிசுத் தொகை, சீட்டுத் தொகையின் %" },
    discount: { en: "Auction discount", ta: "ஏலத் தள்ளுபடி" },
    dividend: { en: "Your dividend in month", ta: "உங்கள் ஈவுத்தொகை · மாதம்" },
    net: { en: "Your net installment in month", ta: "உங்கள் நிகரத் தவணை · மாதம்" },
  } satisfies Record<"payoutPct" | "discount" | "dividend" | "net", Localized>,
  companyChit: {
    title: { en: "Month 1 is the Company Chit", ta: "முதல் மாதம் நிறுவனச் சீட்டு" },
    body: {
      en: "Paid at 100% of the full chit value: no auction, no discount and no dividend that month.",
      ta: "முழுச் சீட்டுத் தொகையின் 100%: அந்த மாதம் ஏலம் இல்லை, தள்ளுபடி இல்லை, ஈவுத்தொகை இல்லை.",
    },
  } satisfies Record<"title" | "body", Localized>,
  // VERIFY: the assumed foreman's commission (CHIT_RULES).
  assumptions: {
    en: `Figures follow Panasuna's official auction Structure benchmarks: month 1 is the Company Chit at 100%, early months sit near the 70% payout benchmark (within the ${MAX_DISCOUNT_PCT} maximum discount cap), rising to 95% in the final month after the ${COMMISSION_PCT} foreman's commission. Real dividends depend on each month's auction and are not guaranteed.`,
    ta: `எண்கள் பனசுனாவின் அதிகாரப்பூர்வ ஏல அமைப்பு அளவுகோல்களைப் பின்பற்றுகின்றன: முதல் மாதம் 100% நிறுவனச் சீட்டு, தொடக்க மாதங்களில் சுமார் 70% பரிசுத் தொகை அளவுகோல் (அதிகபட்சத் தள்ளுபடி வரம்பு ${MAX_DISCOUNT_PCT}-க்குள்), கடைசி மாதம் ${COMMISSION_PCT} நிறுவனக் கமிஷன் போக 95%. உண்மையான ஈவுத்தொகை ஒவ்வொரு மாத ஏலத்தைப் பொறுத்தது; உத்தரவாதம் இல்லை.`,
  } as Localized,
  vaultCaption: {
    en: "The vault fills as the chit value grows; the rings turn faster.",
    ta: "சீட்டுத் தொகை உயர உயரப் பெட்டகம் நிரம்புகிறது; வளையங்கள் வேகமாகச் சுழல்கின்றன.",
  } as Localized,
  cta: FIND_YOUR_CHIT.results.cta,
};

// ─── Join enquiry modal ──────────────────────────────────────────────────────

export const ENQUIRY = {
  title: FIND_YOUR_CHIT.results.cta,
  lead: {
    en: "Leave your name and mobile number. Our manager will call you about this chit; there is no obligation to join.",
    ta: "உங்கள் பெயரையும் கைபேசி எண்ணையும் தாருங்கள். இந்தச் சீட்டு குறித்து எங்கள் மேலாளர் அழைப்பார்; சேர வேண்டிய கட்டாயம் இல்லை.",
  } as Localized,
  name: { en: "Your name", ta: "உங்கள் பெயர்" } as Localized,
  mobile: { en: "Mobile number", ta: "கைபேசி எண்" } as Localized,
  mobileHint: { en: "10-digit Indian mobile number", ta: "10 இலக்க இந்தியக் கைபேசி எண்" } as Localized,
  scheme: { en: "Chit scheme", ta: "சீட்டுத் திட்டம்" } as Localized,
  errors: {
    name: { en: "Please enter your name.", ta: "உங்கள் பெயரை உள்ளிடுங்கள்." } as Localized,
    mobile: { en: "Please enter a valid 10-digit mobile number.", ta: "சரியான 10 இலக்கக் கைபேசி எண்ணை உள்ளிடுங்கள்." } as Localized,
    scheme: { en: "Please choose a chit scheme.", ta: "ஒரு சீட்டுத் திட்டத்தைத் தேர்ந்தெடுங்கள்." } as Localized,
    failed: {
      en: "We couldn't send your request just now. Please call us instead.",
      ta: "உங்கள் கோரிக்கையை இப்போது அனுப்ப இயலவில்லை. தயவுசெய்து எங்களை அழையுங்கள்.",
    } as Localized,
  },
  sending: { en: "Sending…", ta: "அனுப்புகிறது…" } as Localized,
  privacy: {
    en: "We use your number only to call you about this enquiry.",
    ta: "இந்த விசாரணை குறித்து அழைக்க மட்டுமே உங்கள் எண்ணைப் பயன்படுத்துவோம்.",
  } as Localized,
  callInstead: { en: "Prefer to talk now?", ta: "இப்போதே பேச விரும்புகிறீர்களா?" } as Localized,
  close: { en: "Close", ta: "மூடு" } as Localized,
  choosePlan: { en: "Choose a scheme", ta: "திட்டத்தைத் தேர்ந்தெடுங்கள்" } as Localized,
};

/** Normalises "+91 98423 60611", "098423-60611" etc. to 10 digits, or null if it isn't an Indian mobile. */
export function normalizeIndianMobile(input: string): string | null {
  const digits = input.replace(/\D/g, "").replace(/^(?:91|0)(?=\d{10}$)/, "");
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

// ─── Trust engine ─────────────────────────────────────────────────────────────

export interface TrustFact {
  id: "heritage" | "fdr-security" | "governance" | "head-office";
  stat: string;
  title: Localized;
  body: Localized;
}

export const TRUST_FACTS: readonly TrustFact[] = [
  {
    id: "heritage",
    stat: String(ESTABLISHED_YEAR),
    title: { en: "50+ years of trust", ta: "50+ ஆண்டுகால நம்பிக்கை" },
    body: {
      en: "Serving savers and businesses from Salem since 1975.",
      ta: "1975 முதல் சேலத்திலிருந்து சேமிப்பாளர்களுக்கும் வணிகர்களுக்கும் சேவை.",
    },
  },
  {
    id: "fdr-security",
    stat: "100%",
    title: { en: "Security for your money", ta: "உங்கள் பணத்திற்குப் பாதுகாப்பு" },
    body: {
      en: "We make a security deposit equal to 100% of the chit value in a Scheduled Bank as an FDR.",
      ta: "சீட்டுத் தொகையின் 100%-க்குச் சமமான பாதுகாப்பு வைப்பை, ஷெட்யூல்டு வங்கியில் நிரந்தர வைப்பு ரசீதாக (FDR) வைக்கிறோம்.",
    },
  },
  {
    id: "governance",
    stat: "5",
    title: { en: "Managed by a Board of Directors", ta: "இயக்குநர் குழுவால் நிர்வகிக்கப்படுகிறது" },
    body: {
      en: "Five directors with leadership roles in the SCFFA, TNCFA, AIACF and Young Minds.",
      ta: "SCFFA, TNCFA, AIACF மற்றும் யங் மைண்ட்ஸ் அமைப்புகளில் தலைமைப் பொறுப்பு வகிக்கும் ஐந்து இயக்குநர்கள்.",
    },
  },
  {
    id: "head-office",
    stat: "636 001",
    title: { en: "Our Salem head office", ta: "எங்கள் சேலம் தலைமை அலுவலகம்" },
    body: CONTACT.addressOneLine,
  },
];

/** From the old "Security for Money" block — relevant to auction transparency. */
export const SERVICE_NORMS: readonly Localized[] = [
  { en: "Adherence to standard service norms.", ta: "நிலையான சேவை நெறிமுறைகளைப் பின்பற்றுகிறோம்." },
  { en: "Prompt communication of bid details.", ta: "ஏல விவரங்களை உடனுக்குடன் தெரிவிக்கிறோம்." },
];

// ─── Home hero & about ────────────────────────────────────────────────────────

const HERO_HEADLINE_LINES: readonly Localized[] = [
  { en: "Your Dreams.", ta: "உங்கள் கனவுகள்." },
  { en: "Your Goals.", ta: "உங்கள் இலக்குகள்." },
  { en: "Your Panasuna.", ta: "உங்கள் பனசுனா." },
];

export const HERO = {
  /** Accessible description of the hero WebGL scene (role="img"). */
  sceneLabel: {
    en: "A two-storey luxury villa with a gold-trimmed tiered roof, a pillared entrance portico and warmly glowing windows, on a stepped travertine plinth beside a stack of gold coins, circled by two gold rings and orbiting Panasuna crown coins.",
    ta: "தங்க விளிம்புடன் அடுக்குக் கூரை, தூண்கள் கொண்ட நுழைவாயில், கதகதப்பாக ஒளிரும் சாளரங்கள் கொண்ட இரண்டு மாடிச் சொகுசு இல்லம்; படிநிலைப் பளிங்கு மேடையில், அருகே தங்க நாணய அடுக்கு; அதைச் சுற்றி இரண்டு தங்க வளையங்களும் பனசுனா கிரீட நாணயங்களும்.",
  } as Localized,
  /** Client tagline — kept in its title case on purpose. One line per sentence. */
  headlineLines: HERO_HEADLINE_LINES,
  headline: {
    en: HERO_HEADLINE_LINES.map((l) => l.en).join(" "),
    ta: HERO_HEADLINE_LINES.map((l) => l.ta).join(" "),
  } as Localized,
  /** Client revision (Nov 2026): one punchy line replaces the old lead and the two saving lines. */
  subtitle: {
    en: "Every Big Dream Begins with a Small Step.",
    ta: "ஒவ்வொரு பெரிய கனவும் ஒரு சிறிய அடியிலிருந்துதான் தொடங்குகிறது.",
  } as Localized,
  primaryCta: { label: { en: "Explore chit plans", ta: "சீட்டுத் திட்டங்களைப் பாருங்கள்" } as Localized, href: navHref("plans") },
  secondaryCta: { label: { en: "Calculate your chit", ta: "உங்கள் சீட்டைக் கணக்கிடுங்கள்" } as Localized, href: navHref("calculator") },
  /** Persona audit A1: the FDR guarantee in plain words, above the fold. */
  security: {
    en: "100% of every chit's value is held as an FDR in a Scheduled Bank.",
    ta: "ஒவ்வொரு சீட்டுத் தொகையின் 100%-ம் ஷெட்யூல்டு வங்கியில் FDR ஆக வைக்கப்படுகிறது.",
  } as Localized,
  scrollCue: { en: "Scroll to enter the vault", ta: "பெட்டகத்திற்குள் செல்ல கீழே உருட்டுங்கள்" } as Localized,
  cta: { en: "Join Panasuna and make your dreams come true.", ta: "பனசுனாவில் இணைந்து உங்கள் கனவுகளை நனவாக்குங்கள்." } as Localized,
  highlights: [
    {
      id: "start-saving",
      title: { en: "Start your saving", ta: "சேமிப்பைத் தொடங்குங்கள்" },
      body: {
        en: "Saving and investing is a lifelong process. The earlier you start, the brighter your future. Now is the right time to join Panasuna Chits.",
        ta: "சேமிப்பும் முதலீடும் வாழ்நாள் முழுவதுமான பயணம். எவ்வளவு முன்னதாகத் தொடங்குகிறீர்களோ, அவ்வளவு பிரகாசமாக இருக்கும் உங்கள் எதிர்காலம். பனசுனா சிட்ஸில் இணைய இதுவே சரியான நேரம்.",
      },
    },
    {
      id: "security",
      title: { en: "Security for your money", ta: "உங்கள் பணத்திற்குப் பாதுகாப்பு" },
      body: {
        en: "We make a security deposit equal to 100% of the chit value in a Scheduled Bank as an FDR. We adhere to standard service norms and communicate bid details promptly.",
        ta: "சீட்டுத் தொகையின் 100%-க்குச் சமமான பாதுகாப்பு வைப்பை ஷெட்யூல்டு வங்கியில் FDR ஆக வைக்கிறோம். நிலையான சேவை நெறிமுறைகளைப் பின்பற்றி, ஏல விவரங்களை உடனுக்குடன் தெரிவிக்கிறோம்.",
      },
    },
    {
      id: "choose-wisely",
      title: { en: "Choose wisely", ta: "சிந்தித்துத் தேர்ந்தெடுங்கள்" },
      body: {
        en: "For anyone who likes to save, a chit is more rewarding than other savings schemes: the dividend you earn in a chit is typically higher than the interest from other financial instruments.",
        ta: "சேமிக்க விரும்பும் எவருக்கும், பிற சேமிப்புத் திட்டங்களை விடச் சீட்டு அதிகப் பலன் தரும்: சீட்டில் கிடைக்கும் ஈவுத்தொகை, பொதுவாகப் பிற நிதிக் கருவிகளின் வட்டியை விட அதிகம்.",
      },
    },
  ] as readonly { id: string; title: Localized; body: Localized }[],
};

export const ABOUT = {
  company: {
    title: { en: "Our company", ta: "எங்கள் நிறுவனம்" },
    body: {
      en: "A pioneer in chit funds, Panasuna Chits (P) Ltd. is managed by a Board of Directors and has contributed in no small measure to the growth of the industry. That's why Panasuna is stable and prudent.",
      ta: "சீட்டு நிதித் துறையின் முன்னோடியான பனசுனா சிட்ஸ் (பி) லிமிடெட், இயக்குநர் குழுவால் நிர்வகிக்கப்படுகிறது; இத்துறையின் வளர்ச்சிக்குக் குறிப்பிடத்தக்க பங்களிப்பை வழங்கியுள்ளது. அதனால்தான் பனசுனா நிலையானது, விவேகமானது.",
    },
  },
  values: {
    title: { en: "Our values", ta: "எங்கள் விழுமியங்கள்" },
    body: {
      en: "Our products aim to deliver real value to every customer. Whatever their economic status, we believe time is precious and everyone deserves courtesy and prompt service with a high level of transparency.",
      ta: "ஒவ்வொரு வாடிக்கையாளருக்கும் உண்மையான மதிப்பை வழங்குவதே எங்கள் திட்டங்களின் நோக்கம். பொருளாதார நிலை எதுவாக இருந்தாலும், நேரம் விலைமதிப்பற்றது என்றும், ஒவ்வொருவரும் மரியாதையான, விரைவான, முழு வெளிப்படைத்தன்மையுடன் கூடிய சேவைக்கு உரியவர் என்றும் நம்புகிறோம்.",
    },
  },
  vision: {
    title: { en: "Our vision", ta: "எங்கள் தொலைநோக்கு" },
    body: {
      en: "Over the next few years, Panasuna Chits (P) Ltd. aims to become a leading player in the chit fund sector, serving the needs of the mass market.",
      ta: "வரும் ஆண்டுகளில், பரந்துபட்ட மக்களின் தேவைகளைப் பூர்த்தி செய்யும் சீட்டு நிதித் துறையின் முன்னணி நிறுவனமாக உயர்வதே பனசுனா சிட்ஸ் (பி) லிமிடெட்டின் இலக்கு.",
    },
  },
  mission: {
    title: { en: "Our mission", ta: "எங்கள் பணி இலக்கு" },
    body: {
      en: "Our purpose is to bring convenience to the lives of the ordinary people of India — to “make life easy” for them.",
      ta: "இந்தியாவின் சாதாரண மக்களின் வாழ்க்கையில் வசதியைக் கொண்டு வருவதே — அவர்களின் “வாழ்க்கையை எளிதாக்குவதே” — எங்கள் நோக்கம்.",
    },
  },
} satisfies Record<string, { title: Localized; body: Localized }>;

// ─── Why Panasuna (6 pillars) ─────────────────────────────────────────────────

export interface WhyPillar {
  id: "timely-payment" | "tech-convenience" | "fdr-security" | "trusted-advisor" | "customer-centric" | "registered-groups";
  title: Localized;
  body: Localized;
  /** Short proof points shown as chips under the body. */
  chips?: readonly Localized[];
  /** Bespoke animated SVG icon id. */
  icon: string;
}

/** Client order (Nov 2026): Timely payment, Technology, FDR security, Trusted advisor, Customer-centric, Registered groups. */
export const WHY_PANASUNA: readonly WhyPillar[] = [
  {
    id: "timely-payment",
    title: { en: "Timely Payment", ta: "உரிய நேரத்தில் பணம்" },
    body: {
      en: "We understand how vital timely cash flow is to a business, so we use technology to pay our clients on time. We honour your faith through every payment.",
      ta: "வணிகத்திற்கு உரிய நேரத்தில் பணப்புழக்கம் எவ்வளவு முக்கியம் என்பதை அறிவோம்; எனவே தொழில்நுட்பத்தின் உதவியுடன் வாடிக்கையாளர்களுக்கு உரிய நேரத்தில் பணம் வழங்குகிறோம். ஒவ்வொரு பணப்பட்டுவாடாவிலும் உங்கள் நம்பிக்கையைக் காக்கிறோம்.",
    },
    icon: "pillar-payout",
  },
  {
    id: "tech-convenience",
    title: { en: "Convenience Through Technology", ta: "தொழில்நுட்பம் தரும் வசதி" },
    body: {
      en: "We embrace technology to make customer interactions and financial transactions more convenient.",
      ta: "வாடிக்கையாளர் தொடர்புகளையும் நிதிப் பரிவர்த்தனைகளையும் மேலும் வசதியாக்க, தொழில்நுட்பத்தை நாங்கள் ஏற்றுக்கொள்கிறோம்.",
    },
    icon: "pillar-tech",
  },
  {
    id: "fdr-security",
    title: { en: "100% Bank FDR Security", ta: "100% வங்கி FDR பாதுகாப்பு" },
    body: {
      en: "100% of every chit's value is deposited as a Fixed Deposit Receipt in a Scheduled Bank, under strict Tamil Nadu Chit Funds Act governance, so your capital stays completely safe.",
      ta: "ஒவ்வொரு சீட்டுத் தொகையின் 100%-ம் ஷெட்யூல்டு வங்கியில் நிரந்தர வைப்பு ரசீதாக (FDR) வைக்கப்படுகிறது; தமிழ்நாடு சீட்டு நிதிச் சட்டத்தின் கடுமையான நிர்வாகத்தின் கீழ், உங்கள் மூலதனம் முழுமையாகப் பாதுகாக்கப்படுகிறது.",
    },
    chips: [
      { en: "100% FDR", ta: "100% FDR" },
      { en: "Scheduled Bank", ta: "ஷெட்யூல்டு வங்கி" },
      { en: "TN Chit Funds Act", ta: "த.நா. சீட்டு நிதிச் சட்டம்" },
    ],
    icon: "pillar-shield",
  },
  {
    id: "trusted-advisor",
    title: { en: "Trusted Advisor", ta: "நம்பகமான ஆலோசகர்" },
    body: {
      en: "We provide real-time guidance, backed by proven best practices, to help you plan and allocate your resources.",
      ta: "சிறந்த நடைமுறைகளின் அடிப்படையில், உங்கள் நிதி வளங்களைத் திட்டமிட உடனடி வழிகாட்டுதல் வழங்குகிறோம்.",
    },
    icon: "pillar-advisor",
  },
  {
    id: "customer-centric",
    title: { en: "Customer-Centric Approach", ta: "வாடிக்கையாளருக்கே முன்னுரிமை" },
    body: {
      en: "We believe our clients' business growth is Panasuna's growth. We care for every customer and keep our service warm and welcoming.",
      ta: "எங்கள் வாடிக்கையாளர்களின் வணிக வளர்ச்சியே பனசுனாவின் வளர்ச்சி என்பது எங்கள் நம்பிக்கை. ஒவ்வொரு வாடிக்கையாளரிடமும் அக்கறையுடன், இனிமையான சூழலில் சேவை செய்கிறோம்.",
    },
    icon: "pillar-handshake",
  },
  {
    id: "registered-groups",
    title: { en: "Registered Chit Groups", ta: "பதிவு செய்யப்பட்ட சீட்டுக் குழுக்கள்" },
    body: {
      en: "Every single group is registered with the government for compliance.",
      ta: "ஒவ்வொரு குழுவும் சட்ட இணக்கத்திற்காக அரசிடம் பதிவு செய்யப்பட்டுள்ளது.",
    },
    icon: "pillar-registered",
  },
];

// ─── Home: trust indicators & tabbed "Trust engine" ────────────────────────────

const PLAN_VALUE_MIN = Math.min(...CHIT_PLANS.map((p) => p.chitValue));
const PLAN_VALUE_MAX = Math.max(...CHIT_PLANS.map((p) => p.chitValue));

/** ₹1 Lakh / ₹1 Crore (en) — ₹1 லட்சம் / ₹1 கோடி (ta): whole lakh or crore figures spelled out. */
function lakhCrore(amount: number, locale: Locale): string {
  const crore = amount >= 1e7;
  const n = crore ? amount / 1e7 : amount / 1e5;
  const unit = locale === "ta" ? (crore ? "கோடி" : "லட்சம்") : crore ? "Crore" : "Lakh";
  return `₹${n} ${unit}`;
}

export interface TrustIndicator {
  id: "established" | "fdr" | "plans" | "tenure";
  /** Animated as a rolling counter; only verified figures. */
  value: number;
  /** Static text before the counter, e.g. "15 – " for a range. */
  prefix?: string;
  suffix: "" | "%" | "+";
  label: Localized;
  detail: Localized;
}

export const TRUST_SECTION = {
  title: { en: "Half a century of trust, in numbers.", ta: "அரை நூற்றாண்டு நம்பிக்கை, எண்களில்." } as Localized,
  /** Client copy (Nov 2026): three short paragraphs; they replace the company blurb that the heritage tab repeated. */
  leadParagraphs: [
    {
      en: "We believe that financial planning is not just about saving money; it is about being prepared for opportunities and life's important milestones.",
      ta: "நிதித் திட்டமிடல் என்பது பணத்தைச் சேமிப்பது மட்டுமல்ல; வாய்ப்புகளுக்கும் வாழ்க்கையின் முக்கியத் தருணங்களுக்கும் தயாராக இருப்பதே என்று நாங்கள் நம்புகிறோம்.",
    },
    {
      en: "With a strong foundation in the chit industry and a customer-first approach, we strive to make chit funds more accessible, transparent and convenient.",
      ta: "சீட்டுத் துறையில் வலுவான அடித்தளமும் வாடிக்கையாளருக்கே முன்னுரிமை என்ற அணுகுமுறையும் கொண்டு, சீட்டு நிதிகளை மேலும் எளிதில் அணுகக்கூடியதாகவும், வெளிப்படையாகவும், வசதியாகவும் மாற்ற முயல்கிறோம்.",
    },
    {
      en: "At Panasuna, our commitment remains simple: to serve our customers with integrity, experience and dedication.",
      ta: "பனசுனாவில் எங்கள் உறுதி எளிமையானது: நேர்மை, அனுபவம், அர்ப்பணிப்புடன் வாடிக்கையாளர்களுக்குச் சேவை செய்வது.",
    },
  ] as readonly Localized[],
  /** Display order is the client's: Established, Security deposit, Tenure, then Plans & groups. */
  indicators: [
    {
      id: "established",
      value: ESTABLISHED_YEAR,
      suffix: "",
      label: { en: "Established in Salem", ta: "சேலத்தில் நிறுவப்பட்டது" },
      detail: COMPANY.yearsOfTrust,
    },
    {
      id: "fdr",
      value: 100,
      suffix: "%",
      label: { en: "Security deposit", ta: "பாதுகாப்பு வைப்பு" },
      detail: {
        en: "of the chit value, held in a Scheduled Bank as an FDR",
        ta: "சீட்டுத் தொகைக்கு, ஷெட்யூல்டு வங்கியில் FDR ஆக",
      },
    },
    {
      id: "tenure",
      value: CHIT_DURATIONS[CHIT_DURATIONS.length - 1],
      prefix: `${CHIT_DURATIONS[0]} – `,
      suffix: "",
      label: { en: "Months tenure range", ta: "மாதக் கால வரம்பு" },
      detail: {
        en: "Short term (15–30 months) or long term (40–60 months), always paid monthly",
        ta: "குறுகிய காலம் (15–30 மாதங்கள்) அல்லது நீண்ட காலம் (40–60 மாதங்கள்); எப்போதும் மாதத் தவணை",
      },
    },
    {
      id: "plans",
      value: PLAN_COUNT_HEADLINE,
      suffix: "+",
      label: PLAN_COUNT_LABEL,
      detail: {
        en: `${lakhCrore(PLAN_VALUE_MIN, "en")} to ${lakhCrore(PLAN_VALUE_MAX, "en")}`,
        ta: `${lakhCrore(PLAN_VALUE_MIN, "ta")} முதல் ${lakhCrore(PLAN_VALUE_MAX, "ta")} வரை`,
      },
    },
  ] as readonly TrustIndicator[],
  tabs: {
    heritage: { en: "50 years of trust", ta: "50 ஆண்டுகால நம்பிக்கை" } as Localized,
    engine: { en: "Trust engine", ta: "நம்பிக்கைப் பொறிமுறை" } as Localized,
    why: { en: "Why Panasuna?", ta: "ஏன் பனசுனா?" } as Localized,
  },
  heritage: {
    title: { en: `Stable and prudent since ${ESTABLISHED_YEAR}.`, ta: `${ESTABLISHED_YEAR} முதல் நிலையானது, விவேகமானது.` } as Localized,
    dialCaption: { en: "years of trust", ta: "ஆண்டுகால நம்பிக்கை" } as Localized,
    facts: [
      { label: { en: "Established", ta: "நிறுவப்பட்டது" }, value: { en: `${ESTABLISHED_YEAR}, Salem`, ta: `${ESTABLISHED_YEAR}, சேலம்` } },
      {
        label: { en: "Management", ta: "நிர்வாகம்" },
        value: { en: "A Board of five directors", ta: "ஐந்து இயக்குநர்கள் கொண்ட குழு" },
      },
      { label: { en: "Head office", ta: "தலைமை அலுவலகம்" }, value: CONTACT.addressOneLine },
    ] as readonly { label: Localized; value: Localized }[],
    mission: ABOUT.mission,
  },
  engine: {
    title: { en: "Five layers around every rupee.", ta: "ஒவ்வொரு ரூபாயைச் சுற்றியும் ஐந்து அடுக்குகள்." } as Localized,
    hint: { en: "Hover or tap a layer to find it on the dial.", ta: "வட்டில் காண, ஓர் அடுக்கைத் தொடுங்கள்." } as Localized,
    centre: { en: "Your chit", ta: "உங்கள் சீட்டு" } as Localized,
    /** Innermost first. Every claim traces to the old site (Security for money, Why us, Board). */
    layers: [
      {
        id: "security",
        name: { en: "100% security deposit", ta: "100% பாதுகாப்பு வைப்பு" },
        body: TRUST_FACTS.find((f) => f.id === "fdr-security")!.body,
      },
      {
        id: "transparency",
        name: { en: "Transparent auctions", ta: "வெளிப்படையான ஏலம்" },
        body: {
          en: "We adhere to standard service norms and communicate bid details promptly to every member.",
          ta: "நிலையான சேவை நெறிமுறைகளைப் பின்பற்றி, ஏல விவரங்களை ஒவ்வொரு உறுப்பினருக்கும் உடனுக்குடன் தெரிவிக்கிறோம்.",
        },
      },
      {
        id: "dividend",
        name: { en: "Dividends for members", ta: "உறுப்பினர்களுக்கு ஈவுத்தொகை" },
        body: {
          en: "Each auction's discount is shared among members as a dividend, lowering what you pay. Dividends vary with every auction.",
          ta: "ஒவ்வொரு ஏலத்தின் தள்ளுபடியும் உறுப்பினர்களுக்கு ஈவுத்தொகையாகப் பகிரப்பட்டு, நீங்கள் செலுத்தும் தொகையைக் குறைக்கிறது. ஈவுத்தொகை ஒவ்வொரு ஏலத்திற்கும் மாறுபடும்.",
        },
      },
      {
        id: "collection",
        name: { en: "Disciplined monthly collection", ta: "ஒழுங்கான மாத வசூல்" },
        body: {
          en: "A 100% monthly installment cycle: one fixed installment each month, lowered by that month's auction dividend and collected at your doorstep by our reliable team.",
          ta: "100% மாதத் தவணைச் சுழற்சி: ஒவ்வொரு மாதமும் ஒரே நிலையான தவணை; அந்த மாத ஏல ஈவுத்தொகையால் குறைந்து, எங்கள் நம்பகமான குழுவால் உங்கள் வீட்டு வாசலிலேயே பெறப்படுகிறது.",
        },
      },
      {
        id: "governance",
        name: { en: "Board governance", ta: "இயக்குநர் குழு நிர்வாகம்" },
        body: {
          en: "Managed by a Board of Directors, serving savers and businesses from Salem since 1975.",
          ta: "இயக்குநர் குழுவால் நிர்வகிக்கப்பட்டு, 1975 முதல் சேலத்திலிருந்து சேமிப்பாளர்களுக்கும் வணிகர்களுக்கும் சேவை.",
        },
      },
    ] as readonly { id: string; name: Localized; body: Localized }[],
  },
  why: {
    title: { en: "Six reasons to choose Panasuna.", ta: "பனசுனாவைத் தேர்ந்தெடுக்க ஆறு காரணங்கள்." } as Localized,
  },
};

// ─── About chit funds ─────────────────────────────────────────────────────────

export const CHIT_FUND_BASICS = {
  whatIs: {
    title: { en: "What is a chit fund?", ta: "சீட்டு நிதி என்றால் என்ன?" } as Localized,
    body: {
      en: "A chit fund is a savings scheme practised in India for centuries. It began as an informal association of traders and households within communities, and it lets people of modest means turn small, regular savings into a lump sum.",
      ta: "சீட்டு நிதி என்பது இந்தியாவில் பல நூற்றாண்டுகளாக நடைமுறையில் உள்ள ஒரு சேமிப்புத் திட்டம். சமூகங்களுக்குள் வணிகர்களும் குடும்பங்களும் இணைந்த முறைசாரா அமைப்பாகத் தொடங்கிய இது, சிறிய வழக்கமான சேமிப்புகளை ஒரு பெருந்தொகையாக மாற்ற உதவுகிறது.",
    } as Localized,
  },
  whyInvest: {
    title: { en: "Why people invest in chit funds", ta: "மக்கள் ஏன் சீட்டில் முதலீடு செய்கிறார்கள்" } as Localized,
    points: [
      { en: "Simple to join, with minimal formalities", ta: "குறைந்த நடைமுறைகளுடன் எளிதாகச் சேரலாம்" },
      { en: "Attractive returns through dividends", ta: "ஈவுத்தொகை மூலம் கவர்ச்சிகரமான வருவாய்" },
      { en: "Start with a small monthly deposit", ta: "சிறிய மாதத் தொகையுடன் தொடங்கலாம்" },
      { en: "A borrowing-cum-savings instrument", ta: "கடனும் சேமிப்பும் இணைந்த நிதிக் கருவி" },
    ] as readonly Localized[],
  },
};

// ─── How chits work: the 5-stage scroll journey (home §6, /how-chits-work) ─────

export type JourneyStageId = "join" | "pay" | "auction" | "bidder" | "payout";

/** Figures the journey fills in from its example plan; the data never types a rupee amount. */
export type JourneyFactKey =
  | "members"
  | "monthly"
  | "pool"
  | "duration"
  | "beforeDividends"
  | "discount"
  | "cap"
  | "commission"
  | "dividendPool"
  | "share"
  | "next"
  | "prize"
  | "security";

export interface JourneyStage {
  id: JourneyStageId;
  title: Localized;
  body: Localized;
  facts: readonly { key: JourneyFactKey; label: Localized }[];
}

/**
 * editorial: stages 4 and 5 describe how the bidder is chosen and paid in general terms only.
 * VERIFY with the client before adding specifics (tie-breaks, the exact documents or sureties asked for).
 */
export const HOW_CHITS_WORK = {
  sceneLabel: {
    en: "Animated 3D illustration of the five stages: forty crown coins form a group, pay into the calendar ring, bid at the auction podium, share the dividend, and the winning coin enters the vault guarded by the FDR shield.",
    ta: "ஐந்து நிலைகளின் 3D விளக்கம்: நாற்பது கிரீட நாணயங்கள் குழுவாகி, நாட்காட்டி வளையத்தில் செலுத்தி, ஏல மேடையில் ஏலம் கேட்டு, ஈவுத்தொகையைப் பகிர்ந்து, வென்ற நாணயம் FDR கேடயம் காக்கும் பெட்டகத்தில் சேர்கிறது.",
  } as Localized,
  title: { en: "How a chit works, in five stages.", ta: "சீட்டு இயங்கும் விதம், ஐந்து நிலைகளில்." } as Localized,
  lead: {
    en: "Follow one real Panasuna group from the day it forms to the day a member takes the chit amount home.",
    ta: "ஓர் உண்மையான பனசுனா குழு உருவாகும் நாள் முதல், ஓர் உறுப்பினர் சீட்டுத் தொகையைப் பெறும் நாள் வரை பின்தொடருங்கள்.",
  } as Localized,
  /** The popular ₹10,00,000 / 40-month plan: 40 members, as in the stage copy. */
  examplePlanId: "cv-1000000-40m",
  exampleDiscountRate: 0.2,
  example: { en: "Example group", ta: "எடுத்துக்காட்டுக் குழு" } as Localized,
  exampleNote: {
    en: "A real Panasuna plan. The 20% winning discount is an illustration; real bids vary every month.",
    ta: "உண்மையான பனசுனா திட்டம். 20% வெற்றித் தள்ளுபடி ஒரு எடுத்துக்காட்டு மட்டுமே; உண்மையான ஏலம் மாதந்தோறும் மாறுபடும்.",
  } as Localized,
  stagesLabel: { en: "Stages", ta: "நிலைகள்" } as Localized,
  stage: { en: "Stage", ta: "நிலை" } as Localized,
  collection: { en: "Collected at your doorstep", ta: "உங்கள் வீட்டு வாசலில் வசூல்" } as Localized,
  monthlyOnly: { en: "Fixed monthly installments only", ta: "நிலையான மாதத் தவணைகள் மட்டும்" } as Localized,
  scrollHint: { en: "Scroll to move through the stages", ta: "நிலைகளைக் கடக்க உருட்டுங்கள்" } as Localized,
  tryIt: {
    simulator: { en: "Try other bids in the auction simulator", ta: "ஏல மாதிரியில் வேறு ஏலங்களை முயன்று பாருங்கள்" } as Localized,
    calculator: { en: "See the whole cycle in the calculator", ta: "முழுச் சுழற்சியைக் கணிப்பானில் பாருங்கள்" } as Localized,
  },
  stages: [
    {
      id: "join",
      title: { en: "Join a chit group", ta: "சீட்டுக் குழுவில் சேருங்கள்" },
      body: {
        en: "Choose a plan and join its group. A group has as many members as the plan has months — a 40-month chit has 40 members. Everyone pays the same monthly subscription, so together the group pools the full chit value every month. The value, duration and subscription are written into the chit agreement you sign.",
        ta: "ஒரு திட்டத்தைத் தேர்ந்தெடுத்து அதன் குழுவில் சேருங்கள். திட்டத்தில் எத்தனை மாதங்களோ, குழுவில் அத்தனை உறுப்பினர்கள் — 40 மாதச் சீட்டில் 40 பேர். அனைவரும் ஒரே மாதச் சந்தாவைச் செலுத்துவதால், ஒவ்வொரு மாதமும் முழுச் சீட்டுத் தொகை சேர்கிறது. தொகை, காலம், சந்தா ஆகியவை நீங்கள் கையெழுத்திடும் சீட்டு ஒப்பந்தத்தில் இடம்பெறும்.",
      },
      facts: [
        { key: "members", label: { en: "Members", ta: "உறுப்பினர்கள்" } },
        { key: "monthly", label: { en: "Each pays monthly", ta: "ஒவ்வொருவரின் மாதச் சந்தா" } },
        { key: "pool", label: { en: "Pooled every month", ta: "ஒவ்வொரு மாதமும் சேரும் தொகை" } },
        { key: "duration", label: { en: "Duration", ta: "காலம்" } },
      ],
    },
    {
      id: "pay",
      title: { en: "Pay monthly installments", ta: "மாதத் தவணைகளைச் செலுத்துங்கள்" },
      body: {
        en: "Each member pays one fixed monthly installment into the common pool, for the life of the chit. Our collection team comes to your doorstep each month. After every auction, your dividend is deducted, so the next month's installment is smaller.",
        ta: "சீட்டுக் காலம் முழுவதும், ஒவ்வொரு உறுப்பினரும் ஒரே நிலையான மாதத் தவணையைப் பொது நிதியில் செலுத்துகிறார். எங்கள் வசூல் குழு ஒவ்வொரு மாதமும் உங்கள் வீட்டு வாசலுக்கே வரும். ஒவ்வொரு ஏலத்திற்குப் பிறகும் உங்கள் ஈவுத்தொகை கழிக்கப்படுவதால், அடுத்த மாதத் தவணை குறைகிறது.",
      },
      facts: [
        { key: "monthly", label: { en: "Monthly subscription", ta: "மாதச் சந்தா" } },
        { key: "beforeDividends", label: { en: "Over the chit, before dividends", ta: "சீட்டுக் காலத்தில், ஈவுத்தொகைக்கு முன்" } },
      ],
    },
    {
      id: "auction",
      title: { en: "Participate in the auction", ta: "ஏலத்தில் பங்கேற்றிடுங்கள்" },
      body: {
        en: `Every month the group holds an open auction for that month's chit. A member who needs the money now bids by offering a discount — the part of the chit value they are willing to give up, also called the foregone amount. The discount cannot exceed ${MAX_DISCOUNT_PCT} of the chit value.`,
        ta: `ஒவ்வொரு மாதமும் அந்த மாதச் சீட்டுக்காகக் குழு வெளிப்படையான ஏலம் நடத்துகிறது. இப்போதே பணம் தேவைப்படும் உறுப்பினர், சீட்டுத் தொகையில் தான் விட்டுக்கொடுக்கத் தயாராக உள்ள பகுதியைத் தள்ளுபடியாக (விட்டுக்கொடுக்கும் தொகை) முன்வைத்து ஏலம் கேட்கிறார். தள்ளுபடி சீட்டுத் தொகையின் ${MAX_DISCOUNT_PCT}-ஐ மிஞ்சக் கூடாது.`,
      },
      facts: [
        { key: "discount", label: { en: "Winning discount in this example", ta: "இந்த எடுத்துக்காட்டில் வெற்றித் தள்ளுபடி" } },
        { key: "cap", label: { en: "Most a bidder may give up", ta: "ஏலதாரர் விட்டுக்கொடுக்கக்கூடிய அதிகபட்சம்" } },
      ],
    },
    {
      id: "bidder",
      title: { en: "Determine the successful bidder", ta: "வெற்றி ஏலதாரரைத் தீர்மானித்தல்" },
      body: {
        en: "The member offering the highest discount, within the chit agreement and the Chit Funds Act, becomes the successful bidder, and we communicate the bid details promptly. The discount, less the foreman's commission, is shared equally among all members as a dividend — so everyone's next installment falls.",
        ta: "சீட்டு ஒப்பந்தம் மற்றும் சீட்டு நிதிச் சட்ட வரம்புகளுக்குள், அதிகத் தள்ளுபடியை முன்வைக்கும் உறுப்பினர் வெற்றி ஏலதாரர் ஆகிறார்; ஏல விவரங்களை உடனுக்குடன் தெரிவிக்கிறோம். நிறுவனக் கமிஷன் போக, மீதித் தள்ளுபடி அனைத்து உறுப்பினர்களுக்கும் சமமாக ஈவுத்தொகையாகப் பகிரப்படுகிறது — அதனால் அனைவரின் அடுத்த தவணையும் குறைகிறது.",
      },
      facts: [
        { key: "commission", label: { en: `Foreman's commission (assumed ${COMMISSION_PCT})`, ta: `நிறுவனக் கமிஷன் (${COMMISSION_PCT} எனக் கொண்டு)` } },
        { key: "dividendPool", label: { en: "Dividend pool", ta: "ஈவுத்தொகைத் தொகுப்பு" } },
        { key: "share", label: { en: "Each member's dividend", ta: "ஒவ்வொரு உறுப்பினரின் ஈவுத்தொகை" } },
        { key: "next", label: { en: "Next month's installment", ta: "அடுத்த மாதத் தவணை" } },
      ],
    },
    {
      id: "payout",
      title: { en: "Receive the chit amount", ta: "சீட்டுத் தொகையைப் பெறுங்கள்" },
      body: {
        en: "The successful bidder receives the chit value less their discount, paid on time. As installments are still due, they first provide the documents and surety the chit agreement requires. All along, Panasuna keeps a security deposit equal to 100% of the chit value in a Scheduled Bank as an FDR.",
        ta: "வெற்றி ஏலதாரர், சீட்டுத் தொகையிலிருந்து தமது தள்ளுபடி கழித்த தொகையை உரிய நேரத்தில் பெறுகிறார். இன்னும் தவணைகள் செலுத்த வேண்டியிருப்பதால், சீட்டு ஒப்பந்தம் கோரும் ஆவணங்களையும் ஜாமீனையும் முதலில் வழங்குகிறார். இதற்கிடையே, சீட்டுத் தொகையின் 100%-க்குச் சமமான பாதுகாப்பு வைப்பைப் பனசுனா ஷெட்யூல்டு வங்கியில் FDR-ஆக வைத்திருக்கிறது.",
      },
      facts: [
        { key: "prize", label: { en: "Paid to the successful bidder", ta: "வெற்றி ஏலதாரருக்கு வழங்கப்படுவது" } },
        { key: "security", label: { en: "Bank FDR security, 100% of the chit", ta: "வங்கி FDR பாதுகாப்பு, சீட்டுத் தொகையின் 100%" } },
      ],
    },
  ] as readonly JourneyStage[],
};

export const HOW_CHITS_WORK_PAGE = {
  title: { en: "How chits work.", ta: "சீட்டு இயங்கும் விதம்." } as Localized,
  lead: CHIT_FUND_BASICS.whatIs.body,
  next: {
    title: { en: "Ready to find your chit?", ta: "உங்கள் சீட்டைக் கண்டறியத் தயாரா?" } as Localized,
    find: { en: "Find your chit", ta: "உங்கள் சீட்டைக் கண்டறியுங்கள்" } as Localized,
    calculator: { en: "Open the calculator", ta: "கணிப்பானைத் திறக்க" } as Localized,
  },
};

// ─── Comparing other tools (6) ────────────────────────────────────────────────

export interface Comparison {
  id: "fixed-deposit" | "recurring-deposit" | "bank-loan" | "stock-market" | "mutual-fund" | "credit-card";
  instrument: Localized;
  title: Localized;
  /** What people reach for it to do — the matrix groups by this. */
  use: "save" | "borrow" | "invest";
  /**
   * Indicative Indian market rate, % a year (client revision, Nov 2026). Banks revise rates often, so the page
   * shows them as indicative. `note` is the one-line catch that goes with the number.
   */
  rate: { min?: number; max: number; approx?: boolean; label: Localized; note?: Localized } | null;
  chit: Localized<readonly string[]>;
  other: Localized<readonly string[]>;
  mantra?: { chit: Localized; other: Localized };
}

export const COMPARISONS: readonly Comparison[] = [
  {
    id: "fixed-deposit",
    use: "save",
    instrument: { en: "Fixed deposits", ta: "நிரந்தர வைப்பு" },
    title: { en: "Chits vs fixed deposits", ta: "சீட்டு vs நிரந்தர வைப்பு" },
    rate: {
      min: 6.5,
      max: 7.5,
      label: { en: "Bank FD interest", ta: "வங்கி நிரந்தர வைப்பு வட்டி" },
      note: {
        en: "Interest is taxable, the money is locked in, and early withdrawal carries a penalty. Reaching a bigger sum early means taking a loan against the FD.",
        ta: "வட்டிக்கு வரி உண்டு, பணம் முடக்கப்படும், முன்கூட்டி எடுத்தால் அபராதம். பெரிய தொகையை முன்கூட்டியே பெற FD-மீது கடன் வாங்க வேண்டும்.",
      },
    },
    chit: {
      en: [
        "Patient savers can earn an effective dividend gain of about 8–12% a year, above typical FD rates.",
        "Returns are paid in the form of dividends.",
        "If you have a lump sum, you can invest it in another chit.",
        "Use the funds for any planned or unplanned expense — or wait until the end of the chit and enjoy higher dividends.",
      ],
      ta: [
        "பொறுமையாகச் சேமிப்போர் ஆண்டுக்குச் சுமார் 8–12% திறன்மிகு ஈவுத்தொகை ஆதாயம் பெறலாம்; இது வழக்கமான FD வட்டியை விட அதிகம்.",
        "வருவாய் ஈவுத்தொகையாக (டிவிடெண்ட்) வழங்கப்படுகிறது.",
        "கையில் மொத்தத் தொகை இருந்தால், அதை மற்றொரு சீட்டில் முதலீடு செய்யலாம்.",
        "திட்டமிட்ட அல்லது எதிர்பாராத எந்தச் செலவுக்கும் நிதியைப் பயன்படுத்தலாம் — அல்லது சீட்டு முடியும் வரை காத்திருந்து அதிக ஈவுத்தொகையைப் பெறலாம்.",
      ],
    },
    other: {
      en: [
        "A fixed deposit is locked in for a pre-determined period.",
        "Banks pay about 6.5–7.5% a year, and the interest is taxable.",
        "Withdrawing early attracts a penalty.",
        "A fixed deposit is illiquid.",
        "The principal cannot be used for unforeseen expenses.",
        "In a cumulative deposit, the entire amount is returned only on maturity.",
      ],
      ta: [
        "நிரந்தர வைப்பு முன்கூட்டியே நிர்ணயிக்கப்பட்ட காலத்திற்கு முடக்கப்படுகிறது.",
        "வங்கிகள் ஆண்டுக்குச் சுமார் 6.5–7.5% வட்டி வழங்குகின்றன; அந்த வட்டிக்கு வரி உண்டு.",
        "முன்கூட்டியே எடுத்தால் அபராதம் விதிக்கப்படும்.",
        "நிரந்தர வைப்பை எளிதில் பணமாக்க முடியாது.",
        "எதிர்பாராத செலவுகளுக்கு அசல் தொகையைப் பயன்படுத்த முடியாது.",
        "கூட்டு வட்டி வைப்பில், முழுத் தொகையும் முதிர்வின்போது மட்டுமே திருப்பித் தரப்படும்.",
      ],
    },
  },
  {
    id: "recurring-deposit",
    use: "save",
    instrument: { en: "Recurring deposits", ta: "தொடர் வைப்பு" },
    title: { en: "Chits vs recurring deposits", ta: "சீட்டு vs தொடர் வைப்பு" },
    rate: {
      min: 6.5,
      max: 7.25,
      label: { en: "Bank RD interest", ta: "வங்கி தொடர் வைப்பு வட்டி" },
      note: {
        en: "Pays out only at the end of the term. You cannot withdraw the full target sum in month 3 or 6 for an urgent business or family need.",
        ta: "கால முடிவில் மட்டுமே தொகை கிடைக்கும். அவசரத் தொழில் அல்லது குடும்பத் தேவைக்கு 3 அல்லது 6-ஆம் மாதத்தில் முழு இலக்குத் தொகையை எடுக்க முடியாது.",
      },
    },
    chit: {
      en: [
        "Put the same monthly amount into a chit and a patient saver can earn about 8–12% a year in dividends.",
        "A chit also lets you bid for the full sum in an early month, which a recurring deposit never allows.",
      ],
      ta: [
        "அதே மாதத் தொகையைச் சீட்டில் செலுத்தினால், பொறுமையாகச் சேமிப்போர் ஆண்டுக்குச் சுமார் 8–12% ஈவுத்தொகை ஈட்டலாம்.",
        "ஆரம்ப மாதத்திலேயே முழுத் தொகைக்கு ஏலம் கேட்கவும் சீட்டில் முடியும்; தொடர் வைப்பில் இது ஒருபோதும் சாத்தியமில்லை.",
      ],
    },
    other: {
      en: [
        "You deposit a fixed minimum amount every month, and the bank pays interest at pre-determined rates — usually lower than fixed-deposit rates.",
        "On maturity, you receive the principal deposited plus the interest payable.",
        "Banks pay about 6.5–7.25% a year, and rates change with regulation.",
      ],
      ta: [
        "ஒவ்வொரு மாதமும் நிலையான குறைந்தபட்சத் தொகையைச் செலுத்துகிறீர்கள்; வங்கி முன்னரே நிர்ணயிக்கப்பட்ட வட்டி தருகிறது — இது பொதுவாக நிரந்தர வைப்பு வட்டியை விடக் குறைவு.",
        "முதிர்வின்போது, செலுத்திய அசலும் வட்டியும் வழங்கப்படும்.",
        "வங்கிகள் ஆண்டுக்குச் சுமார் 6.5–7.25% வட்டி வழங்குகின்றன; விதிமுறைகளுக்கேற்ப இது மாறும்.",
      ],
    },
  },
  {
    id: "bank-loan",
    use: "borrow",
    instrument: { en: "Bank personal & business loans", ta: "வங்கித் தனிநபர் & தொழிற்கடன்" },
    title: { en: "Chits vs bank loans", ta: "சீட்டு vs வங்கிக் கடன்" },
    rate: {
      min: 12,
      max: 18,
      label: { en: "Personal & business loan interest", ta: "தனிநபர் & தொழிற்கடன் வட்டி" },
      note: {
        en: "Plus 1–3% processing fees, strict CIBIL and collateral barriers, and every rupee of interest is pure outflow with no dividend back.",
        ta: "கூடுதலாக 1–3% செயலாக்கக் கட்டணம், கடுமையான CIBIL மற்றும் பிணைய நிபந்தனைகள்; செலுத்தும் வட்டி முழுவதும் செலவு, ஈவுத்தொகை திரும்ப வராது.",
      },
    },
    chit: {
      en: [
        "A smart salaried employee can plan a car purchase using a chit.",
        "An early bidder's effective net borrowing cost is about 10–14% a year, because monthly dividends offset the bid discount.",
        "No prepayment penalty, no processing fee, and far less paperwork and fewer sureties than a personal loan.",
      ],
      ta: [
        "திட்டமிடும் சம்பளதாரர் சீட்டு மூலம் கார் வாங்குவதைத் திட்டமிடலாம்.",
        "முன்னதாக ஏலம் எடுப்பவரின் திறன்மிகு நிகரக் கடன் செலவு ஆண்டுக்குச் சுமார் 10–14%; மாத ஈவுத்தொகை ஏலத் தள்ளுபடியை ஈடுசெய்கிறது.",
        "முன்கூட்டிச் செலுத்தும் அபராதம் இல்லை, செயலாக்கக் கட்டணம் இல்லை; தனிநபர் கடனை விட ஆவணங்களும் ஜாமீன் தேவைகளும் மிகக் குறைவு.",
      ],
    },
    other: {
      en: [
        "Rapid growth in banking has led to an explosion of personal loans to young salaried employees in IT, BPO and other sectors.",
        "This segment has higher disposable income and is willing to spend on cars and motorbikes.",
        "Banks and financial institutions charge 12–18% a year on personal and unsecured business loans, plus 1–3% in processing fees.",
      ],
      ta: [
        "வங்கித் துறையின் வேகமான வளர்ச்சியால், ஐடி, பிபிஓ உள்ளிட்ட துறைகளில் பணிபுரியும் இளம் சம்பளதாரர்களுக்குத் தனிநபர் கடன்கள் பெருமளவில் வழங்கப்படுகின்றன.",
        "இவர்களிடம் செலவழிக்கக்கூடிய வருமானம் அதிகம்; கார், மோட்டார் சைக்கிள் வாங்கச் செலவிடத் தயாராக உள்ளனர்.",
        "தனிநபர் மற்றும் பிணையற்ற தொழிற்கடன்களுக்கு வங்கிகளும் நிதி நிறுவனங்களும் ஆண்டுக்கு 12–18% வட்டியும், 1–3% செயலாக்கக் கட்டணமும் வசூலிக்கின்றன.",
      ],
    },
  },
  {
    id: "stock-market",
    use: "invest",
    instrument: { en: "Stock market", ta: "பங்குச் சந்தை" },
    title: { en: "Chits vs the stock market", ta: "சீட்டு vs பங்குச் சந்தை" },
    rate: null,
    chit: {
      en: [
        "With a lower-risk instrument like a chit, you don't need to keep calculating whether stock-market returns will beat it.",
      ],
      ta: [
        "சீட்டு போன்ற குறைந்த அபாயமுள்ள முதலீட்டில், பங்குச் சந்தை வருவாய் அதை விட அதிகமாக இருக்குமா என்று தொடர்ந்து கணக்கிட வேண்டியதில்லை.",
      ],
    },
    other: {
      en: [
        "Investing in the stock market demands a lot of personal time and effort.",
        "After buying a stock, you can't stop worrying: you must track the market and the company, and constantly decide whether to hold or sell.",
        "Even a five-year investor must keep abreast of what is happening in the market.",
      ],
      ta: [
        "பங்குச் சந்தையில் முதலீடு செய்ய அதிக நேரமும் உழைப்பும் தேவை.",
        "பங்கை வாங்கிய பிறகும் நிம்மதியாக இருக்க முடியாது: சந்தையையும் நிறுவனத்தையும் கண்காணித்து, வைத்திருப்பதா விற்பதா என்று தொடர்ந்து முடிவெடுக்க வேண்டும்.",
        "ஐந்தாண்டு காலத்திற்கு முதலீடு செய்பவரும் சந்தை நிலவரங்களைத் தொடர்ந்து அறிந்திருக்க வேண்டும்.",
      ],
    },
  },
  {
    id: "mutual-fund",
    use: "invest",
    instrument: { en: "Mutual funds & SIPs", ta: "பரஸ்பர நிதி & SIP" },
    title: { en: "Chits vs mutual funds", ta: "சீட்டு vs பரஸ்பர நிதி" },
    rate: null,
    chit: {
      en: [
        "Investing in a chit is similar to an SIP: you invest monthly in the chit group you choose.",
        "Your net monthly installment varies with the bidding in the group.",
        "There are no entry or exit charges, and the risk is very low compared with a mutual fund.",
      ],
      ta: [
        "சீட்டில் முதலீடு செய்வது SIP போன்றதே: நீங்கள் தேர்ந்தெடுக்கும் சீட்டுக் குழுவில் மாதந்தோறும் முதலீடு செய்கிறீர்கள்.",
        "குழுவில் நடக்கும் ஏலப் போட்டியைப் பொறுத்து நிகர மாதத் தவணை மாறுபடும்.",
        "நுழைவு அல்லது வெளியேறும் கட்டணம் இல்லை; பரஸ்பர நிதியுடன் ஒப்பிடும்போது அபாயம் மிகக் குறைவு.",
      ],
    },
    other: {
      en: [
        "In a Systematic Investment Plan (SIP), investments are made at regular intervals, usually monthly or quarterly.",
        "The fund company invests the money in the stock market, and every fund has a Net Asset Value (NAV).",
        "The NAV depends entirely on prevailing market conditions.",
        "The current value of your investment can fall below what you paid.",
        "Entry and exit loads — charges to join or leave the fund — may apply.",
        "Overall, a mutual fund carries moderate to high risk depending on the market.",
      ],
      ta: [
        "முறையான முதலீட்டுத் திட்டத்தில் (SIP) குறிப்பிட்ட இடைவெளிகளில், பொதுவாக மாதாந்திர அல்லது காலாண்டு அடிப்படையில் முதலீடு செய்யப்படுகிறது.",
        "நிதி நிறுவனம் அந்தப் பணத்தைப் பங்குச் சந்தையில் முதலீடு செய்கிறது; ஒவ்வொரு நிதிக்கும் நிகர சொத்து மதிப்பு (NAV) உண்டு.",
        "NAV முழுக்க முழுக்க அப்போதைய சந்தை நிலவரத்தைப் பொறுத்தது.",
        "உங்கள் முதலீட்டின் தற்போதைய மதிப்பு, நீங்கள் செலுத்தியதை விடக் குறையக்கூடும்.",
        "நிதியில் சேரவும் வெளியேறவும் நுழைவு/வெளியேற்றக் கட்டணங்கள் (லோடு) விதிக்கப்படலாம்.",
        "மொத்தத்தில், சந்தையைப் பொறுத்து பரஸ்பர நிதியில் மிதமானது முதல் அதிக அபாயம் உண்டு.",
      ],
    },
  },
  {
    id: "credit-card",
    use: "borrow",
    instrument: { en: "Credit cards", ta: "கடன் அட்டை" },
    title: { en: "Chits vs credit cards", ta: "சீட்டு vs கடன் அட்டை" },
    rate: {
      min: 36,
      max: 42,
      label: { en: "Revolving card interest", ta: "சுழற்சி அட்டை வட்டி" },
      note: {
        en: "That is 3.0–3.5% every month on the unpaid balance, plus heavy late-payment penalties.",
        ta: "செலுத்தாத நிலுவைக்கு மாதந்தோறும் 3.0–3.5% வட்டி, கூடவே கடுமையான தாமதக் கட்டணம்.",
      },
    },
    chit: {
      en: [
        "A smart investor follows the SAVE–BORROW–PAY mantra instead of BUY NOW–PAY LATER.",
        "Earn more on your savings, borrow at a lower cost, and escape exorbitant interest charges.",
        "It all comes from financial discipline: planning, investing, saving and borrowing through chits.",
      ],
      ta: [
        "புத்திசாலி முதலீட்டாளர் “இப்போது வாங்கு–பின்னர் செலுத்து” என்பதற்குப் பதிலாக “சேமி–கடன் பெறு–செலுத்து” என்ற மந்திரத்தைப் பின்பற்றுகிறார்.",
        "சேமிப்பில் அதிகம் ஈட்டுங்கள், குறைந்த செலவில் கடன் பெறுங்கள், அளவுக்கு மீறிய வட்டிச் சுமையிலிருந்து தப்புங்கள்.",
        "இதற்கு அடிப்படை நிதி ஒழுக்கம்: சீட்டு மூலம் திட்டமிடுதல், முதலீடு, சேமிப்பு மற்றும் கடன் பெறுதல்.",
      ],
    },
    other: {
      en: [
        "BUY NOW–PAY LATER tempts you to spend more than you can actually afford.",
        "Banks extend high credit limits without much thought to your ability to repay.",
        "The trap: buy more than you can afford, pay the minimum due, roll the rest into next month — a vicious cycle.",
        "Few realise that a revolving balance is charged 36–42% a year, or 3.0–3.5% every month.",
        "You end up caught in a credit card debt trap.",
      ],
      ta: [
        "“இப்போது வாங்கு–பின்னர் செலுத்து” உங்கள் சக்திக்கு மீறிச் செலவு செய்யத் தூண்டுகிறது.",
        "திருப்பிச் செலுத்தும் திறனைப் பெரிதாகக் கருதாமல் வங்கிகள் அதிகக் கடன் வரம்பை வழங்குகின்றன.",
        "சிக்கல் இதுதான்: சக்திக்கு மீறி வாங்குவது, குறைந்தபட்சத் தொகையை மட்டும் செலுத்துவது, மீதியை அடுத்த மாதத்திற்குத் தள்ளுவது — இது ஒரு தீய சுழற்சி.",
        "இப்படி நிலுவையைத் தொடர்ந்தால் ஆண்டுக்கு 36–42% (மாதம் 3.0–3.5%) வட்டி விதிக்கப்படும் என்பதைப் பலர் உணர்வதில்லை.",
        "இறுதியில் கடன் அட்டைக் கடன் வலையில் சிக்கிக்கொள்கிறீர்கள்.",
      ],
    },
    mantra: {
      chit: { en: "SAVE – BORROW – PAY", ta: "சேமி – கடன் பெறு – செலுத்து" },
      other: { en: "BUY NOW – PAY LATER", ta: "இப்போது வாங்கு – பின்னர் செலுத்து" },
    },
  },
];

/** "7.5–9.5%", "≈8.5%", "up to 40%" — or null for market-linked instruments. */
export function formatRate(rate: Comparison["rate"], locale: Locale): string | null {
  if (!rate) return null;
  if (rate.min !== undefined) return `${rate.min}–${rate.max}%`;
  if (rate.approx) return `≈${rate.max}%`;
  return locale === "ta" ? `அதிகபட்சம் ${rate.max}%` : `up to ${rate.max}%`;
}

const CREDIT_CARD = COMPARISONS.find((c) => c.id === "credit-card")!;

/** The interactive matrix on /how-chits-work. Every claim comes from COMPARISONS (old site). */
export const COMPARE_TOOLS = {
  title: { en: "A chit, against the other tools.", ta: "மற்ற நிதிக் கருவிகளுடன் ஒரு சீட்டு." } as Localized,
  lead: {
    en: "Six ways people save, borrow and invest — and how a chit compares with each, point by point.",
    ta: "மக்கள் சேமிக்கவும், கடன் பெறவும், முதலீடு செய்யவும் பயன்படுத்தும் ஆறு வழிகள் — ஒவ்வொன்றுடனும் சீட்டு எப்படி ஒப்பிடுகிறது, புள்ளிவாரியாக.",
  } as Localized,
  /** Shortcut past the journey (persona audit B5: comparisons one tap from "How it works"). */
  jump: { en: "Compare with FDs, loans and credit cards", ta: "FD, கடன், கடன் அட்டையுடன் ஒப்பிடுங்கள்" } as Localized,
  anchor: "compare",
  mantra: {
    lead: { en: "A smart investor follows", ta: "புத்திசாலி முதலீட்டாளர் பின்பற்றுவது" } as Localized,
    chit: CREDIT_CARD.mantra!.chit,
    instead: { en: "instead of", ta: "இதற்குப் பதிலாக" } as Localized,
    other: CREDIT_CARD.mantra!.other,
    /** "Earn more on your savings, borrow at a lower cost, and escape exorbitant interest charges." */
    steps: [
      { word: { en: "Save", ta: "சேமி" }, body: { en: "Earn more on your savings", ta: "சேமிப்பில் அதிகம் ஈட்டுங்கள்" } },
      { word: { en: "Borrow", ta: "கடன் பெறு" }, body: { en: "Borrow at a lower cost", ta: "குறைந்த செலவில் கடன் பெறுங்கள்" } },
      { word: { en: "Pay", ta: "செலுத்து" }, body: { en: "Escape exorbitant interest", ta: "அளவுக்கு மீறிய வட்டியிலிருந்து தப்புங்கள்" } },
    ] as readonly { word: Localized; body: Localized }[],
    /** The vicious cycle from the credit-card bullets. */
    trap: [
      { en: "Buy more than you can afford", ta: "சக்திக்கு மீறி வாங்குவது" },
      { en: "Pay the minimum due", ta: "குறைந்தபட்சத் தொகையை மட்டும் செலுத்துவது" },
      { en: "Roll the rest into next month", ta: "மீதியை அடுத்த மாதத்திற்குத் தள்ளுவது" },
      { en: `Interest of ${CREDIT_CARD.rate!.min}–${CREDIT_CARD.rate!.max}% a year`, ta: `ஆண்டுக்கு ${CREDIT_CARD.rate!.min}–${CREDIT_CARD.rate!.max}% வட்டி` },
    ] as readonly Localized[],
    trapLabel: { en: "The vicious cycle", ta: "தீய சுழற்சி" } as Localized,
    discipline: CREDIT_CARD.chit,
  },
  matrixLabel: { en: "Compare a chit with", ta: "சீட்டை இதனுடன் ஒப்பிடுக" } as Localized,
  chit: { en: "Chit", ta: "சீட்டு" } as Localized,
  uses: {
    save: { en: "Save", ta: "சேமிப்பு" },
    borrow: { en: "Borrow", ta: "கடன்" },
    invest: { en: "Invest", ta: "முதலீடு" },
  } satisfies Record<Comparison["use"], Localized>,
  marketLinked: { en: "Market-linked", ta: "சந்தை சார்ந்தது" } as Localized,
  rates: {
    title: { en: "Interest at a glance", ta: "வட்டி விகிதங்கள் ஒரே பார்வையில்" } as Localized,
    earn: { en: "What your savings earn", ta: "உங்கள் சேமிப்பு ஈட்டுவது" } as Localized,
    cost: { en: "What borrowing costs you", ta: "கடனுக்கு நீங்கள் செலுத்துவது" } as Localized,
    axis: { en: "Interest rate, % a year", ta: "வட்டி விகிதம், ஆண்டுக்கு %" } as Localized,
    chitNote: {
      en: "A chit has no fixed rate. Savers earn dividends from each month's bidding; early bidders see those dividends offset the bid discount. One instrument, both sides: SAVE – BORROW – PAY.",
      ta: "சீட்டுக்கு நிலையான வட்டி இல்லை. சேமிப்போர் ஒவ்வொரு மாத ஏலத்தின் ஈவுத்தொகையைப் பெறுகின்றனர்; முன்னதாக எடுப்போருக்கு அந்த ஈவுத்தொகை ஏலத் தள்ளுபடியை ஈடுசெய்கிறது. ஒரே கருவி, இரு தரப்புக்கும்: சேமி – கடன் பெறு – செலுத்து.",
    } as Localized,
    chitLink: { en: "See how in the auction simulator", ta: "ஏல மாதிரியில் எப்படி என்று பாருங்கள்" } as Localized,
    /** Panasuna's own two bars: the saver's gain (earn group) and the early bidder's net cost (cost group). */
    chitEarn: {
      min: 8,
      max: 12,
      label: { en: "Panasuna chit (saver)", ta: "பனசுனா சீட்டு (சேமிப்பாளர்)" },
      note: {
        en: "Effective dividend gain for patient savers, through monthly auction dividends. No lock-in penalty.",
        ta: "பொறுமையாகச் சேமிப்போருக்கு மாத ஏல ஈவுத்தொகை மூலம் கிடைக்கும் திறன்மிகு ஆதாயம். முடக்க அபராதம் இல்லை.",
      },
    },
    chitCost: {
      min: 10,
      max: 14,
      label: { en: "Panasuna chit (early bidder)", ta: "பனசுனா சீட்டு (முன்னதாக எடுப்போர்)" },
      note: {
        en: "Effective net cost for early bidders: accumulated dividends offset the bid discount, with zero prepayment penalty and no bank processing charges.",
        ta: "முன்னதாக எடுப்போருக்கான திறன்மிகு நிகரச் செலவு: சேர்ந்த ஈவுத்தொகை ஏலத் தள்ளுபடியை ஈடுசெய்கிறது; முன்கூட்டிச் செலுத்தும் அபராதமோ வங்கிச் செயலாக்கக் கட்டணமோ இல்லை.",
      },
    },
    caveat: {
      en: "Indicative ranges, % a year; rates vary by bank, borrower and group, and chit dividends depend on each month's auction and are not guaranteed. Check current rates before you decide.",
      ta: "தோராய வரம்புகள், ஆண்டுக்கு %; வங்கி, கடன் பெறுபவர், குழுவைப் பொறுத்து மாறும்; சீட்டு ஈவுத்தொகை ஒவ்வொரு மாத ஏலத்தையும் பொறுத்தது, உத்தரவாதம் இல்லை. முடிவெடுக்கும் முன் தற்போதைய விகிதங்களைச் சரிபாருங்கள்.",
    } as Localized,
  },
};

// ─── Auction simulator (home §7, /auction-process) ─────────────────────────────

export type AuctionRowId = "gross" | "discount" | "commission" | "pool" | "share" | "next" | "payout";

export const AUCTION_SIMULATOR = {
  sceneLabel: {
    en: "3D auction podium. The balance tips toward the discount you set, and a ring of 100 tiles shows how the gross chit amount splits into the payout, the commission and the dividend pool.",
    ta: "3D ஏல மேடை. நீங்கள் அமைக்கும் தள்ளுபடிக்கேற்பத் தராசு சாய்கிறது; 100 வில்லைகள் கொண்ட வளையம் மொத்தச் சீட்டுத் தொகை பரிசுத் தொகை, கமிஷன், ஈவுத்தொகையாகப் பிரிவதைக் காட்டுகிறது.",
  } as Localized,
  title: { en: "Run a month's auction yourself.", ta: "ஒரு மாத ஏலத்தை நீங்களே நடத்திப் பாருங்கள்." } as Localized,
  lead: {
    en: "Pick a real Panasuna plan and slide the winning bid. Watch where every rupee of the chit goes — to the bidder, to the foreman, and back to every member as a dividend.",
    ta: "ஓர் உண்மையான பனசுனா திட்டத்தைத் தேர்ந்தெடுத்து, வெற்றி ஏலத்தை நகர்த்துங்கள். சீட்டின் ஒவ்வொரு ரூபாயும் எங்கே செல்கிறது என்று பாருங்கள் — ஏலதாரருக்கு, நிறுவனத்துக்கு, ஈவுத்தொகையாக ஒவ்வொரு உறுப்பினருக்கும்.",
  } as Localized,
  /** ₹5,00,000 over 50 months, ₹10,000 a month: 50 subscribers. */
  defaultPlanId: "cv-500000-50m",
  defaultDiscountRate: 0.2,
  plan: { en: "Chit plan", ta: "சீட்டுத் திட்டம்" } as Localized,
  month: { en: "Auction month", ta: "ஏல மாதம்" } as Localized,
  monthHint: {
    en: "Sets the discount to that month's figure from our Structure sheet. You can still slide the bid yourself.",
    ta: "அந்த மாதத்திற்கான எங்கள் அமைப்புத் தாளின் தள்ளுபடியை அமைக்கிறது. ஏலத்தை நீங்களே நகர்த்தலாம்.",
  } as Localized,
  structure: { en: "Structure sheet", ta: "அமைப்புத் தாள்" } as Localized,
  structurePayout: { en: "payout", ta: "பரிசுத் தொகை" } as Localized,
  structureDiscount: { en: "discount", ta: "தள்ளுபடி" } as Localized,
  useStructure: { en: "Reset to this month's schedule", ta: "இந்த மாத அமைப்புக்குத் திரும்பு" } as Localized,
  companyChit: CALCULATOR.companyChit,
  discount: { en: "Hypothetical bid discount", ta: "கற்பனை ஏலத் தள்ளுபடி" } as Localized,
  discountHint: {
    en: `From ${COMMISSION_PCT} — the foreman's commission, when no one bids higher — up to ${MAX_DISCOUNT_PCT}, Panasuna's cap: the winner always receives at least 60% of the chit.`,
    ta: `${COMMISSION_PCT} (யாரும் அதிகம் ஏலம் கேட்காதபோது, நிறுவனக் கமிஷன்) முதல் ${MAX_DISCOUNT_PCT} (பனசுனாவின் உச்சவரம்பு; வெற்றியாளர் எப்போதும் சீட்டுத் தொகையில் குறைந்தது 60% பெறுவார்) வரை.`,
  } as Localized,
  // VERIFY: the 2019 amendment's terms ("share of discount", "net chit amount") with the client.
  rows: {
    gross: {
      label: { en: "Gross chit amount", ta: "மொத்தச் சீட்டுத் தொகை" },
      note: { en: "The full value the group pools this month", ta: "இந்த மாதம் குழு சேர்க்கும் முழுத் தொகை" },
    },
    discount: {
      label: { en: "Hypothetical discount", ta: "கற்பனைத் தள்ளுபடி" },
      note: { en: "The foregone amount: what the bidder gives up", ta: "விட்டுக்கொடுக்கும் தொகை: ஏலதாரர் விட்டுக்கொடுப்பது" },
    },
    commission: {
      label: { en: "Foreman's commission", ta: "நிறுவனக் கமிஷன்" },
      note: {
        en: `Applicable statutory commission, assumed at ${COMMISSION_PCT} of the chit`,
        ta: `பொருந்தும் சட்டப்பூர்வ கமிஷன்; சீட்டுத் தொகையில் ${COMMISSION_PCT} எனக் கொள்ளப்படுகிறது`,
      },
    },
    pool: {
      label: { en: "Dividend pool", ta: "ஈவுத்தொகைத் தொகுப்பு" },
      note: { en: "Discount less commission, for distribution", ta: "தள்ளுபடியில் கமிஷன் போக, பகிர்வுக்கான தொகை" },
    },
    share: {
      label: { en: "Dividend per subscriber", ta: "ஒவ்வொரு சந்தாதாரருக்கும் ஈவுத்தொகை" },
      note: { en: "In the Act: share of discount", ta: "சட்டச் சொல்: தள்ளுபடிப் பங்கு" },
    },
    next: {
      label: { en: "Next month's installment", ta: "அடுத்த மாதத் தவணை" },
      note: { en: "instead of", ta: "என்பதற்குப் பதிலாக" },
    },
    payout: {
      label: { en: "Net payout to the successful bidder", ta: "வெற்றி ஏலதாரருக்கு நிகரத் தொகை" },
      note: { en: "In the Act: net chit amount", ta: "சட்டச் சொல்: நிகரச் சீட்டுத் தொகை" },
    },
  } satisfies Record<AuctionRowId, { label: Localized; note: Localized }>,
  whereItGoes: { en: "Where the gross chit amount goes", ta: "மொத்தச் சீட்டுத் தொகை எங்கே செல்கிறது" } as Localized,
  legend: {
    payout: { en: "To the bidder", ta: "ஏலதாரருக்கு" },
    commission: { en: "Commission", ta: "கமிஷன்" },
    pool: { en: "Dividend to members", ta: "உறுப்பினர்களுக்கு ஈவுத்தொகை" },
  } satisfies Record<"payout" | "commission" | "pool", Localized>,
  shared: { en: "subscribers share the pool equally", ta: "சந்தாதாரர்கள் தொகுப்பைச் சமமாகப் பகிர்கின்றனர்" } as Localized,
  podiumCaption: {
    en: "Each tile in the ring is 1% of the chit. Gold tiles go back to members as dividend.",
    ta: "வளையத்தின் ஒவ்வொரு ஓடும் சீட்டுத் தொகையின் 1%. தங்க ஓடுகள் ஈவுத்தொகையாக உறுப்பினர்களுக்குத் திரும்புகின்றன.",
  } as Localized,
  disclaimer: {
    en: "Illustration only, not an offer. Real discounts are set by each month's open bidding, and the commission rate shown is assumed.",
    ta: "விளக்கத்திற்காக மட்டும்; இது சலுகை அல்ல. உண்மையான தள்ளுபடி ஒவ்வொரு மாத வெளிப்படை ஏலத்தில் தீர்மானிக்கப்படுகிறது; காட்டப்படும் கமிஷன் விகிதம் ஒரு அனுமானம்.",
  } as Localized,
  cta: FIND_YOUR_CHIT.results.cta,
};

// ─── Payout curve (client Excel `Structure` sheet) ────────────────────────────

export interface PayoutStructure {
  months: ChitDuration;
  /** The reference chit the sheet's column is priced on. */
  chitValue: number;
  /**
   * Prize payout ₹ for months 2…N, exactly as the `Structure` sheet lists them for `chitValue`. Month 1 is
   * always the company chit at 100%, so it is not stored. Every other plan scales these by payout ÷ chitValue.
   */
  payouts: readonly number[];
}

/** The six columns of the client's `Structure` sheet, month by month (Nov 2026 revision). */
export const PAYOUT_STRUCTURES: readonly PayoutStructure[] = [
  { months: 20, chitValue: 150_000, payouts: [105_000, 105_000, 105_000, 111_000, 120_000, 125_000, 127_500, 129_000, 131_600, 132_750, 134_250, 135_750, 137_250, 138_000, 138_750, 139_500, 140_250, 140_250, 142_500] },
  { months: 25, chitValue: 200_000, payouts: [140_000, 140_000, 140_000, 140_000, 145_000, 147_900, 155_000, 160_000, 165_000, 168_500, 170_500, 172_500, 174_000, 175_200, 177_000, 178_500, 180_500, 182_000, 184_000, 186_000, 187_000, 188_000, 188_000, 190_000] },
  { months: 30, chitValue: 450_000, payouts: [315_000, 315_000, 315_000, 315_000, 315_000, 315_000, 315_000, 315_000, 315_000, 315_000, 320_700, 326_400, 332_100, 337_800, 343_500, 349_200, 354_900, 360_600, 366_300, 372_000, 377_700, 383_400, 389_100, 394_800, 400_500, 406_200, 411_900, 418_500, 427_500] },
  { months: 40, chitValue: 1_000_000, payouts: [700_000, 700_000, 700_000, 700_000, 700_000, 700_000, 700_000, 700_000, 700_000, 700_000, 700_000, 700_000, 700_000, 700_000, 700_000, 700_000, 700_000, 735_000, 750_000, 760_000, 754_000, 756_000, 770_000, 796_000, 820_000, 830_000, 850_000, 865_000, 865_000, 882_000, 890_000, 900_000, 910_000, 915_000, 920_000, 930_000, 935_000, 945_000, 950_000] },
  { months: 50, chitValue: 5_000_000, payouts: [3_500_000, 3_500_000, 3_500_000, 3_500_000, 3_500_000, 3_500_000, 3_500_000, 3_500_000, 3_500_000, 3_500_000, 3_500_000, 3_500_000, 3_500_000, 3_500_000, 3_500_000, 3_500_000, 3_500_000, 3_500_000, 3_500_000, 3_500_000, 3_500_000, 3_500_000, 3_500_000, 3_500_000, 3_500_000, 3_500_000, 3_500_000, 3_800_000, 3_950_000, 4_025_000, 4_050_000, 4_075_000, 4_110_000, 4_140_000, 4_170_000, 4_225_000, 4_325_000, 4_400_000, 4_425_000, 4_425_000, 4_475_000, 4_525_000, 4_575_000, 4_625_000, 4_650_000, 4_675_000, 4_700_000, 4_700_000, 4_750_000] },
  { months: 60, chitValue: 600_000, payouts: [420_000, 420_000, 420_000, 420_000, 420_000, 420_000, 420_000, 420_000, 420_000, 420_000, 420_000, 420_000, 420_000, 420_000, 420_000, 420_000, 420_000, 420_000, 420_000, 420_000, 420_000, 420_000, 420_000, 420_000, 420_000, 420_000, 420_000, 420_000, 441_600, 442_800, 444_900, 439_800, 450_000, 459_600, 472_500, 484_500, 489_000, 492_000, 498_000, 500_100, 501_000, 502_500, 505_200, 510_000, 514_800, 519_000, 525_000, 529_500, 530_100, 534_600, 538_800, 549_000, 552_000, 555_000, 558_000, 561_000, 561_000, 561_000, 570_000] },
];

/**
 * VERIFY: the sheet has no 15-month column (only the ₹15 L × 15m express group runs on it). Until the client
 * sends one, this is the 20-month column resampled onto 15 months (70% floor → 95%), rounded to ₹1,000.
 */
const STRUCTURE_15M: PayoutStructure = {
  months: 15,
  chitValue: 1_500_000,
  payouts: [1_050_000, 1_050_000, 1_096_000, 1_208_000, 1_263_000, 1_289_000, 1_320_000, 1_338_000, 1_359_000, 1_376_000, 1_386_000, 1_397_000, 1_402_000, 1_425_000],
};

/** The structure every plan of this duration follows (15 months: the derived schedule above). */
export function structureFor(months: ChitDuration): PayoutStructure {
  return months === 15 ? STRUCTURE_15M : PAYOUT_STRUCTURES.find((s) => s.months === months)!;
}

/** Payout ratio for month 1…N: 1 for the company chit, then the sheet's payout ÷ its reference chit. */
export function payoutRateFor(months: ChitDuration, month: number): number {
  if (month <= 1) return 1;
  const s = structureFor(months);
  return s.payouts[Math.min(month, s.months) - 2] / s.chitValue;
}

export type PayoutPersona = "company" | "borrower" | "balanced" | "saver";

export function personaFor(month: number, rate: number): PayoutPersona {
  if (month <= 1) return "company";
  return rate < 0.8 ? "borrower" : rate < 0.9 ? "balanced" : "saver";
}

export const PAYOUT_CURVE = {
  title: { en: "Early bidder or patient saver?", ta: "முன்னதாக ஏலம் எடுப்பவரா, பொறுமையான சேமிப்பாளரா?" } as Localized,
  lead: {
    en: "Every month of Panasuna's real auction structure. Pick a chit, then drag through the months to see the prize, the discount and what it saves every member.",
    ta: "பனசுனா ஏல அமைப்பின் ஒவ்வொரு மாதமும். ஒரு சீட்டைத் தேர்ந்தெடுத்து, மாதங்களை நகர்த்தி, பரிசுத் தொகை, தள்ளுபடி, ஒவ்வொரு உறுப்பினருக்குமான சேமிப்பைப் பாருங்கள்.",
  } as Localized,
  pick: { en: "Chit structure", ta: "சீட்டு அமைப்பு" } as Localized,
  month: { en: "Month", ta: "மாதம்" } as Localized,
  scrub: { en: "Drag to choose the month you take the chit", ta: "சீட்டை எடுக்கும் மாதத்தைத் தேர்ந்தெடுக்க நகர்த்துங்கள்" } as Localized,
  payout: { en: "Prize payout", ta: "பரிசுத் தொகை" } as Localized,
  ofGross: { en: "of the gross chit value", ta: "மொத்தச் சீட்டுத் தொகையில்" } as Localized,
  benchmark: { en: "From our Structure sheet", ta: "எங்கள் அமைப்புத் தாளிலிருந்து" } as Localized,
  breakdown: {
    discount: { en: "Bid discount", ta: "ஏலத் தள்ளுபடி" },
    commission: { en: `Foreman's commission (${COMMISSION_PCT})`, ta: `நிறுவனக் கமிஷன் (${COMMISSION_PCT})` },
    dividend: { en: "Monthly dividend per member", ta: "ஒவ்வொரு உறுப்பினருக்கும் மாத ஈவுத்தொகை" },
    next: { en: "Reduced next month's installment", ta: "குறைந்த அடுத்த மாதத் தவணை" },
  } satisfies Record<"discount" | "commission" | "dividend" | "next", Localized>,
  insteadOf: { en: "instead of", ta: "என்பதற்குப் பதிலாக" } as Localized,
  floor: { en: "70% benchmark", ta: "70% அளவுகோல்" } as Localized,
  personas: {
    company: {
      title: { en: "Company chit", ta: "நிறுவனச் சீட்டு" },
      body: { en: "Month 1 is the foreman's chit, at 100% of the value, as the Chit Funds Act provides.", ta: "முதல் மாதம் நிறுவனத்தின் சீட்டு; சீட்டு நிதிச் சட்டப்படி முழு 100% தொகை." },
    },
    borrower: {
      title: { en: "Urgent business / liquidity borrower", ta: "அவசரத் தொழில் / பணப்புழக்கத் தேவை" },
      body: { en: "Money now, when it matters most. On our Structure sheet you receive about 70% of the chit, and never less than 60%.", ta: "மிகத் தேவையான நேரத்தில் இப்போதே பணம். எங்கள் அமைப்புத் தாளில் சீட்டுத் தொகையில் சுமார் 70% கிடைக்கும்; எப்போதும் 60%-க்குக் குறையாது." },
    },
    balanced: {
      title: { en: "Balanced planner", ta: "சமநிலைத் திட்டமிடுபவர்" },
      body: { en: "Competition eases, so the prize climbs while dividends have already lowered your installments.", ta: "போட்டி குறைய, பரிசுத் தொகை உயர்கிறது; ஈவுத்தொகை ஏற்கெனவே உங்கள் தவணைகளைக் குறைத்திருக்கும்." },
    },
    saver: {
      title: { en: "Maximised wealth saver", ta: "அதிகபட்சச் செல்வச் சேமிப்பாளர்" },
      body: { en: "Patience pays: up to 95% of the chit, plus every month's dividend along the way.", ta: "பொறுமைக்குப் பலன்: சீட்டுத் தொகையில் 95% வரை, கூடவே ஒவ்வொரு மாத ஈவுத்தொகையும்." },
    },
  } satisfies Record<PayoutPersona, { title: Localized; body: Localized }>,
  axis: { en: "Payout, % of chit value", ta: "பரிசுத் தொகை, சீட்டுத் தொகையின் %" } as Localized,
  note: {
    en: `Every month is plotted from Panasuna's auction Structure sheet: month 1 is the company chit at 100%, the 70% benchmark holds early on, and the last month pays 95% after the ${COMMISSION_PCT} foreman's commission. Real payouts depend on each month's open bidding.`,
    ta: `ஒவ்வொரு மாதமும் பனசுனா ஏல அமைப்புத் தாளிலிருந்து: முதல் மாதம் 100% நிறுவனச் சீட்டு, தொடக்க மாதங்களில் 70% அளவுகோல், கடைசி மாதம் ${COMMISSION_PCT} நிறுவனக் கமிஷன் போக 95%. உண்மையான பரிசுத் தொகை ஒவ்வொரு மாத வெளிப்படை ஏலத்தைப் பொறுத்தது.`,
  } as Localized,
};

export const GOLDEN_RULES = {
  title: { en: "The 3 golden rules of a Panasuna auction.", ta: "பனசுனா ஏலத்தின் 3 பொன் விதிகள்." } as Localized,
  rules: [
    {
      id: "cap",
      figure: MAX_DISCOUNT_PCT,
      title: { en: "Maximum discount cap", ta: "அதிகபட்சத் தள்ளுபடி வரம்பு" },
      body: {
        en: `No bid can go beyond ${MAX_DISCOUNT_PCT} of the chit value, so subscribers always receive at least 60% of the gross chit value, even in the most competitive early months.`,
        ta: `எந்த ஏலமும் சீட்டுத் தொகையின் ${MAX_DISCOUNT_PCT}-ஐத் தாண்ட முடியாது; எனவே போட்டி மிகுந்த தொடக்க மாதங்களிலும், சந்தாதாரர்கள் மொத்தச் சீட்டுத் தொகையில் குறைந்தது 60% எப்போதும் பெறுவர்.`,
      },
    },
    {
      id: "dividend",
      figure: "100%",
      title: { en: "Dividend sharing", ta: "ஈவுத்தொகைப் பகிர்வு" },
      body: {
        en: `Every rupee of bid discount after the statutory ${COMMISSION_PCT} foreman's commission is divided equally among all members, lowering next month's installment.`,
        ta: `சட்டப்பூர்வ ${COMMISSION_PCT} நிறுவனக் கமிஷன் போக, ஏலத் தள்ளுபடியின் ஒவ்வொரு ரூபாயும் அனைத்து உறுப்பினர்களுக்கும் சமமாகப் பகிரப்பட்டு, அடுத்த மாதத் தவணையைக் குறைக்கிறது.`,
      },
    },
    {
      id: "maturity",
      figure: "95%",
      title: { en: "Final maturity payout", ta: "இறுதி முதிர்வுத் தொகை" },
      body: {
        en: "Members who wait until the end of the cycle receive up to 95% of the gross chit value, plus every month's accumulated dividends.",
        ta: "சுழற்சியின் இறுதி வரை காத்திருக்கும் உறுப்பினர்கள், மொத்தச் சீட்டுத் தொகையில் 95% வரையும், ஒவ்வொரு மாதமும் சேர்ந்த ஈவுத்தொகையையும் பெறுவர்.",
      },
    },
  ] as readonly { id: string; figure: string; title: Localized; body: Localized }[],
};

/** editorial: /auction-process. Steps restate the journey's stages 3–5 as a checklist. */
export const AUCTION_PROCESS = {
  title: { en: "The auction, in the open.", ta: "ஏலம், வெளிப்படையாக." } as Localized,
  lead: {
    en: "Every month one member takes the chit through an open auction. Here is exactly how the money moves — try it with any of our plans.",
    ta: "ஒவ்வொரு மாதமும் ஓர் உறுப்பினர் வெளிப்படையான ஏலத்தின் மூலம் சீட்டைப் பெறுகிறார். பணம் எப்படி நகர்கிறது என்பதைத் துல்லியமாகப் பாருங்கள் — எங்கள் எந்தத் திட்டத்துடனும் முயன்று பாருங்கள்.",
  } as Localized,
  enquire: FIND_YOUR_CHIT.results.cta,
  stepsTitle: { en: "How a monthly auction runs", ta: "மாத ஏலம் நடைபெறும் முறை" } as Localized,
  // VERIFY: step 1 (who attends and how) and step 5 (documents and surety) with the client.
  steps: [
    {
      title: { en: "The group meets", ta: "குழு கூடுகிறது" },
      body: {
        en: "On the auction day set in the chit agreement, members gather for that month's auction.",
        ta: "சீட்டு ஒப்பந்தத்தில் குறிக்கப்பட்ட ஏல நாளில், அந்த மாத ஏலத்திற்காக உறுப்பினர்கள் கூடுகின்றனர்.",
      },
    },
    {
      title: { en: "Bids are offered as discounts", ta: "தள்ளுபடியாக ஏலம் கேட்கப்படுகிறது" },
      body: {
        en: `Members who want the money this month offer the discount they will give up. Bidding is open, and stops at the ${MAX_DISCOUNT_PCT} ceiling.`,
        ta: `இந்த மாதம் பணம் தேவைப்படும் உறுப்பினர்கள், தாங்கள் விட்டுக்கொடுக்கும் தள்ளுபடியை முன்வைக்கின்றனர். ஏலம் வெளிப்படையானது; ${MAX_DISCOUNT_PCT} உச்சவரம்பில் நிற்கிறது.`,
      },
    },
    {
      title: { en: "The highest discount wins", ta: "அதிகத் தள்ளுபடி வெற்றி பெறுகிறது" },
      body: {
        en: "The member offering the highest discount becomes the prized subscriber, and every member is told the bid details promptly.",
        ta: "அதிகத் தள்ளுபடியை முன்வைக்கும் உறுப்பினர் பரிசுபெற்ற சந்தாதாரர் ஆகிறார்; ஏல விவரங்கள் அனைத்து உறுப்பினர்களுக்கும் உடனுக்குடன் தெரிவிக்கப்படுகின்றன.",
      },
    },
    {
      title: { en: "The dividend is shared", ta: "ஈவுத்தொகை பகிரப்படுகிறது" },
      body: {
        en: "After the foreman's commission, the rest of the discount is divided equally among all subscribers and reduces their next installment.",
        ta: "நிறுவனக் கமிஷன் போக, மீதித் தள்ளுபடி அனைத்துச் சந்தாதாரர்களுக்கும் சமமாகப் பிரிக்கப்பட்டு, அவர்களின் அடுத்த தவணையைக் குறைக்கிறது.",
      },
    },
    {
      title: { en: "The chit amount is paid", ta: "சீட்டுத் தொகை வழங்கப்படுகிறது" },
      body: {
        en: "Once the documents and surety the chit agreement requires are in place, the prized subscriber is paid the chit value less the discount — on time.",
        ta: "சீட்டு ஒப்பந்தம் கோரும் ஆவணங்களும் ஜாமீனும் தயாரானதும், பரிசுபெற்ற சந்தாதாரருக்குச் சீட்டுத் தொகையில் தள்ளுபடி கழித்த தொகை உரிய நேரத்தில் வழங்கப்படுகிறது.",
      },
    },
  ] as readonly { title: Localized; body: Localized }[],
  normsTitle: { en: "Our service norms", ta: "எங்கள் சேவை நெறிமுறைகள்" } as Localized,
  norms: SERVICE_NORMS,
  glossaryTitle: { en: "The words you'll hear", ta: "நீங்கள் கேட்கும் சொற்கள்" } as Localized,
  // VERIFY: statutory equivalents from the Chit Funds (Amendment) Act, 2019.
  glossary: [
    {
      term: { en: "Gross chit amount", ta: "மொத்தச் சீட்டுத் தொகை" },
      body: { en: "The chit value: every member's subscription for one month, added together.", ta: "சீட்டுத் தொகை: ஒரு மாதத்திற்கான அனைத்து உறுப்பினர்களின் சந்தாவின் கூட்டுத்தொகை." },
    },
    {
      term: { en: "Discount (foregone amount)", ta: "தள்ளுபடி (விட்டுக்கொடுக்கும் தொகை)" },
      body: { en: "The part of the chit value the successful bidder agrees to give up to take the money now.", ta: "இப்போதே பணம் பெற, வெற்றி ஏலதாரர் விட்டுக்கொடுக்க ஒப்புக்கொள்ளும் சீட்டுத் தொகையின் பகுதி." },
    },
    {
      term: { en: "Foreman's commission", ta: "நிறுவனக் கமிஷன்" },
      body: { en: "The fee the chit company takes from the discount for running the group, within the statutory cap.", ta: "குழுவை நடத்துவதற்காகச் சட்ட வரம்புக்குள், தள்ளுபடியிலிருந்து சீட்டு நிறுவனம் பெறும் கட்டணம்." },
    },
    {
      term: { en: "Dividend (share of discount)", ta: "ஈவுத்தொகை (தள்ளுபடிப் பங்கு)" },
      body: { en: "The discount less the commission, split equally among all subscribers.", ta: "தள்ளுபடியில் கமிஷன் போக மீதம், அனைத்துச் சந்தாதாரர்களுக்கும் சமமாகப் பிரிக்கப்படுவது." },
    },
    {
      term: { en: "Prize amount (net chit amount)", ta: "பரிசுத் தொகை (நிகரச் சீட்டுத் தொகை)" },
      body: { en: "What the successful bidder receives: the chit value minus the discount.", ta: "வெற்றி ஏலதாரர் பெறுவது: சீட்டுத் தொகையில் தள்ளுபடி கழித்த தொகை." },
    },
    {
      term: { en: "Prized subscriber", ta: "பரிசுபெற்ற சந்தாதாரர்" },
      body: { en: "A member who has already taken the chit; they keep paying installments until the chit ends.", ta: "ஏற்கெனவே சீட்டைப் பெற்ற உறுப்பினர்; சீட்டு முடியும் வரை தவணைகளைத் தொடர்ந்து செலுத்துவார்." },
    },
  ] as readonly { term: Localized; body: Localized }[],
  cycle: {
    title: { en: "See the whole cycle", ta: "முழுச் சுழற்சியைப் பாருங்கள்" } as Localized,
    body: {
      en: "One auction is one month. The calculator plays out every month of a chit and shows what you would pay and receive depending on when you take it.",
      ta: "ஓர் ஏலம் என்பது ஒரு மாதம். சீட்டின் ஒவ்வொரு மாதத்தையும் கணிப்பான் கணக்கிட்டு, நீங்கள் எப்போது எடுக்கிறீர்கள் என்பதைப் பொறுத்து செலுத்துவதையும் பெறுவதையும் காட்டுகிறது.",
    } as Localized,
    link: { en: "Open the calculator", ta: "கணிப்பானைத் திறக்க" } as Localized,
  },
};

// ─── Board of Directors ───────────────────────────────────────────────────────

export type AssociationId = "SCFFA" | "TNCFA" | "AIACF" | "YOUNG_MINDS";

export const ASSOCIATIONS: Record<AssociationId, { abbr: string; name: Localized; verified: boolean }> = {
  SCFFA: {
    abbr: "SCFFA",
    name: { en: "Salem Chit Funds & Financiers Association", ta: "சேலம் சீட்டு நிதி மற்றும் நிதியாளர்கள் சங்கம்" },
    verified: true,
  },
  // VERIFY: full name not stated on the old site; it also appears once as "TNCFCA".
  TNCFA: {
    abbr: "TNCFA",
    name: { en: "Tamil Nadu Chit Funds Association", ta: "தமிழ்நாடு சீட்டு நிதிகள் சங்கம்" },
    verified: false,
  },
  // VERIFY: full name not stated on the old site.
  AIACF: {
    abbr: "AIACF",
    name: { en: "All India Association of Chit Funds", ta: "அகில இந்திய சீட்டு நிதிகள் சங்கம்" },
    verified: false,
  },
  YOUNG_MINDS: {
    abbr: "Young Minds",
    name: { en: "Young Minds", ta: "யங் மைண்ட்ஸ்" },
    verified: true,
  },
};

/** Motif drawn behind the monogram in the bespoke SVG avatar. */
export type AvatarMotif = "crown" | "scales" | "ledger" | "ascent" | "compass";

export interface DirectorBadge {
  association: AssociationId;
  title: Localized;
  current: boolean;
}

export interface Director {
  id: string;
  order: number;
  name: Localized;
  role: Localized;
  bio: Localized<readonly string[]>;
  badges: readonly DirectorBadge[];
  /** Real portrait in /public/photos (Gemini watermark cropped out). */
  photo: string;
  avatar: { monogram: string; motif: AvatarMotif; tone: "gold" | "emerald" };
}

export const DIRECTORS: readonly Director[] = [
  {
    id: "r-viswanathan",
    photo: "/photos/r-viswanathan.jpg",
    order: 1,
    name: { en: "R. Viswanathan", ta: "ஆர். விஸ்வநாதன்" },
    role: { en: "Managing Director", ta: "நிர்வாக இயக்குநர்" },
    bio: {
      en: [
        "One of the founding members of the company, he has weathered every high and low of the chit fund industry. He set aside other opportunities to build a chit fund company alongside his uncle, Mr. S. Krishnamoorthy, and has made it a lasting success.",
        "He is widely respected across the industry and takes an active part in chit fund meetings held across the nation. He has his own way of motivating people to save for their future through chits. He is a Past President of the Salem Chit Funds & Financiers Association and a Past Treasurer of the TNCFA.",
      ],
      ta: [
        "நிறுவனத்தின் நிறுவன உறுப்பினர்களில் ஒருவர். சீட்டு நிதித் துறையின் அனைத்து ஏற்ற இறக்கங்களையும் கடந்து வந்தவர். தம் மாமா திரு. எஸ். கிருஷ்ணமூர்த்தி அவர்களுடன் இணைந்து ஒரு சீட்டு நிதி நிறுவனத்தை உருவாக்குவதற்காகப் பிற வாய்ப்புகளைத் துறந்து, அதில் நிலையான வெற்றியும் கண்டவர்.",
        "துறையின் பிற உறுப்பினர்களிடையே நன்மதிப்பைப் பெற்றவர்; நாடு முழுவதும் நடைபெறும் கூட்டங்களில் தீவிரமாகப் பங்கேற்பவர். சீட்டுகள் மூலம் எதிர்காலத்திற்காகச் சேமிக்க மக்களை ஊக்குவிப்பதில் தனக்கென ஒரு பாணி கொண்டவர். சேலம் சீட்டு நிதி மற்றும் நிதியாளர்கள் சங்கத்தின் முன்னாள் தலைவராகவும், TNCFA-வின் முன்னாள் பொருளாளராகவும் பணியாற்றியவர்.",
      ],
    },
    badges: [
      { association: "SCFFA", title: { en: "Past President", ta: "முன்னாள் தலைவர்" }, current: false },
      { association: "TNCFA", title: { en: "Past Treasurer", ta: "முன்னாள் பொருளாளர்" }, current: false },
    ],
    avatar: { monogram: "RV", motif: "crown", tone: "gold" },
  },
  {
    id: "k-mohanasundaram",
    photo: "/photos/k-mohanasundaram.jpg",
    order: 2,
    name: { en: "K. Mohanasundaram", ta: "கே. மோகனசுந்தரம்" },
    role: { en: "Director (Legal)", ta: "இயக்குநர் (சட்டம்)" },
    bio: {
      en: [
        "An advocate by profession, he completed his law degree and practised actively before choosing to support his father's growing chit fund business. He brought his legal expertise to the company to help it grow in new directions, and ensures that every business activity is carried out in full legal compliance — an increasingly demanding task in today's chit industry.",
        "He continues to give legal opinions to his clients and assists other chit fund owners with the procedures for maintaining their documents and books. He is one of the legal advisors to the Salem Chit Funds & Financiers Association.",
      ],
      ta: [
        "தொழில்முறையில் வழக்கறிஞர். சட்டப் படிப்பை முடித்து வழக்கறிஞராகத் தீவிரமாகப் பணியாற்றிய பின், தம் தந்தையின் வளர்ந்து வரும் சீட்டு நிதித் தொழிலுக்கு உதவ முடிவெடுத்தார். தமது சட்ட அறிவை நிறுவனத்தின் பன்முக வளர்ச்சிக்குப் பயன்படுத்தினார்; இன்றைய சீட்டுத் துறையில் சவாலாகி வரும் சட்ட இணக்கத்துடன் அனைத்துச் செயல்பாடுகளும் நடைபெறுவதை உறுதி செய்கிறார்.",
        "இன்றும் தம் வாடிக்கையாளர்களுக்குச் சட்ட ஆலோசனை வழங்குவதோடு, பிற சீட்டு நிதி நிறுவன உரிமையாளர்களுக்கு ஆவணங்கள் மற்றும் கணக்குப் புத்தகங்களைப் பராமரிக்கும் நடைமுறைகளில் உதவுகிறார். சேலம் சீட்டு நிதி மற்றும் நிதியாளர்கள் சங்கத்தின் சட்ட ஆலோசகர்களில் ஒருவர்.",
      ],
    },
    badges: [{ association: "SCFFA", title: { en: "Legal Advisor", ta: "சட்ட ஆலோசகர்" }, current: true }],
    avatar: { monogram: "KM", motif: "scales", tone: "emerald" },
  },
  {
    id: "k-karunanithy",
    photo: "/photos/k-karunanithy.jpg",
    order: 3,
    name: { en: "K. Karunanithy", ta: "கே. கருணாநிதி" },
    role: { en: "Director", ta: "இயக்குநர்" },
    bio: {
      en: [
        "A central figure in the company — “the backbone” is the phrase that suits him best. Unlike other members of the board, he began his career directly at Panasuna. Chit funds are his life's work: he reads customer needs quickly and meets them with the right chit plan.",
        "Customers value his clear explanations and precise calculations of interest and returns — exactly what an investor or business owner wants. He has dedicated his whole career to the company, and is an Executive Committee Member of the Salem Chit Funds & Financiers Association.",
      ],
      ta: [
        "நிறுவனத்தின் முக்கிய ஆளுமை; “நிறுவனத்தின் முதுகெலும்பு” என்ற சொல் அவருக்கே பொருந்தும். பிற இயக்குநர்களைப் போலன்றி, தம் பணி வாழ்க்கையை நேரடியாகப் பனசுனாவிலேயே தொடங்கியவர். சீட்டு நிதியே அவரது மூச்சு; வாடிக்கையாளர்களின் தேவைகளை எளிதில் புரிந்துகொண்டு, பொருத்தமான சீட்டுத் திட்டங்கள் மூலம் அவற்றை நிறைவேற்றுபவர்.",
        "அவரது தெளிவான விளக்கங்களும் வட்டி மற்றும் வருவாய் குறித்த துல்லியமான கணக்கீடுகளும் வாடிக்கையாளர்களை மகிழ்விக்கின்றன — ஒரு முதலீட்டாளர் அல்லது தொழிலதிபர் வேறென்ன எதிர்பார்க்க முடியும்? தம் வாழ்நாள் முழுவதையும் இந்நிறுவனத்திற்காக அர்ப்பணித்தவர்; சேலம் சீட்டு நிதி மற்றும் நிதியாளர்கள் சங்கத்தின் செயற்குழு உறுப்பினர்.",
      ],
    },
    badges: [{ association: "SCFFA", title: { en: "Executive Committee Member", ta: "செயற்குழு உறுப்பினர்" }, current: true }],
    avatar: { monogram: "KK", motif: "ledger", tone: "gold" },
  },
  {
    id: "m-karthish",
    photo: "/photos/m-karthish.jpg",
    order: 4,
    name: { en: "M. Karthish", ta: "எம். கார்த்திஷ்" },
    role: { en: "Director", ta: "இயக்குநர்" },
    bio: {
      en: [
        "The youngest director of the company — and one of the youngest voices in the chit industry. Convinced by his grandfather's belief that the chit business never ends, he left his job in investment banking, earned a Master's in Business Administration and also completed a law degree.",
        "He is passionate about educating the younger generation about chit funds and clearly explains their advantages over other financial instruments. He works with graduating college students to help them start saving through chit funds.",
        "With his systematic, energetic ideas and the teamwork of the senior directors, Panasuna's business has grown many times over. He serves as a Finance Committee Member representing Tamil Nadu in the AIACF, Joint Secretary of the TNCFA, and an Executive Committee Member of the SCFFA.",
      ],
      ta: [
        "நிறுவனத்தின் இளைய இயக்குநர் — சீட்டுத் துறையின் இளம் குரல்களிலும் ஒருவர். “சீட்டுத் தொழிலுக்கு முடிவே இல்லை” என்ற தம் தாத்தாவின் சொற்களில் நம்பிக்கை கொண்டு, முதலீட்டு வங்கித் துறைப் பணியைத் துறந்தார்; வணிக நிர்வாகத்தில் முதுநிலைப் பட்டமும், சட்டப் பட்டமும் பெற்றார்.",
        "சீட்டு நிதி பற்றி இளைய தலைமுறைக்குக் கற்பிப்பதில் ஆர்வம் கொண்டவர்; பிற நிதிக் கருவிகளுடன் ஒப்பிட்டுச் சீட்டின் நன்மைகளைத் தெளிவாக விளக்குபவர். கல்லூரிப் படிப்பை முடிக்கும் மாணவர்கள் சீட்டு மூலம் சேமிப்பைத் தொடங்க வழிகாட்டுகிறார்.",
        "அவரது முறையான, உற்சாகமான சிந்தனைகளாலும் மூத்த இயக்குநர்களின் கூட்டு உழைப்பாலும் பனசுனாவின் வணிகம் பன்மடங்கு வளர்ந்துள்ளது. தற்போது AIACF-இல் தமிழ்நாட்டின் சார்பில் நிதிக் குழு உறுப்பினராகவும், TNCFA-வின் இணைச் செயலாளராகவும், SCFFA-வின் செயற்குழு உறுப்பினராகவும் உள்ளார்.",
      ],
    },
    badges: [
      { association: "AIACF", title: { en: "Finance Committee Member (Tamil Nadu)", ta: "நிதிக் குழு உறுப்பினர் (தமிழ்நாடு)" }, current: true },
      // VERIFY: old site says "JS of TNCFCA" — read here as Joint Secretary of the TNCFA.
      { association: "TNCFA", title: { en: "Joint Secretary", ta: "இணைச் செயலாளர்" }, current: true },
      { association: "SCFFA", title: { en: "Executive Committee Member", ta: "செயற்குழு உறுப்பினர்" }, current: true },
    ],
    avatar: { monogram: "MK", motif: "ascent", tone: "emerald" },
  },
  {
    id: "k-harish",
    photo: "/photos/k-harish.jpg",
    order: 5,
    name: { en: "K. Harish", ta: "கே. ஹரிஷ்" },
    role: { en: "Director", ta: "இயக்குநர்" },
    bio: {
      en: [
        "With a Master's degree in Business Management from Ireland and three years as a Financial Analyst in the Irish financial sector, he has built a solid foundation in finance and management. His years abroad gave him a deep understanding of global financial practices, which he now applies to his work in India.",
        "He has made it his mission to raise awareness of registered chit funds, and is passionate about helping people make better financial decisions by comparing chit schemes with the modern tools available. He regularly gives presentations to college students on financial awareness, the importance of registered chit funds, and their role in responsible saving and borrowing.",
        "He currently heads Young Minds, a state-level organisation that encourages and guides the younger generation to take part in — and take leadership roles within — the chit fund industry.",
      ],
      ta: [
        "அயர்லாந்தில் வணிக மேலாண்மையில் முதுநிலைப் பட்டமும், ஐரிஷ் நிதித் துறையில் நிதி ஆய்வாளராக மூன்று ஆண்டு அனுபவமும் பெற்றவர். வெளிநாட்டுப் பணி அனுபவம் உலகளாவிய நிதி நடைமுறைகள் குறித்த ஆழ்ந்த புரிதலைத் தந்தது; அதை இப்போது இந்தியாவில் தம் பணியில் பயன்படுத்துகிறார்.",
        "“பதிவு செய்யப்பட்ட சீட்டு நிதிகள்” குறித்த விழிப்புணர்வை ஏற்படுத்துவதைத் தம் இலக்காகக் கொண்டுள்ளார்; நவீன கருவிகளைக் கொண்டு சீட்டுத் திட்டங்களை ஒப்பிட்டுச் சிறந்த நிதி முடிவுகளை எடுக்க மக்களுக்குக் கற்பிப்பதில் ஆர்வம் கொண்டவர். நிதி விழிப்புணர்வு, பதிவு செய்யப்பட்ட சீட்டு நிதிகளின் முக்கியத்துவம், பொறுப்பான சேமிப்பு மற்றும் கடன் பழக்கங்களில் அவற்றின் பங்கு குறித்துக் கல்லூரி மாணவர்களுக்கு விளக்கக்காட்சிகள் வழங்கி வருகிறார்.",
        "இளைய தலைமுறையினர் சீட்டு நிதித் துறையில் தீவிரமாகப் பங்கேற்கவும் தலைமைப் பொறுப்புகளை ஏற்கவும் ஊக்குவித்து வழிகாட்டும் மாநில அளவிலான அமைப்பான “யங் மைண்ட்ஸ்”-இன் தலைவராக உள்ளார்.",
      ],
    },
    badges: [{ association: "YOUNG_MINDS", title: { en: "Head", ta: "தலைவர்" }, current: true }],
    avatar: { monogram: "KH", motif: "compass", tone: "gold" },
  },
];

// ─── Customers (testimonials) ─────────────────────────────────────────────────

export type IndustryId = "silverware" | "pipes" | "jewellery" | "trading" | "retail" | "ceramics" | "feeds" | "manufacturing";

/** Badge labels for the customer marquee. Inferred from each business name on the old site. */
export const INDUSTRIES: Record<IndustryId, Localized> = {
  silverware: { en: "Silverware", ta: "வெள்ளிப் பொருட்கள்" },
  pipes: { en: "Pipes & fittings", ta: "குழாய்கள் & பொருத்திகள்" },
  jewellery: { en: "Jewellery", ta: "நகைகள்" },
  // VERIFY: "Enterprises" doesn't say what the business does.
  trading: { en: "Trading", ta: "வர்த்தகம்" },
  retail: { en: "Retail store", ta: "சில்லறை வணிகம்" },
  ceramics: { en: "Ceramics", ta: "பீங்கான் பொருட்கள்" },
  feeds: { en: "Feeds & foods", ta: "தீவனம் & உணவுப் பொருட்கள்" },
  // VERIFY: "Industries" doesn't say what the business makes.
  manufacturing: { en: "Manufacturing", ta: "உற்பத்தி" },
};

export interface Customer {
  id: string;
  name: Localized;
  business: Localized;
  industry: IndustryId;
}

/**
 * VERIFY: on the old site all 8 testimonials shared one generic sentence (including a
 * template line about "a vast fan base"). The cleaned sentence below should be replaced
 * with real, individual quotes collected from these customers.
 */
export const SHARED_TESTIMONIAL: Localized & { placeholder: true } = {
  en: "We are very happy and satisfied with the service, and we would highly recommend Panasuna to anyone.",
  ta: "சேவையில் நாங்கள் மிகவும் மகிழ்ச்சியும் திருப்தியும் அடைந்துள்ளோம்; பனசுனாவை அனைவருக்கும் பரிந்துரைக்கிறோம்.",
  placeholder: true,
};

export const CUSTOMERS: readonly Customer[] = [
  { id: "ravi-kumar", name: { en: "Ravi Kumar", ta: "ரவி குமார்" }, business: { en: "Kumbakonam Silver Shop & Co", ta: "கும்பகோணம் சில்வர் ஷாப் & கோ" }, industry: "silverware" },
  // VERIFY: business name spelled "Arunggarai" on the old site.
  { id: "anand", name: { en: "Anand", ta: "ஆனந்த்" }, business: { en: "Arunggarai Amman Pipes", ta: "அருங்கரை அம்மன் பைப்ஸ்" }, industry: "pipes" },
  { id: "bala", name: { en: "Bala", ta: "பாலா" }, business: { en: "Thanga Maligai Jewellers", ta: "தங்க மாளிகை ஜுவல்லர்ஸ்" }, industry: "jewellery" },
  { id: "vivek", name: { en: "Vivek", ta: "விவேக்" }, business: { en: "Madhurambigai Enterprises", ta: "மதுராம்பிகை எண்டர்பிரைசஸ்" }, industry: "trading" },
  { id: "mani", name: { en: "Mani", ta: "மணி" }, business: { en: "Sri Kannika Parameswari Store", ta: "ஸ்ரீ கன்னிகா பரமேஸ்வரி ஸ்டோர்" }, industry: "retail" },
  { id: "ashok-raja", name: { en: "Ashok Raja", ta: "அசோக் ராஜா" }, business: { en: "Mahaalaxmi Ceramics", ta: "மகாலட்சுமி செராமிக்ஸ்" }, industry: "ceramics" },
  { id: "vignesh-s", name: { en: "Vignesh S.", ta: "விக்னேஷ் எஸ்." }, business: { en: "Sai Durga Feeds & Foods", ta: "சாய் துர்கா ஃபீட்ஸ் & ஃபுட்ஸ்" }, industry: "feeds" },
  { id: "sundar", name: { en: "Sundar", ta: "சுந்தர்" }, business: { en: "Sundara Krishna Industries", ta: "சுந்தர கிருஷ்ணா இண்டஸ்ட்ரீஸ்" }, industry: "manufacturing" },
];

// ─── Quotes ───────────────────────────────────────────────────────────────────

export interface Quote {
  id: string;
  topic?: Localized;
  text: Localized;
  /** Attribution can't be traced; kept in the data, left off the page. */
  doubtful?: true;
}

export const QUOTES: { buffett: { author: Localized; quotes: readonly Quote[] }; gandhi: { author: Localized; quotes: readonly Quote[] } } = {
  buffett: {
    author: { en: "Warren Buffett", ta: "வாரன் பஃபெட்" },
    quotes: [
      {
        id: "earning",
        topic: { en: "On earning", ta: "வருமானம் பற்றி" },
        text: {
          en: "Never depend on a single income. Make investments to create a second source.",
          ta: "ஒரே வருமானத்தை மட்டும் நம்பியிருக்காதீர்கள். இரண்டாவது வருமான வழியை உருவாக்க முதலீடு செய்யுங்கள்.",
        },
      },
      {
        id: "spending",
        topic: { en: "On spending", ta: "செலவு பற்றி" },
        text: {
          en: "If you buy things you do not need, soon you will have to sell things you need.",
          ta: "தேவையில்லாதவற்றை வாங்கினால், விரைவில் தேவையானவற்றை விற்க வேண்டியிருக்கும்.",
        },
      },
      {
        id: "savings",
        topic: { en: "On savings", ta: "சேமிப்பு பற்றி" },
        text: {
          en: "Do not save what is left after spending, but spend what is left after saving.",
          ta: "செலவு செய்தபின் மீதமுள்ளதைச் சேமிக்காதீர்கள்; சேமித்தபின் மீதமுள்ளதைச் செலவு செய்யுங்கள்.",
        },
      },
      {
        id: "investment",
        topic: { en: "On investment", ta: "முதலீடு பற்றி" },
        text: {
          en: "Do not put all your eggs in one basket.",
          ta: "எல்லா முட்டைகளையும் ஒரே கூடையில் வைக்காதீர்கள்.",
        },
      },
      {
        id: "expectations",
        topic: { en: "On expectations", ta: "எதிர்பார்ப்பு பற்றி" },
        text: {
          en: "Honesty is a very expensive gift. Do not expect it from cheap people.",
          ta: "நேர்மை மிக விலையுயர்ந்த பரிசு. அதை மலிவான மனிதர்களிடம் எதிர்பார்க்காதீர்கள்.",
        },
      },
    ],
  },
  gandhi: {
    author: { en: "Mahatma Gandhi", ta: "மகாத்மா காந்தி" },
    quotes: [
      {
        id: "most-important-visitor",
        text: {
          en: "A customer is the most important visitor on our premises.",
          ta: "நம் வளாகத்திற்கு வரும் மிக முக்கியமான விருந்தினர் வாடிக்கையாளரே.",
        },
      },
      {
        id: "dependent",
        text: {
          en: "He is not dependent on us. We are dependent on him.",
          ta: "அவர் நம்மைச் சார்ந்திருக்கவில்லை. நாம்தான் அவரைச் சார்ந்திருக்கிறோம்.",
        },
      },
      {
        id: "purpose",
        text: {
          en: "He is not an interruption in our work. He is the purpose of it.",
          ta: "அவர் நம் பணிக்கு இடையூறு அல்ல. அவரே நம் பணியின் நோக்கம்.",
        },
      },
      {
        id: "part-of-it",
        text: {
          en: "He is not an outsider in our business. He is part of it.",
          ta: "அவர் நம் தொழிலுக்கு அந்நியர் அல்ல. அவர் அதன் ஒரு பகுதி.",
        },
      },
      {
        id: "favour",
        text: {
          en: "We are not doing him a favour by serving him. He is doing us a favour by giving us an opportunity to do so.",
          ta: "அவருக்குச் சேவை செய்வதன் மூலம் நாம் அவருக்கு உதவி செய்யவில்லை. அவ்வாறு செய்ய நமக்கு வாய்ப்பளிப்பதன் மூலம் அவர்தான் நமக்கு உதவி செய்கிறார்.",
        },
      },
      // VERIFY: widely circulated with the lines above, but this sentence is not reliably traced to Gandhi.
      {
        id: "brings-wants",
        doubtful: true,
        text: {
          en: "The customer is not someone to argue with or match wits against. He is a person who brings us his wants. If we have sufficient imagination, we will endeavour to handle them profitably for him and for ourselves.",
          ta: "வாடிக்கையாளர் வாதிடுவதற்கோ அறிவுப் போட்டிக்கோ உரியவர் அல்ல; தம் தேவைகளுடன் நம்மிடம் வருபவர். போதுமான கற்பனைத்திறன் இருந்தால், அவருக்கும் நமக்கும் பயனளிக்கும் வகையில் அவற்றை நிறைவேற்ற முயல்வோம்.",
        },
      },
    ],
  },
};

// ─── Contact section & modals ─────────────────────────────────────────────────

export const CONTACT_SECTION = {
  title: { en: "Contact us", ta: "எங்களைத் தொடர்புகொள்ள" } as Localized,
  intro: {
    en: "Whether you're looking for answers, want to solve a problem, or just want to tell us how we did, you'll find many ways to reach us here. We'll help you resolve your issues quickly and easily, so you can get back to more important things.",
    ta: "கேள்விகளுக்கு விடை தேடுகிறீர்களா, ஒரு சிக்கலைத் தீர்க்க வேண்டுமா, அல்லது எங்கள் சேவை குறித்துக் கருத்துச் சொல்ல விரும்புகிறீர்களா — எங்களைத் தொடர்புகொள்ளப் பல வழிகள் இங்கே உள்ளன. உங்கள் சிக்கல்களை விரைவாகவும் எளிதாகவும் தீர்க்க உதவுவோம்.",
  } as Localized,
  cards: [
    {
      id: "apply",
      title: { en: "Apply for a chit", ta: "சீட்டில் சேர விண்ணப்பிக்க" },
      body: { en: "Looking to join a new chit? Contact us now.", ta: "புதிய சீட்டில் சேர விரும்புகிறீர்களா? இப்போதே தொடர்புகொள்ளுங்கள்." },
      action: { en: "Book an appointment", ta: "சந்திப்பை முன்பதிவு செய்ய" },
    },
    {
      id: "call",
      title: { en: "Call us", ta: "எங்களை அழையுங்கள்" },
      body: { en: "9842360611", ta: "9842360611" },
      action: { en: "Call now", ta: "இப்போதே அழைக்க" },
    },
    {
      id: "advisor",
      title: { en: "Talk to an advisor", ta: "ஆலோசகருடன் பேசுங்கள்" },
      body: { en: "Need savings advice? Talk to our chit advisors.", ta: "சேமிப்பு ஆலோசனை வேண்டுமா? எங்கள் சீட்டு ஆலோசகர்களுடன் பேசுங்கள்." },
      action: { en: "Meet an advisor", ta: "ஆலோசகரைச் சந்திக்க" },
    },
  ] as readonly { id: string; title: Localized; body: Localized; action: Localized }[],
};

// ─── About page (/about) and home §8 ──────────────────────────────────────────

const FIFTIETH_YEAR = ESTABLISHED_YEAR + 50;

export type HeritageChapterId = "founding" | "cycles" | "compliance" | "customers" | "next-generation" | "fifty";

export interface HeritageChapter {
  id: HeritageChapterId;
  /** Only the two dates the old site supports; every other chapter is an era, not a year. */
  year: number | null;
  marker: Localized;
  title: Localized;
  body: Localized;
}

/** editorial: chapters are drawn from the directors' bios and the old About/Why us pages — no invented dates. */
export const ABOUT_PAGE = {
  title: { en: "Fifty years of making life easy.", ta: "வாழ்க்கையை எளிதாக்கும் ஐம்பது ஆண்டுகள்." } as Localized,
  lead: {
    en: `Founded in Salem in ${ESTABLISHED_YEAR} and managed by a Board of Directors, Panasuna has spent half a century helping families and businesses turn regular saving into the money they need, when they need it.`,
    ta: `${ESTABLISHED_YEAR}-இல் சேலத்தில் நிறுவப்பட்டு, இயக்குநர் குழுவால் நிர்வகிக்கப்படும் பனசுனா, அரை நூற்றாண்டாகக் குடும்பங்களும் வணிகங்களும் தங்கள் வழக்கமான சேமிப்பைத் தேவையான நேரத்தில் தேவையான பணமாக மாற்ற உதவி வருகிறது.`,
  } as Localized,
  timeline: {
    title: { en: `From ${ESTABLISHED_YEAR}, one year at a time.`, ta: `${ESTABLISHED_YEAR} முதல், ஒவ்வொரு ஆண்டாக.` } as Localized,
    lead: {
      en: "Each gold mark round the base is a year of trust, and each stone a decade. Scroll to build all fifty.",
      ta: "அடித்தளத்தைச் சுற்றியுள்ள ஒவ்வொரு தங்கக் குறியும் ஓர் ஆண்டு நம்பிக்கை; ஒவ்வொரு கல்லும் ஒரு பத்தாண்டு. ஐம்பதையும் கட்டியெழுப்ப உருட்டுங்கள்.",
    } as Localized,
    sceneLabel: {
      en: `A heritage monolith of five obsidian stones, one for each decade from ${ESTABLISHED_YEAR} to ${FIFTIETH_YEAR}, ringed by fifty gold year marks and crowned by the Panasuna crest.`,
      ta: `${ESTABLISHED_YEAR} முதல் ${FIFTIETH_YEAR} வரை பத்தாண்டுக்கு ஒன்றாக ஐந்து கருங்கற்கள் கொண்ட பாரம்பரியத் தூண்; அதைச் சுற்றி ஐம்பது தங்க ஆண்டுக் குறிகள், உச்சியில் பனசுனா முத்திரை.`,
    } as Localized,
    yearsBuilt: { en: "years", ta: "ஆண்டுகள்" } as Localized,
    chapters: [
      {
        id: "founding",
        year: ESTABLISHED_YEAR,
        marker: { en: "Founded", ta: "தொடக்கம்" },
        title: { en: "A chit fund company, founded in Salem", ta: "சேலத்தில் ஒரு சீட்டு நிதி நிறுவனம்" },
        body: {
          en: "R. Viswanathan set aside every other opportunity to build a chit fund company with his uncle, Mr. S. Krishnamoorthy. Panasuna Chits (P) Ltd. began in Salem with one idea: spend what is left after saving.",
          ta: "திரு. ஆர். விஸ்வநாதன் பிற வாய்ப்புகள் அனைத்தையும் துறந்து, தம் மாமா திரு. எஸ். கிருஷ்ணமூர்த்தி அவர்களுடன் இணைந்து ஒரு சீட்டு நிதி நிறுவனத்தை உருவாக்கினார். “சேமித்தபின் மீதமுள்ளதைச் செலவு செய்” என்ற ஒரே சிந்தனையுடன் சேலத்தில் பனசுனா சிட்ஸ் (பி) லிமிடெட் தொடங்கியது.",
        },
      },
      {
        id: "cycles",
        year: null,
        marker: { en: "Through every cycle", ta: "ஒவ்வொரு சுழற்சியிலும்" },
        title: { en: "Stable and prudent through the ups and downs", ta: "ஏற்ற இறக்கங்களிலும் நிலையானது, விவேகமானது" },
        body: {
          en: "The company has been through every high and low of the chit industry. Through all of it, every chit has been backed by a security deposit equal to 100% of its value, held in a Scheduled Bank as an FDR.",
          ta: "சீட்டுத் துறையின் அனைத்து ஏற்ற இறக்கங்களையும் நிறுவனம் கடந்து வந்துள்ளது. அனைத்துக் காலங்களிலும், ஒவ்வொரு சீட்டுக்கும் அதன் மதிப்பில் 100%-க்குச் சமமான பாதுகாப்பு வைப்பு ஷெட்யூல்டு வங்கியில் FDR ஆக வைக்கப்பட்டுள்ளது.",
        },
      },
      {
        id: "compliance",
        year: null,
        marker: { en: "Law and books", ta: "சட்டமும் கணக்கும்" },
        title: { en: "Compliance made part of the craft", ta: "சட்ட இணக்கமே தொழிலின் அங்கம்" },
        body: {
          en: "K. Mohanasundaram, an advocate, brought his legal practice into the business. He makes sure every activity is carried out in full legal compliance, and advises other chit companies on keeping their documents and books.",
          ta: "வழக்கறிஞரான திரு. கே. மோகனசுந்தரம் தமது சட்ட அனுபவத்தைத் தொழிலுக்குக் கொண்டு வந்தார். ஒவ்வொரு செயல்பாடும் முழுச் சட்ட இணக்கத்துடன் நடைபெறுவதை உறுதி செய்வதோடு, பிற சீட்டு நிறுவனங்களுக்கும் ஆவணங்கள், கணக்குகள் பராமரிப்பில் ஆலோசனை வழங்குகிறார்.",
        },
      },
      {
        id: "customers",
        year: null,
        marker: { en: "At your doorstep", ta: "உங்கள் வாசலில்" },
        title: { en: "Customer-Centric Approach", ta: "வாடிக்கையாளருக்கே முன்னுரிமை" },
        body: {
          en: "K. Karunanithy, the company's backbone, made clear explanations and careful calculations the house style. A disciplined monthly collection cycle, and a team that collects at your doorstep, followed.",
          ta: "நிறுவனத்தின் முதுகெலும்பான திரு. கே. கருணாநிதி, தெளிவான விளக்கங்களையும் கவனமான கணக்கீடுகளையும் நிறுவனத்தின் பாணியாக்கினார். ஒழுங்கான மாத வசூல் சுழற்சியும், வீடு தேடி வரும் வசூல் குழுவும் அதைத் தொடர்ந்தன.",
        },
      },
      {
        id: "next-generation",
        year: null,
        marker: { en: "The next generation", ta: "அடுத்த தலைமுறை" },
        title: { en: "A new generation joins the board", ta: "இயக்குநர் குழுவில் புதிய தலைமுறை" },
        body: {
          en: "M. Karthish left investment banking, and K. Harish returned from the Irish financial sector. Both now teach college students how registered chit funds work, and K. Harish heads Young Minds, the state-level organisation for young people in the industry.",
          ta: "திரு. எம். கார்த்திஷ் முதலீட்டு வங்கிப் பணியைத் துறந்தும், திரு. கே. ஹரிஷ் அயர்லாந்து நிதித் துறையிலிருந்து திரும்பியும் இணைந்தனர். இருவரும் பதிவு செய்யப்பட்ட சீட்டு நிதிகள் குறித்துக் கல்லூரி மாணவர்களுக்குக் கற்பிக்கின்றனர்; துறையின் இளைஞர்களுக்கான மாநில அமைப்பான யங் மைண்ட்ஸ்-ஐத் திரு. கே. ஹரிஷ் தலைமை தாங்குகிறார்.",
        },
      },
      {
        id: "fifty",
        year: OPERATING_YEAR,
        marker: HERITAGE_SPAN.label,
        title: { en: `${ESTABLISHED_YEAR} – ${OPERATING_YEAR}, and continuing strong`, ta: `${ESTABLISHED_YEAR} – ${OPERATING_YEAR}, தொடர்ந்து வலுவாக` },
        body: {
          en: `Fifty years on and still running, Panasuna offers ${PLAN_COUNT_HEADLINE}+ plans and active groups from ${formatINR(PLAN_VALUE_MIN)} to ${formatINR(PLAN_VALUE_MAX)}, and still works toward one purpose: to make life easy for the ordinary people of India.`,
          ta: `ஐம்பது ஆண்டுகளுக்குப் பின்னும் தொடர்ந்து, ${PLAN_COUNT_HEADLINE}+ திட்டங்கள் & நடப்புக் குழுக்களுடன், ${formatINR(PLAN_VALUE_MIN)} முதல் ${formatINR(PLAN_VALUE_MAX)} வரையிலான சீட்டுகளுடன், இந்தியாவின் சாதாரண மக்களின் வாழ்க்கையை எளிதாக்கும் அதே நோக்கத்திற்காகப் பனசுனா உழைக்கிறது.`,
        },
      },
    ] as readonly HeritageChapter[],
  },
  purpose: {
    title: { en: "Why we exist", ta: "நாங்கள் ஏன் இருக்கிறோம்" } as Localized,
    mission: ABOUT.mission,
    vision: ABOUT.vision,
    values: ABOUT.values,
    /** The phrase the mission statement is built around, set large. */
    motto: { en: "Make life easy.", ta: "வாழ்க்கையை எளிதாக்குவோம்." } as Localized,
  },
  board: {
    title: { en: "The Board of Directors", ta: "இயக்குநர் குழு" } as Localized,
    lead: {
      en: "Three generations, one table. Every director holds a role in the chit fund associations that set the industry's standards.",
      ta: "மூன்று தலைமுறைகள், ஒரே மேசை. ஒவ்வொரு இயக்குநரும் துறையின் தரங்களை வகுக்கும் சீட்டு நிதிச் சங்கங்களில் பொறுப்பு வகிக்கின்றனர்.",
    } as Localized,
    readBio: { en: "Read profile", ta: "சுயவிவரம் படிக்க" } as Localized,
    associations: { en: "Associations", ta: "சங்கப் பொறுப்புகள்" } as Localized,
    past: { en: "Past", ta: "முன்னாள்" } as Localized,
    current: { en: "Current", ta: "தற்போது" } as Localized,
    close: { en: "Close profile", ta: "சுயவிவரத்தை மூடு" } as Localized,
    previous: { en: "Previous director", ta: "முந்தைய இயக்குநர்" } as Localized,
    next: { en: "Next director", ta: "அடுத்த இயக்குநர்" } as Localized,
  },
  philosophies: {
    title: { en: "Two ideas we work by", ta: "நாங்கள் பின்பற்றும் இரு சிந்தனைகள்" } as Localized,
    buffett: {
      theme: { en: "Saving & investing", ta: "சேமிப்பும் முதலீடும்" } as Localized,
      /** The quote set large; it's also the old hero's tagline. */
      headline: "savings",
    },
    gandhi: {
      theme: { en: "Customer first", ta: "வாடிக்கையாளரே முதன்மை" } as Localized,
      headline: "purpose",
    },
  },
};

export const HOME_ABOUT = {
  title: { en: "A family institution, run by a board.", ta: "இயக்குநர் குழு நடத்தும் ஒரு குடும்ப நிறுவனம்." } as Localized,
  lead: ABOUT.company.body,
  meet: { en: "Meet the board", ta: "இயக்குநர் குழுவைச் சந்திக்க" } as Localized,
  story: { en: "Read our story", ta: "எங்கள் கதையைப் படிக்க" } as Localized,
};

// ─── Customers (home §9) ──────────────────────────────────────────────────────

export const CUSTOMERS_SECTION = {
  title: { en: "Salem's businesses save with us.", ta: "சேலத்தின் வணிகங்கள் எங்களுடன் சேமிக்கின்றன." } as Localized,
  lead: {
    en: "Jewellers, traders, manufacturers and shopkeepers use Panasuna chits to fund stock, machinery and growth.",
    ta: "நகைக்கடைக்காரர்கள், வணிகர்கள், உற்பத்தியாளர்கள், கடைக்காரர்கள் தங்கள் சரக்கு, இயந்திரங்கள், வளர்ச்சிக்குப் பனசுனா சீட்டுகளைப் பயன்படுத்துகின்றனர்.",
  } as Localized,
  listLabel: { en: "Customers of Panasuna", ta: "பனசுனாவின் வாடிக்கையாளர்கள்" } as Localized,
  pause: { en: "Pause scrolling", ta: "நகர்வை நிறுத்து" } as Localized,
  play: { en: "Resume scrolling", ta: "நகர்வைத் தொடர்" } as Localized,
  quote: SHARED_TESTIMONIAL,
  quoteBy: { en: "Our customers", ta: "எங்கள் வாடிக்கையாளர்கள்" } as Localized,
};

// ─── Google reviews (home §9, beside the customer marquee) ───────────────────

export interface GoogleReview {
  id: string;
  reviewer: Localized;
  rating: 1 | 2 | 3 | 4 | 5;
  /** Theme the client asked to highlight; drives the small tag on the card. */
  topic: "payout" | "heritage" | "auctions" | "staff" | "flexibility" | "trust";
  text: Localized;
  /**
   * VERIFY: true until the text and name are copied verbatim from the live Google Business profile.
   * Draft reviews render only in development, so invented reviews can never ship to customers.
   */
  draft: boolean;
}

export const GOOGLE_REVIEWS_SECTION = {
  title: { en: "Verified Google Reviews", ta: "சரிபார்க்கப்பட்ட Google மதிப்புரைகள்" } as Localized,
  /** Read from the live Google Business profile on 7 Nov 2026: 4.9 from 83 reviews. */
  rating: 4.9,
  ratingLabel: { en: "4.9 ★ Rating · 83 Google reviews · Salem HQ", ta: "4.9 ★ மதிப்பீடு · 83 Google மதிப்புரைகள் · சேலம் தலைமையகம்" } as Localized,
  subscriberTag: { en: "Google review", ta: "Google மதிப்புரை" } as Localized,
  topics: {
    payout: { en: "Prompt payout", ta: "விரைவான பணப்பட்டுவாடா" },
    heritage: { en: "50+ years on Chinna Kadai Street", ta: "சின்னக்கடை வீதியில் 50+ ஆண்டுகள்" },
    auctions: { en: "Transparent monthly auctions", ta: "வெளிப்படையான மாத ஏலம்" },
    staff: { en: "Courteous staff", ta: "மரியாதையான ஊழியர்கள்" },
    flexibility: { en: "Save and borrow in one", ta: "சேமிப்பும் கடனும் ஒன்றாக" },
    trust: { en: "Safe and trusted", ta: "பாதுகாப்பானது, நம்பகமானது" },
  } satisfies Record<GoogleReview["topic"], Localized>,
  readAll: { en: "Read all reviews on Google", ta: "அனைத்து மதிப்புரைகளையும் Google-இல் படிக்க" } as Localized,
  draftNotice: {
    en: "Draft reviews (development only): replace with verbatim reviews from the Google Business profile.",
    ta: "வரைவு மதிப்புரைகள் (மேம்பாட்டில் மட்டும்): Google வணிகச் சுயவிவரத்தின் உண்மையான மதிப்புரைகளால் மாற்றவும்.",
  } as Localized,
  href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Panasuna Chits, ${CONTACT.addressOneLine.en}`)}`,
};

/** Verbatim Google reviews of Panasuna Chits (P) Ltd, Salem (collected 7 Nov 2026; 4.9 from 83 reviews). Names and text are as posted. */
export const GOOGLE_REVIEWS: readonly GoogleReview[] = [
  {
    id: "ajith-kumar",
    reviewer: { en: "Ajith Kumar", ta: "Ajith Kumar" },
    rating: 5,
    topic: "auctions",
    text: { en: "Been a customer with them for years now, they have really good schemes and they explain the pros and cons so clear, their investment and return policy is very clear and transparent, would definitely recommend for friends and family who wants to save money", ta: "Been a customer with them for years now, they have really good schemes and they explain the pros and cons so clear, their investment and return policy is very clear and transparent, would definitely recommend for friends and family who wants to save money" },
    draft: false,
  },
  {
    id: "princely-sethu",
    reviewer: { en: "Princely Sethu", ta: "Princely Sethu" },
    rating: 5,
    topic: "staff",
    text: { en: "I like the way the company guide and support me. Good administration, and this is the best chit company i ever seen, and very faithful. This is my backbone of my success in the business, thank you so much.", ta: "I like the way the company guide and support me. Good administration, and this is the best chit company i ever seen, and very faithful. This is my backbone of my success in the business, thank you so much." },
    draft: false,
  },
  {
    id: "kiruthika-k",
    reviewer: { en: "Kiruthika K", ta: "Kiruthika K" },
    rating: 5,
    topic: "flexibility",
    text: { en: "I would definitely choose investing in Chit fund when compared to other tools in the market due to its flexibility of both borrowing and savings.", ta: "I would definitely choose investing in Chit fund when compared to other tools in the market due to its flexibility of both borrowing and savings." },
    draft: false,
  },
  {
    id: "sarees-ulagam",
    reviewer: { en: "Sarees Ulagam", ta: "Sarees Ulagam" },
    rating: 5,
    topic: "payout",
    text: { en: "Best Place to Save Money and get Good Returns. Staff is Friendly and Helpful", ta: "Best Place to Save Money and get Good Returns. Staff is Friendly and Helpful" },
    draft: false,
  },
  {
    id: "soundar-r",
    reviewer: { en: "Soundar R", ta: "Soundar R" },
    rating: 5,
    topic: "staff",
    text: { en: "Excellent response from management and staff... Everyone should join and get the benefits", ta: "Excellent response from management and staff... Everyone should join and get the benefits" },
    draft: false,
  },
  {
    id: "muthumani-kuttalam",
    reviewer: { en: "Muthumani Kuttalam", ta: "Muthumani Kuttalam" },
    rating: 5,
    topic: "staff",
    text: { en: "Best customer service I have ever experienced.", ta: "Best customer service I have ever experienced." },
    draft: false,
  },
  {
    id: "loges-wari",
    reviewer: { en: "Loges Wari", ta: "Loges Wari" },
    rating: 5,
    topic: "staff",
    text: { en: "They give good service and are always ready to answer my questions", ta: "They give good service and are always ready to answer my questions" },
    draft: false,
  },
  {
    id: "kesav-bm",
    reviewer: { en: "Kesav BM", ta: "Kesav BM" },
    rating: 5,
    topic: "trust",
    text: { en: "Good and trusted finance in Salem", ta: "Good and trusted finance in Salem" },
    draft: false,
  },
  {
    id: "nithi-venkatla",
    reviewer: { en: "Nithi Venkatla", ta: "Nithi Venkatla" },
    rating: 5,
    topic: "trust",
    text: { en: "Safe and secure chits", ta: "Safe and secure chits" },
    draft: false,
  },
  {
    id: "priya-sweety",
    reviewer: { en: "Priya Sweety", ta: "Priya Sweety" },
    rating: 5,
    topic: "trust",
    text: { en: "Best chits company and trusted", ta: "Best chits company and trusted" },
    draft: false,
  },
];

// ─── FAQ & terminology (home §10, /resources) ─────────────────────────────────

const FAQ_PLAN = { chitValue: 500_000, months: 50, discountRate: 0.2 };
const faqDiscount = FAQ_PLAN.chitValue * FAQ_PLAN.discountRate;
const faqCommission = FAQ_PLAN.chitValue * CHIT_RULES.commissionRate;
const faqShare = (faqDiscount - faqCommission) / FAQ_PLAN.months;
const faqInstallment = FAQ_PLAN.chitValue / FAQ_PLAN.months;
const PHONE_LIST = PHONE_LINE;

export type FaqId = "what-is" | "auction" | "dividends" | "join-existing" | "missed" | "documents" | "support";

export interface FaqItem {
  id: FaqId;
  question: Localized;
  /** One string per paragraph. */
  answer: Localized<readonly string[]>;
  /** Extra words a visitor might search for. */
  keywords: Localized;
}

export const FAQ = {
  title: { en: "Questions, answered.", ta: "கேள்விகளுக்குப் பதில்கள்." } as Localized,
  lead: {
    en: "The things people ask us most, in plain words. Can't find yours? Call us.",
    ta: "மக்கள் அதிகம் கேட்கும் கேள்விகள், எளிய சொற்களில். உங்கள் கேள்வி இல்லையா? எங்களை அழையுங்கள்.",
  } as Localized,
  search: { en: "Search questions and terms", ta: "கேள்விகளையும் சொற்களையும் தேடுங்கள்" } as Localized,
  placeholder: { en: "Try “dividend” or “documents”", ta: "“ஈவுத்தொகை” அல்லது “ஆவணங்கள்” எனத் தேடுங்கள்" } as Localized,
  clear: { en: "Clear search", ta: "தேடலை அழி" } as Localized,
  results: {
    en: (n: number) => (n === 1 ? "1 result" : `${n} results`),
    ta: (n: number) => `${n} முடிவுகள்`,
  },
  empty: {
    en: "Nothing matches that yet. Call us and we'll answer it.",
    ta: "இதற்குப் பொருத்தம் இல்லை. எங்களை அழையுங்கள், பதில் தருகிறோம்.",
  } as Localized,
  questionsTitle: { en: "Frequently asked", ta: "அடிக்கடி கேட்கப்படுபவை" } as Localized,
  termsTitle: { en: "Terminology", ta: "சொல் விளக்கம்" } as Localized,
  more: { en: "All questions and terms", ta: "அனைத்துக் கேள்விகளும் சொற்களும்" } as Localized,
  items: [
    {
      id: "what-is",
      question: CHIT_FUND_BASICS.whatIs.title,
      answer: {
        en: [
          CHIT_FUND_BASICS.whatIs.body.en,
          "A group of members each pay a fixed monthly subscription. Every month the pooled amount, the chit value, goes to one member through an auction, until every member has received it once. It works as savings for those who take it late and as a low-cost loan for those who take it early.",
        ],
        ta: [
          CHIT_FUND_BASICS.whatIs.body.ta,
          "ஒரு குழுவின் உறுப்பினர்கள் ஒவ்வொருவரும் நிலையான மாதச் சந்தா செலுத்துகின்றனர். ஒவ்வொரு மாதமும் திரண்ட தொகை, அதாவது சீட்டுத் தொகை, ஏலத்தின் மூலம் ஓர் உறுப்பினருக்குச் செல்கிறது; இவ்வாறு ஒவ்வொருவரும் ஒருமுறை பெறும் வரை தொடர்கிறது. தாமதமாக எடுப்பவர்களுக்கு இது சேமிப்பு; முன்னதாக எடுப்பவர்களுக்குக் குறைந்த செலவிலான கடன்.",
        ],
      },
      keywords: { en: "chit fund meaning savings scheme group members pool", ta: "சீட்டு பொருள் சேமிப்பு குழு உறுப்பினர்" },
    },
    {
      id: "auction",
      question: { en: "How does an auction work?", ta: "ஏலம் எப்படி நடைபெறுகிறது?" },
      answer: {
        en: [
          "Each month, members who have not yet taken the chit can bid for it. A bid is the discount they are willing to give up from the chit value to take the money now.",
          `The highest discount wins, up to a ceiling of ${MAX_DISCOUNT_PCT} of the chit value. The winner, the prized subscriber, receives the chit value minus the discount, and every member is told the bid details promptly.`,
        ],
        ta: [
          "ஒவ்வொரு மாதமும், இன்னும் சீட்டை எடுக்காத உறுப்பினர்கள் ஏலம் கேட்கலாம். இப்போதே பணம் பெற, சீட்டுத் தொகையிலிருந்து அவர்கள் விட்டுக்கொடுக்கத் தயாராக உள்ள தள்ளுபடியே ஏலத் தொகை.",
          `சீட்டுத் தொகையின் ${MAX_DISCOUNT_PCT} உச்சவரம்பு வரை, அதிகத் தள்ளுபடி வெற்றி பெறுகிறது. வெற்றியாளர் (பரிசுபெற்ற சந்தாதாரர்) சீட்டுத் தொகையில் தள்ளுபடி கழித்த தொகையைப் பெறுகிறார்; ஏல விவரங்கள் அனைத்து உறுப்பினர்களுக்கும் உடனுக்குடன் தெரிவிக்கப்படுகின்றன.`,
        ],
      },
      keywords: { en: "bid bidding discount prize winner highest", ta: "ஏலம் தள்ளுபடி பரிசு வெற்றி" },
    },
    {
      id: "dividends",
      question: { en: "How are dividends calculated?", ta: "ஈவுத்தொகை எப்படிக் கணக்கிடப்படுகிறது?" },
      answer: {
        en: [
          "Dividend per member = (discount − foreman's commission) ÷ number of members. It is taken off your next installment, so you pay less.",
          `Example, ${formatINR(FAQ_PLAN.chitValue)} over ${FAQ_PLAN.months} months: a ${formatPercent(FAQ_PLAN.discountRate)} bid is a ${formatINR(faqDiscount)} discount. Less the ${COMMISSION_PCT} commission (${formatINR(faqCommission)}), ${formatINR(faqDiscount - faqCommission)} is shared, ${formatINR(faqShare)} each, so the next installment is ${formatINR(faqInstallment - faqShare)} instead of ${formatINR(faqInstallment)}.`,
          `Dividends change with every auction and are not guaranteed. The ${COMMISSION_PCT} commission is an assumption for illustration; your chit agreement states the actual rate.`,
        ],
        ta: [
          "ஒரு உறுப்பினருக்கான ஈவுத்தொகை = (தள்ளுபடி − நிறுவனக் கமிஷன்) ÷ உறுப்பினர்களின் எண்ணிக்கை. இது உங்கள் அடுத்த தவணையிலிருந்து கழிக்கப்படுவதால், நீங்கள் குறைவாகச் செலுத்துவீர்கள்.",
          `எடுத்துக்காட்டு, ${formatINR(FAQ_PLAN.chitValue)}, ${FAQ_PLAN.months} மாதங்கள்: ${formatPercent(FAQ_PLAN.discountRate)} ஏலம் என்றால் ${formatINR(faqDiscount)} தள்ளுபடி. ${COMMISSION_PCT} கமிஷன் (${formatINR(faqCommission)}) போக ${formatINR(faqDiscount - faqCommission)} பகிரப்படுகிறது — ஒவ்வொருவருக்கும் ${formatINR(faqShare)}; அடுத்த தவணை ${formatINR(faqInstallment)}-க்குப் பதில் ${formatINR(faqInstallment - faqShare)}.`,
          `ஈவுத்தொகை ஒவ்வொரு ஏலத்திற்கும் மாறுபடும்; உத்தரவாதம் இல்லை. ${COMMISSION_PCT} கமிஷன் விளக்கத்திற்கான அனுமானம்; உண்மையான விகிதம் உங்கள் சீட்டு ஒப்பந்தத்தில் குறிப்பிடப்படும்.`,
        ],
      },
      keywords: { en: "dividend commission share installment reduce formula example", ta: "ஈவுத்தொகை கமிஷன் பங்கு தவணை" },
    },
    {
      id: "join-existing",
      question: { en: "Can I join an existing group?", ta: "ஏற்கெனவே நடைபெறும் குழுவில் சேரலாமா?" },
      // VERIFY: Panasuna's policy on filling vacancies in running groups.
      answer: {
        en: [
          "Sometimes. When a seat becomes vacant in a running group, it may be offered to a new member on the terms the chit agreement and the Chit Funds Act allow. Most members join a new group at its start.",
          "Tell us the chit value and duration you want, and our team will tell you which groups are open now and which are starting soon.",
        ],
        ta: [
          "சில நேரங்களில் முடியும். நடைபெறும் குழுவில் ஓர் இடம் காலியானால், சீட்டு ஒப்பந்தமும் சீட்டு நிதிச் சட்டமும் அனுமதிக்கும் விதிமுறைகளின்படி அது புதிய உறுப்பினருக்கு வழங்கப்படலாம். பெரும்பாலான உறுப்பினர்கள் புதிய குழுவின் தொடக்கத்திலேயே சேருகின்றனர்.",
          "நீங்கள் விரும்பும் சீட்டுத் தொகையையும் காலத்தையும் தெரிவியுங்கள்; இப்போது திறந்துள்ள மற்றும் விரைவில் தொடங்கவுள்ள குழுக்களை எங்கள் குழு தெரிவிக்கும்.",
        ],
      },
      keywords: { en: "join running group vacancy seat start new", ta: "சேர குழு காலி இடம் புதிய" },
    },
    {
      id: "missed",
      question: { en: "What happens if I miss an installment?", ta: "ஒரு தவணையைத் தவறவிட்டால் என்ன ஆகும்?" },
      // VERIFY: late-payment terms, and whether a member who misses installments can still bid.
      answer: {
        en: [
          "Panasuna runs on a disciplined monthly installment schedule: one fixed installment, due on the same date every month.",
          `If you face an unexpected delay, call our Salem office team on ${PHONE_LIST} before the monthly due date. Our advisors will guide you according to your chit agreement terms and help protect your dividend eligibility.`,
        ],
        ta: [
          "பனசுனா ஒழுங்கான மாதத் தவணை அட்டவணையில் இயங்குகிறது: ஒவ்வொரு மாதமும் ஒரே தேதியில் செலுத்த வேண்டிய ஒரே நிலையான தவணை.",
          `எதிர்பாராத தாமதம் ஏற்பட்டால், மாதத் தவணைத் தேதிக்கு முன்பே ${PHONE_LIST} என்ற எண்களில் எங்கள் சேலம் அலுவலகக் குழுவை அழையுங்கள். உங்கள் சீட்டு ஒப்பந்த விதிமுறைகளின்படி எங்கள் ஆலோசகர்கள் வழிகாட்டி, உங்கள் ஈவுத்தொகைத் தகுதியைக் காக்க உதவுவார்கள்.`,
        ],
      },
      keywords: { en: "late payment miss default penalty due date monthly collection dividend", ta: "தாமதம் தவணை தவறு நிலுவை மாத வசூல் ஈவுத்தொகை" },
    },
    {
      id: "documents",
      question: { en: "What documents are required?", ta: "என்னென்ன ஆவணங்கள் தேவை?" },
      // VERIFY: the exact document and surety list per scheme.
      answer: {
        en: [
          "To join, you sign the chit agreement and provide proof of identity and address.",
          "When you take the chit amount, the agreement requires security for the installments still to come, such as a surety or other documents. The list depends on the scheme and the amount, so our team will give you the exact list before you join.",
        ],
        ta: [
          "சேர, சீட்டு ஒப்பந்தத்தில் கையொப்பமிட்டு, அடையாள மற்றும் முகவரிச் சான்றுகளை வழங்க வேண்டும்.",
          "சீட்டுத் தொகையைப் பெறும்போது, இனி வரவுள்ள தவணைகளுக்கான பாதுகாப்பாக ஜாமீன் அல்லது பிற ஆவணங்களை ஒப்பந்தம் கோருகிறது. இந்தப் பட்டியல் திட்டத்தையும் தொகையையும் பொறுத்தது; சேர்வதற்கு முன் எங்கள் குழு சரியான பட்டியலைத் தரும்.",
        ],
      },
      keywords: { en: "documents proof identity address surety guarantor kyc agreement", ta: "ஆவணங்கள் சான்று அடையாளம் முகவரி ஜாமீன்" },
    },
    {
      id: "support",
      question: { en: "How can I contact customer support?", ta: "வாடிக்கையாளர் சேவையை எப்படித் தொடர்புகொள்வது?" },
      answer: {
        en: [
          `Call ${CONTACT.phones[0].display} (primary mobile) or ${CONTACT.phones[1].display} (office landline).`,
          `Or visit our Salem office at ${CONTACT.addressOneLine.en}.`,
        ],
        ta: [
          `${CONTACT.phones[0].display} (முதன்மைக் கைபேசி) அல்லது ${CONTACT.phones[1].display} (அலுவலகத் தொலைபேசி) என்ற எண்களில் அழையுங்கள்.`,
          `அல்லது ${CONTACT.addressOneLine.ta} என்ற முகவரியில் உள்ள எங்கள் சேலம் அலுவலகத்திற்கு வாருங்கள்.`,
        ],
      },
      keywords: { en: "contact phone call mobile landline office address help support", ta: "தொடர்பு தொலைபேசி அழைப்பு கைபேசி அலுவலகம் முகவரி உதவி" },
    },
  ] as readonly FaqItem[],
  terms: [
    {
      term: { en: "Chit value", ta: "சீட்டுத் தொகை" },
      body: { en: "The total a group pools each month: the monthly subscription times the number of members.", ta: "ஒரு குழு ஒவ்வொரு மாதமும் திரட்டும் மொத்தத் தொகை: மாதச் சந்தா × உறுப்பினர்களின் எண்ணிக்கை." },
    },
    {
      term: { en: "Subscriber", ta: "சந்தாதாரர்" },
      body: { en: "A member of the chit group who pays the monthly subscription.", ta: "மாதச் சந்தா செலுத்தும் சீட்டுக் குழு உறுப்பினர்." },
    },
    {
      term: { en: "Foreman", ta: "நிறுவனர் (ஃபோர்மேன்)" },
      body: { en: "The chit company that runs the group, holds the security deposit and conducts the auctions.", ta: "குழுவை நடத்தி, பாதுகாப்பு வைப்பை வைத்து, ஏலங்களை நடத்தும் சீட்டு நிறுவனம்." },
    },
    ...AUCTION_PROCESS.glossary,
    {
      term: { en: "FDR security deposit", ta: "FDR பாதுகாப்பு வைப்பு" },
      body: TRUST_FACTS.find((f) => f.id === "fdr-security")!.body,
    },
  ] as readonly { term: Localized; body: Localized }[],
};

export const RESOURCES_PAGE = {
  title: { en: "Resources", ta: "தகவல் மையம்" } as Localized,
  lead: {
    en: "Answers to common questions, the words used in every chit agreement, and tools to work out what a chit means for you.",
    ta: "பொதுவான கேள்விகளுக்கான பதில்கள், ஒவ்வொரு சீட்டு ஒப்பந்தத்திலும் வரும் சொற்கள், உங்களுக்கு ஒரு சீட்டு என்ன தரும் என்பதைக் கணக்கிடும் கருவிகள்.",
  } as Localized,
  toolsTitle: { en: "Work it out yourself", ta: "நீங்களே கணக்கிடுங்கள்" } as Localized,
  tools: [
    {
      href: "/how-chits-work",
      title: { en: "How chits work", ta: "சீட்டு இயங்கும் விதம்" },
      body: { en: "Five stages of a chit, from joining to payout, and how a chit compares with FDs, loans and credit cards.", ta: "சேர்வது முதல் பணம் பெறுவது வரை சீட்டின் ஐந்து நிலைகள்; FD, கடன், கடன் அட்டையுடன் ஒப்பீடு." },
    },
    {
      href: "/auction-process",
      title: { en: "Auction simulator", ta: "ஏல மாதிரி" },
      body: { en: "Pick a plan, set a bid and see the dividend each member receives.", ta: "ஒரு திட்டத்தைத் தேர்ந்து, ஏலத்தை அமைத்து, ஒவ்வொருவரும் பெறும் ஈவுத்தொகையைப் பாருங்கள்." },
    },
    {
      href: "/calculator",
      title: { en: "Chit calculator", ta: "சீட்டுக் கணிப்பான்" },
      body: { en: "Play out every month of a chit and see what you pay and receive.", ta: "சீட்டின் ஒவ்வொரு மாதத்தையும் கணக்கிட்டு, செலுத்துவதையும் பெறுவதையும் பாருங்கள்." },
    },
  ] as readonly { href: string; title: Localized; body: Localized }[],
};

// ─── Closing CTA (home §11) ───────────────────────────────────────────────────

export const CLOSING_CTA = {
  title: { en: "Let's plan your next financial milestone.", ta: "உங்கள் அடுத்த நிதி மைல்கல்லைத் திட்டமிடுவோம்." } as Localized,
  lead: {
    en: "Tell us what you're saving for. We'll match it to a real Panasuna plan and walk you through every month of it.",
    ta: "நீங்கள் எதற்காகச் சேமிக்கிறீர்கள் என்று சொல்லுங்கள். அதற்கேற்ற பனசுனா திட்டத்தைப் பரிந்துரைத்து, அதன் ஒவ்வொரு மாதத்தையும் விளக்குவோம்.",
  } as Localized,
  explore: { en: "Explore available chits", ta: "சீட்டுகளைப் பாருங்கள்" } as Localized,
  speak: { en: "Speak to our team", ta: "எங்கள் குழுவுடன் பேசுங்கள்" } as Localized,
};

// ─── Contact page (/contact) and footer (§12) ─────────────────────────────────

export const CONTACT_PAGE = {
  title: { en: "Visit, call or write.", ta: "வாருங்கள், அழையுங்கள், எழுதுங்கள்." } as Localized,
  lead: CONTACT_SECTION.intro,
  getInTouch: { en: "Get in touch", ta: "தொடர்புகொள்ள" } as Localized,
  address: { en: "Head office", ta: "தலைமை அலுவலகம்" } as Localized,
  phones: { en: "Phone", ta: "தொலைபேசி" } as Localized,
  call: { en: "Call", ta: "அழைக்க" } as Localized,
  helpTitle: { en: "We are here to help you", ta: "உங்களுக்கு உதவ நாங்கள் இருக்கிறோம்" } as Localized,
  map: {
    label: {
      en: `Stylised map of Salem town centre with a pin on Chinna Kadai Street`,
      ta: `சின்னக்கடை வீதியில் குறியுடன் சேலம் நகர மையத்தின் வரைபடம்`,
    } as Localized,
    street: { en: "Chinna Kadai St", ta: "சின்னக்கடை வீதி" } as Localized,
    office: { en: "Panasuna Chits", ta: "பனசுனா சிட்ஸ்" } as Localized,
    note: { en: "Stylised map, not to scale.", ta: "மாதிரி வரைபடம், அளவுக்கேற்றதல்ல." } as Localized,
    directions: { en: "Get directions", ta: "வழி காண" } as Localized,
    copy: { en: "Copy address", ta: "முகவரியை நகலெடு" } as Localized,
    copied: { en: "Address copied", ta: "முகவரி நகலெடுக்கப்பட்டது" } as Localized,
    zoomIn: { en: "Zoom in", ta: "பெரிதாக்கு" } as Localized,
    zoomOut: { en: "Zoom out", ta: "சிறிதாக்கு" } as Localized,
    recenter: { en: "Centre on our office", ta: "அலுவலகத்தை மையப்படுத்து" } as Localized,
    hint: { en: "Drag or use the arrow keys to move the map.", ta: "வரைபடத்தை நகர்த்த இழுக்கவும் அல்லது அம்பு விசைகளைப் பயன்படுத்தவும்." } as Localized,
    /** Opens the visitor's maps app on the published address; no coordinates are claimed. */
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Panasuna Chits, ${CONTACT.addressOneLine.en}`)}`,
  },
  disclosuresTitle: { en: "Disclosures", ta: "வெளிப்படுத்தல்கள்" } as Localized,
};

/** editorial: plain-language compliance notes, shown in full on /contact and in brief in the footer. */
export const DISCLOSURES: readonly { id: string; text: Localized }[] = [
  {
    // VERIFY: registration number and Registrar of Chits office before launch.
    id: "act",
    text: {
      en: `${COMPANY.legalName} conducts chits under the Chit Funds Act, 1982. Read your chit agreement before you sign it.`,
      ta: `${COMPANY.name.ta} சீட்டு நிதிச் சட்டம், 1982-இன் கீழ் சீட்டுகளை நடத்துகிறது. கையொப்பமிடும் முன் உங்கள் சீட்டு ஒப்பந்தத்தைப் படியுங்கள்.`,
    },
  },
  { id: "security", text: TRUST_FACTS.find((f) => f.id === "fdr-security")!.body },
  {
    id: "not-deposit",
    text: {
      en: "A chit subscription is not a bank deposit and is not covered by deposit insurance.",
      ta: "சீட்டுச் சந்தா ஒரு வங்கி வைப்பு அல்ல; வைப்புக் காப்பீட்டின் கீழ் வராது.",
    },
  },
  {
    id: "dividends",
    text: {
      en: "Dividends depend on each month's auction. They vary and are not guaranteed.",
      ta: "ஈவுத்தொகை ஒவ்வொரு மாத ஏலத்தையும் பொறுத்தது; மாறுபடும், உத்தரவாதம் இல்லை.",
    },
  },
  {
    id: "illustrative",
    text: {
      en: `Calculator, simulator and example figures are illustrative. They assume a ${COMMISSION_PCT} foreman's commission; your chit agreement states the actual rate, within the statutory limit.`,
      ta: `கணிப்பான், மாதிரி மற்றும் எடுத்துக்காட்டுத் தொகைகள் விளக்கத்திற்கானவை. ${COMMISSION_PCT} நிறுவனக் கமிஷன் அனுமானிக்கப்பட்டுள்ளது; உண்மையான விகிதம் சட்ட வரம்புக்குள் உங்கள் சீட்டு ஒப்பந்தத்தில் குறிப்பிடப்படும்.`,
    },
  },
  {
    id: "rates",
    text: {
      en: "Bank and card rates shown in comparisons are indicative and change often.",
      ta: "ஒப்பீடுகளில் காட்டப்படும் வங்கி மற்றும் அட்டை வட்டி விகிதங்கள் தோராயமானவை; அடிக்கடி மாறக்கூடியவை.",
    },
  },
  { id: "privacy", text: ENQUIRY.privacy },
];

export const FOOTER = {
  tagline: { en: "Spend what is left after saving.", ta: "சேமித்த பின் மீதமுள்ளதைச் செலவிடுங்கள்." } as Localized,
  explore: { en: "Explore", ta: "பாருங்கள்" } as Localized,
  visit: { en: "Visit us", ta: "எங்களைக் காண" } as Localized,
  call: { en: "Call us", ta: "அழையுங்கள்" } as Localized,
  disclosures: { en: "Read all disclosures", ta: "அனைத்து வெளிப்படுத்தல்களையும் படிக்க" } as Localized,
  // No current year: a build-time year would go stale and a runtime one could mismatch on hydration.
  rights: {
    en: `© ${COMPANY.legalName} Est. ${ESTABLISHED_YEAR}, Salem. All rights reserved.`,
    ta: `© ${COMPANY.name.ta}. ${ESTABLISHED_YEAR} முதல், சேலம். அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.`,
  } as Localized,
};

export const UI_STRINGS = {
  chitValue: { en: "Chit value", ta: "சீட்டுத் தொகை" },
  duration: { en: "Duration", ta: "காலம்" },
  months: { en: "months", ta: "மாதங்கள்" },
  monthlyInstallment: { en: "Monthly subscription", ta: "மாதச் சந்தா" },
  perMonth: { en: "/mo", ta: "/மாதம்" },
  installmentNote: {
    en: "Full subscription before dividend. After each month's auction dividend, what you actually pay is usually lower.",
    ta: "ஈவுத்தொகைக்கு முந்தைய முழுச் சந்தா. ஒவ்வொரு மாத ஏல ஈவுத்தொகைக்குப் பின் நீங்கள் செலுத்தும் தொகை பொதுவாகக் குறைவாக இருக்கும்.",
  },
  popular: { en: "Popular", ta: "பிரபலமானது" },
  joinNow: { en: "Join this chit", ta: "இந்தச் சீட்டில் சேர" },
  search: { en: "Find a plan", ta: "திட்டத்தைத் தேடுங்கள்" },
  sortBy: { en: "Sort by", ta: "வரிசைப்படுத்து" },
  ascending: { en: "Low to high", ta: "குறைவிலிருந்து அதிகம்" },
  descending: { en: "High to low", ta: "அதிகத்திலிருந்து குறைவு" },
  joinForm: {
    title: { en: "Join a chit", ta: "சீட்டில் சேருங்கள்" },
    scheme: { en: "Chit scheme", ta: "சீட்டுத் திட்டம்" },
    cancel: { en: "No thanks", ta: "வேண்டாம்" },
    submit: { en: "Request a call back", ta: "திரும்ப அழைக்கக் கோருங்கள்" },
  },
  joinConfirmation: {
    title: { en: "Request received", ta: "கோரிக்கை பெறப்பட்டது" },
    body: { en: "Our manager will contact you soon.", ta: "எங்கள் மேலாளர் விரைவில் உங்களைத் தொடர்புகொள்வார்." },
    dismiss: { en: "Done", ta: "சரி" },
  },
} satisfies Record<string, Localized | Record<string, Localized>>;

// ─── Aggregate export ─────────────────────────────────────────────────────────

export const panasunaData = {
  company: COMPANY,
  contact: CONTACT,
  nav: NAV,
  chrome: SITE_CHROME,
  hero: HERO,
  about: ABOUT,
  trust: { facts: TRUST_FACTS, serviceNorms: SERVICE_NORMS },
  whyPanasuna: WHY_PANASUNA,
  trustSection: TRUST_SECTION,
  goals: GOALS,
  plans: CHIT_PLANS,
  popularPlans: POPULAR_PLANS,
  planFilters: PLAN_FILTERS,
  planSorts: PLAN_SORTS,
  wizard: WIZARD,
  findYourChit: FIND_YOUR_CHIT,
  popularSection: POPULAR_SECTION,
  catalog: CATALOG,
  calculator: CALCULATOR,
  enquiry: ENQUIRY,
  chitFundBasics: CHIT_FUND_BASICS,
  chitRules: CHIT_RULES,
  howChitsWork: HOW_CHITS_WORK,
  howChitsWorkPage: HOW_CHITS_WORK_PAGE,
  comparisons: COMPARISONS,
  compareTools: COMPARE_TOOLS,
  auctionSimulator: AUCTION_SIMULATOR,
  auctionProcess: AUCTION_PROCESS,
  associations: ASSOCIATIONS,
  directors: DIRECTORS,
  customers: CUSTOMERS,
  sharedTestimonial: SHARED_TESTIMONIAL,
  quotes: QUOTES,
  aboutPage: ABOUT_PAGE,
  homeAbout: HOME_ABOUT,
  industries: INDUSTRIES,
  customersSection: CUSTOMERS_SECTION,
  faq: FAQ,
  resourcesPage: RESOURCES_PAGE,
  closingCta: CLOSING_CTA,
  contactSection: CONTACT_SECTION,
  contactPage: CONTACT_PAGE,
  disclosures: DISCLOSURES,
  footer: FOOTER,
  ui: UI_STRINGS,
} as const;

export default panasunaData;
