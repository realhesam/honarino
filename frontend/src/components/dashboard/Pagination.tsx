"use client";

import { HiChevronRight, HiChevronLeft } from "react-icons/hi2";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  itemLabel: string;
}

function buildPageList(current: number, total: number): (number | "gap")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, total, current]);
  if (current - 1 > 1) pages.add(current - 1);
  if (current + 1 < total) pages.add(current + 1);

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const result: (number | "gap")[] = [];

  sorted.forEach((page, idx) => {
    if (idx > 0 && page - sorted[idx - 1] > 1) {
      result.push("gap");
    }
    result.push(page);
  });

  return result;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  itemLabel,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pageList = buildPageList(currentPage, totalPages);
  const from = (currentPage - 1) * itemsPerPage + 1;
  const to = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="px-4 sm:px-6 py-4 border-t border-stone-100 bg-stone-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
      <span className="text-[11px] text-stone-400 font-bold order-2 sm:order-1">
        نمایش <span className="text-stone-600">{from}</span> تا{" "}
        <span className="text-stone-600">{to}</span> از{" "}
        <span className="text-stone-600">{totalItems}</span> {itemLabel}
      </span>

      <div className="flex items-center gap-1 order-1 sm:order-2">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="صفحه قبل"
          className="p-1.5 rounded-xl border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 hover:border-stone-300 disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          <HiChevronRight className="size-4" />
        </button>

        <div className="hidden sm:flex items-center gap-1">
          {pageList.map((page, idx) =>
            page === "gap" ? (
              <span
                key={`gap-${idx}`}
                className="w-7 text-center text-stone-300 text-xs font-bold select-none"
              >
                …
              </span>
            ) : (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                aria-current={page === currentPage ? "page" : undefined}
                className={`min-w-7 h-7 px-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  page === currentPage
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                {page}
              </button>
            ),
          )}
        </div>

        <span className="sm:hidden px-2 text-[11px] font-bold text-stone-500 tabular-nums">
          {currentPage} / {totalPages}
        </span>

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="صفحه بعد"
          className="p-1.5 rounded-xl border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 hover:border-stone-300 disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          <HiChevronLeft className="size-4" />
        </button>
      </div>
    </div>
  );
}
