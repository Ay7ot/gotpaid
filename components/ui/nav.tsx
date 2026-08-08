"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/ui/wordmark";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

const links = [
  { href: "/shop", label: "SHOP" },
  { href: "/drops", label: "DROPS" },
  { href: "/about", label: "ABOUT" },
];

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="m16.5 16.5 4 4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 8h12l1 12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1L6 8Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M9 10V6a3 3 0 0 1 6 0v4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function Nav({ signedIn = false }: { signedIn?: boolean }) {
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "border-hairline bg-paper sticky top-0 z-50 border-b transition-all",
        scrolled ? "py-1.5" : "py-3.5",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4">
        <Link href="/" aria-label="GOTPAID home">
          <Wordmark />
        </Link>
        <nav className="hidden items-center gap-6 sm:flex" aria-label="Primary">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-micro text-smoke hover:text-void font-mono tracking-[0.1em] uppercase transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <Link
            href={signedIn ? "/account" : "/account/sign-in"}
            aria-label={signedIn ? "Account" : "Sign in"}
            className="text-void hover:text-smoke flex h-11 w-11 items-center justify-center transition-colors"
          >
            <UserIcon />
          </Link>
          <button
            type="button"
            aria-label="Search"
            className="text-void hover:text-smoke flex h-11 w-11 items-center justify-center transition-colors"
          >
            <SearchIcon />
          </button>
          <Link
            href="/cart"
            aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
            className="text-void hover:text-smoke relative flex h-11 w-11 items-center justify-center transition-colors"
          >
            <BagIcon />
            {count > 0 ? (
              <span className="bg-void text-paper text-micro absolute top-0.5 right-0.5 flex h-5 min-w-5 items-center justify-center px-1 font-mono">
                {count}
              </span>
            ) : null}
          </Link>
        </div>
      </div>
    </header>
  );
}
