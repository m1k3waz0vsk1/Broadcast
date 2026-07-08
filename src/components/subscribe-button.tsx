"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export function SubscribeButton({ planId, label }: { planId: string; label: string }) {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=/pricing`);
      return;
    }

    setLoading(true);
    const res = await fetch("/api/checkout/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(data.error || "Couldn't start checkout.");
      return;
    }
    window.location.href = data.url;
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-full rounded-full bg-gradient-to-r from-accent to-accent-2 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
    >
      {loading ? "Redirecting…" : label}
    </button>
  );
}
