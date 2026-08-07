"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { login } from "./actions";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-12">
      <h1 className="font-display text-display-sm tracking-display uppercase">Staff Sign In</h1>
      <p className="text-micro text-smoke mt-1 font-mono tracking-[0.12em] uppercase">
        Back office
      </p>

      {state?.error ? (
        <p
          role="alert"
          className="border-alert text-micro text-alert mt-4 border px-3 py-2 font-mono tracking-[0.1em] uppercase"
        >
          {state.error}
        </p>
      ) : null}

      <form action={formAction} className="mt-8 space-y-5">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="username" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </div>
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
