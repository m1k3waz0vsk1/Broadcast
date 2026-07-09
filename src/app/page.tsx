import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product-card";
import { JsonLd } from "@/components/json-ld";
import { siteUrl, siteName, siteDescription } from "@/lib/site";
import { Radio, Download, ShieldCheck, Sparkles } from "lucide-react";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteName,
  url: siteUrl,
  logo: `${siteUrl}/favicon.ico`,
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteName,
  url: siteUrl,
  description: siteDescription,
};

export default async function Home() {
  const [featured, categories] = await Promise.all([
    prisma.product.findMany({
      where: { featured: true },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.category.findMany({
      include: { _count: { select: { products: true } } },
    }),
  ]);

  return (
    <div>
      <JsonLd data={organizationJsonLd} />
      <JsonLd data={websiteJsonLd} />
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent" />
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-muted">
              <Radio className="h-3.5 w-3.5 text-live" /> Built for live production teams
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-6xl">
              Broadcast-quality graphics for{" "}
              <span className="gradient-text">webinars, livestreams &amp; conferences</span>
            </h1>
            <p className="mt-6 text-lg text-muted">
              Lower thirds, overlays, countdowns, and full show packages — ready for OBS, vMix,
              Zoom, and After Effects. Download instantly, drop into your show, go live.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/products"
                className="w-full rounded-full bg-gradient-to-r from-accent to-accent-2 px-8 py-3.5 text-sm font-semibold text-white transition hover:opacity-90 sm:w-auto"
              >
                Browse packages
              </Link>
              <Link
                href="/pricing"
                className="w-full rounded-full border border-border px-8 py-3.5 text-sm font-semibold transition hover:border-accent sm:w-auto"
              >
                Get unlimited access
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-b border-border bg-surface/40">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Download className="h-5 w-5 text-accent-2" />
            <p className="text-sm text-muted">Instant digital delivery, no waiting on export queues</p>
          </div>
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-accent-2" />
            <p className="text-sm text-muted">Editable sources — PSD, After Effects &amp; overlay files</p>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-accent-2" />
            <p className="text-sm text-muted">Commercial license included on every package</p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-xl font-semibold">Shop by category</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/products?category=${c.slug}`}
              className="card-glow rounded-xl bg-surface px-4 py-6 text-center transition hover:bg-surface-2"
            >
              <p className="text-sm font-medium">{c.name}</p>
              <p className="mt-1 text-xs text-muted">{c._count.products} packages</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Featured packages</h2>
          <Link href="/products" className="text-sm text-accent-2 hover:underline">
            View all →
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                ...product,
                category: { name: product.category.name, slug: product.category.slug },
              }}
            />
          ))}
        </div>
      </section>

      {/* Membership CTA */}
      <section className="border-t border-border bg-surface/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="card-glow flex flex-col items-center gap-6 rounded-2xl bg-surface p-10 text-center sm:p-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-xs font-medium text-muted">
              All-Access Membership
            </span>
            <h2 className="max-w-2xl text-3xl font-semibold">
              One subscription. Every broadcast package, unlimited downloads.
            </h2>
            <p className="max-w-xl text-muted">
              Cancel anytime. New graphics packages added monthly, included at no extra cost.
            </p>
            <Link
              href="/pricing"
              className="rounded-full bg-gradient-to-r from-accent to-accent-2 px-8 py-3.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              See membership plans
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
