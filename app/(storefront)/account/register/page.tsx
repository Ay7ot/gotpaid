"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setMessage(null);
    setPending(true);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (password.length < 6) {
      setPending(false);
      setError("Password must be at least 6 characters.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    setPending(false);

    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      router.push("/account");
      router.refresh();
    } else {
      setMessage("Check your email to confirm your account, then sign in.");
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-16">
      <h1 className="font-display text-display-sm tracking-display leading-[0.95] uppercase">
        Create account
      </h1>
      <p className="text-caption text-smoke mt-2 font-mono">
        No account needed to buy - this is optional.
      </p>

      {error ? (
        <p
          role="alert"
          className="border-alert text-micro text-alert mt-6 border px-3 py-2 font-mono tracking-[0.1em] uppercase"
        >
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="border-void text-micro mt-6 border px-3 py-2 font-mono tracking-[0.1em] uppercase">
          {message}
        </p>
      ) : null}

      <form action={handleSubmit} className="mt-8 space-y-5">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" autoComplete="name" required />
        </div>
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
            autoComplete="new-password"
            required
          />
        </div>
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="text-micro text-smoke mt-6 font-mono tracking-[0.12em] uppercase">
        Already have an account?{" "}
        <Link href="/account/sign-in" className="hover:text-void underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  );
}
