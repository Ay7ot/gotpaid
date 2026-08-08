"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createCollection,
  uploadCollectionImage,
} from "@/app/admin/(dashboard)/collections/actions";
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
  const [image, setImage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(file: File) {
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadCollectionImage(formData);
    setUploading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.url) setImage(result.url);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const formData = new FormData();
    formData.set("name", name);
    formData.set("slug", slug || slugify(name));
    formData.set("description", description);
    formData.set("image", image);
    const result = await createCollection(formData);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
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

      <div>
        <span className="text-micro text-smoke mb-1 block font-mono tracking-[0.12em] uppercase">
          Cover image
        </span>
        {image ? (
          <div className="flex items-start gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- storage images */}
            <img src={image} alt="Collection cover" className="h-24 w-36 object-cover" />
            <button
              type="button"
              onClick={() => setImage("")}
              className="text-micro text-smoke hover:text-alert font-mono underline underline-offset-4"
            >
              Remove
            </button>
          </div>
        ) : (
          <label className="border-hairline text-micro hover:border-void inline-block cursor-pointer border px-4 py-2 font-mono tracking-[0.12em] uppercase">
            {uploading ? "Uploading…" : "Upload cover"}
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
        )}
      </div>

      <Button type="submit" disabled={busy}>
        {busy ? "Creating…" : "Create collection"}
      </Button>
    </form>
  );
}
