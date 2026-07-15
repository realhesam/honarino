"use client";

import Link from "next/link";
import ProductList from "./ProductList";
import type { ProductType } from "@/types/types";
import { HiArrowLongLeft, HiCube } from "react-icons/hi2";

const HOMEPAGE_PRODUCT_COUNT = 8;

interface FeaturedProductsProps {
  products: ProductType[];
}

function FeaturedProducts({ products = [] }: Readonly<FeaturedProductsProps>) {
  const visibleProducts = products.slice(0, HOMEPAGE_PRODUCT_COUNT);

  if (visibleProducts.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-10">
      {/* ─── هدر بخش ─── */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <HiCube className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-stone-900">محصولات ویژه</h2>
            <p className="text-xs text-stone-400">جدیدترین و پرطرفدارترین محصولات</p>
          </div>
        </div>

        {/* دکمه مشاهده همه در دسکتاپ، بالای گرید */}
        <Link
          href="/products"
          className="hidden sm:flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-bold text-stone-600 transition-colors hover:border-emerald-500 hover:text-emerald-600"
        >
          <span>مشاهده همه محصولات</span>
          <HiArrowLongLeft className="h-4 w-4" />
        </Link>
      </div>

      {/* ─── گرید محصولات ─── */}
      <ProductList
        products={visibleProducts}
        customGrid="grid grid-cols-2 min-[540px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
      />

      {/* دکمه مشاهده همه در موبایل، زیر گرید */}
      <div className="mt-6 flex justify-center sm:hidden">
        <Link
          href="/products"
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-stone-900 px-5 py-3 text-xs font-bold text-white transition-colors active:scale-95"
        >
          <span>مشاهده همه محصولات</span>
          <HiArrowLongLeft className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

export default FeaturedProducts;