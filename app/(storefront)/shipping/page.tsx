import type { Metadata } from "next";
import { ContentPage, ContentSection, DataTable } from "@/components/storefront/content-page";
import { SHIPPING_FEE } from "@/lib/env";
import { formatNaira } from "@/lib/format";

export const metadata: Metadata = {
  title: "Shipping - GOTPAID",
  description: "GOTPAID shipping timelines, fees, and how your order reaches you.",
};

export default function ShippingPage() {
  return (
    <ContentPage
      eyebrow="Delivery"
      title="Shipping"
      intro="Nigerian streets, honest timelines. Here's how your order gets to you."
    >
      <ContentSection title="How it works">
        <p>
          Orders are processed within 1-2 business days after payment confirms. The moment you pay,
          you get your credit-alert receipt. When your order leaves us, you get a shipping update
          with the courier details.
        </p>
      </ContentSection>

      <ContentSection title="Timelines">
        <DataTable
          head={["Destination", "Delivery time"]}
          rows={[
            ["Lagos (mainland & island)", "1-2 business days"],
            ["Rest of Nigeria", "2-5 business days"],
          ]}
        />
        <p>
          Timelines start after processing. During a drop, allow a little extra - we move a lot in
          one day.
        </p>
      </ContentSection>

      <ContentSection title="Cost">
        <p>
          Flat rate of {formatNaira(SHIPPING_FEE)} across Nigeria, added at checkout. No hidden
          fees, no surprises. The price you confirm is the price you pay.
        </p>
      </ContentSection>

      <ContentSection title="Tracking">
        <p>
          Every order gets a shipping update the moment it leaves us. If anything&rsquo;s unclear,
          message us - real people, real answers, Nigerian business hours.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
