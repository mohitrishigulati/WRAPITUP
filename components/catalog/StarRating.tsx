type StarRatingProps = {
  rating: number | null;
  reviewCount?: number;
  size?: "sm" | "md";
  /** Giftoo-style: `4.8 / 5.0` and `(12) 12 total reviews` */
  variant?: "default" | "giftoo";
  className?: string;
};

export function StarRating({
  rating,
  reviewCount,
  size = "md",
  variant = "default",
  className = "",
}: StarRatingProps) {
  const textClass = size === "sm" ? "text-xs" : "text-sm";

  if (rating === null || rating === 0) {
    if (variant === "giftoo") return null;
    return (
      <span className={`${textClass} text-neutral-muted ${className}`}>No reviews yet</span>
    );
  }

  const rounded = Math.round(rating * 100) / 100;

  if (variant === "giftoo") {
    if (!reviewCount) return null;
    return (
      <div
        className={`flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-neutral-muted ${textClass} ${className}`}
      >
        <span className="text-accent-yellow" aria-hidden>
          ★
        </span>
        <span className="font-medium text-neutral-text">
          {rounded.toFixed(2)} / 5.0
        </span>
        <span>
          ({reviewCount}) {reviewCount} total review{reviewCount === 1 ? "" : "s"}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 text-neutral-muted ${textClass} ${className}`}>
      <span aria-hidden className="text-accent-yellow">
        ★
      </span>
      <span className="font-medium text-neutral-text">{rounded.toFixed(1)}</span>
      {reviewCount !== undefined ? <span>({reviewCount})</span> : null}
    </div>
  );
}
