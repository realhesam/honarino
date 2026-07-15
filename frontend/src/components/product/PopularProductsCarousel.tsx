"use client";

import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import type { ProductType } from "@/types/types";
import Product from "./Product";
import { HiArrowLongLeft } from "react-icons/hi2";

export default function PopularProductsCarousel({
  products,
}: Readonly<{ products: Array<ProductType> }>) {
  return (
    <>
      <Swiper
        dir="rtl"
        navigation
        freeMode
        spaceBetween={16}
        slidesPerView={1.4}
        breakpoints={{
          400: { slidesPerView: 2.2 },
          768: { slidesPerView: 3.2 },
          1024: { slidesPerView: 4.2 },
          1280: { slidesPerView: 5 },
        }}
        modules={[FreeMode, Navigation]}
      >
        {products.map((product, i) => (
          <SwiperSlide key={product.id ?? i}>
            <Product product={product} badge="پرفروش" />
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="flex flex-col gap-4">
 
      <Link
        href="/products"
        className="group mx-auto flex items-center gap-2.5 rounded-full border border-emerald-200 bg-white px-6 py-2.5 text-xs font-bold text-emerald-700 shadow-sm transition-all duration-300 hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-md active:scale-95"
      >
        <span>مشاهده همه محصولات</span>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white transition-transform duration-300 group-hover:-translate-x-1">
          <HiArrowLongLeft className="h-3.5 w-3.5" />
        </span>
      </Link>
    </div>
    </>
  );
}
