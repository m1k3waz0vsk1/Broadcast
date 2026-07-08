"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export type ProductFormInitial = {
  id?: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  categoryName: string;
  priceDollars: number;
  formats: string[];
  featured: boolean;
  coverImage: string;
};

export function ProductForm({
  mode,
  initial,
  categoryNames,
}: {
  mode: "create" | "edit";
  initial: ProductFormInitial;
  categoryNames: string[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [tagline, setTagline] = useState(initial.tagline);
  const [description, setDescription] = useState(initial.description);
  const [categoryName, setCategoryName] = useState(initial.categoryName);
  const [priceDollars, setPriceDollars] = useState(String(initial.priceDollars));
  const [formats, setFormats] = useState(initial.formats.join(", "));
  const [featured, setFeatured] = useState(initial.featured);
  const [coverImage, setCoverImage] = useState(initial.coverImage);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      title,
      slug: slug || undefined,
      tagline,
      description,
      categoryName,
      priceDollars: Number(priceDollars),
      formats: formats
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean),
      featured,
      coverImage: coverImage.trim() || undefined,
    };

    const res = await fetch(
      mode === "create" ? "/api/admin/products" : `/api/admin/products/${initial.id}`,
      {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      toast.error(data.error || "Something went wrong.");
      return;
    }

    toast.success(mode === "create" ? "Product created" : "Product updated");
    router.push("/admin/products");
    router.refresh();
  }

  async function handleDelete() {
    if (!initial.id) return;
    if (!confirm(`Delete "${title}"? This can't be undone.`)) return;

    setDeleting(true);
    const res = await fetch(`/api/admin/products/${initial.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setDeleting(false);

    if (!res.ok) {
      toast.error(data.error || "Couldn't delete product.");
      return;
    }
    toast.success("Product deleted");
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      <div>
        <label className="text-sm text-muted">Title</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      <div>
        <label className="text-sm text-muted">Slug (URL) — leave blank to auto-generate from title</label>
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="auto-generated-from-title"
          className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      <div>
        <label className="text-sm text-muted">Tagline (short, shown on cards)</label>
        <input
          required
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      <div>
        <label className="text-sm text-muted">Description</label>
        <textarea
          required
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-muted">Category</label>
          <input
            required
            list="category-options"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Existing or new category name"
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <datalist id="category-options">
            {categoryNames.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="text-sm text-muted">Price (USD)</label>
          <input
            required
            type="number"
            step="0.01"
            min="0.01"
            value={priceDollars}
            onChange={(e) => setPriceDollars(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
      </div>

      <div>
        <label className="text-sm text-muted">Included formats — comma separated</label>
        <input
          required
          value={formats}
          onChange={(e) => setFormats(e.target.value)}
          placeholder="PNG, PSD, After Effects Template"
          className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <p className="mt-1 text-xs text-muted">
          Each format gets a downloadable placeholder file automatically.
        </p>
      </div>

      <div>
        <label className="text-sm text-muted">Cover image URL — leave blank to auto-generate one</label>
        <input
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          placeholder="https://…"
          className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
          className="h-4 w-4 rounded border-border"
        />
        Featured on homepage
      </label>

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-gradient-to-r from-accent to-accent-2 px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving…" : mode === "create" ? "Create product" : "Save changes"}
        </button>
        {mode === "edit" && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-full border border-border px-6 py-2.5 text-sm font-semibold text-live transition hover:border-live disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete product"}
          </button>
        )}
      </div>
    </form>
  );
}
