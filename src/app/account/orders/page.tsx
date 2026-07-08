import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { Download } from "lucide-react";

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/orders");
  }

  const [orders, subscription] = await Promise.all([
    prisma.order.findMany({
      where: { userId: session.user.id, status: "PAID" },
      include: { items: { include: { product: { include: { assets: true } } } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.subscription.findFirst({
      where: { userId: session.user.id, status: { in: ["ACTIVE", "TRIALING"] } },
    }),
  ]);

  const memberProducts = subscription
    ? await prisma.product.findMany({ include: { assets: true } })
    : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold">Your downloads</h1>
      <p className="mt-2 text-muted">Every file from your purchases and membership, ready to download.</p>

      {subscription && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold">All-Access Membership</h2>
          <p className="mt-1 text-sm text-muted">Your subscription unlocks every package below.</p>
          <div className="mt-4 space-y-4">
            {memberProducts.map((product) => (
              <div key={product.id} className="rounded-xl border border-border bg-surface p-5">
                <div className="flex items-center justify-between">
                  <Link href={`/products/${product.slug}`} className="font-medium hover:text-accent-2">
                    {product.title}
                  </Link>
                </div>
                <ul className="mt-3 space-y-2">
                  {product.assets.map((asset) => (
                    <li key={asset.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted">{asset.fileName}</span>
                      <a
                        href={`/api/downloads/${asset.id}`}
                        className="flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-medium transition hover:border-accent"
                      >
                        <Download className="h-3.5 w-3.5" /> Download
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-lg font-semibold">Purchased packages</h2>
        {orders.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            No purchases yet.{" "}
            <Link href="/products" className="text-accent-2 hover:underline">
              Browse packages
            </Link>
            .
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-xl border border-border bg-surface p-5">
                <div className="flex items-center justify-between text-sm text-muted">
                  <span>Order placed {order.createdAt.toLocaleDateString()}</span>
                  <span>{formatPrice(order.totalCents, order.currency)}</span>
                </div>
                <div className="mt-4 space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id}>
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="font-medium hover:text-accent-2"
                      >
                        {item.product.title}
                      </Link>
                      <ul className="mt-2 space-y-2">
                        {item.product.assets.map((asset) => (
                          <li key={asset.id} className="flex items-center justify-between text-sm">
                            <span className="text-muted">{asset.fileName}</span>
                            <a
                              href={`/api/downloads/${asset.id}`}
                              className="flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-medium transition hover:border-accent"
                            >
                              <Download className="h-3.5 w-3.5" /> Download
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
