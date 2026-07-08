import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product-card";
import clsx from "clsx";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: category ? { category: { slug: category } } : undefined,
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const activeCategory = categories.find((c) => c.slug === category);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold">
          {activeCategory ? activeCategory.name : "All packages"}
        </h1>
        <p className="mt-2 text-muted">
          Broadcast graphics packages for webinars, livestreams, and conferences — download
          instantly and drop into your show.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/products"
          className={clsx(
            "rounded-full border px-4 py-1.5 text-sm transition",
            !category ? "border-accent bg-accent/10 text-foreground" : "border-border text-muted hover:text-foreground"
          )}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/products?category=${c.slug}`}
            className={clsx(
              "rounded-full border px-4 py-1.5 text-sm transition",
              category === c.slug
                ? "border-accent bg-accent/10 text-foreground"
                : "border-border text-muted hover:text-foreground"
            )}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="mt-16 text-center text-muted">No packages found in this category yet.</p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                ...product,
                category: { name: product.category.name, slug: product.category.slug },
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
