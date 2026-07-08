"use client";

import { useState } from "react";
import { toast } from "sonner";

export function ManageBillingButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const res = await fetch("/api/billing-portal", { method: "POST" });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(data.error || "Couldn't open billing portal.");
      return;
    }
    window.location.href = data.url;
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="rounded-full border border-border px-5 py-2.5 text-sm font-medium transition hover:border-accent disabled:opacity-50"
    >
      {loading ? "Opening…" : "Manage billing"}
    </button>
  );
}
