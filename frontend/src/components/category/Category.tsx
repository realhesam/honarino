"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { categories } from "@/data/categories";

function Category() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const active = searchParams.get("p_category") || categories[0].name;

  function handleSelect(name: string) {
    const params = new URLSearchParams(searchParams);
    params.set("p_category", name);
    params.delete("p_filter");
    router.replace(`${pathname}?${params.toString()}#products`, {
      scroll: true,
    });
  }

  return (
    <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-1">
      {categories.map((category) => {
        const isActive = category.name === active;
        return (
          <button
            key={category.id}
            onClick={() => handleSelect(category.name)}
            className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-3 transition-all duration-300 ${
              isActive
                ? "border-primary bg-primary text-white shadow-lg shadow-primary/25"
                : "border-stone-200 bg-white text-stone-500 hover:border-stone-300"
            }`}
          >
            <span className="*:size-6">{category.icon}</span>
            <span className="text-sm font-medium">{category.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default Category;
