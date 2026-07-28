type StarRatingProps = {
  rating: number | null;
  reviewCount?: number;
};

export function StarRating({ rating, reviewCount }: StarRatingProps) {
  if (rating === null) {
    return <span className="text-sm text-zinc-500">No reviews yet</span>;
  }

  const rounded = Math.round(rating * 10) / 10;
  return (
    <div className="flex items-center gap-1 text-sm text-zinc-700">
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
