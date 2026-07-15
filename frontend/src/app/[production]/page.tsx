"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ProductionService } from "@/lib/modules/production/production.service";
import {
  HiOutlineIdentification,
  HiOutlinePhone,
  HiOutlineEnvelope,
  HiOutlineMapPin,
  HiOutlineGlobeAlt,
  HiOutlineTag,
} from "react-icons/hi2";
import { FaTelegramPlane, FaWhatsapp } from "react-icons/fa";

const RubikaIcon = () => (
  <span className="font-bold text-xs bg-gradient-to-tr from-purple-600 to-yellow-500 bg-clip-text text-transparent">
    روبیکا
  </span>
);
const EitaaIcon = () => (
  <span className="font-bold text-xs bg-orange-500 bg-clip-text text-transparent">
    ایتا
  </span>
);

export default function ProductionAboutPage() {
  const { production: productionId } = useParams() as { production: string };
  const [production, setProduction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAboutData() {
      try {
        const prodData = await ProductionService.publicGetById(productionId);
        setProduction(prodData);
      } catch (error) {
        console.error("خطا در بارگذاری اطلاعات تولیدی:", error);
      } finally {
        setIsLoading(false);
      }
    }
    if (productionId) loadAboutData();
  }, [productionId]);

  if (isLoading) {
    return (
      <div className="py-12 text-center text-slate-400 animate-pulse" dir="rtl">
        در حال بارگذاری مشخصات تولیدی...
      </div>
    );
  }

  if (!production) {
    return (
      <div className="py-12 text-center text-rose-500 font-bold" dir="rtl">
        اطلاعاتی برای این تولیدی یافت نشد.
      </div>
    );
  }

  // بررسی وجود لینک‌های شبکه اجتماعی
  const hasSocialLinks =
    production.telegram ||
    production.rubika ||
    production.eitaa ||
    production.whatsapp ||
    production.website;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-right" dir="rtl">
      {/* ستون اصلی (معرفی، بنر و توضیحات) */}
      <div className="lg:col-span-2 space-y-6">
        {/* کارت معرفی و هویت بصری */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          {/* بنر تولیدی */}
          <div className="relative h-48 w-full bg-slate-100">
            {production.banner_url ? (
              <img
                src={production.banner_url}
                alt={production.shop_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-r from-emerald-500 to-teal-600 opacity-85" />
            )}

            {/* لوگوی روی بنر */}
            <div className="absolute -bottom-10 right-6 h-20 w-20 rounded-2xl border-4 border-white bg-white shadow-md overflow-hidden">
              <img
                src={production.logo_url}
                alt="لوگو"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* نام و دسته‌بندی‌ها */}
          <div className="pt-12 p-6">
            <h1 className="text-xl font-black text-slate-800">
              {production.shop_name}
            </h1>

            {/* دسته‌بندی‌ها */}
            {production.categories && production.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {production.categories.map((cat: any) => (
                  <span
                    key={cat.id}
                    className="inline-flex items-center gap-1 rounded-xl bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-100"
                  >
                    <HiOutlineTag className="text-emerald-500 text-sm" />
                    {cat.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* کارت توضیحات */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800 border-b border-slate-50 pb-3 mb-4">
            <HiOutlineIdentification className="text-emerald-500 text-xl" />
            درباره تولیدی
          </h2>
          <p className="text-sm text-slate-600 leading-8 text-justify">
            {production.shop_description ||
              "توضیحاتی برای این تولیدی ثبت نشده است."}
          </p>
        </div>
      </div>

      {/* ستون فرعی (راه‌های ارتباطی و تماس) */}
      <div className="space-y-6">
        {/* اطلاعات تماس مستقیم */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-3 mb-4">
            اطلاعات تماس
          </h3>

          <div className="space-y-4">
            {/* تلفن */}
            {production.production_phone && (
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 text-lg">
                  <HiOutlinePhone />
                </div>
                <div>
                  <span className="block text-[11px] text-slate-400">
                    تلفن تماس
                  </span>
                  <a
                    href={`tel:${production.production_phone}`}
                    className="text-xs font-bold text-slate-700 hover:text-emerald-600 transition-colors"
                  >
                    {production.production_phone}
                  </a>
                </div>
              </div>
            )}

            {/* ایمیل */}
            {production.production_email && (
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 text-lg">
                  <HiOutlineEnvelope />
                </div>
                <div className="min-w-0">
                  <span className="block text-[11px] text-slate-400">
                    نشانی ایمیل
                  </span>
                  <a
                    href={`mailto:${production.production_email}`}
                    className="text-xs font-bold text-slate-700 hover:text-emerald-600 transition-colors break-all"
                  >
                    {production.production_email}
                  </a>
                </div>
              </div>
            )}

            {/* آدرس حضوری */}
            {production.production_address && (
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 text-lg">
                  <HiOutlineMapPin />
                </div>
                <div>
                  <span className="block text-[11px] text-slate-400">
                    آدرس کارگاه / تولیدی
                  </span>
                  <p className="text-xs font-semibold text-slate-600 leading-5">
                    {production.production_address}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* شبکه‌های اجتماعی و وب‌سایت */}
        {hasSocialLinks && (
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-3 mb-4">
              ارتباط در فضای مجازی
            </h3>

            <div className="grid grid-cols-1 gap-2">
              {/* وب‌سایت رسمی */}
              {production.website && (
                <a
                  href={
                    production.website.startsWith("http")
                      ? production.website
                      : `https://${production.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <span className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <HiOutlineGlobeAlt className="text-lg text-slate-400" />
                    وب‌سایت رسمی
                  </span>
                  <span className="text-[10px] text-slate-400">
                    مشاهده سایت
                  </span>
                </a>
              )}

              {/* تلگرام */}
              {production.telegram && (
                <a
                  href={`https://t.me/${production.telegram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-sky-50/50 transition-colors"
                >
                  <span className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <FaTelegramPlane className="text-lg text-sky-500" />
                    تلگرام
                  </span>
                  <span className="text-[10px] text-sky-600 dir-ltr">
                    {production.telegram}
                  </span>
                </a>
              )}

              {/* واتس‌اپ */}
              {production.whatsapp && (
                <a
                  href={`https://wa.me/${production.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-emerald-50/50 transition-colors"
                >
                  <span className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <FaWhatsapp className="text-lg text-emerald-500" />
                    واتس‌اپ
                  </span>
                  <span className="text-[10px] text-emerald-600 dir-ltr">
                    {production.whatsapp}
                  </span>
                </a>
              )}

              {/* ایتا */}
              {production.eitaa && (
                <a
                  href={`https://eitaa.com/${production.eitaa.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-orange-50/30 transition-colors"
                >
                  <span className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-orange-50 border border-orange-100">
                      <EitaaIcon />
                    </span>
                    ایتا
                  </span>
                  <span className="text-[10px] text-orange-600 dir-ltr">
                    {production.eitaa}
                  </span>
                </a>
              )}

              {/* روبیکا */}
              {production.rubika && (
                <a
                  href={`https://rubika.ir/${production.rubika.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-purple-50/30 transition-colors"
                >
                  <span className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-purple-50 border border-purple-100">
                      <RubikaIcon />
                    </span>
                    روبیکا
                  </span>
                  <span className="text-[10px] text-purple-600 dir-ltr">
                    {production.rubika}
                  </span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
