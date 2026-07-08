import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import { findOrCreateCategory } from "@/lib/category";
import { generatePlaceholderDataUri } from "@/lib/placeholder";
import { assetFilesForFormat } from "@/lib/asset-library";

const productSchema = z.object({
  title: z.string().min(1).max(120),
  slug: z.string().max(120).optional(),
  tagline: z.string().min(1).max(200),
  description: z.string().min(1),
  categoryName: z.string().min(1).max(80),
  priceDollars: z.number().positive(),
  formats: z.array(z.string().min(1)).min(1),
  featured: z.boolean().optional(),
  coverImage: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const data = parsed.data;
  const slug = slugify(data.slug || data.title);
  if (!slug) {
    return NextResponse.json({ error: "Couldn't derive a URL slug from that title." }, { status: 400 });
  }

  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: `A product with slug "${slug}" already exists.` }, { status: 409 });
  }

  const category = await findOrCreateCategory(data.categoryName);

  const coverImage = data.coverImage?.trim() || generatePlaceholderDataUri(data.title, category.name);

  const product = await prisma.product.create({
    data: {
      slug,
      title: data.title,
      tagline: data.tagline,
      description: data.description,
      priceCents: Math.round(data.priceDollars * 100),
      featured: data.featured ?? false,
      coverImage,
      previewImages: JSON.stringify([coverImage]),
      formats: JSON.stringify(data.formats),
      categoryId: category.id,
      assets: {
        create: data.formats.flatMap((format) =>
          assetFilesForFormat(format).map((fileName) => ({
            fileName: `${slug}-${fileName}`,
            filePath: `downloads/${slug}/${fileName}`,
            sizeBytes: 1024 * 1024 * (5 + Math.floor(Math.random() * 40)),
          }))
        ),
      },
    },
  });

  return NextResponse.json({ product });
}
