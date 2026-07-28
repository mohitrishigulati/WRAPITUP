import { getAdminAnalytics } from "@/lib/admin/queries";
import { formatUsd } from "@/lib/catalog/money";
import { RevenueChart, TopProductsChart } from "@/components/admin/AdminCharts";

export const metadata = { title: "Admin overview | WrapItUp" };

export default async function AdminOverviewPage() {
  const analytics = await getAdminAnalytics();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-zinc-900">Overview</h1>
        <p className="mt-1 text-zinc-600">Last 30 days of paid order activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-600">Orders</p>
          <p className="text-2xl font-semibold text-zinc-900">{analytics.orderCount}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-600">Revenue</p>
          <p className="text-2xl font-semibold text-zinc-900">
            {formatUsd(analytics.totalRevenue)}
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">Revenue over time</h2>
        <RevenueChart data={analytics.revenueSeries} />
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">Top products</h2>
        <TopProductsChart
          data={analytics.topProducts.map((p) => ({ name: p.name, quantity: p.quantity }))}
        />
      </section>
    </div>
  );
}
