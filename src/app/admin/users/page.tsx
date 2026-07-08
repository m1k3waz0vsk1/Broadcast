import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { RoleToggleButton } from "@/components/admin/role-toggle-button";

export default async function AdminUsersPage() {
  const [users, spendByUser, activeSubs] = await Promise.all([
    prisma.user.findMany({
      include: { _count: { select: { orders: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.groupBy({
      by: ["userId"],
      where: { status: "PAID" },
      _sum: { totalCents: true },
    }),
    prisma.subscription.findMany({
      where: { status: { in: ["ACTIVE", "TRIALING"] } },
      select: { userId: true, plan: { select: { name: true } } },
    }),
  ]);

  const spendMap = new Map(spendByUser.map((s) => [s.userId, s._sum.totalCents ?? 0]));
  const subMap = new Map(activeSubs.map((s) => [s.userId, s.plan.name]));

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Joined</th>
            <th className="px-4 py-3">Orders</th>
            <th className="px-4 py-3">Total spent</th>
            <th className="px-4 py-3">Membership</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {users.map((u) => (
            <tr key={u.id} className="bg-background">
              <td className="px-4 py-3">
                <p className="font-medium">{u.name || "—"}</p>
                <p className="text-xs text-muted">{u.email}</p>
              </td>
              <td className="px-4 py-3">
                <span
                  className={
                    u.role === "ADMIN"
                      ? "rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent-2"
                      : "text-xs text-muted"
                  }
                >
                  {u.role}
                </span>
              </td>
              <td className="px-4 py-3 text-muted">{u.createdAt.toLocaleDateString()}</td>
              <td className="px-4 py-3 text-muted">{u._count.orders}</td>
              <td className="px-4 py-3 font-medium">{formatPrice(spendMap.get(u.id) ?? 0)}</td>
              <td className="px-4 py-3 text-muted">{subMap.get(u.id) ?? "—"}</td>
              <td className="px-4 py-3 text-right">
                <RoleToggleButton userId={u.id} role={u.role} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && <p className="p-8 text-center text-muted">No users yet.</p>}
    </div>
  );
}
