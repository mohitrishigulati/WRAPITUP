type StarRatingProps = {
  rating: number | null;
  reviewCount?: number;
  size?: "sm" | "md";
};

export function StarRating({ rating, reviewCount, size = "md" }: StarRatingProps) {
  const textClass = size === "sm" ? "text-xs" : "text-sm";

  if (rating === null) {
    return <span className={`${textClass} text-zinc-500`}>No reviews yet</span>;
  }

  const rounded = Math.round(rating * 10) / 10;
  return (
    <div className={`flex items-center gap-1 text-zinc-700 ${textClass}`}>
      <span aria-hidden className="text-amber-500">
        ★
      </span>
      <span className="font-medium">{rounded.toFixed(1)}</span>
      {reviewCount !== undefined ? (
        <span className="text-zinc-500">({reviewCount})</span>
      ) : null}
    </div>
  );
}
