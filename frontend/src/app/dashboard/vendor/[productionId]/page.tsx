"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import {
  HiUserGroup,
  HiCube,
  HiPlus,
  HiTicket,
  HiCog6Tooth,
  HiChevronLeft,
  HiMapPin,
  HiCheckCircle,
} from "react-icons/hi2";
import { ProductionService } from "@/lib/modules/production/production.service";

export default function MainPage() {
  const params = useParams();
  const router = useRouter();
  const productionId = params.productionId as string;

  const [productionData, setProductionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editorTotal, setEditorTotal] = useState<number>(0);
  const [adminTotal, setAdminTotal] = useState<number>(0);

  const fetchMembers = useCallback(async () => {
    try {
      const res = await ProductionService.getMembersCount(productionId);
      setEditorTotal(res.editorTotal || 0);
      setAdminTotal(res.adminTotal || 0);
    } catch (err: any) {
      console.error("fetch production members failed:", err);
    } finally {
    }
  }, [productionId]);

  useEffect(() => {
    async function fetchProductionDetails() {
      try {
        if (!productionId) return;
        const data = await ProductionService.getById(productionId);
        setProductionData(data);
      } catch (error) {
        console.error("خطا در دریافت اطلاعات صفحه اصلی تولیدی:", error);
      } finally {
        setLoading(false);
      }
    }

    if (productionId) fetchMembers();
    fetchProductionDetails();
  }, [productionId]);

  useEffect(() => {}, [fetchMembers, productionId]);

  const navigateTo = (path: string) => {
    if (productionId) router.push(`/dashboard/vendor/${productionId}/${path}`);
    else router.push(`/dashboard/${path}`);
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-[400px] text-xs font-bold text-stone-500 animate-pulse"
        dir="rtl"
      >
        در حال بارگذاری اطلاعات مدیریتی کارگاه...
      </div>
    );
  }

  if (!productionData) {
    return (
      <div
        className="text-center py-12 text-xs font-bold text-stone-500"
        dir="rtl"
      >
        امکان بازیابی اطلاعات تولیدی وجود ندارد.
      </div>
    );
  }

  const shopName = productionData.shop_name || "بدون نام";
  const shopId = productionData.shop_id || "";
  const shopDescription =
    productionData.shop_description ||
    `مدیریت شناسنامه کالاها، انبارداری و کاتالوگ اختصاصی مجموعه ${shopName}.`;

  const categories =
    productionData.categories
      ?.map((cat: any) => cat?.name?.trim())
      .filter(Boolean)
      .join("، ") || "بدون رسته";
  const address = productionData.production_address || "آدرسی ثبت نشده است";

  const totalProducts = productionData.total_products || 0;
  const categoriesCount = 0;
  const unreadTicketsCount = productionData.unread_tickets_count || 0;

  const logoUrl = productionData.logo_url;

  const bannerUrl = productionData.banner_url;

  return (
    <div
      className="lg:h-[calc(100vh-110px)] w-full flex flex-col space-y-6 antialiased min-h-0 animate-in fade-in duration-300"
      dir="rtl"
    >
      <div className="relative bg-stone-900 rounded-3xl h-44 sm:h-52 w-full overflow-hidden shrink-0 shadow-sm border border-stone-200/10">
        <img
          src={bannerUrl}
          alt="Production Banner"
          className="w-full h-full object-cover opacity-75 select-none"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        <button
          onClick={() => navigateTo("edit")}
          className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-bold py-2 px-3.5 rounded-xl border border-white/15 transition-all active:scale-95 cursor-pointer"
        >
          <HiCog6Tooth className="size-4 animate-spin-slow" />
          <span>تنظیمات کارگاه</span>
        </button>

        <div className="absolute bottom-4 right-5 flex items-center gap-4">
          <div className="size-16 sm:size-20 rounded-2xl overflow-hidden border-4 border-white bg-white shadow-md shrink-0">
            <img
              src={logoUrl}
              alt="Production Logo"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="text-white drop-shadow-sm">
            <div className="flex items-center gap-1.5">
              <h2 className="text-base sm:text-xl font-black tracking-tight">
                {shopName}
              </h2>
              <HiCheckCircle className="size-5 text-emerald-400 shrink-0" />
            </div>
            <p className="text-[11px] sm:text-xs font-medium text-stone-200/90 mt-0.5 flex items-center gap-1">
              <span>{categories}</span>
              {shopId && (
                <>
                  <span className="text-white/40">•</span>
                  <span className="font-mono text-[10px] text-emerald-300">
                    @{shopId}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto lg:pr-1 pb-4 min-h-0 custom-scrollbar">
        <div className="lg:col-span-2 flex flex-col space-y-6">
          <div
            onClick={() => navigateTo("products")}
            className="group bg-white border border-stone-200 rounded-2xl p-6 flex flex-col justify-between min-h-[160px] sm:min-h-[170px] hover:border-emerald-500/40 hover:shadow-md hover:shadow-emerald-600/[0.01] transition-all cursor-pointer"
          >
            <div className="space-y-1">
              <div className="size-11 rounded-xl bg-stone-50 text-stone-600 border border-stone-200/60 flex items-center justify-center shadow-sm">
                <HiCube className="size-5" />
              </div>
              <h3 className="font-black text-sm text-stone-800 mt-4 group-hover:text-emerald-600 transition-colors">
                لیست محصولات کاتالوگ
              </h3>
              <p className="text-xs text-stone-400 font-medium leading-relaxed">
                {shopDescription}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-stone-100 grid grid-cols-2 gap-4 text-right">
              <div>
                <span className="block text-[10px] text-stone-400 font-bold">
                  کل محصولات فعال
                </span>
                <span className="text-sm font-black text-stone-700 mt-0.5 block">
                  {totalProducts} کالا
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-stone-400 font-bold">
                  تنوع دسته‌بندی
                </span>
                <span className="text-sm font-black text-stone-700 mt-0.5 block">
                  {categoriesCount} گروه اصلی
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div
              onClick={() => navigateTo("products/new")}
              className="group bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl p-6 flex flex-col justify-between min-h-[140px] shadow-sm shadow-emerald-600/10 hover:shadow-lg hover:shadow-emerald-600/10 transition-all cursor-pointer"
            >
              <div
                className="size-10 rounded-xl bg-white/15 border border-white/10 flex items-center justify-center w-fit shadow-inner"
                style={{ padding: "8px" }}
              >
                <HiPlus className="size-5 stroke-[2.5]" />
              </div>
              <div className="mt-4">
                <h4 className="font-black text-sm text-white">
                  افزودن محصول جدید
                </h4>
                <p className="text-[11px] text-emerald-100/80 font-medium mt-0.5">
                  ثبت کالای جدید با مشخصات فنی در خط تولید مجموعه {shopName}
                </p>
              </div>
            </div>

            <div
              onClick={() => navigateTo("tickets")}
              className="group bg-white border border-stone-200 rounded-2xl p-6 flex flex-col justify-between min-h-[140px] hover:border-emerald-500/40 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex justify-between items-center w-full">
                <div className="size-10 rounded-xl bg-stone-50 border border-stone-200/60 flex items-center justify-center text-stone-600 shadow-sm">
                  <HiTicket className="size-5" />
                </div>
                {unreadTicketsCount > 0 && (
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                    {unreadTicketsCount} پاسخ‌نزده
                  </span>
                )}
              </div>
              <div className="mt-4">
                <h4 className="font-black text-sm text-stone-800 group-hover:text-emerald-600 transition-colors">
                  تیکت‌های دریافتی
                </h4>
                <p className="text-[11px] text-stone-400 font-medium mt-0.5">
                  پاسخگویی به درخواست‌ها و پشتیبانی فنی مشتریان کارگاه
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-6 lg:h-full">
          <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-3.5 shadow-sm">
            <div className="flex items-center gap-2 text-stone-800">
              <HiMapPin className="size-4 text-stone-400" />
              <span className="text-xs font-black">موقعیت فیزیکی واحد</span>
            </div>
            <p className="text-[11px] font-medium text-stone-500 leading-relaxed bg-stone-50 p-2.5 border border-stone-100 rounded-xl">
              {address}
            </p>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-5 flex flex-col justify-between flex-1 min-h-[240px] shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-stone-50 text-stone-600 border border-stone-200/60 shadow-sm">
                  <HiUserGroup className="size-4" />
                </div>
                <h4 className="text-xs font-black text-stone-800">
                  مدیریت پرسنل و دسترسی‌ها
                </h4>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-stone-50/60 border border-stone-100 flex items-center justify-between text-xs transition-colors hover:bg-stone-50">
                  <span className="font-medium text-stone-600">
                    مدیران ارشد کارگاه
                  </span>
                  <span className="font-black text-stone-800 bg-white border border-stone-200 px-2 py-0.5 rounded-md">
                    {adminTotal} نفر
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-stone-50/60 border border-stone-100 flex items-center justify-between text-xs transition-colors hover:bg-stone-50">
                  <span className="font-medium text-stone-600">
                    اپراتورها و همکاران خط
                  </span>
                  <span className="font-black text-stone-800 bg-white border border-stone-200 px-2 py-0.5 rounded-md">
                    {editorTotal} نفر
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-stone-400 font-medium leading-relaxed">
                کنترل سطوح دسترسی کاربران و تعریف حساب جدید برای پرسنل مجموعه{" "}
                {shopName}.
              </p>
            </div>

            <button
              onClick={() => navigateTo("members")}
              className="w-full mt-5 inline-flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold py-3 rounded-xl transition-all active:scale-95 cursor-pointer shadow-sm shadow-emerald-600/5"
            >
              <span>تنظیمات اعضا و دسترسی‌ها</span>
              <HiChevronLeft className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
