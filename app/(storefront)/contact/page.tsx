import type { Metadata } from "next";
import { WhatsAppForm } from "@/components/storefront/whatsapp-form";
import { ContentPage, ContentSection } from "@/components/storefront/content-page";
import { SUPPORT_WHATSAPP_NUMBER } from "@/lib/env";
import { whatsappLink } from "@/lib/notifications/whatsapp";

export const metadata: Metadata = {
  title: "Contact — GOTPAID",
  description: "Reach GOTPAID on WhatsApp or email. Real people, Nigerian business hours.",
};

export default function ContactPage() {
  return (
    <ContentPage
      eyebrow="Talk to us"
      title="Contact"
      intro="Real people, Nigerian business hours. WhatsApp is fastest — that's how we've always done business."
    >
      <ContentSection title="WhatsApp">
        <p>
          The fastest way to reach us. Order issues, size help, drop questions — send it straight to
          the phone.
        </p>
        <a
          href={whatsappLink(SUPPORT_WHATSAPP_NUMBER, "Hi GOTPAID! I have a question.")}
          target="_blank"
          rel="noreferrer"
          className="border-void text-caption hover:bg-void hover:text-paper inline-flex items-center gap-2 border px-6 py-3 font-mono tracking-[0.12em] uppercase transition-colors"
        >
          Message us on WhatsApp
          <span aria-hidden="true">→</span>
        </a>
      </ContentSection>

      <ContentSection title="Quick message">
        <p>
          Prefer to type it out? Write it here and we&rsquo;ll pick it up on WhatsApp — no app
          switching required.
        </p>
        <div className="max-w-md">
          <WhatsAppForm phone={SUPPORT_WHATSAPP_NUMBER} />
        </div>
      </ContentSection>

      <ContentSection title="Email">
        <p>
          For anything long-form — partnerships, wholesale, the press.{" "}
          <a
            href="mailto:on@gotpaid.ng"
            className="text-caption hover:text-smoke font-mono underline underline-offset-4"
          >
            on@gotpaid.ng
          </a>
        </p>
      </ContentSection>

      <ContentSection title="Hours">
        <p>
          Mon–Sat, 9am–7pm WAT. Outside those hours we&rsquo;re sleeping — like everybody else — but
          we read everything in the morning.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
