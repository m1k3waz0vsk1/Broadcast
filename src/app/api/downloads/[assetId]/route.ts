import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const { assetId } = await params;
  const asset = await prisma.productAsset.findUnique({
    where: { id: assetId },
    include: { product: true },
  });
  if (!asset) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }

  const [purchase, activeSubscription] = await Promise.all([
    prisma.orderItem.findFirst({
      where: { productId: asset.productId, order: { userId: session.user.id, status: "PAID" } },
    }),
    prisma.subscription.findFirst({
      where: { userId: session.user.id, status: { in: ["ACTIVE", "TRIALING"] } },
    }),
  ]);

  if (!purchase && !activeSubscription) {
    return NextResponse.json({ error: "You don't have access to this file." }, { status: 403 });
  }

  // Demo delivery: assets aren't real production files in this sample store,
  // so we generate a stand-in file rather than reading from disk.
  const content = [
    `BroadcastGFX — ${asset.product.title}`,
    `File: ${asset.fileName}`,
    `Package: ${asset.product.title}`,
    "",
    "This is a placeholder deliverable for the demo storefront.",
    "In production this endpoint streams the real asset file from protected storage",
    "after confirming the same purchase/subscription entitlement check above.",
  ].join("\n");

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${asset.fileName}.txt"`,
    },
  });
}
