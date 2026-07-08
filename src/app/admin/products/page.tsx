import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true, _count: { select: { orderItems: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="px-4 py-3">Product</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Featured</th>
            <th className="px-4 py-3">Sales</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {products.map((p) => (
            <tr key={p.id} className="bg-background">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.coverImage} alt="" className="h-10 w-16 rounded object-cover" />
                  <div>
                    <p className="font-medium">{p.title}</p>
                    <p className="text-xs text-muted">/{p.slug}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-muted">{p.category.name}</td>
              <td className="px-4 py-3 font-medium">{formatPrice(p.priceCents, p.currency)}</td>
              <td className="px-4 py-3">{p.featured ? "✓" : ""}</td>
              <td className="px-4 py-3 text-muted">{p._count.orderItems}</td>
              <td className="px-4 py-3 text-right">
                <Link href={`/admin/products/${p.id}/edit`} className="text-accent-2 hover:underline">
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {products.length === 0 && <p className="p-8 text-center text-muted">No products yet.</p>}
    </div>
  );
}
