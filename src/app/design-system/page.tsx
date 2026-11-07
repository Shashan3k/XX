import type { Metadata } from "next";
import { DesignSystem } from "@/components/design-system/DesignSystem";

export const metadata: Metadata = {
  title: "Design system — Panasuna Chits",
  robots: { index: false },
};

export default function DesignSystemPage() {
  return <DesignSystem />;
}
