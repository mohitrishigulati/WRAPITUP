import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/catalog/Breadcrumbs";
import { ProductGallery } from "@/components/catalog/ProductGallery";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { ProductPurchasePanel } from "@/components/catalog/ProductPurchasePanel";
import { StarRating } from "@/components/catalog/StarRating";
import { formatUsd } from "@/lib/catalog/money";
import { WishlistButton } from "@/components/account/WishlistButton";
import { isProductInWishlist } from "@/lib/account/queries";
import { auth } from "@/lib/auth";
import { ProductReviews } from "@/components/reviews/ProductReviews";
import {
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/catalog/products";
import { listProductReviews, userCanReviewProduct } from "@/lib/reviews/queries";
import { getSiteUrl } from "@/lib/seo/site-url";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: { slug: string };
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) {
    return { title: "Product not found" };
  }

  const description =
    product.description?.slice(0, 155) ??
    `${product.name} — from ${formatUsd(product.minPrice)} at WrapItUp.`;

  return {
    title: product.name,
    description,
    alternates: { canonical: `${getSiteUrl()}/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      url: `${getSiteUrl()}/products/${product.slug}`,
      type: "website",
      images: product.images[0] ? [{ url: product.images[0] }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const session = await auth();
  const wishlistSaved =
    session?.user?.id != null
      ? await isProductInWishlist(session.user.id, product.id)
      : false;

  const related = await getRelatedProducts(product.id, product.category.id);

  const [reviews, eligibility] = await Promise.all([
    listProductReviews(product.id),
    session?.user?.id
      ? userCanReviewProduct(session.user.id, product.id)
      : Promise.resolve({ ok: false as const, reason: "no_eligible_order" as const }),
  ]);

  const canReview = eligibility.ok === true;

  const breadcrumbItems = [
    { label: "Products", href: "/products" },
    ...(product.category.parentSlug && product.category.parentName
      ? [{ label: product.category.parentName, href: `/categories/${product.category.parentSlug}` }]
      : []),
    {
      label: product.category.name,
      href: `/categories/${product.category.slug}`,
    },
    { label: product.name },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={breadcrumbItems} />

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} productName={product.name} />
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-zinc-500">
              {product.category.name}
            </p>
            <h1 className="text-3xl font-semibold text-zinc-900">{product.name}</h1>
            <StarRating rating={product.averageRating} reviewCount={product.reviewCount} />
            {product.tags.length > 0 ? (
              <ul className="flex flex-wrap gap-2 pt-2">
                {product.tags.map((tag) => (
                  <li key={tag.slug}>
                    <Link
                      href={`/products?tags=${tag.slug}`}
                      className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-700 hover:bg-zinc-200"
                    >
                      {tag.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {session?.user ? (
              <WishlistButton productId={product.id} initialSaved={wishlistSaved} />
            ) : (
              <Link
                href={`/login?callbackUrl=${encodeURIComponent(`/products/${product.slug}`)}`}
                className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
              >
                Sign in to save to wishlist
              </Link>
            )}
          </div>

          <ProductPurchasePanel
            productName={product.name}
            variants={product.variants}
            inStock={product.inStock}
            isPersonalizable={product.isPersonalizable}
            personalizationFields={product.personalizationFields}
            minOrderQty={product.minOrderQty}
            isBulkOnly={product.isBulkOnly}
          />
        </div>
      </div>

      {product.description ? (
        <section className="mt-12 max-w-3xl">
          <h2 className="text-lg font-semibold text-zinc-900">Description</h2>
          <p className="mt-3 whitespace-pre-line text-zinc-700">{product.description}</p>
        </section>
      ) : null}

      <ProductReviews
        productId={product.id}
        productSlug={product.slug}
        reviews={reviews}
        averageRating={product.averageRating}
        reviewCount={product.reviewCount}
        canReview={canReview}
        isLoggedIn={Boolean(session?.user)}
      />

      {related.length > 0 ? (
        <section className="mt-16 space-y-6">
          <h2 className="text-xl font-semibold text-zinc-900">Related products</h2>
          <ProductGrid products={related} />
        </section>
      ) : null}
    </div>
  );
}
