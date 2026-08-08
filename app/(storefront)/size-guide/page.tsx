import type { Metadata } from "next";
import { ContentPage, ContentSection, DataTable } from "@/components/storefront/content-page";
import { SUPPORT_WHATSAPP_NUMBER } from "@/lib/env";
import { whatsappLink } from "@/lib/notifications/whatsapp";

export const metadata: Metadata = {
  title: "Size Guide — GOTPAID",
  description: "GOTPAID size guide and fit notes. Measurements in centimetres.",
};

export default function SizeGuidePage() {
  const message = "Hi GOTPAID! I need help picking a size.";

  return (
    <ContentPage
      eyebrow="Reference"
      title="Size guide"
      intro="Measurements in centimetres. Every piece has its own fit — read the notes before you pick."
    >
      <ContentSection title="Tees & long sleeves">
        <DataTable
          head={["Size", "Chest", "Length", "Sleeve"]}
          rows={[
            ["S", "102", "68", "20"],
            ["M", "108", "70", "21"],
            ["L", "114", "73", "22"],
            ["XL", "120", "76", "23"],
          ]}
        />
      </ContentSection>

      <ContentSection title="Cargo pants">
        <DataTable
          head={["Size", "Waist", "Inseam"]}
          rows={[
            ["30", "76", "74"],
            ["32", "81", "76"],
            ["34", "86", "78"],
          ]}
        />
      </ContentSection>

      <ContentSection title="Fit notes">
        <ul className="list-none space-y-3">
          <li>
            <span className="text-smoke font-mono">Tees & long sleeves —</span> boxy cut. Size down
            for fitted, stay true for the intended baggy drop.
          </li>
          <li>
            <span className="text-smoke font-mono">Cargos —</span> tapered leg. If you&rsquo;re
            between sizes, size up. You&rsquo;d rather the waist be roomy than tight.
          </li>
          <li>
            <span className="text-smoke font-mono">Beanie —</span> one size. Stretches to fit.
          </li>
          <li>
            <span className="text-smoke font-mono">Pre-shrunk —</span> washed and dried before
            cutting. What you order is the size you get, after the wash too.
          </li>
        </ul>
        <p>
          Still unsure? Message us your height and weight and we&rsquo;ll point you the right way:{" "}
          <a
            href={whatsappLink(SUPPORT_WHATSAPP_NUMBER, message)}
            target="_blank"
            rel="noreferrer"
            className="text-micro hover:text-smoke font-mono tracking-[0.12em] uppercase underline underline-offset-4"
          >
            WhatsApp us
          </a>
        </p>
      </ContentSection>
    </ContentPage>
  );
}
