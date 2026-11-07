import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { EnquiryProvider } from "@/components/enquiry/EnquiryProvider";

/** Public site chrome. Internal routes (/design-system) sit outside this group. */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <EnquiryProvider>
      <SiteHeader />
      {children}
      <SiteFooter />
    </EnquiryProvider>
  );
}
