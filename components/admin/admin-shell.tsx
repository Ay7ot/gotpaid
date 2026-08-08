import Link from "next/link";
import { AdminNav, type AdminNavItem } from "@/components/admin/admin-nav";
import { Badge } from "@/components/ui/badge";
import { Wordmark } from "@/components/ui/wordmark";
import { signOutAdmin } from "@/app/admin/(dashboard)/actions";

const baseItems: AdminNavItem[] = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/drops", label: "Drops" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/inventory", label: "Inventory" },
];

const ownerItems: AdminNavItem[] = [
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/staff", label: "Staff" },
];

export function AdminShell({
  admin,
  children,
}: {
  admin: { name: string; role: "owner" | "staff" };
  children: React.ReactNode;
}) {
  const items = [...baseItems, ...(admin.role === "owner" ? ownerItems : [])];

  return (
    <div className="bg-paper flex min-h-full flex-col lg:flex-row">
      <aside className="lg:border-hairline hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-56 lg:shrink-0 lg:flex-col lg:border-r">
        <div className="border-hairline border-b px-5 py-5">
          <Link href="/admin" aria-label="GOTPAID back office">
            <Wordmark className="h-6" />
          </Link>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          <AdminNav items={items} />
        </nav>
        <div className="border-hairline border-t px-5 py-4">
          <p className="text-micro text-smoke truncate font-mono tracking-[0.12em] uppercase">
            {admin.name}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <Badge tone={admin.role === "owner" ? "alert" : "void"}>{admin.role}</Badge>
            <LogoutForm />
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="border-hairline flex items-center justify-between border-b px-4 py-3 lg:hidden">
          <Link href="/admin" aria-label="GOTPAID back office">
            <Wordmark className="h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <Badge tone={admin.role === "owner" ? "alert" : "void"}>{admin.role}</Badge>
            <LogoutForm />
          </div>
        </header>
        <nav className="border-hairline overflow-x-auto border-b px-4 py-2 lg:hidden">
          <div className="flex gap-1 whitespace-nowrap">
            <AdminNav items={items} />
          </div>
        </nav>
        <main className="p-5 sm:p-8 lg:p-10">{children}</main>
      </div>
    </div>
  );
}

function LogoutForm() {
  return (
    <form action={signOutAdmin}>
      <button
        type="submit"
        className="text-micro text-smoke hover:text-alert font-mono tracking-[0.12em] uppercase underline underline-offset-4"
      >
        Sign out
      </button>
    </form>
  );
}
