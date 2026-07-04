"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import LinkButton from "@/ui/LinkButton";
import UpgradeProductionModal from "@/components/production/CreateProductionModal";
import {
  HiPlus,
  HiArrowLeft,
  HiMapPin,
  HiFolder,
  HiBuildingStorefront,
  HiCube,
} from "react-icons/hi2";
import { ProductionService } from "@/lib/modules/production/production.service";

export default function VendorOverviewPage() {
  const [productions, setProductions] = useState<any[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadProductions = async () => {
    try {
      setIsLoading(true);

      const response = await ProductionService.list(10, 0);

      setProductions(response.data || response);
    } catch (err: any) {
      console.error("Failed to load productions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProductions();
  }, []);

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    loadProductions();
  };

  const statusMap: any = {
    true: {
      label: "فعال و آنلاین",
      className: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
      dot: "bg-emerald-500",
    },
    false: {
      label: "در انتظار فعال‌سازی",
      className: "bg-amber-50 text-amber-700 ring-amber-600/10",
      dot: "bg-amber-500",
    },
  };

  const totalProducts = productions.reduce(
    (acc: number, curr: any) => acc + (curr.productsCount || 0),
    0,
  );

  if (isLoading) {
    return (
      <div className="text-center py-20 text-stone-500">در حال بارگذاری...</div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* هدر */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/60 pb-6">
        <div>
          <h2 className="text-xl font-black text-stone-900 tracking-tight">
            مدیریت حساب‌های تولیدی
          </h2>
          <p className="text-xs font-medium text-stone-500 mt-1.5">
            مجموعه کارگاه‌ها و واحدهای صنفی خود را مدیریت کنید.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white text-xs font-semibold px-5 py-3.5 rounded-xl hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-md shadow-emerald-600/20"
        >
          <HiPlus className="size-4 stroke-[3]" />
          <span>ثبت کارگاه یا تولیدی جدید</span>
        </button>
      </div>

      <UpgradeProductionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {productions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-4 rounded-2xl border border-stone-200/60 flex items-center gap-4 shadow-xs">
            <div className="p-3 bg-stone-50 text-stone-700 rounded-xl">
              <HiBuildingStorefront className="size-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-stone-400">
                تعداد واحدهای تولیدی
              </p>
              <h4 className="text-base font-black text-stone-800 mt-0.5">
                {productions.length} کارگاه
              </h4>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-stone-200/60 flex items-center gap-4 shadow-xs">
            <div className="p-3 bg-stone-50 text-stone-700 rounded-xl">
              <HiCube className="size-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-stone-400">کل محصولات</p>
              <h4 className="text-base font-black text-stone-800 mt-0.5">
                {totalProducts} محصول
              </h4>
            </div>
          </div>
        </div>
      )}

      {productions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 bg-white rounded-2xl border-2 border-dashed border-stone-200/80 max-w-2xl mx-auto">
          <div className="size-16 bg-stone-50 text-stone-400 rounded-2xl flex items-center justify-center mb-5">
            <HiBuildingStorefront className="size-8" />
          </div>
          <h3 className="text-base font-bold text-stone-800">
            هنوز تولیدی ثبت نکرده‌اید
          </h3>
          <p className="text-xs text-stone-400 text-center mt-2 max-w-sm">
            با دکمه بالا اولین کارگاه خود را ثبت کنید.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-6 bg-emerald-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-emerald-700"
          >
            ثبت اولین تولیدی
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {productions.map((prod: any) => {
            const isActive = prod.active === true;
            const status = isActive ? statusMap.true : statusMap.false;

            return (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-stone-200/70 p-6 shadow-xs hover:shadow-xl hover:border-stone-300/60 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="absolute -right-6 -bottom-6 size-24 bg-stone-50/50 rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

                <div>
                  <div className="flex items-start gap-4">
                    <div className="size-16 rounded-xl overflow-hidden relative shrink-0 bg-stone-100 border border-stone-100">
                      <Image
                        src={prod.logo_url || "/images/default-production.jpg"}
                        alt={prod.shop_name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>

                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${status.className}`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${status.dot}`}
                          />
                          {status.label}
                        </span>
                      </div>

                      <h3 className="font-black text-stone-800 text-base sm:text-lg truncate">
                        {prod.shop_name}
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-stone-100/80 text-stone-600 text-xs">
                    <span className="inline-flex items-center gap-1 bg-stone-50 px-2.5 py-1.5 rounded-lg border border-stone-200/40">
                      <HiFolder className="size-3.5 text-stone-400" />
                      {prod.categories?.join("، ") || "بدون دسته‌بندی"}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-stone-50 px-2.5 py-1.5 rounded-lg border border-stone-200/40">
                      <HiMapPin className="size-3.5 text-stone-400" />
                      {prod.production_address || "بدون آدرس"}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100/80 flex items-center justify-between">
                  <span className="text-xs font-medium text-stone-400">
                    محصولات: <strong className="text-stone-800">—</strong>
                  </span>

                  {isActive ? (
                    <LinkButton
                      href={`/dashboard/vendor/${prod.id}`}
                      customClass="flex items-center gap-1.5 text-xs font-bold text-white bg-primary px-4 py-2.5 rounded-xl hover:bg-primary/90"
                    >
                      ورود به پنل
                      <HiArrowLeft className="size-4" />
                    </LinkButton>
                  ) : (
                    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-3 py-2 rounded-xl">
                      در انتظار فعال‌سازی
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
