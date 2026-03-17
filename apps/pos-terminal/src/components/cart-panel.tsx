"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cart";

interface CartPanelProps {
  onCheckout: (paymentMethod: string) => void;
}

export function CartPanel({ onCheckout }: CartPanelProps) {
  const items = useCartStore((s) => s.items);
  const discount = useCartStore((s) => s.discount);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const setOrderDiscount = useCartStore((s) => s.setOrderDiscount);
  const clear = useCartStore((s) => s.clear);
  const getSubtotal = useCartStore((s) => s.getSubtotal);

  const [showDiscount, setShowDiscount] = useState(false);
  const [discountInput, setDiscountInput] = useState("");
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

  const paymentMethods = [
    { id: "CASH", label: "Cash" },
    { id: "CARD", label: "Card" },
    { id: "FPS", label: "FPS" },
    { id: "OTHER", label: "Other" },
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h2 className="font-bold text-lg text-gray-900">Cart</h2>
        <span className="text-sm text-gray-500">
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg className="h-12 w-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            <p className="text-sm font-medium">Cart is empty</p>
            <p className="text-xs">Tap products to add them</p>
          </div>
        ) : (
          items.map((item) => {
            const lineTotal = item.price * item.quantity - item.discount;
            return (
              <div
                key={item.productId}
                className="flex items-center gap-2 p-2 rounded-lg bg-gray-50"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    ${item.price.toFixed(2)} each
                    {item.discount > 0 && (
                      <span className="text-red-500 ml-1">
                        -${item.discount.toFixed(2)}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-semibold text-sm">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
                <span className="w-16 text-right font-semibold text-sm text-gray-900">
                  ${lineTotal.toFixed(2)}
                </span>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="w-8 h-8 flex items-center justify-center rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Totals & Actions */}
      <div className="border-t border-gray-200 px-4 py-3 space-y-2">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>

        {/* Discount */}
        {discount > 0 && (
          <div className="flex justify-between text-sm text-red-600">
            <span>Discount</span>
            <span>-${discount.toFixed(2)}</span>
          </div>
        )}

        {/* Tax */}
        {taxRate > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax ({taxRate}%)</span>
            <span className="font-medium">${tax.toFixed(2)}</span>
          </div>
        )}

        {/* Total */}
        <div className="flex justify-between text-lg font-bold pt-1 border-t border-gray-100">
          <span>Total</span>
          <span className="text-blue-600">${total.toFixed(2)}</span>
        </div>

        {/* Discount input */}
        {showDiscount && (
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              step="0.01"
              value={discountInput}
              onChange={(e) => setDiscountInput(e.target.value)}
              placeholder="Discount amount"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={() => {
                const val = parseFloat(discountInput);
                if (!isNaN(val) && val >= 0) {
                  setOrderDiscount(val);
                }
                setShowDiscount(false);
                setDiscountInput("");
              }}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowDiscount(!showDiscount)}
            className="flex-1 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Discount
          </button>
          <button
            onClick={clear}
            disabled={items.length === 0}
            className="flex-1 py-2 text-sm font-medium rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Clear
          </button>
        </div>

        {/* Payment method buttons */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          {paymentMethods.map((pm) => (
            <button
              key={pm.id}
              onClick={() => onCheckout(pm.id)}
              disabled={items.length === 0}
              className="py-3 text-sm font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {pm.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
