import Link from "next/link";
import type { HomeReviewItem } from "@/lib/catalog/reviews-home";
import { StarRating } from "@/components/catalog/StarRating";

type ReviewsStripProps = {
  reviews: HomeReviewItem[];
};

export function ReviewsStrip({ reviews }: ReviewsStripProps) {
  if (reviews.length === 0) return null;

  return (
    <section className="border-t border-neutral-border bg-neutral-surface py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="mb-2 font-display text-xl font-semibold text-neutral-text sm:text-2xl">
          Let customers speak for us
        </h2>
        <p className="mb-6 text-sm text-neutral-muted">Verified purchase reviews from the WrapItUp community.</p>
        <ul className="-mx-2 flex gap-4 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory [scrollbar-width:thin]">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="w-[18rem] shrink-0 snap-start rounded-2xl border border-neutral-border bg-neutral-bg p-4"
            >
              <StarRating rating={review.rating} size="sm" />
              <p className="mt-2 line-clamp-4 text-sm text-zinc-700">
                {review.body?.trim() || "Great product!"}
              </p>
              <p className="mt-3 text-xs font-medium text-zinc-900">{review.authorName}</p>
              <Link
                href={`/products/${review.productSlug}`}
                className="mt-1 block text-xs text-brand-600 hover:underline"
              >
                {review.productName}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
