"use client";

import ProductList from "@/components/product/ProductList";
import { ProductService } from "@/lib/modules/product/product.service";
import type { ProductResponse } from "@/lib/modules/product/product.types";
import { CategoryService } from "@/lib/modules/category/category.service";
import type { CategoryResponse } from "@/lib/modules/category/category.types";
import type { ProductType } from "@/types/types";
import InputRow from "@/ui/InputRow";
import LinkButton from "@/ui/LinkButton";
import Modal from "@/ui/Modal";
import Pagination from "@/ui/Pagination";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FiSliders, FiRefreshCw, FiInbox, FiSearch } from "react-icons/fi";
import {
  HiAdjustmentsHorizontal,
  HiCube,
  HiMiniSquares2X2,
  HiMiniTag,
} from "react-icons/hi2";
import { mapProductToWithMeta } from "@/lib/modules/product/product.mapper";

const PAGE_SIZE = 12;

const sortOptions = [
  { value: "newest", label: "جدیدترین" },
  { value: "expensive", label: "گران‌ترین" },
  { value: "cheap", label: "ارزان‌ترین" },
  { value: "popular", label: "محبوب‌ترین" },
];

type ProductsHeaderProps = {
  categories: CategoryResponse[];
  totalProducts: number;
};

function ProductsHeader({ categories, totalProducts }: ProductsHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") ?? "");
  const [maxPriceInput, setMaxPriceInput] = useState(
    searchParams.get("max_price") ?? "",
  );

  const selectedCategory = searchParams.get("category") ?? "all";
  const sortBy = searchParams.get("sort") ?? "newest";

  useEffect(() => {
    setSearchTerm(searchParams.get("q") ?? "");
    setMaxPriceInput(searchParams.get("max_price") ?? "");
  }, [searchParams]);

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (!value || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }

      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const activeFilterCount = [
    selectedCategory !== "all",
    sortBy !== "newest",
    searchParams.get("max_price") !== null,
    searchTerm.trim() !== "",
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSearchTerm("");
    setMaxPriceInput("");
    router.push(pathname);
  };

  const applySearch = () => {
    updateFilter("q", searchTerm.trim());
  };

  const applyMaxPrice = () => {
    updateFilter("max_price", maxPriceInput.trim());
  };

  return (
    <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      {/* فیلد جستجوی زیبا */}
      <div className="relative mb-5">
        <InputRow
          icon={<FiSearch className="text-slate-400 text-lg" />}
          dir="rtl"
          customClass="w-full"
        >
          <input
            type="text"
            className="input w-full pr-11 pl-4 py-3 rounded-xl border border-slate-200 bg-slate-50/40 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm outline-none placeholder:text-slate-400"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            onBlur={applySearch}
            onKeyDown={(event) => {
              if (event.key === "Enter") applySearch();
            }}
            placeholder="نام محصول یا تولیدی مورد نظر خود را بنویسید..."
          />
        </InputRow>
      </div>

      {/* فیلترهای کنترلی سفارشی‌شده */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* دراپ‌دان دسته‌بندی */}
        <div className="relative group">
          <InputRow
            icon={
              <HiMiniSquares2X2 className="text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            }
            dir="rtl"
          >
            <select
              value={selectedCategory}
              onChange={(event) => updateFilter("category", event.target.value)}
              className="appearance-none w-full pr-10 pl-10 py-3 rounded-xl border border-slate-200 bg-slate-50/40 focus:bg-white text-slate-700 text-sm font-medium outline-none cursor-pointer focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
            >
              <option value="all">همه دسته‌ها</option>
              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                  className="py-2 text-slate-700"
                >
                  {category.name}
                </option>
              ))}
            </select>
          </InputRow>
          {/* فلش اختصاصی و متحرک راست‌چین برای دراپ‌دان */}
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 flex items-center pr-2 text-slate-400 transition-transform group-hover:translate-y-[-40%]">
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>

        {/* فیلد قیمت */}
        <div className="relative">
          <InputRow icon={<HiMiniTag className="text-slate-400" />} dir="rtl">
            <input
              type="number"
              min={0}
              value={maxPriceInput}
              onChange={(event) => setMaxPriceInput(event.target.value)}
              onBlur={applyMaxPrice}
              onKeyDown={(event) => {
                if (event.key === "Enter") applyMaxPrice();
              }}
              placeholder="حداکثر قیمت (تومان)"
              className="input w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 bg-slate-50/40 focus:bg-white text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-400"
            />
          </InputRow>
        </div>

        {/* دراپ‌دان مرتب‌سازی */}
        <div className="relative group">
          <InputRow
            icon={
              <HiAdjustmentsHorizontal className="text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            }
            dir="rtl"
          >
            <select
              value={sortBy}
              onChange={(event) => updateFilter("sort", event.target.value)}
              className="appearance-none w-full pr-10 pl-10 py-3 rounded-xl border border-slate-200 bg-slate-50/40 focus:bg-white text-slate-700 text-sm font-medium outline-none cursor-pointer focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
            >
              {sortOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className="py-2 text-slate-700"
                >
                  {option.label}
                </option>
              ))}
            </select>
          </InputRow>
          {/* فلش اختصاصی و متحرک چپ‌چین برای دراپ‌دان دوم */}
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 flex items-center pr-2 text-slate-400 transition-transform group-hover:translate-y-[-40%]">
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>

      {/* بخش خلاصه فیلترها و دکمه ریست */}
      <div className="mt-5 flex items-center justify-between border-t border-slate-50 pt-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
          <FiSliders className="h-4 w-4 text-slate-400" />
          <span>
            {totalProducts.toLocaleString("fa-IR")} محصول یافت شد
            {activeFilterCount > 0 && (
              <span className="mr-1.5 inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                {activeFilterCount} فیلتر فعال
              </span>
            )}
          </span>
        </div>
        <button
          onClick={resetFilters}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-all active:scale-95"
        >
          <FiRefreshCw className="h-3.5 w-3.5" />
          پاک کردن فیلترها
        </button>
      </div>
    </div>
  );
}

function sortAndFilterProducts(
  products: ProductResponse[],
  sortBy: string,
  maxPrice: number,
) {
  let result = [...products];

  if (maxPrice > 0) {
    result = result.filter((p) => (p.from_price ?? 0) <= maxPrice);
  }

  if (sortBy === "expensive") {
    return result.sort((a, b) => (b.from_price ?? 0) - (a.from_price ?? 0));
  }

  if (sortBy === "cheap") {
    return result.sort((a, b) => (a.from_price ?? 0) - (b.from_price ?? 0));
  }

  if (sortBy === "popular") {
    return result.sort((a, b) => (b.views_count ?? 0) - (a.views_count ?? 0));
  }

  return result;
}

function ProductsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-slate-100 bg-white p-4"
        >
          <div className="aspect-square w-full rounded-xl bg-slate-100 mb-4" />
          <div className="h-4 w-2/3 rounded bg-slate-100 mb-2.5" />
          <div className="h-3 w-1/2 rounded bg-slate-100 mb-4" />
          <div className="flex justify-between items-center">
            <div className="h-5 w-1/3 rounded bg-slate-100" />
            <div className="h-8 w-8 rounded-lg bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const page = Math.max(Number(searchParams.get("page")) || 1, 1);
  const selectedCategory = searchParams.get("category") ?? "";
  const searchTerm = searchParams.get("q") ?? "";
  const sortBy = searchParams.get("sort") ?? "newest";
  const maxPrice = Number(searchParams.get("max_price")) || 0;

  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadFilters() {
      try {
        const response = await CategoryService.list_all_categories();
        if (isMounted) setCategories(response?.data ?? []);
      } catch {
        if (isMounted) setCategories([]);
      }
    }

    loadFilters();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      setIsLoading(true);
      setError("");

      try {
        const response = await ProductService.list(
          PAGE_SIZE,
          (page - 1) * PAGE_SIZE,
          {
            q: searchTerm,
            categoryId: selectedCategory,
          },
        );

        if (!isMounted) return;
        setProducts(response?.data ?? []);
        setTotalProducts(response?.total ?? 0);
      } catch {
        if (!isMounted) return;
        setProducts([]);
        setTotalProducts(0);
        setError(
          "خطا در دریافت محصولات از سرور. لطفا اتصال اینترنت خود را بررسی کنید.",
        );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [page, searchTerm, selectedCategory]);

  const visibleProducts = useMemo(() => {

    const filteredAndSorted = sortAndFilterProducts(products, sortBy, maxPrice);


    return filteredAndSorted.map(mapProductToWithMeta);
  }, [maxPrice, products, sortBy]);

  const header = (
    <ProductsHeader categories={categories} totalProducts={totalProducts} />
  );

  return (
    <div
      className="container mx-auto px-4 mt-24 mb-16"
      dir="rtl"
      style={{ marginTop: "120px" }}
    >
      {/* هدر در دسکتاپ */}
      <div className="hidden lg:block">{header}</div>

      {/* هدر در موبایل */}
      <div className="mb-5 flex items-center justify-between lg:hidden">
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-700">
          <HiCube className="h-6 w-6 text-emerald-600" />
          <span>لیست محصولات</span>
        </h3>
        <Modal>
          <Modal.Open name="products-header">
            <button className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50">
              <FiSliders className="h-4 w-4" />
              فیلترها و جستجو
            </button>
          </Modal.Open>
          <Modal.Window name="products-header">
            <div className="p-4" dir="rtl">
              {header}
            </div>
          </Modal.Window>
        </Modal>
      </div>

      {/* وضعیت‌های مختلف بدنه اصلی صفحه */}
      {isLoading ? (
        <ProductsSkeleton />
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-rose-100 bg-rose-50/30 py-20 px-6 text-center transition-all">
          <div className="rounded-2xl bg-rose-50 p-4 mb-4 text-rose-500">
            <FiInbox className="h-10 w-10" />
          </div>
          <p className="font-semibold text-slate-800 mb-1">{error}</p>
          <p className="text-xs text-slate-400">
            می‌توانید چند لحظه دیگر دوباره تلاش کنید.
          </p>
        </div>
      ) : visibleProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50/20 py-20 px-6 text-center">
          <div className="rounded-2xl bg-slate-50 p-4 mb-4 text-slate-400">
            <FiInbox className="h-10 w-10" />
          </div>
          <p className="font-semibold text-slate-700 mb-1">
            هیچ محصولی پیدا نشد
          </p>
          <p className="text-xs text-slate-400">
            با تغییر دادن فیلترها یا عبارت جستجو مجدداً شانس خود را امتحان کنید.
          </p>
        </div>
      ) : (
        <div className="transition-all duration-300">
          <ProductList products={visibleProducts} />
        </div>
      )}

      {/* صفحه‌بندی */}
      {totalProducts > PAGE_SIZE && (
        <div className="mt-10 flex justify-center">
          <Pagination totalItems={totalProducts} pageSize={PAGE_SIZE} />
        </div>
      )}
    </div>
  );
}
