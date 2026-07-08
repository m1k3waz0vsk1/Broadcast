import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { category: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  const formats: string[] = JSON.parse(product.formats);

  return (
    <div>
      <h2 className="text-lg font-semibold">Edit product</h2>
      <div className="mt-6">
        <ProductForm
          mode="edit"
          categoryNames={categories.map((c) => c.name)}
          initial={{
            id: product.id,
            title: product.title,
            slug: product.slug,
            tagline: product.tagline,
            description: product.description,
            categoryName: product.category.name,
            priceDollars: product.priceCents / 100,
            formats,
            featured: product.featured,
            coverImage: product.coverImage,
          }}
        />
      </div>
    </div>
  );
}
