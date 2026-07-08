import Link from "next/link";
import clsx from "clsx";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

const statuses = ["PENDING", "PAID", "FAILED", "REFUNDED"] as const;

const statusStyles: Record<string, string> = {
  PAID: "bg-emerald-500/15 text-emerald-400",
  PENDING: "bg-amber-500/15 text-amber-400",
  FAILED: "bg-live/15 text-live",
  REFUNDED: "bg-muted/20 text-muted",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeStatus = statuses.includes(status as (typeof statuses)[number]) ? status : undefined;

  const [orders, revenue, counts] = await Promise.all([
    prisma.order.findMany({
      where: activeStatus ? { status: activeStatus } : undefined,
      include: { user: true, items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.order.aggregate({ where: { status: "PAID" }, _sum: { totalCents: true } }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const countMap = new Map(counts.map((c) => [c.status, c._count._all]));

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-muted">Total revenue (paid)</p>
          <p className="mt-1 text-xl font-semibold">{formatPrice(revenue._sum.totalCents ?? 0)}</p>
        </div>
        {statuses.map((s) => (
          <div key={s} className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs text-muted">{s}</p>
            <p className="mt-1 text-xl font-semibold">{countMap.get(s) ?? 0}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href="/admin/orders"
          className={clsx(
            "rounded-full border px-4 py-1.5 text-sm transition",
            !activeStatus ? "border-accent bg-accent/10 text-foreground" : "border-border text-muted hover:text-foreground"
          )}
        >
          All
        </Link>
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={clsx(
              "rounded-full border px-4 py-1.5 text-sm capitalize transition",
              activeStatus === s ? "border-accent bg-accent/10 text-foreground" : "border-border text-muted hover:text-foreground"
            )}
          >
            {s.toLowerCase()}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((o) => (
              <tr key={o.id} className="bg-background align-top">
                <td className="px-4 py-3 font-mono text-xs text-muted">{o.id.slice(-10)}</td>
                <td className="px-4 py-3">
                  <p className="font-medium">{o.user.name || "—"}</p>
                  <p className="text-xs text-muted">{o.user.email}</p>
                </td>
                <td className="px-4 py-3 text-muted">
                  {o.createdAt.toLocaleDateString()}{" "}
                  <span className="text-xs">{o.createdAt.toLocaleTimeString()}</span>
                </td>
                <td className="px-4 py-3 text-muted">
                  {o.items.map((i) => i.product.title).join(", ")}
                </td>
                <td className="px-4 py-3">
                  <span className={clsx("rounded-full px-2 py-0.5 text-xs font-medium", statusStyles[o.status])}>
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium">{formatPrice(o.totalCents, o.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="p-8 text-center text-muted">No orders in this view.</p>}
      </div>
    </div>
  );
}
