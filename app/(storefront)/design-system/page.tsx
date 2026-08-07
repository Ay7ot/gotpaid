import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditAlertCard } from "@/components/ui/credit-alert-card";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { ProductCard } from "@/components/ui/product-card";
import { Wordmark } from "@/components/ui/wordmark";
import { formatNaira } from "@/lib/format";

export const metadata: Metadata = {
  title: "Design System — GOTPAID",
};

const colors = [
  ["void", "#0A0A0A"],
  ["paper", "#F6F5F1"],
  ["smoke", "#8C8B86"],
  ["hairline", "#DEDCD5"],
  ["alert", "#E1362B"],
];

const typeScale: [string, string, string][] = [
  ["micro", "12px", "text-micro"],
  ["caption", "14px", "text-caption"],
  ["body", "16px", "text-body"],
  ["lead", "20px", "text-lead"],
  ["title", "26px", "text-title"],
  ["display-sm", "34px", "text-display-sm"],
  ["display", "48px", "text-display"],
  ["display-lg", "64px", "text-display-lg"],
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-hairline text-micro text-smoke border-b pb-2 font-mono tracking-[0.14em] uppercase">
      {children}
    </h2>
  );
}

export default function DesignSystemPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="mx-auto max-w-6xl space-y-16 px-4 py-12">
      <div>
        <Wordmark />
        <p className="text-micro text-smoke mt-2 font-mono tracking-[0.14em] uppercase">
          Design system — dev only
        </p>
      </div>

      <section className="space-y-4">
        <SectionTitle>Color — 5 tokens</SectionTitle>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {colors.map(([name, hex]) => (
            <div key={name} className="border-hairline border">
              <div
                className="border-hairline h-20 border-b"
                style={{ backgroundColor: hex, color: name === "paper" ? "#0A0A0A" : "#FFFFFF" }}
              />
              <div className="text-micro p-2 font-mono tracking-[0.1em] uppercase">
                <p>{name}</p>
                <p className="text-smoke">{hex}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle>Type scale</SectionTitle>
        <div className="divide-hairline border-hairline divide-y border-y">
          {typeScale.map(([name, size, className]) => (
            <div key={name} className="flex items-baseline justify-between gap-6 py-3">
              <span className="text-micro text-smoke w-28 shrink-0 font-mono tracking-[0.1em] uppercase">
                {name} · {size}
              </span>
              <span className={`${className} font-display tracking-display leading-none uppercase`}>
                GOTPAID
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle>Buttons</SectionTitle>
        <div className="flex flex-wrap gap-4">
          <Button>ADD TO CART</Button>
          <Button variant="outline">NOTIFY ME</Button>
          <Button disabled>DISABLED</Button>
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle>Badges</SectionTitle>
        <div className="flex flex-wrap gap-3">
          <Badge tone="alert">SOLD OUT</Badge>
          <Badge tone="alert">LIVE</Badge>
          <Badge>3 LEFT</Badge>
          <Badge tone="smoke">PRE-ORDER</Badge>
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <SectionTitle>Forms</SectionTitle>
          <div className="space-y-5">
            <div>
              <Label htmlFor="name">RECIPIENT NAME</Label>
              <Input id="name" placeholder="Ada Obi" />
            </div>
            <div>
              <Label htmlFor="phone">PHONE</Label>
              <Input id="phone" type="tel" placeholder="+234 801 234 5678" />
            </div>
            <div>
              <Label htmlFor="state">STATE</Label>
              <Select id="state" defaultValue="">
                <option value="" disabled>
                  Select state
                </option>
                <option>Lagos</option>
                <option>Abuja</option>
                <option>Port Harcourt</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">NOTES</Label>
              <Textarea id="notes" placeholder="Landmark…" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <SectionTitle>Credit Alert Card</SectionTitle>
          <CreditAlertCard
            amount={formatNaira(68000)}
            rows={[
              { label: "ORDER", value: "GP-000123" },
              { label: "STATUS", value: "CONFIRMED" },
              { label: "SHIPPING", value: formatNaira(3500) },
              { label: "TOTAL", value: formatNaira(71500) },
            ]}
          />
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle>Product Card</SectionTitle>
        <div className="grid max-w-sm grid-cols-1 gap-4">
          <ProductCard name="VARSITY JACKET" price={68000} badge="3 LEFT" badgeTone="alert" />
          <ProductCard name="HEAVYWEIGHT TEE" price={18000} badge="SOLD OUT" badgeTone="alert" />
        </div>
      </section>
    </div>
  );
}
