"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/field";

export function WhatsAppForm({ phone }: { phone: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();
    const text = `Hi GOTPAID!${name ? ` I'm ${name}.` : ""} ${message || "I have a question."}`;
    window.location.assign(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`);
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label htmlFor="name">Your name</Label>
        <Input id="name" name="name" autoComplete="name" />
      </div>
      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" placeholder="What's up?" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Opening WhatsApp…" : "Open WhatsApp"}
      </Button>
    </form>
  );
}
