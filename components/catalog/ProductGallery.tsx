"use client";

import { useState } from "react";
import { ProductImage } from "@/components/catalog/ProductImage";
import { PRODUCT_DETAIL_IMAGE_SIZES } from "@/lib/catalog/images";

type ProductGalleryProps = {
  images: string[];
  productName: string;
};

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const gallery = images.length > 0 ? images : [null];
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-zinc-100">
        <ProductImage
          src={gallery[activeIndex]}
          alt={productName}
          priority
          sizes={PRODUCT_DETAIL_IMAGE_SIZES}
        />
      </div>
      {gallery.length > 1 ? (
        <ul className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {gallery.map((image, index) => (
            <li key={`${image ?? "placeholder"}-${index}`}>
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`relative aspect-square overflow-hidden rounded-lg border ${
                  index === activeIndex ? "border-zinc-900" : "border-zinc-200"
                }`}
              >
                <ProductImage src={image} alt="" sizes="80px" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
