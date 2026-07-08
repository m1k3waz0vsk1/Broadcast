import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

// Matches by display name first (existing seeded categories use short,
// hand-picked slugs like "webinar" rather than a slugified version of their
// name), only creating a new category when no name match exists.
export async function findOrCreateCategory(name: string) {
  const trimmed = name.trim();
  const existing = await prisma.category.findFirst({
    where: { name: { equals: trimmed, mode: "insensitive" } },
  });
  if (existing) return existing;

  const baseSlug = slugify(trimmed);
  const slugTaken = await prisma.category.findUnique({ where: { slug: baseSlug } });
  const slug = slugTaken ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;

  return prisma.category.create({ data: { slug, name: trimmed } });
}
