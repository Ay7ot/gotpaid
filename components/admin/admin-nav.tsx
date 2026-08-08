"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type AdminNavItem = { href: string; label: string };

export function AdminNav({ items }: { items: AdminNavItem[] }) {
  const pathname = usePathname();

  return items.map((item) => {
    const active =
      pathname === item.href ||
      (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "text-caption flex items-center px-3 py-2 font-mono tracking-[0.1em] whitespace-nowrap uppercase transition-colors",
          active ? "bg-void text-paper" : "text-void hover:text-smoke",
        )}
      >
        {item.label}
      </Link>
    );
  });
}
