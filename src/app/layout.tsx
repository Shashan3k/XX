import type { Metadata } from "next";
import { DM_Sans, Mukta_Malar, Noto_Sans_Tamil, Plus_Jakarta_Sans } from "next/font/google";
import { LocaleProvider } from "@/lib/i18n";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import "./globals.css";

/** Display, headings and figures: geometric, tabular-capable (variable 200–800). */
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

/** Body and UI. */
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

/** Tamil body. */
const notoSansTamil = Noto_Sans_Tamil({
  variable: "--font-noto-sans-tamil",
  subsets: ["tamil"],
  display: "swap",
});

/** Tamil headings. */
const muktaMalar = Mukta_Malar({
  variable: "--font-mukta-malar",
  subsets: ["tamil"],
  weight: ["500", "600", "700"],
  display: "swap",
});

/**
 * Runs before first paint so a stored light theme never flashes dark. Dark is the default,
 * so the server-rendered `dark` class only ever needs removing. Keep in sync with lib/theme.tsx.
 */
const THEME_SCRIPT = `try{if(localStorage.getItem("pn-theme")==="light"){var d=document.documentElement;d.classList.remove("dark");d.style.colorScheme="light"}}catch(e){}`;

export const metadata: Metadata = {
  title: "Panasuna Chits (P) Ltd. — Salem, since 1975",
  description:
    "Registered chit funds from Salem since 1975. 100% of every chit's value is held as a security deposit in a Scheduled Bank.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${jakarta.variable} ${dmSans.variable} ${notoSansTamil.variable} ${muktaMalar.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <LocaleProvider>
          <SmoothScroll>{children}</SmoothScroll>
        </LocaleProvider>
      </body>
    </html>
  );
}
