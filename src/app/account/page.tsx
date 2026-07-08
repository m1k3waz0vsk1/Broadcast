import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { ManageBillingButton } from "@/components/manage-billing-button";
import { Package, CreditCard } from "lucide-react";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account");
  }

  const [orders, subscription] = await Promise.all([
    prisma.order.findMany({
      where: { userId: session.user.id, status: "PAID" },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.subscription.findFirst({
      where: { userId: session.user.id, status: { in: ["ACTIVE", "TRIALING"] } },
      include: { plan: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold">
        Welcome back{session.user.name ? `, ${session.user.name.split(" ")[0]}` : ""}
      </h1>
      <p className="mt-2 text-muted">{session.user.email}</p>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-accent-2">
            <CreditCard className="h-4 w-4" /> Membership
          </div>
          {subscription ? (
            <>
              <p className="mt-3 text-lg font-medium">{subscription.plan.name}</p>
              <p className="mt-1 text-sm text-muted">
                Renews {subscription.currentPeriodEnd.toLocaleDateString()}
              </p>
              <div className="mt-4">
                <ManageBillingButton />
              </div>
            </>
          ) : (
            <>
              <p className="mt-3 text-sm text-muted">
                You don&apos;t have an active membership yet.
              </p>
              <Link
                href="/pricing"
                className="mt-4 inline-block rounded-full bg-gradient-to-r from-accent to-accent-2 px-5 py-2.5 text-sm font-semibold text-white"
              >
                View plans
              </Link>
            </>
          )}
        </div>

        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-accent-2">
            <Package className="h-4 w-4" /> Recent orders
          </div>
          {orders.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No purchases yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {orders.map((o) => (
                <li key={o.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted">{o.createdAt.toLocaleDateString()}</span>
                  <span className="font-medium">{formatPrice(o.totalCents, o.currency)}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/account/orders" className="mt-4 inline-block text-sm text-accent-2 hover:underline">
            View all downloads →
          </Link>
        </div>
      </div>
    </div>
  );
}
