import type { Metadata } from "next";
import { CONTACT, CONTACT_PAGE, PHONE_LINE } from "@/data/panasunaData";
import { PageIntro } from "@/components/site/PageIntro";
import { ContactDetails } from "@/components/contact/ContactDetails";
import { HelpCards } from "@/components/contact/HelpCards";
import { Disclosures } from "@/components/contact/Disclosures";
import { SalemMap } from "@/components/contact/SalemMap";

export const metadata: Metadata = {
  title: "Contact — Panasuna Chits (P) Ltd.",
  description: `Visit Panasuna Chits at ${CONTACT.addressOneLine.en}, or call ${PHONE_LINE}.`,
};

export default function ContactPage() {
  return (
    <main id="main" tabIndex={-1} aria-labelledby="page-title" className="flex-1 outline-none">
      <div className="mx-auto flex max-w-7xl flex-col gap-24 px-4 pb-24 sm:px-8 md:gap-32 md:pb-32">
        <div>
          <PageIntro title={CONTACT_PAGE.title} lead={CONTACT_PAGE.lead} />
          <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12">
            <SalemMap />
            <ContactDetails />
          </div>
        </div>
        <HelpCards />
        <Disclosures />
      </div>
    </main>
  );
}
