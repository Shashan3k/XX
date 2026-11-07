import type { Localized } from "@/data/panasunaData";

/** Blender-exported assets (scripts/blender/*.py → public/models). Shared by the showcase and pages. */
export interface ModelSpec {
  id: "coin" | "home" | "calendar" | "auction" | "heritage";
  file: string;
  title: Localized;
  concept: Localized;
  /** Named nodes that must exist so GSAP/R3F can animate parts independently. */
  nodes: readonly string[];
  /** Nodes whose origin is deliberately off-centre (hinges, ring centres, detachable parts). */
  pivots: readonly string[];
  camera: [number, number, number];
}

const range = (prefix: string, n: number) => Array.from({ length: n }, (_, i) => `${prefix}${String(i + 1).padStart(2, "0")}`);

export const MODELS: readonly ModelSpec[] = [
  {
    id: "coin",
    file: "/models/panasuna-crown-coin.glb",
    title: { en: "Crown sovereign", ta: "கிரீட நாணயம்" },
    concept: {
      en: "Bevelled gold coin, the crown embossed on both faces, 120-ridge milled edge.",
      ta: "இருபுறமும் கிரீட முத்திரை, 120 வரிப்பள்ளங்கள் கொண்ட விளிம்புடன் தங்க நாணயம்.",
    },
    nodes: ["Coin_Body", "Coin_Rim", "Coin_Milling", "Crown_Emboss_Front", "Crown_Emboss_Back", "Crown_Gem"],
    pivots: [],
    camera: [1.4, 0.7, 3.2],
  },
  {
    id: "home",
    file: "/models/architectural-home-vault.glb",
    title: { en: "Wealth villa", ta: "செல்வ இல்லம்" },
    concept: {
      en: "Two-storey villa with a tiered gold-trimmed roof, pillared portico and glowing glass on a stepped travertine plinth, a coin stack, two orbital milestone rings.",
      ta: "அடுக்குக் கூரை, தூண் நுழைவாயில், ஒளிரும் கண்ணாடியுடன் படிநிலைப் பளிங்கு மேடையில் இரண்டு மாடி இல்லம், நாணய அடுக்கு, இரண்டு சுற்றுவட்ட மைல்கல் வளையங்கள்.",
    },
    nodes: ["Home_Core", "Coin_Stack", "Ring_Outer", "Ring_Inner", "Home_Plinth"],
    pivots: ["Coin_Stack", "Ring_Outer", "Ring_Inner"],
    camera: [2.4, 1.5, 3.4],
  },
  {
    id: "calendar",
    file: "/models/chit-calendar-ring.glb",
    title: { en: "Chit cycle dial", ta: "சீட்டுச் சுழற்சி வட்டு" },
    concept: {
      en: "Twelve detachable month tokens around the 100% FDR security shield.",
      ta: "100% FDR பாதுகாப்புக் கேடயத்தைச் சுற்றி பிரிக்கக்கூடிய பன்னிரண்டு மாத வில்லைகள்.",
    },
    nodes: ["Cycle_Ring", ...range("Month_Token_", 12), "Shield_FDR", "Shield_Rim", "Shield_Crown"],
    pivots: range("Month_Token_", 12),
    camera: [0, 0, 5.2],
  },
  {
    id: "auction",
    file: "/models/auction-gavel-podium.glb",
    title: { en: "Auction podium", ta: "ஏல மேடை" },
    concept: {
      en: "Hexagonal podium, gavel on its sound block, balance scale, ring of eight dividend coins.",
      ta: "அறுகோண மேடை, ஏலச் சுத்தியல், தராசு, எட்டு ஈவுத்தொகை நாணயங்களின் வளையம்.",
    },
    nodes: [
      "Podium_Base",
      "Gavel",
      "Gavel_Head",
      "Gavel_Handle",
      "Scale_Post",
      "Scale_Beam",
      "Scale_Pan_L",
      "Scale_Pan_R",
      "Dividend_Ring",
      ...range("Dividend_Coin_", 8),
    ],
    pivots: ["Gavel", "Scale_Beam", "Scale_Pan_L", "Scale_Pan_R", "Dividend_Ring", ...range("Dividend_Coin_", 8)],
    camera: [2.6, 2.0, 3.4],
  },
  {
    id: "heritage",
    file: "/models/panasuna-heritage-1975.glb",
    title: { en: "Heritage monolith, 1975", ta: "பாரம்பரியத் தூண், 1975" },
    concept: {
      en: "Five obsidian strata, one per decade, fifty gold year ticks round the plinth, crowned by the Panasuna crest.",
      ta: "பத்தாண்டுக்கு ஒன்றாக ஐந்து கருங்கல் அடுக்குகள், மேடையைச் சுற்றி ஐம்பது தங்க ஆண்டுக் குறிகள், உச்சியில் பனசுனா முத்திரை.",
    },
    nodes: ["Heritage_Plinth", ...range("Heritage_Year_", 50), ...range("Heritage_Decade_", 5), "Heritage_Capstone", "Heritage_Crest"],
    pivots: [...range("Heritage_Year_", 50), ...range("Heritage_Decade_", 5), "Heritage_Capstone", "Heritage_Crest"],
    camera: [2.8, 1.4, 4.8],
  },
];

export const TRIANGLE_BUDGET = 25_000;
