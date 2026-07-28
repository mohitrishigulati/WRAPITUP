import { notFound } from "next/navigation";
import { updateProductAction } from "@/actions/admin/products";
import { getAdminProduct, listCategoriesForAdmin } from "@/lib/admin/queries";
import { decimalToNumber } from "@/lib/catalog/money";
import { ProductForm } from "@/components/admin/ProductForm";

type EditProductPageProps = {
  params: { id: string };
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const [product, categories] = await Promise.all([
    getAdminProduct(params.id),
    listCategoriesForAdmin(),
  ]);
  if (!product) notFound();

  const primaryVariant = product.variants[0];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-zinc-900">Edit product</h1>
      <ProductForm
        categories={categories}
        action={updateProductAction}
        submitLabel="Save changes"
        initial={{
          productId: product.id,
          variantId: primaryVariant?.id,
          name: product.name,
          slug: product.slug,
          categoryId: product.categoryId,
          description: product.description ?? "",
          basePrice: decimalToNumber(product.basePrice),
          isPublished: product.isPublished,
          images: product.images,
          defaultSku: primaryVariant?.sku,
          defaultVariantName: primaryVariant?.name,
          stock: primaryVariant?.stock ?? 0,
        }}
      />
    </div>
  );
}
