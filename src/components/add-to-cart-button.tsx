"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useCart } from "@/components/cart-context";
import { ShoppingCart } from "lucide-react";

export function AddToCartButton({
  productId,
  owned,
}: {
  productId: string;
  owned: boolean;
}) {
  const { status } = useSession();
  const { refresh } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (owned) {
    return (
      <button
        disabled
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface px-6 py-3.5 text-sm font-semibold text-muted"
      >
        You already own this package
      </button>
    );
  }

  async function handleClick() {
    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setLoading(true);
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(data.error || "Couldn't add to cart.");
      return;
    }

    toast.success("Added to cart");
    refresh();
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-accent to-accent-2 px-6 py-3.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
    >
      <ShoppingCart className="h-4 w-4" />
      {loading ? "Adding…" : "Add to cart"}
    </button>
  );
}
