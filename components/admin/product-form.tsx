"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { saveProduct, uploadProductImage } from "@/app/admin/(dashboard)/products/actions";
import { Button } from "@/components/ui/button";
import { cn, slugify } from "@/lib/utils";

type VariantRow = {
  key: string;
  id?: string;
  size: string;
  color: string;
  sku: string;
  price: string;
  stock: string;
};

type ImageRow = { key: string; id?: string; url: string; alt: string };

type InitialData = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  collectionId: string | null;
  dropId: string | null;
  status: string;
  variants: {
    id: string;
    size: string | null;
    color: string | null;
    sku: string | null;
    priceOverride: number | null;
    stockQuantity: number;
  }[];
  images: { id: string; url: string; alt: string | null }[];
};

const boxed =
  "w-full border border-hairline bg-paper px-3 py-2 font-mono text-caption focus:border-void focus:outline-none";

const newKey = () => crypto.randomUUID();

function emptyVariant(): VariantRow {
  return { key: newKey(), size: "", color: "", sku: "", price: "", stock: "0" };
}

export function ProductForm({
  initial,
  collections,
  drops,
}: {
  initial?: InitialData;
  collections: { id: string; name: string }[];
  drops: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [collectionId, setCollectionId] = useState(initial?.collectionId ?? "");
  const [dropId, setDropId] = useState(initial?.dropId ?? "");
  const [status, setStatus] = useState(initial?.status ?? "draft");
  const [variants, setVariants] = useState<VariantRow[]>(
    initial?.variants.length
      ? initial.variants.map((v) => ({
          key: newKey(),
          id: v.id,
          size: v.size ?? "",
          color: v.color ?? "",
          sku: v.sku ?? "",
          price: v.priceOverride != null ? String(v.priceOverride / 100) : "",
          stock: String(v.stockQuantity),
        }))
      : [emptyVariant()],
  );
  const [images, setImages] = useState<ImageRow[]>(
    initial?.images.map((i) => ({ key: newKey(), id: i.id, url: i.url, alt: i.alt ?? "" })) ?? [],
  );

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  function onNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function updateVariant(key: string, patch: Partial<VariantRow>) {
    setVariants((prev) => prev.map((v) => (v.key === key ? { ...v, ...patch } : v)));
  }

  const colorGroups = useMemo(() => {
    const map = new Map<string, VariantRow[]>();
    for (const variant of variants) {
      const color = variant.color ?? "";
      if (!map.has(color)) map.set(color, []);
      map.get(color)!.push(variant);
    }
    return [...map.entries()].map(([color, rows]) => ({
      key: rows[0].key,
      color,
      rows,
    }));
  }, [variants]);

  function setGroupColor(groupKey: string, color: string) {
    const group = colorGroups.find((g) => g.key === groupKey);
    if (!group) return;
    const keys = new Set(group.rows.map((r) => r.key));
    setVariants((prev) => prev.map((v) => (keys.has(v.key) ? { ...v, color } : v)));
  }

  function addSizeToGroup(groupKey: string) {
    const group = colorGroups.find((g) => g.key === groupKey);
    setVariants((prev) => [...prev, { ...emptyVariant(), color: group?.color ?? "" }]);
  }

  function removeGroup(groupKey: string) {
    const group = colorGroups.find((g) => g.key === groupKey);
    if (!group) return;
    const keys = new Set(group.rows.map((r) => r.key));
    setVariants((prev) => {
      const next = prev.filter((v) => !keys.has(v.key));
      return next.length ? next : [emptyVariant()];
    });
  }

  function removeVariantFromGroup(groupKey: string, variantKey: string) {
    const group = colorGroups.find((g) => g.key === groupKey);
    if (!group || group.rows.length <= 1) return;
    setVariants((prev) => prev.filter((v) => v.key !== variantKey));
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
    formData.set("category", category);
    formData.set("collection", collectionId);
    formData.set("drop", dropId);
    formData.set("status", status);
    formData.set(
      "variants",
      JSON.stringify(
        variants.map((v) => ({
          id: v.id,
          size: v.size,
          color: v.color,
          sku: v.sku,
          price: v.price,
          stock: v.stock,
        })),
      ),
    );
    formData.set(
      "images",
      JSON.stringify(images.map((i) => ({ id: i.id, url: i.url, alt: i.alt }))),
    );

    const result = await saveProduct(formData);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/admin/products");
  }

  async function handleUpload(file: File) {
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadProductImage(formData);
    setUploading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.url) {
      setImages((prev) => [...prev, { key: newKey(), url: result.url!, alt: "" }]);
    }
  }

  function moveImage(index: number, direction: -1 | 1) {
    setImages((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
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
              onChange={(e) => onNameChange(e.target.value)}
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
              Category
            </span>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Tops, Bottoms…"
              className={boxed}
            />
          </label>
          <label className="block">
            <span className="text-micro text-smoke mb-1 block font-mono tracking-[0.12em] uppercase">
              Status
            </span>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={boxed}>
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="archived">archived</option>
            </select>
          </label>
          <label className="block">
            <span className="text-micro text-smoke mb-1 block font-mono tracking-[0.12em] uppercase">
              Collection
            </span>
            <select
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
              className={boxed}
            >
              <option value="">None</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-micro text-smoke mb-1 block font-mono tracking-[0.12em] uppercase">
              Drop
            </span>
            <select value={dropId} onChange={(e) => setDropId(e.target.value)} className={boxed}>
              <option value="">None</option>
              {drops.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section>
        <div className="border-hairline flex items-center justify-between border-b pb-2">
          <h2 className="text-micro text-smoke font-mono tracking-[0.16em] uppercase">Images</h2>
          <label className="text-micro cursor-pointer font-mono tracking-[0.12em] uppercase underline underline-offset-4">
            {uploading ? "Uploading…" : "Upload"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleUpload(file);
                e.target.value = "";
              }}
            />
          </label>
        </div>

        {images.length ? (
          <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {images.map((image, index) => (
              <li key={image.key} className="border-hairline border">
                {/* eslint-disable-next-line @next/next/no-img-element -- storage images */}
                <img src={image.url} alt="" className="aspect-[4/5] w-full object-cover" />
                <div className="border-hairline flex items-center justify-between border-t px-1 py-1">
                  <div className="flex">
                    <button
                      type="button"
                      onClick={() => moveImage(index, -1)}
                      disabled={index === 0}
                      aria-label="Move up"
                      className="text-micro disabled:text-smoke px-1.5 py-0.5 font-mono"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(index, 1)}
                      disabled={index === images.length - 1}
                      aria-label="Move down"
                      className="text-micro disabled:text-smoke px-1.5 py-0.5 font-mono"
                    >
                      ↓
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, i) => i !== index))}
                    className="text-micro text-smoke hover:text-alert px-1.5 py-0.5 font-mono"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-caption text-smoke mt-4 font-mono">
            No images yet. Upload shots - they show on the product page in this order.
          </p>
        )}
      </section>

      <section>
        <div className="border-hairline flex items-center justify-between border-b pb-2">
          <h2 className="text-micro text-smoke font-mono tracking-[0.16em] uppercase">Variants</h2>
          <button
            type="button"
            onClick={() => setVariants((prev) => [...prev, emptyVariant()])}
            className="text-micro font-mono tracking-[0.12em] uppercase underline underline-offset-4"
          >
            Add color
          </button>
        </div>
        <p className="text-micro text-smoke mt-3 font-mono">
          Add a color first, then its sizes below it.
        </p>

        <div className="mt-4 space-y-6">
          {colorGroups.map((group) => {
            const displayColor = group.color || "Default";
            return (
              <div key={group.key} className="border-hairline border">
                <div className="border-hairline bg-hairline/20 flex flex-wrap items-center gap-3 border-b px-3 py-2">
                  <label className="text-micro text-smoke flex items-center gap-2 font-mono tracking-[0.12em] uppercase">
                    Color
                    <input
                      key={group.key}
                      value={group.color}
                      onChange={(e) => setGroupColor(group.key, e.target.value)}
                      placeholder="Black"
                      className={cn(boxed, "min-w-28")}
                    />
                  </label>
                  <span className="text-micro text-smoke font-mono">
                    {group.rows.length} {group.rows.length === 1 ? "size" : "sizes"}
                  </span>
                  <div className="ml-auto flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => addSizeToGroup(group.key)}
                      className="text-micro font-mono tracking-[0.12em] uppercase underline underline-offset-4"
                    >
                      Add size
                    </button>
                    {colorGroups.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeGroup(group.key)}
                        className="text-micro text-smoke hover:text-alert font-mono tracking-[0.12em] uppercase"
                      >
                        Remove {displayColor}
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="text-caption w-full border-collapse font-mono">
                    <thead>
                      <tr className="border-hairline text-micro text-smoke border-b text-left tracking-[0.12em] uppercase">
                        <th className="py-2 pr-3 pl-3 font-normal">Size</th>
                        <th className="py-2 pr-3 font-normal">SKU</th>
                        <th className="py-2 pr-3 font-normal">Price (₦)</th>
                        <th className="py-2 pr-3 font-normal">Stock</th>
                        <th className="py-2 pr-3 font-normal" />
                      </tr>
                    </thead>
                    <tbody>
                      {group.rows.map((variant) => (
                        <tr key={variant.key} className="border-hairline border-b">
                          <td className="py-2 pr-3 pl-3">
                            <input
                              value={variant.size}
                              onChange={(e) => updateVariant(variant.key, { size: e.target.value })}
                              placeholder="M"
                              className={cn(boxed, "min-w-16")}
                            />
                          </td>
                          <td className="py-2 pr-3">
                            <input
                              value={variant.sku}
                              onChange={(e) => updateVariant(variant.key, { sku: e.target.value })}
                              placeholder="TEE-BLK-M"
                              className={cn(boxed, "min-w-28")}
                            />
                          </td>
                          <td className="py-2 pr-3">
                            <input
                              type="number"
                              inputMode="numeric"
                              min="0"
                              value={variant.price}
                              onChange={(e) =>
                                updateVariant(variant.key, { price: e.target.value })
                              }
                              placeholder="18000"
                              className={cn(boxed, "w-28")}
                            />
                          </td>
                          <td className="py-2 pr-3">
                            <input
                              type="number"
                              inputMode="numeric"
                              min="0"
                              value={variant.stock}
                              onChange={(e) =>
                                updateVariant(variant.key, { stock: e.target.value })
                              }
                              className={cn(boxed, "w-20")}
                            />
                          </td>
                          <td className="py-2 pr-3 text-right">
                            <button
                              type="button"
                              onClick={() => removeVariantFromGroup(group.key, variant.key)}
                              className="text-micro text-smoke hover:text-alert font-mono"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
        {initial ? (
          <p className="text-micro text-smoke mt-3 font-mono tracking-[0.12em] uppercase">
            Prices are in naira. Stock updates here change the storefront immediately.
          </p>
        ) : null}
      </section>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save product"}
        </Button>
        {initial ? (
          <span className="text-micro text-smoke font-mono tracking-[0.12em] uppercase">
            Saved changes go live immediately.
          </span>
        ) : null}
      </div>
    </form>
  );
}
