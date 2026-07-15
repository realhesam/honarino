"use client";

import {
  useEffect,
  useState,
  ReactNode,
  createContext,
  useContext,
} from "react";
import { useParams, usePathname } from "next/navigation";
import { ProductionService } from "@/lib/modules/production/production.service";
import Link from "next/link";
import {
  HiOutlineBuildingOffice2,
  HiOutlineCube,
  HiOutlineInformationCircle,
  HiOutlinePhone,
  HiOutlineMapPin,
} from "react-icons/hi2";

const ProductionContext = createContext<any>(null);

export function useProduction() {
  return useContext(ProductionContext);
}

export default function ProductionLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { production: productionId } = useParams() as { production: string };
  const pathname = usePathname();
  const [production, setProduction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProductionDetails() {
      try {
        const data = await ProductionService.publicGetById(productionId);
        setProduction(data);
      } catch (error) {
        console.error("خطا در دریافت اطلاعات لایوت:", error);
      } finally {
        setIsLoading(false);
      }
    }
    if (productionId) fetchProductionDetails();
  }, [productionId]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 mt-[120px] text-center" dir="rtl">
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-slate-500 animate-pulse">
          <div className="h-4 w-4 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-sm font-medium">
            در حال بارگذاری اطلاعات تولیدی...
          </span>
        </div>
      </div>
    );
  }

  if (!production) {
    return (
      <div className="container mx-auto px-4 mt-[120px] text-center" dir="rtl">
        <div className="inline-block rounded-2xl bg-rose-50 border border-rose-100 p-6 max-w-md">
          <p className="text-sm font-bold text-rose-600">
            تولیدی مورد نظر یافت نشد یا غیرفعال است.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: "about",
      label: "صفحه اصلی",
      href: `/${productionId}`,
      icon: <HiOutlineInformationCircle />,
    },
    {
      id: "products",
      label: "محصولات",
      href: `/${productionId}/products`,
      icon: <HiOutlineCube />,
    },
  ];

  return (
    <ProductionContext.Provider value={production}>
      <div
        className="container mx-auto px-4 mt-[120px] mb-16 max-w-6xl"
        dir="rtl"
      >
        {/* هدر تولیدی */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-sm mb-8">
          <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl -z-10" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-right">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 p-1 shadow-sm transition-transform duration-300 hover:scale-105">
                {production.logo_url ? (
                  <img
                    src={production.logo_url}
                    alt={production.shop_name || "لوگو"}
                    className="h-full w-full rounded-xl object-cover"
                  />
                ) : (
                  <HiOutlineBuildingOffice2 className="text-emerald-600 text-4xl" />
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-xl font-black text-slate-800">
                    {production.shop_name || production.name || "نام تولیدی"}
                  </h1>
                  {production.active && (
                    <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
                      رسمی
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 mt-2 text-xs text-slate-400">
                  {production.production_address && (
                    <span className="flex items-center gap-1">
                      <HiOutlineMapPin className="text-slate-400 text-sm" />
                      {production.production_address
                        .split(" ")
                        .slice(0, 2)
                        .join(" ")}
                    </span>
                  )}
                  {production.production_phone && (
                    <span className="flex items-center gap-1">
                      <HiOutlinePhone className="text-slate-400 text-sm" />
                      {production.production_phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {production.production_phone && (
              <div className="shrink-0 hidden sm:block">
                <a
                  href={`tel:${production.production_phone}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-emerald-600 active:scale-95"
                >
                  <HiOutlinePhone className="text-lg" />
                  تماس سریع با تولیدی
                </a>
              </div>
            )}
          </div>

          {/* تب‌ها */}
          <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-5 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const isHomeActive =
                tab.id === "about" &&
                (pathname === `/${productionId}` ||
                  pathname === `/${productionId}/`);
              const isProductsActive =
                tab.id === "products" &&
                pathname.startsWith(`/${productionId}/products`);
              const isActive = isHomeActive || isProductsActive;

              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all duration-300 whitespace-nowrap ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>

        <main className="transition-all duration-300 animate-fadeIn">
          {children}
        </main>
      </div>
    </ProductionContext.Provider>
  );
}
