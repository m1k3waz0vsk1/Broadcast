import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h2 className="text-lg font-semibold">New product</h2>
      <div className="mt-6">
        <ProductForm
          mode="create"
          categoryNames={categories.map((c) => c.name)}
          initial={{
            title: "",
            slug: "",
            tagline: "",
            description: "",
            categoryName: "",
            priceDollars: 29,
            formats: [],
            featured: false,
            coverImage: "",
          }}
        />
      </div>
    </div>
  );
}
