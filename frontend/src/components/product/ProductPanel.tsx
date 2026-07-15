"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Filter from "../other/Filter";
import type { ProductType } from "@/types/types";
import { cities } from "@/data/cities"; // شهرها رو فعلاً استاتیک نگه می‌داریم
import ProductList from "./ProductList";

// تایپ دسته‌بندی داینامیک که از API میاد
interface ApiCategory {
  id: string;
  name: string;  // معادل همان slug یا نام انگلیسی برای فیلتر آدرس
  label: string; // نام فارسی برای نمایش به کاربر
  icon?: any;
  subFilters?: Array<{ name: string; label: string }>;
}

export interface ProductWithMeta extends ProductType {
  categorySlug: string;
  filterTag: string;
  city: string;
}

const sorts = [
  { name: "newest", label: "جدیدترین‌ها" },
  { name: "price-asc", label: "ارزان‌ترین" },
  { name: "price-desc", label: "گران‌ترین" },
  { name: "rating", label: "محبوب‌ترین" },
  { name: "discount", label: "بیشترین تخفیف" },
];

interface ProductPanelProps {
  products: Array<ProductWithMeta>;
  categories: Array<ApiCategory>; // دریافت دسته‌بندی‌ها به عنوان پراپ داینامیک از کلاینت کامپوننت اصلی
}

function ProductPanel({
  products = [],
  categories = [], 
}: Readonly<ProductPanelProps>) {
  console.log(products); // میاد
  const searchParams = useSearchParams();

  // لایه محافظتی در صورتی که آرایه دسته‌بندی‌ها هنوز از API لود نشده باشه
  const defaultCategoryName = categories[0]?.name ?? "";

  const activeCategory = searchParams.get("p_category") || defaultCategoryName;
  const activeSubFilter = searchParams.get("p_filter") || "all";
  const activeCity = searchParams.get("p_city") || "all";
  const activeSort = searchParams.get("p_sort") || "newest";

  // ─── مدیریت اسکرول خودکار و بی‌نهایت ───
  const ITEMS_PER_PAGE = 8; 
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [isAutoMode, setIsAutoMode] = useState(false); 
  const [isLoading, setIsLoading] = useState(false); 
  
  const observerTarget = useRef<HTMLDivElement>(null);

  // ریست شدن وضعیت‌ها با تغییر فیلترها
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
    setIsAutoMode(false);
    setIsLoading(false);
  }, [activeCategory, activeSubFilter, activeCity, activeSort]);

  // ۱. استخراج زیرمجموعه‌ها به صورت کاملاً داینامیک از دیتای بک‌اند
  const subFilters = useMemo(() => {
    const currentCat = categories.find((c) => c.name === activeCategory);
    return currentCat?.subFilters ?? [{ name: "all", label: "همه" }];
  }, [categories, activeCategory]);

  // تبدیل دسته‌بندی‌های API به فرمت قابل فهم برای کامپوننت Filter
  const categoryTabs = useMemo(() => {
    return categories.map((c) => ({
      name: c.name,
      label: c.label,
      icon: c.icon,
    }));
  }, [categories]);

  // ۲. منطق فیلتر و مرتب‌سازی کالاها
  // ۲. منطق فیلتر و مرتب‌سازی کالاها (اصلاح شده)
const allFilteredProducts = useMemo(() => {
  return products
}, [products, activeCategory, activeSubFilter, activeCity, activeSort]);

  const displayedProducts = useMemo(() => {
    return allFilteredProducts.slice(0, visibleCount);
  }, [allFilteredProducts, visibleCount]);

  const activeCategoryLabel = categories.find((c) => c.name === activeCategory)?.label || "همه دسته‌ها";
  const hasMore = allFilteredProducts.length > visibleCount;

  // ۳. موتور خودکار Intersection Observer
  useEffect(() => {
    if (!isAutoMode || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsLoading(true);
          setTimeout(() => {
            setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
            setIsLoading(false);
          }, 1000);
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) observer.observe(currentTarget);

    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [isAutoMode, hasMore, isLoading]);

  const handleStartAutoMode = () => {
    setIsLoading(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
      setIsAutoMode(true);
      setIsLoading(false);
    }, 800);
  };

  const handleResetMode = () => {
    setVisibleCount(ITEMS_PER_PAGE);
    setIsAutoMode(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 antialiased text-stone-800">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[18rem_1fr] items-start">
        
        {/* ─── سایدبار فیلترها ─── */}
        <aside className="lg:sticky lg:top-24 rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
          <div className="mb-5 pb-3 border-b border-stone-100 flex items-center gap-2">
            <span className="h-3.5 w-1 rounded-full bg-emerald-500" />
            <h3 className="font-bold text-sm text-stone-900">فیلترها</h3>
          </div>

          {categories.length > 0 && (
            <div className="mb-5">
              <p className="mb-2 text-[11px] font-bold text-stone-400">دسته‌بندی</p>
              <ul className="flex flex-col gap-1">
                <Filter
                  field="p_category"
                  filters={categoryTabs}
                  defaultFilter={defaultCategoryName}
                  resetFields={["p_filter"]}
                />
              </ul>
            </div>
          )}

          <div className="border-t border-stone-100 pt-4 mb-4">
            <p className="mb-2 text-[11px] font-bold text-stone-400">زیر مجموعه‌ها</p>
            <ul className="flex flex-wrap gap-1.5">
              <Filter field="p_filter" filters={subFilters} defaultFilter="all" />
            </ul>
          </div>

          <div className="border-t border-stone-100 pt-4">
            <p className="mb-2 text-[11px] font-bold text-stone-400">شهر تولیدکننده</p>
            <ul className="flex flex-wrap gap-1.5">
              <Filter field="p_city" filters={cities} defaultFilter="all" />
            </ul>
          </div>
        </aside>

        {/* ─── بخش محصولات ─── */}
        <main className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 rounded-xl border border-stone-100 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>{allFilteredProducts.length} کالا در «{activeCategoryLabel}»</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-0.5">
              <ul className="flex items-center gap-1 bg-stone-50 p-1 rounded-lg border border-stone-100">
                <Filter field="p_sort" filters={sorts} defaultFilter="newest" />
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-100 bg-white p-4 sm:p-6 shadow-sm flex flex-col gap-6">
            {products.length > 0 && displayedProducts.length === 0 ? (
              <div className="text-center py-12 text-sm text-stone-400 font-medium">
                هیچ محصولی با مشخصات فیلتر شده پیدا نشد.
              </div>
            ) : (
              <ProductList
                products={displayedProducts}
                customGrid="grid grid-cols-2 min-[540px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
              />
            )}

            {/* ─── دکمه‌ها و کنترلرهای اسکرول ته صفحه ─── */}
            <div className="mt-4 border-t border-stone-50 pt-5 flex flex-col items-center justify-center">
              {!isAutoMode && hasMore && !isLoading && (
                <button
                  onClick={handleStartAutoMode}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs shadow-sm transition-all duration-200 hover:bg-emerald-600 active:scale-95"
                >
                  <span>مشاهده محصولات بیشتر</span>
                </button>
              )}

              {isLoading && (
                <div className="flex flex-col items-center gap-2 py-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-stone-100 border-t-emerald-500" />
                </div>
              )}

              {isAutoMode && hasMore && <div ref={observerTarget} className="h-8 w-full" />}

              {isAutoMode && (
                <div className="flex flex-col items-center gap-2.5 w-full">
                  {!hasMore && !isLoading && (
                    <span className="text-[11px] font-bold text-stone-400 bg-stone-50 px-2.5 py-1 rounded-md">پایان محصولات این دسته‌بندی</span>
                  )}
                  <button
                    onClick={handleResetMode}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-stone-500 hover:text-rose-500 font-bold text-[11px] transition-colors active:scale-95"
                  >
                    <span>نمایش کمتر</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </main>

      </div>
    </div>
  );
}

export default ProductPanel;