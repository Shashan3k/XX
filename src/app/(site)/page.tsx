import { Hero } from "@/components/home/Hero";
import { TrustSection } from "@/components/home/trust/TrustSection";
import { FindYourChitSection } from "@/components/home/FindYourChitSection";
import { PopularPlans } from "@/components/home/PopularPlans";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { AuctionSection } from "@/components/home/AuctionSection";
import { HomeAboutSection } from "@/components/home/HomeAboutSection";
import { CustomersSection } from "@/components/home/CustomersSection";
import { FaqSection } from "@/components/home/FaqSection";
import { ClosingCta } from "@/components/home/ClosingCta";

export default function Home() {
  return (
    <main id="main" tabIndex={-1} className="flex-1 outline-none">
      <Hero />
      <TrustSection />
      <FindYourChitSection />
      <PopularPlans />
      <HowItWorksSection />
      <AuctionSection />
      <HomeAboutSection />
      <CustomersSection />
      <FaqSection />
      <ClosingCta />
    </main>
  );
}
