"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { SearchBar } from "@/components/search-bar";
import { CategoryTabs } from "@/components/category-tabs";
import { ProductGrid } from "@/components/product-grid";
import { CartPanel } from "@/components/cart-panel";
import { CheckoutDialog } from "@/components/checkout-dialog";
import { ReceiptDialog } from "@/components/receipt-dialog";
import { useCartStore } from "@/store/cart";

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function useClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  return time;
}

export default function PosPage() {
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [checkoutPayment, setCheckoutPayment] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const time = useClock();

  const userName = session?.user?.name || session?.user?.email || "Cashier";
  const storeName = "POS Terminal";

  const handleCheckout = useCallback((paymentMethod: string) => {
    setCheckoutPayment(paymentMethod);
  }, []);

  const handleCheckoutSuccess = useCallback((order: any) => {
    setCheckoutPayment(null);
    setCompletedOrder(order);
  }, []);

  const handleReceiptClose = useCallback(() => {
    setCompletedOrder(null);
    useCartStore.getState().clear();
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">{storeName}</h1>
          <div className="h-6 w-px bg-gray-300" />
          <span className="text-sm text-gray-600">{userName}</span>
        </div>
        <time className="text-sm font-mono text-gray-500 tabular-nums">
          {time.toLocaleTimeString()}
        </time>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Products */}
        <div className="flex-[3] flex flex-col p-4 gap-3 overflow-hidden">
          <SearchBar value={search} onChange={setSearch} />
          <CategoryTabs selected={categoryId} onSelect={setCategoryId} />
          <div className="flex-1 overflow-y-auto">
            <ProductGrid search={debouncedSearch} categoryId={categoryId} />
          </div>
        </div>

        {/* Right: Cart */}
        <div className="flex-[2] p-4 pl-0">
          <CartPanel onCheckout={handleCheckout} />
        </div>
      </div>

      {/* Dialogs */}
      <CheckoutDialog
        open={checkoutPayment !== null}
        paymentMethod={checkoutPayment || ""}
        onClose={() => setCheckoutPayment(null)}
        onSuccess={handleCheckoutSuccess}
      />

      {completedOrder && (
        <ReceiptDialog order={completedOrder} onClose={handleReceiptClose} />
      )}
    </div>
  );
}
