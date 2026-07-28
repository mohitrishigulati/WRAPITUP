import Image from "next/image";
import { productImageUrl, PRODUCT_IMAGE_SIZES } from "@/lib/catalog/images";

type ProductImageProps = {
  src: string | null | undefined;
  alt: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
};

export function ProductImage({
  src,
  alt,
  priority,
  className = "object-cover",
  sizes = PRODUCT_IMAGE_SIZES,
}: ProductImageProps) {
  const url = productImageUrl(src);
  return (
    <Image
      src={url}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}
