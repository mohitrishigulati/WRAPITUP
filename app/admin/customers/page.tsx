import { listAdminCustomers } from "@/lib/admin/queries";

export const metadata = { title: "Customers | Admin" };

export default async function AdminCustomersPage() {
  const customers = await listAdminCustomers();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-zinc-900">Customers</h1>
      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Orders</th>
              <th className="px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b border-zinc-100 last:border-0">
                <td className="px-4 py-3">{customer.name ?? "—"}</td>
                <td className="px-4 py-3">{customer.email}</td>
                <td className="px-4 py-3">{customer._count.orders}</td>
                <td className="px-4 py-3">{customer.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
