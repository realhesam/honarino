"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Filter from "../other/Filter";
import type { BuilderType } from "@/types/builder";
import { categories } from "@/data/categories";
import { cities } from "@/data/cities";
import BuilderList from "./BuilderList";

const categoryTabs = [
  { name: "all", label: "همه", icon: undefined },
  ...categories.map((c) => ({ name: c.name, label: c.label, icon: c.icon })),
];

const verifiedTabs = [
  { name: "all", label: "همه تولیدی‌ها" },
  { name: "verified", label: "تأیید شده" },
];

const sorts = [
  { name: "top", label: "برترین ها" },
  { name: "popular", label: "پربازدیدترین" },
  { name: "newest", label: "جدیدترین ها" },
];

function BuilderPanel({
  builders,
}: Readonly<{ builders: Array<BuilderType> }>) {
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("b_category") || "all";
  const activeVerified = searchParams.get("b_verified") || "all";
  const activeCity = searchParams.get("b_city") || "all";
  const activeSort = searchParams.get("b_sort") || "top";

  const filtered = useMemo(() => {
    let list = builders.filter(
      (b) =>
        (activeCategory === "all" || b.categories.includes(activeCategory)) &&
        (activeVerified === "all" || b.verified) &&
        (activeCity === "all" || b.city === activeCity)
    );

    if (activeSort === "popular") {
      list = [...list].sort((a, b) => b.viewsCount - a.viewsCount);
    } else {
      list = [...list].sort((a, b) => b.rate - a.rate);
    }

    return list;
  }, [builders, activeCategory, activeVerified, activeCity, activeSort]);

  return (
    <div className="relative items-start gap-2 lg:grid lg:grid-cols-[18rem_1fr]">
      <div className="mb-2.5 rounded-xl border-stone-200 bg-white drop-shadow-xl lg:sticky lg:top-30">
        <h3 className="border-b border-stone-100 py-4 text-center text-lg text-stone-500">
          دسته‌بندی تولیدی‌ها
        </h3>

        <ul className="grid grid-cols-2 gap-2 p-3 text-sm">
          <Filter
            field="b_category"
            filters={categoryTabs}
            defaultFilter="all"
          />
        </ul>

        <ul className="flex flex-wrap gap-1.5 border-t border-stone-100 p-3 text-xs">
          <Filter
            field="b_verified"
            filters={verifiedTabs}
            defaultFilter="all"
          />
        </ul>

        <div className="border-t border-stone-100 p-3">
          <p className="mb-2 px-1 text-xs text-stone-400">شهر تولیدی</p>
          <ul className="flex flex-wrap gap-1.5 text-xs">
            <Filter field="b_city" filters={cities} defaultFilter="all" />
          </ul>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-white drop-shadow-xl">
        <div className="flex items-center justify-between gap-2 border-b border-stone-200 p-2">
          <span className="shrink-0 px-2 text-xs text-stone-400">
            {filtered.length} تولیدی
          </span>
          <ul className="flex shrink-0 items-center gap-2.5 overflow-x-scroll text-sm *:shrink-0 *:rounded-lg *:px-2 *:py-px">
            <Filter field="b_sort" filters={sorts} defaultFilter="top" />
          </ul>
        </div>
        <div className="p-3">
          <BuilderList builders={filtered} />
        </div>
      </div>
    </div>
  );
}

export default BuilderPanel;
