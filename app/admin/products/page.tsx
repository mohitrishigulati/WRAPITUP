import Link from "next/link";
import { listAdminProducts } from "@/lib/admin/queries";
import { decimalToNumber } from "@/lib/catalog/money";
import { deleteProductByIdAction } from "@/actions/admin/products";

export const metadata = { title: "Admin products | WrapItUp" };

export default async function AdminProductsPage() {
  const products = await listAdminProducts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold text-zinc-900">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          New product
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const stock = product.variants.reduce((sum, v) => sum + v.stock, 0);
              return (
                <tr key={product.id} className="border-b border-zinc-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-zinc-900">{product.name}</td>
                  <td className="px-4 py-3 text-zinc-600">{product.category.name}</td>
                  <td className="px-4 py-3">{decimalToNumber(product.basePrice).toFixed(2)}</td>
                  <td className="px-4 py-3">{stock}</td>
                  <td className="px-4 py-3">{product.isPublished ? "Published" : "Draft"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/products/${product.id}/edit`} className="text-zinc-700 hover:underline">
                      Edit
                    </Link>
                    <form action={deleteProductByIdAction.bind(null, product.id)} className="inline ml-3">
                      <button type="submit" className="text-red-600 hover:underline">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
