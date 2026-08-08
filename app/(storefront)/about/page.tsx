import type { Metadata } from "next";
import { ContentPage, ContentSection } from "@/components/storefront/content-page";

export const metadata: Metadata = {
  title: "About - GOTPAID",
  description:
    "GOTPAID is Nigerian streetwear cut in small runs. No restocks. When a drop sells out, it's gone.",
};

export default function AboutPage() {
  return (
    <ContentPage
      eyebrow="The brand"
      title="About"
      intro="GOTPAID is Nigerian streetwear for people who already know: the alert doesn't lie."
    >
      <ContentSection title="The origin story">
        <p>
          GOTPAID started where most of the story happens - on a phone, in a group chat, waiting on
          a delivery that was never going to be early. We grew up on POS transfers, credit-alert
          SMS, and the particular thrill of a package finally landing.
        </p>
        <p>
          That energy - the payment that clears, the alert that confirms it, the box that arrives -
          is the whole brand. Streetwear in Nigeria didn&rsquo;t need a translation. It needed
          honesty. No inflated hype. No &ldquo;limited edition&rdquo; that isn&rsquo;t. When we say
          it&rsquo;s limited, it&rsquo;s limited. When we say it&rsquo;s dropping, it drops.
        </p>
      </ContentSection>

      <ContentSection title="Why small runs">
        <p>
          We cut in small runs for three reasons. One: we refuse to sit on dead stock. Two:
          you&rsquo;d rather wear something we made last week than something that&rsquo;s been
          living in a container since last year. Three: scarcity is the mechanic. When a drop sells
          out, it&rsquo;s gone - that&rsquo;s not a marketing line, it&rsquo;s the business model.
        </p>
        <p>
          The result is simple: when you wear GOTPAID, you&rsquo;re wearing something a handful of
          people in the country have. That&rsquo;s the point.
        </p>
      </ContentSection>

      <ContentSection title="The rules">
        <ul className="space-y-3">
          {[
            "No restocks. When it's gone, it's gone.",
            "No fake scarcity. Stock is real, and it's displayed honestly.",
            "No generic designs. Everything is cut for the streets that raised it.",
            "Pay, get the alert, wear it first.",
          ].map((rule) => (
            <li key={rule} className="flex gap-4">
              <span className="text-alert font-mono">✦</span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </ContentSection>
    </ContentPage>
  );
}
