import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CartList } from "@/components/cart-list";

export default async function CartPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/cart");
  }

  const items = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: { product: { include: { category: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold">Your cart</h1>
      <p className="mt-2 text-muted">Review your packages before checkout.</p>

      <div className="mt-8">
        <CartList
          initialItems={items.map((i) => ({
            productId: i.productId,
            title: i.product.title,
            tagline: i.product.tagline,
            coverImage: i.product.coverImage,
            priceCents: i.product.priceCents,
            currency: i.product.currency,
            slug: i.product.slug,
          }))}
        />
      </div>
    </div>
  );
}
