"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import type { BuilderType } from "@/types/builder";
import Builder from "./Builder";

function PopularBuildersCarousel({
  builders,
}: Readonly<{ builders: Array<BuilderType> }>) {
  return (
    <Swiper
      dir="rtl"
      navigation
      freeMode
      spaceBetween={16}
      slidesPerView={1.2}
      breakpoints={{
        400: { slidesPerView: 1.6 },
        768: { slidesPerView: 2.4 },
        1024: { slidesPerView: 3.2 },
        1280: { slidesPerView: 4 },
      }}
      modules={[FreeMode, Navigation]}
    >
      {builders.map((builder) => (
        <SwiperSlide key={builder.id}>
          <Builder builder={builder} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export default PopularBuildersCarousel;
