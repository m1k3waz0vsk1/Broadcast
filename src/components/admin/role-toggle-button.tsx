"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function RoleToggleButton({ userId, role }: { userId: string; role: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const nextRole = role === "ADMIN" ? "USER" : "ADMIN";

  async function handleClick() {
    if (!confirm(`Change this user's role to ${nextRole}?`)) return;

    setLoading(true);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: nextRole }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(data.error || "Couldn't update role.");
      return;
    }
    toast.success(`Role updated to ${nextRole}`);
    router.refresh();
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="rounded-full border border-border px-3 py-1 text-xs font-medium transition hover:border-accent disabled:opacity-50"
    >
      {loading ? "…" : `Make ${nextRole === "ADMIN" ? "admin" : "user"}`}
    </button>
  );
}
