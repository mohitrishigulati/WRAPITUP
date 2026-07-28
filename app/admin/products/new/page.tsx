import { createProductAction } from "@/actions/admin/products";
import { listCategoriesForAdmin } from "@/lib/admin/queries";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "New product | Admin" };

export default async function NewProductPage() {
  const categories = await listCategoriesForAdmin();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-zinc-900">New product</h1>
      <ProductForm
        categories={categories}
        action={createProductAction}
        submitLabel="Create product"
      />
    </div>
  );
}
