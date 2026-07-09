"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/components/cart-context";

type CartItem = {
  productId: string;
  title: string;
  tagline: string;
  coverImage: string;
  priceCents: number;
  currency: string;
  slug: string;
};

export function CartList({ initialItems }: { initialItems: CartItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const { refresh } = useCart();

  const total = items.reduce((sum, item) => sum + item.priceCents, 0);
  const currency = items[0]?.currency ?? "usd";

  async function removeItem(productId: string) {
    setRemovingId(productId);
    const res = await fetch("/api/cart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    setRemovingId(null);

    if (!res.ok) {
      toast.error("Couldn't remove item.");
      return;
    }
    setItems((prev) => prev.filter((i) => i.productId !== productId));
    refresh();
  }

  async function checkout() {
    setCheckingOut(true);
    const res = await fetch("/api/checkout", { method: "POST" });
    const data = await res.json();
    setCheckingOut(false);

    if (!res.ok) {
      toast.error(data.error || "Couldn't start checkout.");
      return;
    }
    window.location.href = data.url;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-12 text-center">
        <p className="text-muted">Your cart is empty.</p>
        <Link
          href="/products"
          className="mt-4 inline-block rounded-full bg-gradient-to-r from-accent to-accent-2 px-6 py-2.5 text-sm font-semibold text-white"
        >
          Browse packages
        </Link>
      </div>
    );
  }

  return (
    <div>
      <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
        {items.map((item) => (
          <li key={item.productId} className="flex items-center gap-4 p-4">
            <Link href={`/products/${item.slug}`} className="h-16 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-surface-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.coverImage}
                alt={item.title}
                width={112}
                height={64}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </Link>
            <div className="min-w-0 flex-1">
              <Link href={`/products/${item.slug}`} className="font-medium hover:text-accent-2">
                {item.title}
              </Link>
              <p className="truncate text-sm text-muted">{item.tagline}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{formatPrice(item.priceCents, item.currency)}</p>
            </div>
            <button
              onClick={() => removeItem(item.productId)}
              disabled={removingId === item.productId}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition hover:border-live hover:text-live disabled:opacity-50"
              aria-label="Remove"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex items-center justify-between rounded-xl border border-border bg-surface p-6">
        <div>
          <p className="text-sm text-muted">Total</p>
          <p className="text-2xl font-semibold">{formatPrice(total, currency)}</p>
        </div>
        <button
          onClick={checkout}
          disabled={checkingOut}
          className="rounded-full bg-gradient-to-r from-accent to-accent-2 px-8 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {checkingOut ? "Redirecting…" : "Checkout with Stripe"}
        </button>
      </div>
    </div>
  );
}
