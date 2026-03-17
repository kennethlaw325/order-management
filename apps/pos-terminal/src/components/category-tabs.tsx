"use client";

import { trpc } from "@/lib/trpc";

interface CategoryTabsProps {
  selected: string | null;
  onSelect: (id: string | null) => void;
}

export function CategoryTabs({ selected, onSelect }: CategoryTabsProps) {
  const { data: categories, isLoading } = trpc.category.list.useQuery();

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
      <button
        onClick={() => onSelect(null)}
        className={`flex-shrink-0 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
          selected === null
            ? "bg-blue-600 text-white shadow-md"
            : "bg-white text-gray-700 hover:bg-gray-200 border border-gray-300"
        }`}
      >
        All
      </button>
      {isLoading &&
        Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-24 h-10 bg-gray-200 rounded-lg animate-pulse"
          />
        ))}
      {categories?.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`flex-shrink-0 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            selected === cat.id
              ? "bg-blue-600 text-white shadow-md"
              : "bg-white text-gray-700 hover:bg-gray-200 border border-gray-300"
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
