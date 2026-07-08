import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { formatPrice } from "@/lib/format";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductCard } from "@/components/product-card";
import { CheckCircle2 } from "lucide-react";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true, assets: true },
  });

  if (!product) notFound();

  const session = await auth();
  let owned = false;
  if (session?.user?.id) {
    const order = await prisma.orderItem.findFirst({
      where: { productId: product.id, order: { userId: session.user.id, status: "PAID" } },
    });
    owned = Boolean(order);
  }

  const formats: string[] = JSON.parse(product.formats);
  const previewImages: string[] = JSON.parse(product.previewImages);

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id } },
    include: { category: true },
    take: 3,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="text-sm text-muted">
        <Link href="/products" className="hover:text-foreground">Packages</Link>
        {" / "}
        <Link href={`/products?category=${product.category.slug}`} className="hover:text-foreground">
          {product.category.name}
        </Link>
      </nav>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewImages[0]} alt={product.title} className="w-full" />
          </div>

          <div className="mt-10">
            <h2 className="text-lg font-semibold">About this package</h2>
            <p className="mt-3 whitespace-pre-line text-muted">{product.description}</p>
          </div>

          <div className="mt-10">
            <h2 className="text-lg font-semibold">What&apos;s included</h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {formats.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted">
                  <CheckCircle2 className="h-4 w-4 text-accent-2" /> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-24 rounded-xl border border-border bg-surface p-6">
            <span className="text-xs font-semibold uppercase tracking-wide text-accent-2">
              {product.category.name}
            </span>
            <h1 className="mt-2 text-2xl font-semibold leading-tight">{product.title}</h1>
            <p className="mt-2 text-sm text-muted">{product.tagline}</p>

            <div className="mt-6 text-3xl font-semibold">
              {formatPrice(product.priceCents, product.currency)}
              <span className="ml-2 text-sm font-normal text-muted">one-time purchase</span>
            </div>

            <div className="mt-6">
              <AddToCartButton productId={product.id} owned={owned} />
            </div>

            {owned && (
              <Link
                href="/account/orders"
                className="mt-3 block text-center text-sm text-accent-2 hover:underline"
              >
                Go to your downloads →
              </Link>
            )}

            <p className="mt-4 text-xs text-muted">
              Or get this package included with{" "}
              <Link href="/pricing" className="text-accent-2 hover:underline">
                All-Access Membership
              </Link>
              .
            </p>

            <div className="mt-6 border-t border-border pt-6 text-xs text-muted">
              Commercial license included. Files delivered instantly after checkout — no waiting.
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="text-xl font-semibold">More from {product.category.name}</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard
                key={p.id}
                product={{ ...p, category: { name: p.category.name, slug: p.category.slug } }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
