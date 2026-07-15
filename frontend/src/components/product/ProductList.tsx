"use client";

import Product from "./Product";
import type { ProductType } from "@/types/types";

interface ProductListProps {
  products: Array<ProductType>;
  customGrid?: string;
  badge?: "جدید" | "پرفروش" | "پیشنهادی";
}

function ProductList({
  products,
  customGrid,
  badge,
}: Readonly<ProductListProps>) {
  // ─── طراحی مدرن بخش «محصولی پیدا نشد» ───
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 py-16 px-4 text-center animate-fade-in">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-400">
          {/* یک آیکون مینی‌مال جعبه خالی */}
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        </div>
        <p className="text-sm font-bold text-stone-500">محصولی برای نمایش پیدا نشد</p>
        <p className="mt-1 text-xs text-stone-400">لطفاً فیلترهای انتخاب شده را تغییر دهید.</p>
      </div>
    );
  }

  return (
    <div
      className={`${
        customGrid
          ? customGrid
          : "grid grid-cols-2 min-[540px]:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
      } items-stretch`}
    >
      {products.map((product, i) => (
        <div 
          key={product.id ?? i} 
          className="transform transition-all duration-500 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-4"
          style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'both' }} // ایجاد افکت لود دانه دانه‌ای برای کارت‌ها
        >
          <Product product={product} badge={badge} />
        </div>
      ))}
    </div>
  );
}

export default ProductList;