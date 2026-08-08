"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { createClient } from "@/lib/supabase/client";

export default function SignInPage() {
  const router = useRouter();
  const supabase = createClient();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setPending(true);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/account");
    router.refresh();
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-16">
      <h1 className="font-display text-display-sm tracking-display leading-[0.95] uppercase">
        Sign in
      </h1>
      <p className="text-caption text-smoke mt-2 font-mono">
        Back for your orders? Log in to see them.
      </p>

      {error ? (
        <p
          role="alert"
          className="border-alert text-micro text-alert mt-6 border px-3 py-2 font-mono tracking-[0.1em] uppercase"
        >
          {error}
        </p>
      ) : null}

      <form action={handleSubmit} className="mt-8 space-y-5">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="text-micro text-smoke mt-6 font-mono tracking-[0.12em] uppercase">
        New here?{" "}
        <Link href="/account/register" className="hover:text-void underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </div>
  );
}
