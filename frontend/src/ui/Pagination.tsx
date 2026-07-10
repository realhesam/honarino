"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

type PaginationProps = {
  totalItems: number;
  pageSize?: number;
};

export default function Pagination({
  totalItems,
  pageSize = 10,
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get("page")) || 1;

  const totalPages = Math.ceil(totalItems / pageSize);

  const createPageURL = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    return `?${params.toString()}`;
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    router.push(createPageURL(page));
  };

  const generatePages = () => {
    const pages: (number | "...")[] = [];

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1);

    if (currentPage > 3) {
      pages.push("...");
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  };

  const pages = generatePages();

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center mt-10">
      <div className="flex items-center gap-1 bg-white/70 backdrop-blur-md border border-gray-200 rounded-xl p-2 shadow-sm">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg text-gray-600 hover:bg-emerald-50 disabled:opacity-40 *:size-5"
        >
          <HiChevronRight />
        </button>

        {pages.map((page, index) =>
          page === "..." ? (
            <span key={index} className="px-2 text-gray-400">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition
                ${
                  currentPage === page
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-emerald-50"
                }`}
            >
              {page}
            </button>
          ),
        )}

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg text-gray-600 hover:bg-emerald-50 disabled:opacity-40 *:size-5"
        >
          <HiChevronLeft />
        </button>
      </div>
    </div>
  );
}
