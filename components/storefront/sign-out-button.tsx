"use client";

import { signOut } from "@/app/(storefront)/account/actions";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="text-micro text-smoke hover:text-alert font-mono tracking-[0.12em] uppercase underline underline-offset-4"
      >
        Sign out
      </button>
    </form>
  );
}
