import { db } from "@/lib/db";

export async function getCategoryBySlug(slug: string) {
  return db.category.findUnique({
    where: { slug },
    include: {
      parent: { select: { id: true, name: true, slug: true } },
      children: { orderBy: { name: "asc" } },
    },
  });
}

export async function getAllCategoriesForNav() {
  return db.category.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
    include: {
      children: { orderBy: { name: "asc" } },
    },
  });
}

export async function getCategoryDescendantIds(categoryId: string): Promise<string[]> {
  const categories = await db.category.findMany({
    select: { id: true, parentId: true },
  });

  const byParent = new Map<string | null, string[]>();
  for (const cat of categories) {
    const list = byParent.get(cat.parentId) ?? [];
    list.push(cat.id);
    byParent.set(cat.parentId, list);
  }

  const ids: string[] = [];
  const queue = [categoryId];
  while (queue.length) {
    const current = queue.shift()!;
    ids.push(current);
    const children = byParent.get(current) ?? [];
    queue.push(...children);
  }
  return ids;
}

export async function getFilterCategories() {
  return db.category.findMany({
    orderBy: [{ parentId: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true, parentId: true },
  });
}
