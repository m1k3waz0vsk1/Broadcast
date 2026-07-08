import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import { findOrCreateCategory } from "@/lib/category";
import { assetFilesForFormat } from "@/lib/asset-library";

const updateSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  slug: z.string().min(1).max(120).optional(),
  tagline: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  categoryName: z.string().min(1).max(80).optional(),
  priceDollars: z.number().positive().optional(),
  formats: z.array(z.string().min(1)).min(1).optional(),
  featured: z.boolean().optional(),
  coverImage: z.string().min(1).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }
  const data = parsed.data;

  let categoryId: string | undefined;
  if (data.categoryName) {
    const category = await findOrCreateCategory(data.categoryName);
    categoryId = category.id;
  }

  let slug: string | undefined;
  if (data.slug || data.title) {
    slug = slugify(data.slug || data.title || existing.title);
    if (slug !== existing.slug) {
      const clash = await prisma.product.findUnique({ where: { slug } });
      if (clash) {
        return NextResponse.json({ error: `A product with slug "${slug}" already exists.` }, { status: 409 });
      }
    }
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title }),
      ...(slug && { slug }),
      ...(data.tagline && { tagline: data.tagline }),
      ...(data.description && { description: data.description }),
      ...(data.priceDollars !== undefined && { priceCents: Math.round(data.priceDollars * 100) }),
      ...(data.featured !== undefined && { featured: data.featured }),
      ...(data.coverImage && { coverImage: data.coverImage, previewImages: JSON.stringify([data.coverImage]) }),
      ...(data.formats && { formats: JSON.stringify(data.formats) }),
      ...(categoryId && { categoryId }),
    },
  });

  if (data.formats) {
    await prisma.productAsset.deleteMany({ where: { productId: id } });
    await prisma.productAsset.createMany({
      data: data.formats.flatMap((format) =>
        assetFilesForFormat(format).map((fileName) => ({
          productId: id,
          fileName: `${product.slug}-${fileName}`,
          filePath: `downloads/${product.slug}/${fileName}`,
          sizeBytes: 1024 * 1024 * (5 + Math.floor(Math.random() * 40)),
        }))
      ),
    });
  }

  return NextResponse.json({ product });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }

  const { id } = await params;

  const purchaseCount = await prisma.orderItem.count({ where: { productId: id } });
  if (purchaseCount > 0) {
    return NextResponse.json(
      { error: "This product has existing orders and can't be deleted. Unfeature it instead." },
      { status: 409 }
    );
  }

  await prisma.cartItem.deleteMany({ where: { productId: id } });
  await prisma.productAsset.deleteMany({ where: { productId: id } });
  await prisma.product.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
