import type { Metadata } from "next";
import { ContentPage, ContentSection } from "@/components/storefront/content-page";
import { SUPPORT_WHATSAPP_NUMBER } from "@/lib/env";
import { whatsappLink } from "@/lib/notifications/whatsapp";

export const metadata: Metadata = {
  title: "Returns & Exchanges — GOTPAID",
  description: "GOTPAID returns and exchange policy. Unworn, tags on, within 7 days.",
};

export default function ReturnsPage() {
  const message = "Hi GOTPAID! I need to start a return/exchange. Order number: ";

  return (
    <ContentPage
      eyebrow="Policy"
      title="Returns & exchanges"
      intro="Worn once, wrong size? Let's fix it."
    >
      <ContentSection title="Exchanges">
        <p>
          Unworn items with tags still attached can be exchanged within{" "}
          <span className="font-mono">7 days</span> of delivery. Message us on WhatsApp with your
          order number and we&rsquo;ll sort the swap.
        </p>
      </ContentSection>

      <ContentSection title="The catch">
        <p>
          Because drops are limited, we can&rsquo;t guarantee your size will still be around by the
          time an exchange comes back. If it&rsquo;s gone, we refund the full amount instead — no
          restocking fee, no argument.
        </p>
      </ContentSection>

      <ContentSection title="Final sale">
        <p>
          Items marked <span className="font-mono">SALE</span>, or pieces from older drops, are
          final sale. No exceptions.
        </p>
      </ContentSection>

      <ContentSection title="How to start a return">
        <ol className="list-none space-y-3">
          {[
            "Message us on WhatsApp with your order number and what's wrong.",
            "We approve it and give you the return address.",
            "Send it back — unworn, tags on, original packaging.",
            "We swap it or refund you in full.",
          ].map((step, index) => (
            <li key={step} className="flex gap-4">
              <span className="text-smoke font-mono">{String(index + 1).padStart(2, "0")}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <p>
          <a
            href={whatsappLink(SUPPORT_WHATSAPP_NUMBER, message)}
            target="_blank"
            rel="noreferrer"
            className="border-void text-caption hover:bg-void hover:text-paper inline-flex border px-6 py-3 font-mono tracking-[0.12em] uppercase transition-colors"
          >
            Start a return on WhatsApp
          </a>
        </p>
      </ContentSection>
    </ContentPage>
  );
}
