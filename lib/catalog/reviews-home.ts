import { db } from "@/lib/db";

export type HomeReviewItem = {
  id: string;
  rating: number;
  body: string | null;
  createdAt: Date;
  authorName: string;
  productName: string;
  productSlug: string;
};

export async function getLatestReviews(limit = 12): Promise<HomeReviewItem[]> {
  const rows = await db.review.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      product: { select: { name: true, slug: true } },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    rating: r.rating,
    body: r.body,
    createdAt: r.createdAt,
    authorName: r.user.name?.trim() || r.user.email.split("@")[0] || "Customer",
    productName: r.product.name,
    productSlug: r.product.slug,
  }));
}
