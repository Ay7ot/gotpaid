import type { Metadata } from "next";
import { ContentPage } from "@/components/storefront/content-page";

export const metadata: Metadata = {
  title: "FAQ - GOTPAID",
  description: "GOTPAID frequently asked questions - the answers, straight.",
};

const FAQS: { q: string; a: string }[] = [
  {
    q: "When do drops go live?",
    a: "Watch the homepage. When a drop is scheduled you'll see a live countdown and a notify-me box. The moment it hits zero, it's live.",
  },
  {
    q: "Will it restock?",
    a: "No. That's the whole point. When a drop sells out, it's gone.",
  },
  {
    q: "How do I know my order went through?",
    a: "You get your credit-alert receipt the moment payment confirms, plus a confirmation email. No alert, no order - message us and we'll check.",
  },
  {
    q: "What payment methods do you take?",
    a: "Card, bank transfer, and USSD - all through Paystack. You pay in naira, however is easiest for you.",
  },
  {
    q: "How long does delivery take?",
    a: "Lagos: 1-2 business days. Rest of Nigeria: 2-5 business days. After processing.",
  },
  {
    q: "I ordered the wrong size.",
    a: "You have 7 days from delivery for an exchange, unworn with tags. If your size is gone, we refund in full. See the returns page.",
  },
  {
    q: "Can I get notified about future drops?",
    a: "Yes - drop your email or WhatsApp on any upcoming drop's page and we'll give you a heads-up before it goes live.",
  },
  {
    q: "Do you ship outside Nigeria?",
    a: "Not yet. When we do, you'll hear it from us first.",
  },
  {
    q: "Is the stock real?",
    a: "Completely. What you see on the site is what's in the warehouse - updated live. No fake scarcity, ever.",
  },
];

export default function FaqPage() {
  return (
    <ContentPage
      eyebrow="Questions"
      title="FAQ"
      intro="The answers, straight. If yours isn't here, WhatsApp us - we reply fast."
    >
      <section>
        <div className="divide-hairline border-hairline divide-y border-y">
          {FAQS.map((faq) => (
            <div key={faq.q} className="py-5">
              <h2 className="font-display text-title tracking-display leading-tight uppercase">
                {faq.q}
              </h2>
              <p className="text-body text-smoke mt-2 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </ContentPage>
  );
}
