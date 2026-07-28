"use client";

import { useFormState, useFormStatus } from "react-dom";
import Image from "next/image";
import { useState } from "react";
import { submitReviewAction } from "@/actions/reviews";
import { StarRating } from "@/components/catalog/StarRating";
import type { ActionResult } from "@/types/actions";

export type ProductReviewItem = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  photoUrl: string | null;
  createdAt: string;
  authorName: string;
};

type ProductReviewsProps = {
  productId: string;
  productSlug: string;
  reviews: ProductReviewItem[];
  averageRating: number | null;
  reviewCount: number;
  canReview: boolean;
  isLoggedIn: boolean;
};

const initialState: ActionResult = { ok: false };

function SubmitReviewButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
    >
      {pending ? "Submitting…" : "Submit review"}
    </button>
  );
}

function ReviewForm({ productId }: { productId: string }) {
  const [state, formAction] = useFormState(submitReviewAction, initialState);
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function onPhotoSelected(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/reviews/upload", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Upload failed");
      setPhotoUrl(data.url as string);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4">
      <h3 className="font-semibold text-zinc-900">Write a review</h3>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="photoUrl" value={photoUrl} />
      <label className="block text-sm font-medium">
        Rating
        <select name="rating" required className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm">
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>
              {value} stars
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium">
        Title (optional)
        <input name="title" maxLength={120} className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
      </label>
      <label className="block text-sm font-medium">
        Review
        <textarea name="body" rows={4} maxLength={2000} required className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
      </label>
      <div>
        <label className="inline-flex cursor-pointer items-center rounded-lg border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50">
          {uploading ? "Uploading photo…" : "Add photo (optional)"}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => void onPhotoSelected(e.target.files)} />
        </label>
        {uploadError ? <p className="mt-1 text-sm text-red-600">{uploadError}</p> : null}
        {photoUrl ? (
          <p className="mt-2 text-xs text-emerald-700">Photo attached</p>
        ) : null}
      </div>
      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-emerald-700" : "text-red-600"}`}>{state.message}</p>
      ) : null}
      <SubmitReviewButton />
    </form>
  );
}

function ReviewList({ reviews }: { reviews: ProductReviewItem[] }) {
  if (!reviews.length) {
    return <p className="text-sm text-zinc-600">No reviews yet.</p>;
  }

  return (
    <ul className="space-y-4">
      {reviews.map((review) => (
        <li key={review.id} className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="flex items-center justify-between gap-4">
            <StarRating rating={review.rating} />
            <span className="text-xs text-zinc-500">
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="mt-2 text-sm font-medium text-zinc-900">{review.authorName}</p>
          {review.title ? <p className="mt-1 font-medium text-zinc-900">{review.title}</p> : null}
          {review.body ? <p className="mt-1 text-sm text-zinc-700">{review.body}</p> : null}
          {review.photoUrl ? (
            <div className="relative mt-3 h-40 w-40 overflow-hidden rounded-lg bg-zinc-100">
              <Image src={review.photoUrl} alt="" fill className="object-cover" sizes="160px" />
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function ProductReviews({
  productId,
  reviews,
  averageRating,
  reviewCount,
  canReview,
  isLoggedIn,
}: ProductReviewsProps) {
  return (
    <section className="mt-16 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Customer reviews</h2>
          <div className="mt-1">
            <StarRating rating={averageRating} reviewCount={reviewCount} />
          </div>
        </div>
      </div>

      {canReview ? (
        <ReviewForm productId={productId} />
      ) : isLoggedIn ? (
        <p className="text-sm text-zinc-600">
          Reviews are available after your order is delivered and includes this product.
        </p>
      ) : (
        <p className="text-sm text-zinc-600">Sign in to leave a verified review after delivery.</p>
      )}

      <ReviewList reviews={reviews} />
    </section>
  );
}
