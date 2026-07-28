type StarRatingProps = {
  rating: number | null;
  reviewCount?: number;
  size?: "sm" | "md";
};

export function StarRating({ rating, reviewCount, size = "md" }: StarRatingProps) {
  const textClass = size === "sm" ? "text-xs" : "text-sm";

  if (rating === null) {
    return <span className={`${textClass} text-neutral-muted`}>No reviews yet</span>;
  }

  const rounded = Math.round(rating * 10) / 10;
  return (
    <div className={`flex items-center gap-1 text-neutral-muted ${textClass}`}>
      <span aria-hidden className="text-accent-yellow">
        ★
      </span>
      <span className="font-medium text-neutral-text">{rounded.toFixed(1)}</span>
      {reviewCount !== undefined ? (
        <span>({reviewCount})</span>
      ) : null}
    </div>
  );
}
