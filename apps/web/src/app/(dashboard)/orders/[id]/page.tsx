"use client";

import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const order = trpc.order.getById.useQuery(orderId, {
    enabled: !!orderId,
  });

  if (order.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading order...</p>
      </div>
    );
  }

  if (order.error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Order not found</p>
      </div>
    );
  }

  const data = order.data;
  if (!data) return null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => router.push("/orders")}
            className="text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            &larr; Back to Orders
          </button>
          <h2 className="text-2xl font-bold text-gray-900">{data.orderNumber}</h2>
        </div>
        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
          data.status === "completed"
            ? "bg-green-100 text-green-800"
            : data.status === "refunded"
            ? "bg-yellow-100 text-yellow-800"
            : "bg-red-100 text-red-800"
        }`}>
          {data.status}
        </span>
      </div>

      {/* Order Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Date</p>
            <p className="font-medium">{new Date(data.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-500">Cashier</p>
            <p className="font-medium">{data.cashier.name}</p>
          </div>
          <div>
            <p className="text-gray-500">Store</p>
            <p className="font-medium">{data.store.name}</p>
          </div>
          <div>
            <p className="text-gray-500">Payment Method</p>
            <p className="font-medium capitalize">{data.paymentMethod}</p>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Items</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Discount</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    ${item.unitPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {item.discount > 0 ? `-$${item.discount.toFixed(2)}` : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                    ${item.subtotal.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Totals */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="max-w-xs ml-auto space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span>${data.subtotal.toFixed(2)}</span>
          </div>
          {data.discount > 0 && (
            <div className="flex justify-between text-red-600">
              <span>Discount</span>
              <span>-${data.discount.toFixed(2)}</span>
            </div>
          )}
          {data.tax > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">Tax</span>
              <span>${data.tax.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between border-t pt-2 font-bold text-base">
            <span>Total</span>
            <span>${data.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
