import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ items: [] });
  }

  const items = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: { product: { include: { category: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ items });
}

const addSchema = z.object({
  productId: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const alreadyOwned = await prisma.orderItem.findFirst({
    where: { productId: product.id, order: { userId: session.user.id, status: "PAID" } },
  });
  if (alreadyOwned) {
    return NextResponse.json({ error: "You already own this package." }, { status: 409 });
  }

  const item = await prisma.cartItem.upsert({
    where: { userId_productId: { userId: session.user.id, productId: product.id } },
    update: {},
    create: { userId: session.user.id, productId: product.id, quantity: 1 },
  });

  return NextResponse.json({ item });
}

const removeSchema = z.object({
  productId: z.string().min(1),
});

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = removeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  await prisma.cartItem.deleteMany({
    where: { userId: session.user.id, productId: parsed.data.productId },
  });

  return NextResponse.json({ ok: true });
}
