import Link from "next/link";

const sections = [
  { href: "/admin/products", label: "Products", note: "Create, edit, stock" },
  { href: "/admin/drops", label: "Drops", note: "Schedule releases" },
  { href: "/admin/orders", label: "Orders", note: "Fulfil and refund" },
  { href: "/admin/customers", label: "Customers", note: "Who's buying" },
  { href: "/admin/inventory", label: "Inventory", note: "Stock at a glance" },
];

export default function AdminDashboardPage() {
  return (
    <div>
      <p className="text-micro text-smoke font-mono tracking-[0.16em] uppercase">Back office</p>
      <h1 className="font-display text-display-sm tracking-display mt-2 leading-[0.95] uppercase">
        Overview
      </h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group border-hairline hover:border-void flex flex-col justify-between border p-5 transition-colors"
          >
            <p className="font-display text-title tracking-display uppercase group-hover:underline">
              {section.label}
            </p>
            <p className="text-micro text-smoke mt-6 font-mono tracking-[0.12em] uppercase">
              {section.note} →
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
