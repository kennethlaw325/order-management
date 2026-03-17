"use client";

import { trpc } from "@/lib/trpc";
import { useCartStore } from "@/store/cart";

interface ProductGridProps {
  search: string;
  categoryId: string | null;
}

export function ProductGrid({ search, categoryId }: ProductGridProps) {
  const { data: products, isLoading } = trpc.product.list.useQuery({
    search: search || undefined,
    categoryId: categoryId || undefined,
    activeOnly: true,
  });

  const addItem = useCartStore((s) => s.addItem);

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 xl:grid-cols-4 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="h-28 bg-white rounded-xl animate-pulse border border-gray-200"
          />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <svg className="h-16 w-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
        <p className="text-lg font-medium">No products found</p>
        <p className="text-sm">Try a different search or category</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 xl:grid-cols-4 gap-3">
      {products.map((product) => (
        <button
          key={product.id}
          onClick={() =>
            addItem({ id: product.id, name: product.name, price: product.price })
          }
          className="flex flex-col items-start justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all active:scale-95 text-left min-h-[100px]"
        >
          <span className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
            {product.name}
          </span>
          <span className="text-blue-600 font-bold text-lg mt-2">
            ${product.price.toFixed(2)}
          </span>
        </button>
      ))}
    </div>
  );
}
