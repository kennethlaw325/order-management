"use client";

interface ReceiptDialogProps {
  order: any;
  onClose: () => void;
}

export function ReceiptDialog({ order, onClose }: ReceiptDialogProps) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-green-600 text-white text-center">
          <svg className="h-10 w-10 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold">Order Complete</h2>
          <p className="text-green-100 text-sm font-mono">{order.orderNumber}</p>
        </div>

        {/* Items */}
        <div className="px-6 py-4 max-h-48 overflow-y-auto space-y-2">
          {order.items?.map((item: any) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-700">
                {item.product?.name || "Product"} x{item.quantity}
              </span>
              <span className="font-medium">${item.subtotal.toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="px-6 py-3 border-t border-gray-200 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span>${order.subtotal.toFixed(2)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-sm text-red-600">
              <span>Discount</span>
              <span>-${order.discount.toFixed(2)}</span>
            </div>
          )}
          {order.tax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold pt-1 border-t border-gray-100">
            <span>Total</span>
            <span className="text-green-600">${order.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm pt-1">
            <span className="text-gray-600">Payment</span>
            <span className="font-medium">{order.paymentMethod}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Time</span>
            <span className="font-medium">
              {new Date(order.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action */}
        <div className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-lg bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
          >
            New Order
          </button>
        </div>
      </div>
    </div>
  );
}
