import Link from "next/link";
import { formatPrice } from "@/lib/format";

type ProductCardData = {
  slug: string;
  title: string;
  tagline: string;
  coverImage: string;
  priceCents: number;
  currency: string;
  category: { name: string; slug: string };
};

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="card-glow group flex flex-col overflow-hidden rounded-xl bg-surface"
    >
      <div className="aspect-video w-full overflow-hidden bg-surface-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.coverImage}
          alt={product.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-accent-2">
          {product.category.name}
        </span>
        <h3 className="text-base font-semibold leading-snug">{product.title}</h3>
        <p className="line-clamp-2 flex-1 text-sm text-muted">{product.tagline}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-semibold">
            {formatPrice(product.priceCents, product.currency)}
          </span>
          <span className="text-sm text-muted transition group-hover:text-accent-2">
            View package →
          </span>
        </div>
      </div>
    </Link>
  );
}
