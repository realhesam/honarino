"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { useProduction } from "../../layout";
import {
  HiOutlineCube,
  HiOutlineClock,
  HiOutlineSparkles,
  HiOutlineEye,
  HiOutlinePhone,
  HiOutlineChevronLeft,
  HiOutlineTag,
} from "react-icons/hi2";
import { ProductService } from "@/lib/modules/product/product.service";

export default function ProductDetailPage() {
  const { productSlug } = useParams() as { productSlug: string };

  const production = useProduction();

  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>("");

  useEffect(() => {
    async function fetchProduct() {
      if (!production?.id || !productSlug) return;

      try {
        const data = await ProductService.getBySlug(production.id, productSlug);
        setProduct(data);
        if (data?.media && data.media.length > 0) {
          const sortedMedia = [...data.media].sort(
            (a, b) => a.sort_order - b.sort_order,
          );
          setActiveImage(sortedMedia[0].url);
        }
      } catch (error) {
        console.error("خطا در دریافت اطلاعات محصول:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProduct();
  }, [production?.id, productSlug]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fa-IR").format(price);
  };

  if (!production || isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center" dir="rtl">
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-slate-500 animate-pulse">
          <div className="h-4 w-4 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-sm font-medium">
            در حال بارگذاری جزئیات محصول...
          </span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center" dir="rtl">
        <div className="inline-block rounded-2xl bg-rose-50 border border-rose-100 p-8 max-w-md">
          <p className="text-sm font-bold text-rose-600">
            محصول مورد نظر یافت نشد.
          </p>
        </div>
      </div>
    );
  }

  const sortedMedia = product.media
    ? [...product.media].sort((a: any, b: any) => a.sort_order - b.sort_order)
    : [];

  return (
    <div className="container mx-auto max-w-6xl px-2 mb-20" dir="rtl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-6 px-2">
        <span className="hover:text-slate-600 cursor-pointer">
          محصولات تولیدی
        </span>
        <HiOutlineChevronLeft className="text-[10px]" />
        {product.categories && product.categories[0] && (
          <>
            <span className="hover:text-slate-600 cursor-pointer">
              {product.categories[0].name}
            </span>
            <HiOutlineChevronLeft className="text-[10px]" />
          </>
        )}
        <span className="text-slate-800 font-semibold truncate max-w-[200px]">
          {product.title}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white rounded-3xl border border-slate-100 p-4 sm:p-8 shadow-sm">
        {/* تصاویر */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 shadow-inner flex items-center justify-center group">
            {activeImage ? (
              <img
                src={activeImage}
                alt={product.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <HiOutlineCube className="text-slate-300 text-8xl" />
            )}

            {product.is_customizable && (
              <span className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20">
                <HiOutlineSparkles className="text-base" />
                امکان سفارشی‌سازی
              </span>
            )}
          </div>

          {sortedMedia.length > 1 && (
            <div className="flex flex-wrap gap-3 mt-1">
              {sortedMedia.map((item: any) => {
                const isSelected = activeImage === item.url;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveImage(item.url)}
                    className={`relative h-16 w-16 overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? "border-emerald-500 scale-95 shadow-md shadow-emerald-500/10"
                        : "border-slate-100 hover:border-slate-300"
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.alt_text || product.title}
                      className="h-full w-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* محتوای متنی و مشخصات */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4 mb-4">
              {product.categories && product.categories[0] ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  <HiOutlineTag />
                  {product.categories[0].name}
                </span>
              ) : (
                <span />
              )}

              <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                <HiOutlineEye className="text-sm" />
                {product.views_count || 0} بازدید
              </span>
            </div>

            <h1 className="text-2xl font-black text-slate-800 leading-snug mb-4">
              {product.title}
            </h1>

            {product.description && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-700 mb-2">
                  توضیحات محصول
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                  {product.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              {product.dimensions && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/50">
                  <span className="block text-[10px] text-slate-400 font-semibold mb-1">
                    ابعاد و اندازه
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    {product.dimensions} میلی‌متر
                  </span>
                </div>
              )}
              {product.material && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/50">
                  <span className="block text-[10px] text-slate-400 font-semibold mb-1">
                    جنس و متریال
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    {product.material}
                  </span>
                </div>
              )}
              {product.style && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/50">
                  <span className="block text-[10px] text-slate-400 font-semibold mb-1">
                    سبک طراحی
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    {product.style}
                  </span>
                </div>
              )}
              {product.production_time_days && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/50">
                  <span className="block text-[10px] text-slate-400 font-semibold mb-1">
                    زمان آماده‌سازی کالا
                  </span>
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <HiOutlineClock className="text-emerald-500" />
                    {product.production_time_days} روز کاری
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* بخش قیمت و تماس */}
          <div className="border-t border-slate-100 pt-6 mt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-right">
                {product.is_price_hidden ? (
                  <div>
                    <span className="text-xs text-slate-400 block mb-1">
                      قیمت این محصول
                    </span>
                    <span className="text-sm font-bold text-emerald-600">
                      نیازمند استعلام تلفنی
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">
                      بازه قیمت تولیدی (تومان)
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg font-black text-slate-800">
                        {formatPrice(product.from_price)}
                      </span>
                      <span className="text-xs text-slate-400">تا</span>
                      <span className="text-lg font-black text-slate-800">
                        {formatPrice(product.to_price)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() =>
                    window.open(`tel:${production.production_phone || ""}`)
                  }
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-white font-bold text-sm px-6 py-4 shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-95 whitespace-nowrap"
                >
                  <HiOutlinePhone className="text-lg" />
                  استعلام قیمت و سفارش
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
