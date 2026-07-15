"use client";

import Image from "next/image";
import Link from "next/link";
import type { ProductType } from "@/types/types";
import { PiHammerDuotone, PiStarFill } from "react-icons/pi";
import { useParams } from "next/navigation";

interface ProductProps {
  product: ProductType;
  badge?: "جدید" | "پرفروش" | "پیشنهادی";
}

const BADGE_STYLE: Record<string, string> = {
  جدید: "bg-sky-500 shadow-sky-500/20",
  پرفروش: "bg-rose-500 shadow-rose-500/20",
  پیشنهادی: "bg-amber-500 shadow-amber-500/20",
};

function Product({ product, badge }: Readonly<ProductProps>) {
  const { production: productionId } = useParams() as { production: string };
  const {
    cover,
    alt,
    name,
    builder,
    slug,
    caption,
    rate,
    price,
    offerPrice,
    offer,
  } = product;

  const hasDiscount = offer > 0;

  return (
    <div className="group relative flex h-full flex-col justify-between rounded-2xl border border-stone-100 bg-white p-3 transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-500/10 hover:shadow-[0_12px_30px_rgba(0,0,0,0.04)]">
      
      {/* حل مشکل تکرار آدرس با اضافه کردن اسلش (/) در ابتدای مسیر */}
      <Link href={`/${productionId}/product/${slug}`} className="absolute inset-0 z-20" aria-label={name} />

      <div>
        {/* ─── محفظه تصویر محصول ─── */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-stone-50">
          <img src={cover} alt={alt} className="object-cover transition-transform duration-500 ease-out group-hover:scale-105" />

          {/* بج وضعیت */}
          {badge && (
            <span
              className={`absolute right-2.5 top-2.5 z-10 rounded-lg px-2.5 py-1 text-[10px] font-bold text-white shadow-md backdrop-blur-sm ${BADGE_STYLE[badge]}`}
            >
              {badge}
            </span>
          )}

          {/* بج درصد تخفیف */}
          {hasDiscount && (
            <span className="absolute left-2.5 bottom-2.5 z-10 rounded-md bg-rose-500 px-1.5 py-0.5 text-[11px] font-black text-white shadow-sm">
              {offer}%
            </span>
          )}
        </div>

        {/* ─── اطلاعات متنی ─── */}
        <div className="mt-3 px-1">
          {/* عنوان محصول */}
          <h2 className="line-clamp-2 h-10 text-xs sm:text-sm font-bold text-stone-800 transition-colors group-hover:text-emerald-600">
            {name}
          </h2>
          
          {/* توضیح کوتاه */}
          <p className="mt-1 line-clamp-1 text-[11px] text-stone-400">{caption}</p>

          {/* بخش سازنده */}
          <div className="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-stone-500">
            <span className="text-stone-400 *:size-3.5">
              <PiHammerDuotone />
            </span>
            <span className="truncate hover:text-emerald-600 transition-colors relative z-30">
              <Link href="/test">{builder}</Link>
            </span>
          </div>
        </div>
      </div>

      {/* ─── بخش قیمت و امتیاز ─── */}
      <div className="mt-4 border-t border-stone-50 pt-3 flex items-center justify-between px-1">
        
        {/* امتیاز کالا */}
        <div className="flex items-center gap-0.5 rounded-md bg-stone-50 px-1.5 py-0.5 text-xs font-bold text-stone-600">
          <span className="text-amber-400 *:size-3.5">
            <PiStarFill />
          </span>
          <span>{rate}</span>
        </div>

        {/* قیمت‌ها */}
        <div className="flex flex-col items-end gap-0.5">
          {hasDiscount && (
            <span className="text-[11px] font-medium text-stone-400 line-through decoration-stone-400/70">
              {price.toLocaleString()}
            </span>
          )}
          
          <div className="flex items-center gap-0.5 font-black text-emerald-600">
            <span className="text-sm sm:text-base">{offerPrice.toLocaleString()}</span>
            <span className="text-[10px] font-bold text-stone-400">ریال</span>
          </div>
        </div>

      </div>

    </div>
  );
}

export default Product;