"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import { useCartStore } from "@/store/cart";

interface CheckoutDialogProps {
  open: boolean;
  paymentMethod: string;
  onClose: () => void;
  onSuccess: (order: any) => void;
}

export function CheckoutDialog({
  open,
  paymentMethod,
  onClose,
  onSuccess,
}: CheckoutDialogProps) {
  const { data: session } = useSession();
  const items = useCartStore((s) => s.items);
  const discount = useCartStore((s) => s.discount);
  const getSubtotal = useCartStore((s) => s.getSubtotal);

  const [taxRate, setTaxRate] = useState(0);

  useEffect(() => {
    try {
      const settings = localStorage.getItem("pos-settings");
      if (settings) {
        const parsed = JSON.parse(settings);
        if (parsed.taxRate != null) setTaxRate(parsed.taxRate);
      }
    } catch {}
  }, []);

  const subtotal = getSubtotal();
  const tax = subtotal * taxRate / 100;
  const total = subtotal - discount + tax;

  const storeId = (session?.user as any)?.storeId;

  const createOrder = trpc.order.create.useMutation({
    onSuccess: (order) => {
      onSuccess(order);
    },
  });

  const handleConfirm = () => {
    if (!storeId) return;
    createOrder.mutate({
      storeId,
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.price,
        discount: i.discount,
      })),
      discount,
      tax,
      paymentMethod,
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-blue-600 text-white">
          <h2 className="text-xl font-bold">Confirm Order</h2>
          <p className="text-blue-100 text-sm">Payment: {paymentMethod}</p>
        </div>

        {/* Items */}
        <div className="px-6 py-4 max-h-64 overflow-y-auto space-y-2">
          {items.map((item) => (
            <div key={item.productId} className="flex justify-between text-sm">
              <span className="text-gray-700">
                {item.name} x{item.quantity}
              </span>
              <span className="font-medium">
                ${(item.price * item.quantity - item.discount).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="px-6 py-3 border-t border-gray-200 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm text-red-600">
              <span>Discount</span>
              <span>-${discount.toFixed(2)}</span>
            </div>
          )}
          {taxRate > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax ({taxRate}%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold pt-1 border-t border-gray-100">
            <span>Total</span>
            <span className="text-blue-600">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Error */}
        {createOrder.error && (
          <div className="px-6 py-2 text-sm text-red-600 bg-red-50">
            Error: {createOrder.error.message}
          </div>
        )}

        {/* Actions */}
        <div className="px-6 py-4 flex gap-3 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={createOrder.isPending}
            className="flex-1 py-3 rounded-lg border border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={createOrder.isPending || !storeId}
            className="flex-1 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 active:bg-green-800 transition-colors disabled:opacity-40"
          >
            {createOrder.isPending ? "Processing..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
