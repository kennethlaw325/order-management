"use client";

import { trpc } from "@/lib/trpc";
import { useSession } from "next-auth/react";

function StatCard({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const storeId = (session?.user as any)?.storeId;

  const stats = trpc.dashboard.todayStats.useQuery(
    { storeId: storeId! },
    { enabled: !!storeId }
  );
  const recentOrders = trpc.dashboard.recentOrders.useQuery(
    { storeId: storeId!, limit: 10 },
    { enabled: !!storeId }
  );
  const lowStock = trpc.dashboard.lowStockCount.useQuery(
    { storeId: storeId! },
    { enabled: !!storeId }
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Today's Revenue"
          value={`$${(stats.data?.revenue ?? 0).toFixed(2)}`}
        />
        <StatCard
          title="Orders Today"
          value={String(stats.data?.orderCount ?? 0)}
        />
        <StatCard
          title="Avg Order Value"
          value={`$${(stats.data?.avgOrderValue ?? 0).toFixed(2)}`}
        />
        <StatCard
          title="Low Stock Items"
          value={String(lowStock.data ?? 0)}
          subtitle={Number(lowStock.data) > 0 ? "Needs attention" : "All good"}
        />
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cashier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.data?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No orders yet
                  </td>
                </tr>
              )}
              {recentOrders.data?.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.cashier.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
