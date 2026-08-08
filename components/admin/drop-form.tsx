"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveDrop } from "@/app/admin/(dashboard)/drops/actions";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/utils";

const boxed =
  "w-full border border-hairline bg-paper px-3 py-2 font-mono text-caption focus:border-void focus:outline-none";

function toLocalInput(date: string) {
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

type InitialData = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  releaseAt: string;
  endAt: string | null;
  status: string;
  productIds: string[];
};

export function DropForm({
  initial,
  products,
}: {
  initial?: InitialData;
  products: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [description, setDescription] = useState(initial?.description ?? "");
  const [releaseAt, setReleaseAt] = useState(initial ? toLocalInput(initial.releaseAt) : "");
  const [endAt, setEndAt] = useState(initial?.endAt ? toLocalInput(initial.endAt) : "");
  const [status, setStatus] = useState(initial?.status ?? "draft");
  const [selected, setSelected] = useState<string[]>(initial?.productIds ?? []);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function toggleProduct(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const formData = new FormData();
    formData.set("id", initial?.id ?? "");
    formData.set("name", name);
    formData.set("slug", slug || slugify(name));
    formData.set("description", description);
    formData.set("releaseAt", releaseAt);
    formData.set("endAt", endAt);
    formData.set("status", status);
    for (const id of selected) formData.append("productIds", id);

    const result = await saveDrop(formData);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/admin/drops");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error ? (
        <p
          role="alert"
          className="border-alert text-micro text-alert border px-3 py-2 font-mono tracking-[0.1em] uppercase"
        >
          {error}
        </p>
      ) : null}

      <section>
        <h2 className="border-hairline text-micro text-smoke border-b pb-2 font-mono tracking-[0.16em] uppercase">
          Details
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
              placeholder="DROP 006 - TITLE"
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
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={boxed}
            />
          </label>
          <label className="block">
            <span className="text-micro text-smoke mb-1 block font-mono tracking-[0.12em] uppercase">
              Releases at (local time)
            </span>
            <input
              type="datetime-local"
              value={releaseAt}
              onChange={(e) => setReleaseAt(e.target.value)}
              className={boxed}
              required
            />
          </label>
          <label className="block">
            <span className="text-micro text-smoke mb-1 block font-mono tracking-[0.12em] uppercase">
              Ends at (optional)
            </span>
            <input
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              className={boxed}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-micro text-smoke mb-1 block font-mono tracking-[0.12em] uppercase">
              Status
            </span>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={boxed}>
              <option value="draft">draft</option>
              <option value="scheduled">scheduled</option>
              <option value="live">live</option>
              <option value="ended">ended</option>
            </select>
          </label>
        </div>
      </section>

      <section>
        <div className="border-hairline flex items-center justify-between border-b pb-2">
          <h2 className="text-micro text-smoke font-mono tracking-[0.16em] uppercase">
            Products in this drop
          </h2>
          <span className="text-micro text-smoke font-mono">{selected.length} selected</span>
        </div>
        {products.length ? (
          <ul className="divide-hairline border-hairline mt-4 max-h-72 divide-y overflow-y-auto border">
            {products.map((product) => {
              const checked = selected.includes(product.id);
              return (
                <li key={product.id}>
                  <label className="hover:bg-hairline/30 flex cursor-pointer items-center gap-3 px-3 py-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleProduct(product.id)}
                      className="accent-void h-4 w-4"
                    />
                    <span className="text-caption font-mono">{product.name}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-caption text-smoke mt-4 font-mono">
            No published products yet. Create products first, then link them here.
          </p>
        )}
      </section>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save drop"}
        </Button>
        {initial ? (
          <span className="text-micro text-smoke font-mono tracking-[0.12em] uppercase">
            Changes go live immediately.
          </span>
        ) : null}
      </div>
    </form>
  );
}
