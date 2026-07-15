"use client";

import { useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

interface FilterItem {
  label: string;
  name: string;
  icon?: React.ReactNode;
}

interface FilterProps {
  field: string;
  filters: Array<FilterItem>;
  defaultFilter: string;
  resetFields?: Array<string>;
  limit?: number;
}

function Filter({
  field,
  filters,
  defaultFilter,
  resetFields,
  limit = 5,
}: Readonly<FilterProps>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isExpanded, setIsExpanded] = useState(false);

  function handleFilter(filterField: string) {
    const params = new URLSearchParams(searchParams);
    params.set(field, filterField);
    resetFields?.forEach((resetField) => params.delete(resetField));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const currentFilter = searchParams.get(field) || defaultFilter;

  const hasMoreThanLimit = filters.length > limit;

  const visibleFilters =
    hasMoreThanLimit && !isExpanded ? filters.slice(0, limit) : filters;

  return (
    <>
      <div
        className={`w-full flex ${field === "p_category" ? "flex-col gap-1" : "flex-wrap gap-2"}`}
      >
        {visibleFilters.map((filter) => {
          const isActive = filter.name === currentFilter;

          if (field === "p_category") {
            return (
              <button
                key={filter.name}
                onClick={() => handleFilter(filter.name)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 text-right ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 font-bold border-r-4 border-emerald-500"
                    : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                }`}
              >
                {filter.icon && (
                  <span className="text-lg shrink-0">{filter.icon}</span>
                )}
                <span className="truncate">{filter.label}</span>
              </button>
            );
          }

          if (field === "p_sort") {
            return (
              <button
                key={filter.name}
                onClick={() => handleFilter(filter.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 shrink-0 ${
                  isActive
                    ? "bg-white text-emerald-600 shadow-sm"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                {filter.label}
              </button>
            );
          }

          return (
            <button
              key={filter.name}
              onClick={() => handleFilter(filter.name)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 active:scale-95 shrink-0 ${
                isActive
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-white text-stone-600 border-stone-200 hover:border-stone-300 hover:bg-stone-50"
              }`}
            >
              {filter.icon && (
                <span className="*:size-3.5 shrink-0">{filter.icon}</span>
              )}
              <span>{filter.label}</span>
            </button>
          );
        })}
      </div>

      {hasMoreThanLimit && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`mt-2 flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors duration-200 ${
            field === "p_category" ? "px-4 py-1" : "px-1"
          }`}
        >
          <span>
            {isExpanded ? "مشاهده کمتر" : `مشاهده همه (${filters.length})`}
          </span>
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      )}
    </>
  );
}

export default Filter;
