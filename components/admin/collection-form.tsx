"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createCollection } from "@/app/admin/(dashboard)/collections/actions";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/utils";

const boxed =
  "w-full border border-hairline bg-paper px-3 py-2 font-mono text-caption focus:border-void focus:outline-none";

export function CollectionForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const formData = new FormData();
    formData.set("name", name);
    formData.set("slug", slug || slugify(name));
    formData.set("description", description);
    const result = await createCollection(formData);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setName("");
    setSlug("");
    setSlugTouched(false);
    setDescription("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? (
        <p
          role="alert"
          className="border-alert text-micro text-alert border px-3 py-2 font-mono tracking-[0.1em] uppercase"
        >
          {error}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-micro text-smoke mb-1 block font-mono tracking-[0.12em] uppercase">
            Name
          </span>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            className={boxed}
            required
          />
        </label>
        <label className="block">
          <span className="text-micro text-smoke mb-1 block font-mono tracking-[0.12em] uppercase">
            Slug
          </span>
          <input
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            className={boxed}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-micro text-smoke mb-1 block font-mono tracking-[0.12em] uppercase">
            Description
          </span>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={boxed}
          />
        </label>
      </div>
      <Button type="submit" disabled={busy}>
        {busy ? "Creating…" : "Create collection"}
      </Button>
    </form>
  );
}
